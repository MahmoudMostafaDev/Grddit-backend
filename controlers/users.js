const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const router = express.Router();
const User = require("../models/users");
const Posts = require("../models/Posts");
const { verifyToken } = require("../auth/util");

router.get(
  "/:username",
  asyncHandler(async (req, res, next) => {
    const { username, img, banner, posts, subs, recent } =
      await User.findOne().where("username", req.params.username);
    if (username === "null")
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    const postsObj = await Posts.find().where("author", username).limit(10);
    res
      .status(200)
      .json({ username, img, banner, posts, subs, recent, postsObj });
  })
);
router.get(
  "/:username/recent",
  asyncHandler(async (req, res, next) => {
    const { username } = req.params;
    const recent = await User.findOne({ username: username }, "recent");
    res.json({ success: true, recent: recent.recent });
  })
);

router.post(
  "/:username/recent",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const { username } = req.params;
    const { post } = req.body;
    const user = await User.findOne({ username: username });
    if (user.recent.includes(post)) {
      return res.json({ success: false, recent: user.recent });
      s;
    } else {
      user.recent.push(post);
      await user.save();
      res.json({ success: true, recent: user.recent });
    }
  })
);
module.exports = router;
