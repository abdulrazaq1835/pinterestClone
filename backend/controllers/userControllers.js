import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../config/mailer.js";

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
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const userProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.json(user);
};

export const followerAndflollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const loggInUser = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({ message: "User not present with this id" });
    }

    if (user.id.toString() === loggInUser.id.toString()) {
      res.status(404).json({ message: "You Can't Follow YourSelf" });
    }

    if (user.followers.includes(loggInUser.id)) {
      const indexFollowing = loggInUser.following.indexOf(user.id);
      const indexFollowers = user.followers.indexOf(loggInUser.id);

      loggInUser.following.splice(indexFollowing, 1);
      user.followers.splice(indexFollowers, 1);

      await loggInUser.save();
      await user.save();
      res.json({ message: "User Unfollowed" });
    } else {
      loggInUser.following.push(user.id);
      user.followers.push(loggInUser.id);
      await loggInUser.save();
      await user.save();
      res.json({ message: "User followed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error " });
  }
};

export const logOut = async (req, res) => {
  try {
    res.cookie("token", { maxAge: 0 });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User Doesn't Exists" });
    }

    const otpGenerate = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otpGenerate;

    user.resetOTPExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Otp",
      text: `your OTP is ${otpGenerate}. It is valid for 10 minutes.`,
    });
    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otpGenerate } = req.body;

    if (!email || !newPassword || !otpGenerate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User doesn't Exists" });
    }

    if (user.resetOTP !== otpGenerate || user.resetOTPExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.log("error", error);
  }
};
