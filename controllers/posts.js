import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";

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

export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.views++;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ userName: username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Send user posts as a response
    const userPosts = user.userPosts;
    res.status(200).json(userPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Comment.deleteMany({ postId });

    const userIds = Array.from(
      new Set([...post.likes.keys(), ...post.dislikes.keys()])
    );
    await User.updateMany(
      { _id: { $in: userIds } },
      {
        $unset: { [`likes.${postId}`]: 1, [`dislikes.${postId}`]: 1 },
      }
    );

    await Post.findByIdAndDelete(postId);

    user.userPosts = user.userPosts.filter(
      (userPost) => userPost._id.toString() !== postId
    );

    await user.save();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete the post" });
  }
};

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
    const savedUser = await user.save();
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
    const savedUser = await user.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to dislike the post" });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { commentMessage } = req.body;
    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const newComment = new Comment({
      postId,
      userId,
      userName: user.userName,
      userPicturePath: user.profileImage,
      commentMessage: commentMessage,
    });
    const savedComment = await newComment.save();
    post.comments.unshift(savedComment);

    await post.save();
    res.status(200).json(savedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to comment" });
  }
};
