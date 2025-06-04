const express = require("express");
const router = express.Router();
const { createChat, sendMessage, getMessages, getChats, createGroupChat } = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = "./uploads/multimedia";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for multimedia uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Protected routes
router.get("/", authMiddleware, getChats);
router.post("/", authMiddleware, createChat);
router.post("/group", authMiddleware, createGroupChat);
router.post("/messages", authMiddleware, upload.any(), sendMessage);
router.get("/:chatId/messages", authMiddleware, getMessages);

module.exports = router;
