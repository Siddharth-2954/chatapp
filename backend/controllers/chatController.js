const Chat = require("../models/Chat");
const Message = require("../models/Message");

// Get all chats for the authenticated user
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate("users", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// Create a new chat
const createChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    }).populate("users", "-password");

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const newChat = await Chat.create({
      users: [req.user._id, userId],
    });

    const populatedChat = await Chat.findById(newChat._id).populate(
      "users",
      "-password"
    );

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    let fileUrl = null;
    let messageType = "text";

    if (req.files && req.files.length > 0) {
      fileUrl = `/uploads/multimedia/${req.files[0].filename}`;
      messageType = "file";
    }

    if (!chatId || (!content && !fileUrl)) {
      return res.status(400).json({ message: "Invalid message data" });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      content: content || "",
      chat: chatId,
      type: messageType,
      file: fileUrl,
    });

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: newMessage._id,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate({
        path: "sender",
        select: "name email _id"
      })
      .populate("chat");

    console.log('New message:', {
      id: populatedMessage._id,
      sender: populatedMessage.sender,
      content: populatedMessage.content
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get messages for a chat
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate({
        path: "sender",
        select: "name email _id"
      })
      .populate("chat")
      .sort({ createdAt: 1 });

    console.log('Fetched messages:', messages.map(m => ({
      id: m._id,
      sender: m.sender,
      content: m.content
    })));

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Create a group chat
const createGroupChat = async (req, res) => {
  try {
    const { name, users } = req.body;

    if (!name || !users || !Array.isArray(users) || users.length < 2) {
      return res.status(400).json({ 
        message: "Please provide a group name and at least 2 users" 
      });
    }

    // Add the current user to the group
    const allUsers = [...users, req.user._id];

    // Create new group chat
    const newChat = await Chat.create({
      name,
      isGroupChat: true,
      users: allUsers,
    });

    const populatedChat = await Chat.findById(newChat._id)
      .populate("users", "-password")
      .populate("lastMessage");

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error("Error creating group chat:", error);
    res.status(500).json({ message: "Failed to create group chat" });
  }
};

module.exports = {
  getChats,
  createChat,
  sendMessage,
  getMessages,
  createGroupChat
};