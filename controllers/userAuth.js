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
    //finding existing user
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(400).json({ message: "User does not exist!" });

    //checkingpassword
    const isPassword = await bcrypt.compare(password, existingUser.password);
    if (!isPassword)
      return res.status(400).json({ message: "Password is incorrect! " });

    //creating usersession
    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 3 * 60 * 60 * 1000, // 3 hours
      })
      .json(existingUser);

    //error catching
  } catch (error) {
    res.status(500).json({ message: "User Signin has failed!" });
  }
};

//forgotPassword function
export const forgotPassword = (req, res) => {};
