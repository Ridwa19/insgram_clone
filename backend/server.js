const express = require("express");
require("dotenv").config({ path: "./config/config.env" });
require("./config/db").connectToDB(); // Call the function to connect to MongoDB
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
app.use(express.json());
app.use(cors());

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store users' socket connections
const USER_SOCKET_MAP = new Map();

const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");
const userRoute = require("./routes/user");
const chatRoute = require("./routes/chat");
const storyRoute = require("./routes/story");
const User = require("./models/User");

// API Routes
app.use("/auth", authRoute);
app.use("/post", postRoute);
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/story", storyRoute);

// Test Route
app.get("/test", (req, res) => {
  res.send("Hello from the server!");
});

// Socket.io Configuration
io.on("connect", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("online", async ({ uid }) => {
    USER_SOCKET_MAP.set(socket.id, uid);
    await User.updateOne({ _id: uid }, { $set: { online: true } });
  });

  socket.on("typingon", ({ uid, roomId }) => {
    socket.broadcast.emit(`typinglistenon${roomId}`, uid);
  });

  socket.on("typingoff", ({ uid, roomId }) => {
    socket.broadcast.emit(`typinglistenoff${roomId}`, uid);
  });

  socket.on("disconnect", async () => {
    await User.updateOne(
      { _id: USER_SOCKET_MAP.get(socket.id) },
      { $set: { online: false, lastSeen: Date.now() } }
    );
    USER_SOCKET_MAP.delete(socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port: ${PORT}`);
});
