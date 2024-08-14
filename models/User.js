import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    min: 2,
    max: 50,
  },
  lastName: {
    type: String,
    required: true,
    min: 2,
    max: 50,
  },
  userName: {
    type: String,
    required: true,
    min: 2,
    max: 50,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 5,
  },
  profileImage: {
    type: String,
    default: "https://i.ibb.co/4sCN8rm/bezal.png",
  },
  coverImage: {
    type: String,
    default: "https://i.ibb.co/4sCN8rm/bezal.png",
  },
  bio: {
    type: String,
    default: "",
  },

  userFollows: {
    type: Array,
    default: [],
  },

  userFollowers: {
    type: Array,
    default: [],
  },
  userPosts: {
    type: Array,
    default: [],
  },
  location: {
    type: String,
    default: "",
  },
});

const User = mongoose.model("User", userSchema);
export default User;
