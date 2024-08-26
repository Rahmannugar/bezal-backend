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
  getPost,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/posts", getPosts);
router.get("/userposts/:username", getUserPosts);
router.get("/post/:postId", getPost);

// Protected routes
router.post("/createpost/:userId", verifyToken, createPost);
router.delete("/:postId/deletepost", verifyToken, deletePost);
router.patch("/:postId/like", verifyToken, likePost);
router.patch("/:postId/dislike", verifyToken, dislikePost);

export default router;
