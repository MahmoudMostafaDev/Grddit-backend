const express = require("express");
const dotenv = require("dotenv");
const { getUserPassword } = require("./auth/util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./models/users");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const asyncHandler = require("./middleware/asyncHandler");
const cors = require("cors");
const { Server } = require("socket.io");
const chats = require("./models/Chats");
const http = require("http");
const upload = require("./middleware/multer");
const cloudinary = require("./util/cloudinary");
const { createProxyMiddleware } = require("http-proxy-middleware");
// routes
const recentRoute = require("./controlers/recent");
const postsRoute = require("./controlers/posts");
const subsRoute = require("./controlers/subs");
const userRoute = require("./controlers/users");
const chatRoute = require("./controlers/chats");

dotenv.config();

console.log(getUserPassword("mahmoud"));
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
// use routes
app.use("/api/recent", recentRoute);
app.use("/api/posts", postsRoute);
app.use("/api/subs", subsRoute);
app.use("/api/user", userRoute);
app.use("/api/chats", chatRoute);
app.listen(5000, () => console.log("server is running on port 5000"));

//chatt
const server = http.createServer(app);
server.listen(5050);

const io = new Server(server, {
  cors: {
    origin: "https://grddit-7f7df.web.app",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["polling"],
  },
});

const apiProxy = createProxyMiddleware({
  target: "https://grddit-backend.onrender.com:5050", // target the Socket.IO server
  changeOrigin: true,
  pathRewrite: { "^/socket.io": "" }, // rewrite the path to remove the /socket.io prefix
  ws: true, // enable WebSocket support
});

app.use("/socket.io", apiProxy); // use the proxy for requests to /socket.io
io.listen(5050);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("joinRoom", (data) => {
    socket.join(data);
  });

  socket.on("sendMessage", async (data) => {
    const author = data.author;
    const user = await userModel.findOne({ username: author });
    console.log(user);
    if (!user) return;
    socket.to(data.id).emit("receiveMessage", { img: user.img, ...data });
    const chat = await chats.findOne({ roomId: data.id });
    if (!chat) return;
    chat.messages.push(data);
    await chat.save();
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use;

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const passHashed = await getUserPassword(username);
  console.log(passHashed);
  console.log(password);
  if (!passHashed) {
    return res
      .status(404)
      .json({ success: false, error: "user or password invalid" });
  }
  const valid = await bcrypt.compare(password, passHashed);
  console.log(valid);
  if (!valid) {
    return res
      .status(404)
      .json({ success: false, error: "user or password invalid" });
  }
  const token = jwt.sign({ username: username }, process.env.STK);
  res.json({ success: true, token: token });
});

app.post(
  "/register",
  upload.fields([{ name: "image" }, { name: "banner" }]),
  async (req, res) => {
    console.log("start");
    const { username, password } = req.body;
    console.log(username, password);
    const passHashed = await bcrypt.hash(password, 10);
    try {
      const img = await cloudinary.uploader.upload(req.files.image[0].path);
      const banner = await cloudinary.uploader.upload(req.files.banner[0].path);
      if (!img)
        return res.json({ success: false, message: "Please upload img" });
      if (!banner)
        return res.json({ success: false, message: "Please upload banner" });
      const user = await userModel.create({
        username: username,
        password: passHashed,
        img: img.secure_url || "https://i.pravatar.cc",
        banner: banner.secure_url || "https://i.pravatar.cc",
        posts: [],
        subs: [],
      });
      if (!user) {
        return res.json({ success: false, message: "an error happend" });
      }
      const token = jwt.sign({ username: username }, process.env.STK);
      res.json({ success: true, token: token });
    } catch (error) {
      console.log(error);
    }
  }
);
app.use(errorHandler);
