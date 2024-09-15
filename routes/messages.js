import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getMessages, sendMessage } from "../controllers/message.js";

const router = express.Router();

// Protected routes
router.post("/", verifyToken, sendMessage);
router.get("/:conversationId", verifyToken, getMessages);

export default router;
