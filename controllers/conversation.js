import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

//create new conversation
export const newConversation = async (req, res) => {
  const { sender, receiver } = req.body;
  const existingSender = await User.findById(sender);
  const existingReceiver = await User.findById(receiver);

  if (!existingSender) {
    return res.status(404).json({ message: "Sender not found" });
  }
  if (!existingReceiver) {
    return res.status(404).json({ message: "Receiver not found" });
  }

  // Check if the conversation already exists
  const existingConversation = await Conversation.findOne({
    members: { $all: [sender, receiver] },
  });

  if (existingConversation) {
    return res.status(200).json(existingConversation);
  }

  const conversation = new Conversation({
    members: [existingSender._id, existingReceiver._id],
  });
  try {
    const savedConversation = await conversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json({ message: "Failed to create conversation" });
  }
};

//get users conversation
export const getConversations = async (req, res) => {
  const { userId } = req.params;
  try {
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    }).populate("members", "userName profileImage bio");

    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Failed to find conversations" });
  }
};
