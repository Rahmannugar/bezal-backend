import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const signup = async (req, res) => {
  const { firstName, lastName, userName, email, password } = req.body;
  try {
    //finding existing user
    const existingUserByEmail = await User.findOne({ email });
    const existingUserByUserName = await User.findOne({ userName });
    if (existingUserByEmail)
      return res.status(404).json({ message: "Email already exists" });

    if (existingUserByUserName)
      return res.status(404).json({ message: "Username already exists" });

    //password hashing
const resul
    //error catching
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signin = async (req, res) => {};
