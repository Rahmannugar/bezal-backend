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
    const populatedConversation = await Conversation.findById(
      existingConversation._id
    ).populate("members", "userName profileImage bio");
    return res.status(200).json(populatedConversation);
  }

  const conversation = new Conversation({
    members: [existingSender._id, existingReceiver._id],
  });
  try {
    const savedConversation = await conversation.save();
    const populatedConversation = await Conversation.findById(
      savedConversation._id
    ).populate("members", "userName profileImage bio");
    res.status(200).json(populatedConversation);
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
