import imagekit from "../configs/imageKit.js";
import User from "../models/User.js";
import Car from "../models/Car.js";
import fs from "fs";
import Booking from "../models/Booking.js";

// helper to upload single image to imagekit
const uploadToImageKit = async (filePath, fileName, folder) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: folder,
    });

    const optimizedUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: "1280" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    // ✅ delete local file after successful upload
    fs.unlinkSync(filePath);

    return {
      url: optimizedUrl,
      fileId: response.fileId, // ✅ save for deletion later
    };
  } catch (error) {
    // ✅ cleanup local file even if imagekit upload fails
    fs.unlinkSync(filePath);
    throw error; // re-throw so controller catches it
  }
};

// api to change role of user
export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { role: "owner" });
    res.json({ success: true, message: "Now you can list cars" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to list car
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;

    if (req.user.role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const imageFiles = req.files;

    // ✅ validate minimum 1 image
    if (!imageFiles || imageFiles.length === 0) {
      return res.json({
        success: false,
        message: "Please upload at least 1 image",
      });
    }

    // ✅ validate maximum 5 images
    if (imageFiles.length > 5) {
      return res.json({ success: false, message: "Maximum 5 images allowed" });
    }

    let car = JSON.parse(req.body.carData);

    // upload image to imagekit
    const uploadImages = await Promise.all(
      imageFiles.map((file) =>
        uploadToImageKit(file.path, file.originalname, "/cars"),
      ),
    );

    await Car.create({ ...car, owner: _id, images: uploadImages });

    res.json({ success: true, message: "Car added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to update car
export const updateCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId, deleteImageFileIds, carData } = req.body;
    // deleteImageFileIds = array of fileIds owner wants to delete
    // carData = JSON string of fields to update

    // ✅ check car exists and belongs to owner
    const car = await Car.findById(carId);
    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }
    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    // ✅ Step 1 — delete images owner wants removed
    if (deleteImageFileIds) {
      const fileIdsToDelete = JSON.parse(deleteImageFileIds); // array of fileIds

      // delete from imagekit
      await Promise.all(
        fileIdsToDelete.map((fileId) => imagekit.deleteFile(fileId)),
      );

      // remove from car.images array
      car.images = car.images.filter(
        (img) => !fileIdsToDelete.includes(img.fileId),
      );
    }

    // ✅ Step 2 — upload new images if provided
    if (req.files && req.files.length > 0) {
      // check total images won't exceed 5
      const totalImages = car.images.length + req.files.length;
      if (totalImages > 5) {
        return res.json({
          success: false,
          message: `You can only have 5 images total. Currently have ${car.images.length}, trying to add ${req.files.length}`,
        });
      }

      const newImages = await Promise.all(
        req.files.map((file) =>
          uploadToImageKit(file.path, file.originalname, "/cars"),
        ),
      );

      car.images = [...car.images, ...newImages]; // ✅ add new images to existing
    }

    // ✅ check minimum 1 image remains
    if (car.images.length === 0) {
      return res.json({
        success: false,
        message: "Car must have at least 1 image",
      });
    }

    // ✅ Step 3 — update other fields if provided
    if (carData) {
      const updates = JSON.parse(carData);
      const allowedFields = [
        "brand",
        "model",
        "year",
        "category",
        "seating_capacity",
        "fuel_type",
        "transmission",
        "pricePerDay",
        "location",
        "description",
        "isAvaliable",
      ];

      allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
          car[field] = updates[field]; // ✅ only update provided fields
        }
      });
    }

    await car.save();
    res.json({ success: true, message: "Car updated", car });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to list owner car
export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id, isDeleted: false });

    if (cars.length === 0) {
      return res.json({ success: true, message: "No cars found", cars: [] });
    }
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to toggle car availability
export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    if (!car || car.isDeleted) {
      return res.json({ success: false, message: "Car not found" });
    }

    // checking if car belongs to the user
    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.isAvaliable = !car.isAvaliable;
    await car.save();

    res.json({ success: true, message: "Availability toggeled" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to delete a car
export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    // ✅ validate carId
    if (!carId) {
      return res.json({ success: false, message: "Please provide carId" });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }
    // checking if car belongs to the user
    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    // ✅ delete all car images from imagekit
    if (car.images && car.images.length > 0) {
      await Promise.all(
        car.images.map((img) => imagekit.deleteFile(img.fileId)),
      );
    }

    await Booking.updateMany({ car: carId }, { status: "cancelled" });

    // car.owner = null;
    car.isDeleted = true;
    car.isAvaliable = false;
    await car.save();

    res.json({ success: true, message: "Car removed" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to get dashbord data
export const getDashbordData = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const cars = await Car.find({ owner: _id, isDeleted: false });
    const bookings = await Booking.find({ owner: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    // const pendingBookings = await Booking.find({owner: _id, status: "pending"})
    const pendingBookings = bookings.filter(
      (booking) => booking.status === "pending",
    );
    // const completedBookings = await Booking.find({owner: _id, status: "confirmed"})
    const completedBookings = bookings.filter(
      (booking) => booking.status === "confirmed",
    );

    // calculate monthly revenue from booking that are confirmed
    const now = new Date();
    const monthlyRevenue = bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.createdAt);
        return (
          booking.status === "confirmed" &&
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((acc, booking) => acc + booking.price, 0);

    // calculate total revenue from booking that are confirmed
    const totalRevenue = bookings
      .slice()
      .filter((booking) => booking.status === "confirmed")
      .reduce((acc, booking) => acc + booking.price, 0);

    const dashbordData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
      totalRevenue,
    };

    res.json({ success: true, dashbordData });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to update user image
export const updateProfile = async (req, res) => {
  try {
    const { _id } = req.user;
    const { name } = req.body;
    const imageFile = req.file;

    const user = await User.findById(_id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (name) {
      user.name = name;
    }

    if (imageFile) {
      if (user.imageKitFileId) {
        await imagekit.deleteFile(user.imageKitFileId);
      }
      // upload image to imagekit
      const fileBuffer = fs.readFileSync(imageFile.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: imageFile.originalname,
        folder: "/users",
      });

      // ✅ delete local file after successful upload
      fs.unlinkSync(imageFile.path);

      // optimize through image url transformation
      var optimizedImageUrl = imagekit.url({
        path: response.filePath,
        transformation: [
          { width: "400" }, // width resize
          { quality: "auto" }, // auto compression
          { format: "webp" }, // convert to modern format
        ],
      });

      user.image = optimizedImageUrl;
      user.imageKitFileId = response.fileId;
    }

    await user.save();
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
