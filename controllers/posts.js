import Post from "../models/Post.js";
import User from "../models/User.js";

//creating post
export const createPost = async (req, res) => {
  try {
    const { postMessage, picturePath, isPublic } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      userName: user.userName,
      postMessage,
      userPicturePath: user.profileImage,
      picturePath,
      isPublic,
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

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
      user.likes.delete(postId);
    } else {
      post.likes.set(userId, true);
      post.dislikes.delete(userId);

      user.likes.set(postId, true);
      user.dislikes.delete(postId);
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to like the post" });
  }
};

export const dislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isdisLiked = post.dislikes.get(userId);

    if (isdisLiked) {
      post.dislikes.delete(userId);
      user.dislikes.delete(postId);
    } else {
      post.dislikes.set(userId, true);
      post.likes.delete(userId);

      user.dislikes.set(postId, true);
      user.likes.delete(postId);
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to dislike the post" });
  }
};

export const commentPost = async (req, res) => {};
