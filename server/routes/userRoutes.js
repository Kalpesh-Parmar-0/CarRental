import express from 'express'
import {registerUser, loginUser, getUserData, getCars} from '../controllers/userController.js';
import { protect } from '../middelware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data', protect, getUserData)
userRouter.get('/cars', getCars)


export default userRouter;