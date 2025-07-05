import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import Car from "../models/Car.js"
import fs from "fs";

// api to change role of user
export const changeRoleToOwner = async (req, res) => {
    try {
        const {_id} = req.user;
        await User.findByIdAndUpdate(_id, {role: "owner"})
        res.json({success:true, message: "Now you can list cars"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

// api to list car
export const addCar = async (req, res) => {
    try {
        const {_id} = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        // upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname, 
            folder:'/cars'
        })

        // optimize through image url transformation
        var optimizedImageUrl = imagekit.url({
            path : response.filePath,
            transformation : [
                {width:'1280'}, // width resize
                {quality:'auto'}, // auto compression
                {format: 'webp'} // convert to modern format
            ]
        });

        const image = optimizedImageUrl;
        await Car.create({...car, owner: _id, image})

        res.json({success:true, message: "Car added"})

    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

// api to list owner car
export const getOwnerCars = async (req, res) =>{
    try{
        const {_id} = req.user;
        const cars = await Car.find({owner: _id})
        res.json({success:true, cars})
    } catch (error){
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

// api to toggle car availability
export const toggleCarAvailability = async (req, res) => {
    try{
        const {_id} = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)

        // checking if car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({success:false, message: "Unauthorized"})
        }

        car.isAvaliable = !car.isAvaliable;
        await car.save()

        res.json({success:true, message: "Availability toggeled"})
    } catch (error){
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

// api to delete a car
export const deleteCar = async (req, res) => {
    try{
        const {_id} = req.user;
        const {carId} = req.body
        const car = await Car.findById(carId)

        // checking if car belongs to the user
        if(car.owner.toString() !== _id.toString()){
            return res.json({success:false, message: "Unauthorized"})
        }

        car.owner = null;
        car.isAvaliable = false;
        await car.save()

        res.json({success:true, message: "Car removed"})
    } catch (error){
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

// api to get dashbord data
export const getDashbordData = async (req, res) => {
    try{
        const {_id, role} = req.user;
        if(role !== 'owner') {
            return res.json({success:false, message: "Unauthorized"})
        }
        const cars = await Car.find(_id)
    } catch (error){
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}