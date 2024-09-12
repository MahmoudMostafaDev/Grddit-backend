const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const router = express.Router();
const User = require("../models/users");
const { verifyToken } = require("../auth/util");
const Chat = require("../models/Chats");

router.get(
  "/",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const username = req.user.username;
    const chats = await Chat.find().where("users").in([username]);
    if (!chats) return res.status(404).json({ success: false });

    if (chats.length) {
      const readyChats = await Promise.all(
        chats.map(async (chat) => {
          const secondUser = chat.users.filter((user) => user !== username);
          const secondUserData = await User.findOne(
            { username: secondUser },
            "username img"
          );
          console.log(secondUserData);
          const chata = {
            chat,
            secondUserData,
          };
          return chata;
        })
      );
      return res.json({ success: true, chats: readyChats });
    }

    return res.json({ success: true, chats: [] });
  })
);
router.post(
  "/",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const userOne = req.user.username;
    const userTwo = req.body.userTwo;
    let twousers = [userOne, userTwo];
    twousers.sort();
    const chat = await Chat.create({
      users: [userOne, userTwo],
      roomId: twousers[0] + twousers[1],
      messages: [],
    });
    res.json({ success: true, chat: chat });
  })
);
module.exports = router;
