import express from "express";
import {
  commentPost,
  createPost,
  deletePost,
  getUserPosts,
  getPosts,
  likePost,
  updatePost,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/posts", getPosts);
router.get("/userpost/:username", getUserPosts);
// Protected routes
router.post("/createpost/:userId", verifyToken, createPost);

export default router;
