import { io } from "../index.js";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

//create new conversation
export const newConversation = async (req, res) => {
  const { sender, receiver } = req.body;
  const senderId = await User.findById(sender);
  const receiverId = await User.findById(receiver);

  if (!senderId && !receiverId) {
    return res.status(404).json({ message: "Users not found" });
  }

  const conversation = new Conversation({
    members: [senderId, receiverId],
  });
  try {
    const savedConversation = await conversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
};
