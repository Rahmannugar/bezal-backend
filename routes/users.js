import express from "express";
import {
  signin,
  signup,
  forgotPassword,
  editUser,
  searchUsers,
  getUser,
  followUser,
} from "../controllers/userAuth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.patch("/users/:userId", editUser);
router.get("/users/search", searchUsers);
router.get("/users/:userName", getUser);
router.put("/users/:userName/follow", followUser);

export default router;
