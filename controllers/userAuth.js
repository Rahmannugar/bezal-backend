import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import { io } from "../index.js";
import mongoose from "mongoose";

//Sign up function
export const signup = async (req, res) => {
  const {
    firstName,
    lastName,
    userName,
    email,
    password,
    dateOfBirth,
    isDatePublic,
  } = req.body;
  try {
    //finding existing user
    const existingUserByEmail = await User.findOne({ email });
    const existingUserByUserName = await User.findOne({ userName });
    if (existingUserByEmail)
      return res.status(400).json({ message: "Email already exists!" });

    if (existingUserByUserName)
      return res.status(401).json({ message: "Username already exists!" });

    //password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating new user
    const newUser = new User({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      dateOfBirth,
      isDatePublic,
    });
    const savedUser = await newUser.save();

    res.status(200).json(savedUser);

    //error catching
  } catch (error) {
    res.status(500).json({ message: "User registration has failed!" });
  }
};

//signin function
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Finding existing user
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist!" });
    }

    // Checking password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Password is incorrect!" });
    }

    // Generating token
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    // Creating user session (setting the cookie)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 60 * 60 * 1000, // 3 hours
    });

    // Removing password from user data before sending the response
    const userData = existingUser.toObject();
    delete userData.password;

    // Sending response with user data
    res.status(200).json({
      ...userData,
      likes: existingUser.likes,
      dislikes: existingUser.dislikes,
    });
  } catch (error) {
    console.error("Error during user signin:", error);
    res.status(500).json({ message: "User Signin has failed!" });
  }
};

//Verify user function
export const verifyUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist!" });
    }
    res.status(200).json(existingUser);
  } catch (error) {
    console.error("Token has expired", error);
    res.status(500).json({ message: "Token has expired" });
  }
};

// Edit user function
export const editUser = async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  try {
    // Check if the user making the request is the same as the user being updated
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    // Find the user by ID and update with the provided fields
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    // Check if user exists
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    const userData = updatedUser.toObject();
    delete userData.password;

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error during user update:", error);
    res.status(500).json({ message: "Failed to update user data!" });
  }
};

// Search users by username
export const searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    if (!query) {
      return res.status(400).json({ message: "Query is required!" });
    }

    const users = await User.find({
      userName: { $regex: query, $options: "i" },
    }).select("userName profileImage");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error during user search:", error);
    res.status(500).json({ message: "Failed to search users!" });
  }
};

// get user function
export const getUser = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send user data as a response
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Follow or Unfollow User
export const followUser = async (req, res) => {
  try {
    const { userName } = req.params;
    const loggedInUserId = req.user.id;

    // Find the user to follow/unfollow
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).send("User to follow/unfollow not found");
    }

    //verify loggedinuser
    const loggedInUser = await User.findById(loggedInUserId);
    if (!loggedInUser) {
      return res.status(404).send("Logged-in user not found");
    }

    // Check if the authenticated user is attempting to follow/unfollow themselves
    if (loggedInUser.userName === user.userName) {
      return res.status(400).send("You cannot follow or unfollow yourself");
    }

    const isFollowing = loggedInUser.userFollows.includes(user._id);

    if (isFollowing) {
      // Unfollow
      loggedInUser.userFollows = loggedInUser.userFollows.filter(
        (id) => !id.equals(user._id)
      );
      user.userFollowers = user.userFollowers.filter(
        (id) => !id.equals(loggedInUser._id)
      );
      const notification = {
        _id: new mongoose.Types.ObjectId(),
        image: loggedInUser.profileImage,
        msg: `${loggedInUser.userName} unfollowed you!`,
        read: false,
        name: loggedInUser.userName,
        createdAt: new Date(),
      };

      user.notifications.push(notification);
      user.readNotifications = false;
      await loggedInUser.save();
      await user.save();

      io.emit("newNotification", notification);
    } else {
      // Follow
      loggedInUser.userFollows.push(user._id);
      user.userFollowers.push(loggedInUser._id);

      const notification = {
        _id: new mongoose.Types.ObjectId(),
        image: loggedInUser.profileImage,
        msg: `${loggedInUser.userName} followed you!`,
        read: false,
        name: loggedInUser.userName,
        createdAt: new Date(),
      };

      user.notifications.push(notification);

      user.readNotifications = false;
      await loggedInUser.save();
      await user.save();

      io.emit("newNotification", notification);
    }

    // Respond with updated data
    res.status(200).json({
      following: !isFollowing,
      updatedUserFollows: loggedInUser.userFollows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get followers and follows details
export const getUserFollowersAndFollows = async (req, res) => {
  try {
    const { userName } = req.params;

    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Populate userFollowers and userFollows with full user details
    const followers = await User.find({
      _id: { $in: user.userFollowers },
    }).select("userName profileImage");
    const follows = await User.find({ _id: { $in: user.userFollows } }).select(
      "userName profileImage"
    );

    res.status(200).json({
      followers,
      follows,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching followers and follows" });
  }
};

//readAllNotifications function
export const readAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Mark all notifications as read
    user.notifications.forEach((notification) => {
      notification.read = true;
    });
    user.readNotifications = true;

    await user.save();

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

//readNotification function
export const readSingularNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const notification = user.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found!" });
    }

    notification.read = true;

    // Save updated user data
    await user.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

//forgotPassword function
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Finding existing user
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User does not exist!" });
    }
    // Generate a unique JWT token for the user that contains the user's id
    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    // Send the token to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: "Reset Password",
      html: `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="http://localhost:5173/reset-password/${token}">http://localhost:5173/reset-password/${token}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: "Email sent" });
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Reset password has failed!" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    // Verify the token sent by the user
    const decodedToken = jwt.verify(req.params.token, process.env.JWT_SECRET);

    // If the token is invalid, return an error
    if (!decodedToken) {
      return res.status(401).send({ message: "Invalid token" });
    }

    // find the user with the id from the token
    const user = await User.findOne({ _id: decodedToken.userId });
    if (!user) {
      return res.status(401).send({ message: "No user found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    // Update user's password, clear reset token and expiration time
    user.password = req.body.password;
    await user.save();

    // Send success response
    res.status(200).send({ message: "Password updated" });
  } catch (err) {
    // Send error response if any error occurs
    res.status(500).send({ message: err.message });
  }
};
