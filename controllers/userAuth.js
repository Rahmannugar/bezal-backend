import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

//Sign up function
export const signup = async (req, res) => {
  const { firstName, lastName, userName, email, password } = req.body;
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
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);

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
    res.status(201).json(userData);
  } catch (error) {
    console.error("Error during user signin:", error); // Log the actual error for debugging
    res.status(500).json({ message: "User Signin has failed!" });
  }
};
//forgotPassword function
export const forgotPassword = (req, res) => {};
