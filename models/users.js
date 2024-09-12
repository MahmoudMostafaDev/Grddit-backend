const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxLength: 50,
  },
  password: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  banner: {
    type: String,
  },
  posts: {
    type: [String],
  },
  subs: {
    type: [String],
  },
  recent: {
    type: [String],
  },
});

module.exports = mongoose.model("User", userSchema);
