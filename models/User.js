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
  picturePath: {
    type: String,
    default: "https://i.ibb.co/4sCN8rm/bezal.png",
  },
  bio: {
    type: String,
    min: 5,
  },
  follows: {
    type: Array,
    default: [],
  },
  followers: {
    type: Array,
    default: [],
  },
  posts: {
    type: Array,
    default: [],
  },

  location: String,
});

const User = mongoose.model("User", userSchema);
export default User;
