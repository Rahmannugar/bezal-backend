import express from "express";
import {
  signin,
  signup,
  forgotPassword,
  editUser,
  searchUsers,
  getUser,
  followUser,
  getUserFollowersAndFollows,
} from "../controllers/userAuth.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/users/search", searchUsers);
router.get("/users/:userName", getUser);
router.get("/users/following/:userName", getUserFollowersAndFollows);

// Protected routes
router.patch("/users/:userId", verifyToken, editUser);
router.put("/users/:userName/follow", verifyToken, followUser);

export default router;
