import express from 'express'
import { protect } from '../middelware/auth.js';
import { addCar, changeRoleToOwner, deleteCar, getDashbordData, getOwnerCars, toggleCarAvailability, updateUserImage } from '../controllers/ownerController.js';
import upload from '../middelware/multer.js'

const ownerRouter = express.Router();

ownerRouter.post('/change-role', protect, changeRoleToOwner)
ownerRouter.post('/add-car', upload.single("image"), protect, addCar)
ownerRouter.get('/cars', protect, getOwnerCars)
ownerRouter.post('/toggle-car', protect, toggleCarAvailability)
ownerRouter.post('/delete-car', protect, deleteCar)

ownerRouter.get('/dashboard', protect, getDashbordData)
ownerRouter.post('/update-image', upload.single("image"),protect, updateUserImage)


export default ownerRouter;