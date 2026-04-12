import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js";

// generate JWT Token
const generateToken = (userId)=>{
    // const payload = userId;
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: "7d"})
}

// registor user
export const registerUser = async (req, res)=> {
    try {
        const {name, email, password} = req.body
        if(!name || !email || !password){
            return res.json({success: false, message: 'fill all the fields'})
        }
        if (password.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters long' })
        }

        const userExists = await User.findOne({email})
        if(userExists){
            return res.json({success:false, message:'user already exists'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({name, email, password:hashedPassword})
        const token = generateToken(user._id.toString())
        // res.json({success:true, token})

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.json({success:true})

    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// login user
export const loginUser = async(req, res)=>{
    try{
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.json({success:false, message:"user not found"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.json({success:false, message:"Invalid credentials"})
        }
        const token = generateToken(user._id.toString())
        // res.json({success:true, token})

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        res.json({success:true})

    } catch(error){
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

export const logoutUser = (req, res) => {
    res.clearCookie("token")
    res.json({ success: true, message: "Logged out successfully" })
}

// get user data using token(jwt)
export const getUserData = async (req, res)=>{
    try {
        const {user} = req;
        res.json({success:true, user})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// get all cars for frontend
export const getCars = async (req, res)=>{
    try {
        const cars = await Car.find({isDeleted: false, isAvaliable: true})
        res.json({success:true, cars})
        
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// get all cities
export const getCities = async (req, res)=> {
    try {
        // ✅ get all unique locations from cars that are active
        const cities = await Car.distinct('location', {
            isDeleted: false,
            isAvaliable: true
        })
        res.json({success: true, cities})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}