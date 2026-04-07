import jwt from 'jsonwebtoken'
import User from '../models/User.js';

export const protect = async (req, res, next) =>{
    const token = req.cookies.token;
    if(!token){
        return res.json({success:false, message: "not autorized"})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select("-password")
        next()
    } catch (error) {
        return res.json({success:false, message: "not autorized"})
    }
}