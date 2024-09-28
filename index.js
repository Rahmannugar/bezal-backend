import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";

// App configuration
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://bezal.netlify.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://bezal.netlify.app");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(cookieParser());
app.use(bodyParser.json());
dotenv.config();

// Routes
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import conversationRoutes from "./routes/conversations.js";
import messageRoutes from "./routes/messages.js";

app.use("/posts", postRoutes);
app.use("/", userRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);

// MongoDB configuration
const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT || 8080;

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");

    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((error) => console.log(error));

// HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "https://bezal.netlify.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection
io.on("connection", (socket) => {
  //console.log("User connected:", socket.id);

  // user disconnect
  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket.id);
  });
});

export { server, io };
