const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const router = express.Router();
const { verifyToken } = require("../auth/util");
const User = require("../models/users");

router.get(
  "/",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const { username } = req.body;
    console.log(username);
    const recents = await User.findOne({ username: username }, "recent");
    res.json({ success: true, recents: recents.recent });
  })
);

module.exports = router;
