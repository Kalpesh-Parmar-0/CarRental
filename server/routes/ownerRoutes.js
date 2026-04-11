import express from 'express'
import { protect } from '../middelware/auth.js';
import { addCar, changeRoleToOwner, deleteCar, getDashbordData, getOwnerCars, toggleCarAvailability, updateCar, updateProfile } from '../controllers/ownerController.js';
import upload, { uploadMultiple, uploadSingle } from '../middelware/multer.js'

const ownerRouter = express.Router();

ownerRouter.post('/change-role', protect, changeRoleToOwner)
ownerRouter.post('/add-car', protect, uploadMultiple, addCar)
ownerRouter.post('/update-car', protect, uploadMultiple, updateCar)
ownerRouter.get('/cars', protect, getOwnerCars)
ownerRouter.post('/toggle-car', protect, toggleCarAvailability)
ownerRouter.post('/delete-car', protect, deleteCar)

ownerRouter.get('/dashboard', protect, getDashbordData)
ownerRouter.post('/update-profile', protect, uploadSingle, updateProfile)


export default ownerRouter;