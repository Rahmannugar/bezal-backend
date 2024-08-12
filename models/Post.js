const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  picturePath: String,
  userPicturePath: String,
  likes: {
    type: Array,
    default: [],
  },
  comments: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
