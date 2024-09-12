const mongoose = require("mongoose");

const subCommentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: [true, "Author is required"],
    trim: true,
  },
  text: {
    type: String,
    required: [true, "Text is required"],
    maxLength: [2000, "Comment cannot exceed 2000 characters"],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  upVotes: {
    type: Number,
    default: 0,
  },
  downVotes: {
    type: Number,
    default: 0,
  },
  mainComment: {
    type: Boolean,
    required: true,
  },
});
const commentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: [true, "Author is required"],
    trim: true,
  },
  text: {
    type: String,
    required: [true, "Text is required"],
    maxLength: [2000, "Comment cannot exceed 2000 characters"],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  upVotes: {
    type: Number,
    default: 0,
  },
  downVotes: {
    type: Number,
    default: 0,
  },
  mainComment: {
    type: Boolean,
    required: true,
  },
  replies: [subCommentSchema],
});

const infoSchema = new mongoose.Schema({
  upVotes: {
    type: Number,
    default: 0,
  },
  downVotes: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  comments: [commentSchema],
});

const postSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxLength: [300, "Title cannot exceed 300 characters"],
  },
  img: {
    type: String,
  },
  description: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxLength: [4000, "Title cannot exceed 40000 characters"],
  },
  date: {
    type: Date,
    default: Date.now,
  },

  author: {
    type: String,
    required: [true, "Author is required"],
    trim: true,
  },
  subId: {
    type: String,
    required: [true, "Author is required"],
    trim: true,
  },
  info: {
    type: infoSchema,
    required: true,
  },
});

module.exports = mongoose.model("Post", postSchema);
