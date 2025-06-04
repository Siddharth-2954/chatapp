import { useState, useEffect, useRef } from "react";

const ChatWindow = ({ chat, auth, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!chat?._id || !auth?.token) {
      console.warn("Missing chat ID or auth token", { chat, auth });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `http://localhost:3000/api/chats/${chat._id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch messages");
      }

      const data = await response.json();
      console.log('Fetched messages:', data);
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error("Received non-array data:", data);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chat?._id && auth?.token) {
      console.log('Chat:', {
        id: chat._id,
        isGroupChat: chat.isGroupChat,
        name: chat.name,
        users: chat.users
      });
      fetchMessages();
    }
  }, [chat?._id, auth?.token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !chat?._id || !auth?.token) return;

    try {
      const formData = new FormData();
      formData.append("chatId", chat._id);
      if (newMessage.trim()) {
        formData.append("content", newMessage);
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await fetch("http://localhost:3000/api/chats/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
      setSelectedFile(null);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderMessage = (message) => {
    const isCurrentUser = message.sender._id === auth.user._id;
    const showSenderName = chat.isGroupChat && !isCurrentUser;

    const renderContent = () => {
      if (message.type === "file") {
        if (!message.file) {
          return (
            <div className="text-red-500">
              File not available
            </div>
          );
        }

        const fileUrl = message.file.startsWith('http') 
          ? message.file 
          : `http://localhost:3000${message.file}`;
        
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(message.file);
        
        if (isImage) {
          return (
            <div className="flex flex-col space-y-1">
              <img 
                src={fileUrl} 
                alt="Shared image" 
                className="max-w-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(fileUrl, '_blank')}
                onError={(e) => {
                  console.error('Image failed to load:', fileUrl);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                }}
              />
            </div>
          );
        }
        
        return (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View File
            </a>
          </div>
        );
      }
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    };

    return (
      <div
        key={message._id}
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2 md:mb-4`}
      >
        <div
          className={`max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 md:px-4 md:py-2 ${
            isCurrentUser
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {showSenderName && (
            <div className="text-xs font-semibold mb-1 text-gray-600">
              {message.sender?.name || 'Unknown User'}
            </div>
          )}
          {renderContent()}
          <div className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (messages.length > 0) {
      console.log('Messages data:', messages.map(m => ({
        id: m._id,
        type: m.type,
        file: m.file,
        content: m.content
      })));
    }
  }, [messages]);

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">
            {chat.isGroupChat ? (
              <div className="flex items-center">
                <span className="mr-2">👥</span>
                {chat.name}
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2">👤</span>
                {otherUser?.name || "Unknown User"}
              </div>
            )}
          </h2>
          {chat.isGroupChat && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {chat.users.length} members
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
          {selectedFile && (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-sm text-gray-600 truncate">
                  {selectedFile.name}
                </span>
              </div>
              <button
                type="button"
                onClick={removeSelectedFile}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={!newMessage.trim() && !selectedFile}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
