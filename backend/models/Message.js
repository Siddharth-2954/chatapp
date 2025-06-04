const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { 
        type: String, 
        required: function() { 
            return this.type === 'text'; 
        },
        default: ''
    },
    type: { 
        type: String, 
        enum: ["text", "file"], 
        default: "text",
        required: true
    },
    file: { 
        type: String,
        required: function() {
            return this.type === 'file';
        }
    },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);