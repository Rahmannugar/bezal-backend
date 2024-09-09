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
    default:
      "https://firebasestorage.googleapis.com/v0/b/bezal-aa24a.appspot.com/o/files%2Fbezal.png?alt=media&token=ddfaa866-5253-494e-8538-23c20ac65391",
  },
  coverImage: {
    type: String,
    default:
      "https://firebasestorage.googleapis.com/v0/b/bezal-aa24a.appspot.com/o/files%2Fbezal.png?alt=media&token=ddfaa866-5253-494e-8538-23c20ac65391",
  },
  bio: {
    type: String,
    default: "",
  },
  dateOfBirth: {
    type: String,
    default: "",
  },
  isDatePublic: {
    type: Boolean,
    default: false,
  },
  userFollows: {
    type: Array,
    default: [],
  },

  userFollowers: {
    type: Array,
    default: [],
  },
  likes: {
    type: Map,
    of: Boolean,
    default: {},
  },
  dislikes: {
    type: Map,
    of: Boolean,
    default: {},
  },
  comments: {
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
  notifications: [
    {
      image: String,
      msg: String,
      read: { type: Boolean, default: false },
      name: String,
      createdAt: Date,
    },
  ],
  readNotifications: {
    type: Boolean,
    default: true,
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
