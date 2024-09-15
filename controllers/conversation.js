import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

//create new conversation
export const newConversation = async (req, res) => {
  const { senderId, receiverId } = req.body;
  const existingSender = await User.findOne({ _id: senderId });
  const existingReceiver = await User.findOne({ _id: receiverId });

  if (!existingSender) {
    return res.status(404).json({ message: "Sender not found" });
  }
  if (!existingReceiver) {
    return res.status(404).json({ message: "Receiver not found" });
  }
  const conversation = new Conversation({
    members: [existingSender._id.toString(), existingReceiver._id.toString()],
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
    });
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Failed to find conversations" });
  }
};
