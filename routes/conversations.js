import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getConversations,
  newConversation,
} from "../controllers/conversation.js";

const router = express.Router();

// Protected routes
router.post("/", verifyToken, newConversation);
router.get("/:userId", verifyToken, getConversations);

export default router;
