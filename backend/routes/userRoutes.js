const express = require("express");
const {
    getAllUsers,
    getUserById,
    updateUserProfile,
    searchUsers,
    getUserByEmail,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Fetch all users
router.get("/", authMiddleware, getAllUsers);

// Fetch a user by ID
router.get("/:id", authMiddleware, getUserById);

// Update profile of logged-in user
router.put("/profile", authMiddleware, updateUserProfile);

// Search users
router.get("/search", authMiddleware, searchUsers);

// Fetch a user by email
router.get("/email/:email", authMiddleware, getUserByEmail);

module.exports = router;
