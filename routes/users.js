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
  verifyUser,
  resetPassword,
} from "../controllers/userAuth.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/users/search", searchUsers);
router.get("/users/:userName", getUser);
router.get("/users/following/:userName", getUserFollowersAndFollows);
router.post("/forgotPassword", forgotPassword);
router.post("/resetpassword/:token", resetPassword);

// Protected routes
router.get("/verify/:userId", verifyToken, verifyUser);
router.patch("/users/:userId", verifyToken, editUser);
router.put("/users/:userName/follow", verifyToken, followUser);

export default router;
