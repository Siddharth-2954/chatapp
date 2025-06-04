// src/pages/Chats.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import ChatWindow from "../components/Chat/ChatWindow";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { auth, loading: authLoading } = useAuth();
  const location = useLocation();

  const fetchChats = async () => {
    if (!auth?.token) {
      console.error("No auth token available");
      setError("Authentication token missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:3000/api/chats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch chats");
      }

      const data = await response.json();
      console.log("Fetched chats:", data);
      setChats(data);

      // If there's a selected chat in the location state, find and select it
      if (location.state?.selectedChat) {
        const chat = data.find(c => c._id === location.state.selectedChat._id);
        if (chat) {
          setSelectedChat(chat);
        }
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchChats();
    }
  }, [auth?.token, location.state?.selectedChat]);

  const getOtherUser = (chat) => {
    if (!chat?.users || !auth?.user) return null;
    return chat.users.find((user) => user._id !== auth.user._id);
  };

  const renderLastMessage = (message) => {
    if (!message) return null;

    if (message.type === "file") {
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(message.file);
      if (isImage) {
        return (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Image</span>
          </div>
        );
      }
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span>File</span>
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-500 truncate">
        {message.content}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!auth?.token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded-md">
          Please log in to view your chats
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] mt-16 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-2">
              {chats.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-500">No chats yet</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const otherUser = getOtherUser(chat);
                  return (
                    <div
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat?._id === chat._id
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium flex items-center">
                        {chat.isGroupChat ? (
                          <>
                            <span className="mr-2">👥</span>
                            {chat.name || "Unnamed Group"}
                          </>
                        ) : (
                          <>
                            <span className="mr-2">👤</span>
                            {otherUser?.name || "Unknown User"}
                          </>
                        )}
                      </div>
                      {chat.lastMessage && renderLastMessage(chat.lastMessage)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            auth={auth}
            otherUser={getOtherUser(selectedChat)}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
