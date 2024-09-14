import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { newConversation } from "../controllers/conversation.js";

const router = express.Router();

// Protected routes
router.post("/", verifyToken, newConversation);

export default router;
