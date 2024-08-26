import express from "express";
import {
  commentPost,
  createPost,
  deletePost,
  getUserPosts,
  getPosts,
  likePost,
  updatePost,
  dislikePost,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/posts", getPosts);
router.get("/userpost/:username", getUserPosts);

// Protected routes
router.post("/createpost/:userId", verifyToken, createPost);
router.patch("/:postId/like", verifyToken, likePost);
router.patch("/:postId/dislike", verifyToken, dislikePost);

export default router;
