const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  time: {
    type: String,
  },
});

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  users: {
    type: [String],
    required: true,
  },
  messages: [messageSchema],
});

module.exports = mongoose.model("Chats", RoomSchema);
