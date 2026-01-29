import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existsUser = await User.findOne({ email });

    if (existsUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,

      password: hashpassword,
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SEC, {
      expiresIn: "15d",
    });

    user.password = undefined;

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 15 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ message: "User Created Successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User doesn't exists" });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SEC, {
      expiresIn: "15d",
    });
    user.password = undefined;

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: "Login successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Inetrnal server error" });
  }
};

export const myProfile = async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    res.json(user)
  } catch (error) {}
};
