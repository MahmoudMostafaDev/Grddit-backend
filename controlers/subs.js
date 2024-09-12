const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const router = express.Router();
const { verifyToken } = require("../auth/util");
const User = require("../models/users");
const Sub = require("../models/Subs");
const coludinary = require("../util/cloudinary");
const upload = require("../middleware/multer");
router.post(
  "/:id",
  verifyToken,
  upload.fields([{ name: "img" }, { name: "banner" }]),
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { username: creator } = req.user;
    const { mainTitle, description } = req.body;
    console.log(req.body);
    try {
      const resOne = await coludinary.uploader.upload(req.files.img[0].path);
      const resTwo = await coludinary.uploader.upload(req.files.banner[0].path);
      const img = resOne.secure_url;
      const banner = resTwo.secure_url;
      if (!img)
        return res.json({ success: false, message: "Please upload img" });
      if (!banner)
        return res.json({ success: false, message: "Please upload banner" });
      const sub = await Sub.create({
        subId: id,
        mainTitle: mainTitle,
        img: img,
        description: description,
        banner: banner,
        creator: creator,
        posts: [],
        members: [],
      });
      return res.json({ success: true, sub: sub });
    } catch (error) {
      return res.json({ success: false, message: "an error happend" });
    }
  })
);
router.post(
  "/:id/join",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { username: member } = req.user;
    const user = await User.findOne({ username: member });
    user.subs.push(id);
    await user.save();
    const sub = await Sub.findOne({ subId: id });
    sub.members.push(member);
    sub.memberCount += 1;
    await sub.save();
    return res.json({ success: true, sub: sub });
  })
);
router.get(
  "/explore",
  asyncHandler(async (req, res, next) => {
    const subs = await Sub.find(
      {},
      "subId mainTitle img description members memberCount"
    ).limit(12);
    return res.json({ success: true, subs: subs });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const sub = await Sub.findOne({ subId: id });
    if (!sub) {
      return res.json({ success: false, sub: sub });
    }
    return res.json({ success: true, sub: sub });
  })
);

router.get(
  "/search/:keyword",
  asyncHandler(async (req, res, next) => {
    const { keyword } = req.params;
    const subs = await Sub.find({
      $or: [
        { subId: { $regex: keyword, $options: "i" } },
        { mainTitle: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });
    return res.json({ success: true, subs: subs });
  })
);

module.exports = router;
