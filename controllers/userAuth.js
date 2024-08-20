import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

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
    const salt = await bcrypt.genSalt();
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
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 3 * 60 * 60 * 1000, // 3 hours
    });

    // Removing password from user data before sending the response
    const userData = existingUser.toObject();
    delete userData.password;

    // Sending response with user data
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error during user signin:", error); // Log the actual error for debugging
    res.status(500).json({ message: "User Signin has failed!" });
  }
};

// Edit user function
export const editUser = async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  try {
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
    const { loggedInUserName } = req.body;

    // Find the user to follow/unfollow
    const user = await User.findOne({ userName });
    const loggedInUser = await User.findOne({ userName: loggedInUserName });

    if (!user || !loggedInUser) {
      return res.status(404).send("User not found");
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
    } else {
      // Follow
      loggedInUser.userFollows.push(user._id);
      user.userFollowers.push(loggedInUser._id);
    }

    await loggedInUser.save();
    await user.save();

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

//forgotPassword function
export const forgotPassword = (req, res) => {};
