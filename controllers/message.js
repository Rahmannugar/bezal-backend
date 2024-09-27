import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { io } from "../index.js";

// Send message
export const sendMessage = async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();

    await Conversation.findByIdAndUpdate(
      savedMessage.conversationId,
      { updatedAt: Date.now() },
      { new: true }
    );

    res.status(200).json(savedMessage);
    io.emit("newMessage", savedMessage);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get messages
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
