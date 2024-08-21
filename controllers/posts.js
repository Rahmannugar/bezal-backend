import Post from "../models/Post.js";
import User from "../models/User.js";

//creating post
export const createPost = async (req, res) => {
  try {
    const { postMessage, picturePath } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      userName: user.userName,
      postMessage,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    //save post to database
    const savedPost = await newPost.save();

    //sav post to userdatabase
    user.userPosts.push(savedPost);
    await user.save();

    const post = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const getPosts = async (req, res) => {
  try {
    const post = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Send user posts as a response
    const userPosts = user.userPosts;
    res.status(200).json(userPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to fetch user posts" });
  }
};

export const updatePost = async (req, res) => {};

export const deletePost = async (req, res) => {};

export const likePost = async (req, res) => {};

export const commentPost = async (req, res) => {};
