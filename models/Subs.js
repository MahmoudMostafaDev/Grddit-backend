const mongoose = require("mongoose");

const subSchema = new mongoose.Schema({
  subId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxLength: 20,
  },
  mainTitle: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  description: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxLength: [40000, "Title cannot exceed 40000 characters"],
  },
  creator: { type: String, required: [true, "Author is required"], trim: true },
  img: {
    type: String,
  },
  banner: {
    type: String,
  },
  posts: {
    type: [String],
  },
  members: {
    type: [String],
  },
  memberCount: {
    type: Number,
    default: 0,
  },
});
module.exports = mongoose.model("Subs", subSchema);
