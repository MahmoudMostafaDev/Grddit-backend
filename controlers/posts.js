const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const router = express.Router();
const { verifyToken } = require("../auth/util");
const User = require("../models/users");
const Post = require("../models/Posts");
const Sub = require("../models/Subs");
const uuidv4 = require("uuid").v4;
const cloudinary = require("../util/cloudinary");
const upload = require("../middleware/multer");

router.get(
  "/subPosts/:id",
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.find().where({ subId: id });
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "posts not found" });
    return res.json({ success: true, post: post });
  })
);
router.get(
  "/homepage/:username",
  asyncHandler(async (req, res, next) => {
    const { limit, offset } = req.query;
    const username = req.params.username;
    if (username) {
      const subs = await User.findOne({ username: username }, "subs");
      console.log(subs.subs);
      const posts = await Post.find()
        .where("subId")
        .in(subs.subs)
        .limit(limit || 10)
        .skip(offset || 0);
      console.log("s");
      return res.json({ success: true, posts: posts });
    } else {
      const posts = await Post.find()
        .limit(limit || 10)
        .skip(offset || 0);
      return res.json({ success: true, posts: posts });
    }
  })
);

router.get(
  "/homepage",
  asyncHandler(async (req, res, next) => {
    const { limit, offset } = req.query;
    console.log(limit, offset);
    const posts = await Post.find()
      .limit(limit || 10)
      .skip(offset || 0);
    return res.json({ success: true, posts: posts });
  })
);

router.get(
  "/random",
  asyncHandler(async (req, res, next) => {
    const posts = await Post.aggregate([{ $sample: { size: 10 } }]);
    return res.json({ success: true, posts: posts });
  })
);

router.get(
  "/getByNum",
  asyncHandler(async (req, res, next) => {
    const { limit, offset } = req.query;
    console.log(limit, offset);
    const posts = await Post.find()
      .limit(limit || 10)
      .skip(offset || 0);
    if (!posts.length) {
      console.log("no posts");
      return res.json({
        success: false,
        posts: [],
        message: "posts not found",
      });
    }

    return res.json({ success: true, posts: posts });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findOne().where({ slug: id });
    const sub = await Sub.findOne().where({ subId: post.subId });
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "post not found" });
    return res.json({
      success: true,
      post: post,
      sub: { subId: sub.subId, img: sub.img },
    });
  })
);

router.post(
  "/:id",
  verifyToken,
  upload.single("image"),
  asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const { id } = req.params;
    const { title, description, subId } = req.body;
    const author = req.user.username;
    const autorData = await User.findOne({ username: author });
    autorData.posts.push(id);
    autorData.save();
    const sub = await Sub.findOne().where({ subId: subId });
    if (sub === null) {
      return res.json({ success: false, message: "sub not found" });
    }
    let img = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      img = result.secure_url;
      console.log(img);
    }
    const post = await Post.create({
      title: title,
      slug: id,
      img: img,
      description: description,
      subId: subId,
      author: author,
      info: {
        upVotes: 0,
        downVotes: 0,
        comments: [],
        commentCount: 0,
      },
    });

    return res.json({ success: true, post: post });
  })
);
router.post("/:id/upvote", verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findOne().where({ slug: id });
  if (post === null) {
    return res.json({ success: false, message: "post not found" });
  }
  post.info.upVotes += 1;
  await post.save();
  return res.json({ success: true, post: post });
});
router.post("/:id/downvote", verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findOne().where({ slug: id });
  if (post === null) {
    return res.json({ success: false, message: "post not found" });
  }
  post.info.downVotes += 1;
  await post.save();
  return res.json({ success: true, post: post });
});

router.post(
  "/:id/comment",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { comment } = req.body;
    const { username } = req.user;
    const post = await Post.findOne().where({ slug: id });
    if (post === null) {
      return res.json({ success: false, message: "post not found" });
    }
    post.info.comments.push({
      author: username,
      id: uuidv4(),
      text: comment,
      date: Date.now(),
      upVotes: 0,
      downVotes: 0,
      mainComment: true,
      replies: [],
    });
    post.info.commentCount += 1;
    await post.save();
    return res.json({ success: true, comment: post.info.comments });
  })
);

router.post(
  "/reply/:id",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { reply, commentId } = req.body;
    console.log(reply, commentId);
    const { username } = req.user;
    const post = await Post.findOne().where({ slug: id });
    if (post === null) {
      return res.json({ success: false, message: "post not found" });
    }
    const mainComment = post.info.comments.find(
      (comment) => comment.id == commentId
    );
    if (mainComment === undefined) {
      return res.json({ success: false, message: "comment not found" });
    }
    console.log("hhhh");
    mainComment.replies.push({
      author: username,
      id: uuidv4(),
      text: reply || "no reply",
      date: Date.now(),
      upVotes: 0,
      downVotes: 0,
      mainComment: false,
    });
    post.info.commentCount += 1;
    await post.save();
    return res.json({ success: true, comment: post.info.comments });
  })
);

router.post("/:id/commentVote", verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const { commentId, direction } = req.body;
  const post = await Post.findOne().where({ slug: id });
  if (post === null) {
    return res.json({ success: false, message: "post not found" });
  }

  const comment = post.info.comments.find(
    (comment) => comment.id === commentId
  );
  if (comment === undefined) {
    return res.json({ success: false, message: "comment not found" });
  }

  if (direction === "upvote") {
    comment.upVotes += 1;
  } else if (direction === "downvote") {
    comment.downVotes += 1;
  }

  await post.save();
  return res.json({ success: true, comment: comment });
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findOne().where({ slug: id });
  if (post === null) {
    return res.json({ success: false, message: "post not found" });
  }
  return res.json({ success: true, post: post });
});

router.get(
  "/search/:keyword",
  asyncHandler(async (req, res) => {
    const { keyword } = req.params;
    const posts = await Post.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { author: { $regex: keyword, $options: "i" } },
      ],
    });
    return res.json({ success: true, posts: posts });
  })
);
module.exports = router;
