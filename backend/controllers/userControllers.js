import { User } from "../models/userModel.js";
import bcrypt from "bcrypt"

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
    }

    const existsUser = await User.findOne({ email });

    if (existsUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashpassword =  await bcrypt.hash(password,10)

    const user  = await User.create({
      name,
      email,
      password:hashpassword
    })

   res.status(201).json({message:"User Created Successfully",user})
  } catch (error) {
    res.status(500).json({message:"Internal server error"})
  }
};


export const loginUser = async(req,res)=>{
  try {
    const {email,password} = req.body
    
    const user =  User.findOne({email})

    if(!user){
        res.status(400).json({message:"User doesn't exists"})
    }

    const comparePassword =  bcrypt.compare(password,user.password)

    if(!comparePassword){
      res.status(400).json({message:"Invalid Credentials"})
    }

    res.json({message})

  } catch (error) {
    
  }
}