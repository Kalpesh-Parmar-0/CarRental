import Booking from '../models/Booking.js'
import Car from "../models/Car.js"

// function to check availability of car for given date
const checkAvailability = async (car, pickupDate, returnDate) => {
    const bookings = await Booking.find({
        car,
        status: {$nin: ["cancelled"]},
        pickupDate: {$lte: new Date(returnDate)},
        returnDate: {$gte: new Date (pickupDate)}
    })
    return bookings.length === 0;
}

// api to check availability of car for given dates and location
export const checkAvailabilityOfCar = async (req, res) => {
    try {
        const {location, pickupDate, returnDate} = req.body
        // ✅ validate all fields present
        if (!location || !pickupDate || !returnDate) {
            return res.json({ success: false, message: "Please provide location, pickupDate and returnDate" })
        }

        // ✅ validate pickup is before return
        if (new Date(pickupDate) >= new Date(returnDate)) {
            return res.json({ success: false, message: "Return date must be after pickup date" })
        }


        // fetch all available car for given location
        const cars = await Car.find({ location, isAvaliable: true, isDeleted: false })

        if (cars.length === 0) {
            return res.json({ success: true, availableCars: [], message: "No cars found for this location" })
        }

        // check car availability for given date range using promise
        const availableCarsPromises = cars.map(async (car) => {
            const isAvailable = await checkAvailability(car._id, pickupDate, returnDate)
            return {...car._doc, isAvailable: isAvailable}
        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvailable === true)

        res.json({success: true, availableCars})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to create bookings
export const createBooking = async (req, res) => {
    try {
        const {_id} = req.user;
        const {car, pickupDate, returnDate} = req.body;

        // ✅ validate fields
        if (!car || !pickupDate || !returnDate) {
            return res.json({ success: false, message: "Please provide car, pickupDate and returnDate" })
        }

        // ✅ validate dates
        if (new Date(pickupDate) >= new Date(returnDate)) {
            return res.json({ success: false, message: "Return date must be after pickup date" })
        }
        if (new Date(pickupDate) < new Date()) {
            return res.json({ success: false, message: "Pickup date cannot be in the past" })
        }

        const carData = await Car.findById(car)
        if (!carData || carData.isDeleted || !carData.isAvaliable) {
            return res.json({ success: false, message: "Car not found or unavailable" })
        }

        // ✅ find conflicting booking instead of just true/false
        const conflict = await Booking.findOne({
            car,
            status: { $nin: ['cancelled'] },
            pickupDate: { $lte: new Date(returnDate) },
            returnDate: { $gte: new Date(pickupDate) }
        })

        // ✅ return conflict dates in response
        if (conflict) {
            return res.json({
                success: false,
                message: `Car is already booked from ${conflict.pickupDate.toDateString()} to ${conflict.returnDate.toDateString()}`
            })
        }

        // calculate price base on pickup and return date
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate)
        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24))
        const price = carData.pricePerDay * noOfDays;

        await Booking.create({car, owner:carData.owner, user: _id, pickupDate, returnDate, price})
        res.json({success: true, message: "Booking created"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to list user booking
export const getUserBookings = async (req, res) => {
    try {
        const {_id} = req.user;
        const bookings = await Booking.find({user: _id}).populate("car").populate({path: 'car', populate: {path: 'owner', select: 'name email image'}}).sort({createdAt: -1})
        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to get owner bookings
export const getOwnerBookings = async (req, res) => {
    try {
        if(req.user.role !== 'owner'){
            return res.json({success: false, message: "Unauthorized"})
        }

        const bookings = await Booking.find({owner: req.user._id}).populate('car').populate("user", "-password").sort({createdAt: -1})
        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to change booking status for owner
export const changeBookingStatus = async (req, res) => {
    try {
        const {_id} = req.user;
        const {bookingId, status} = req.body;

         // ✅ role check
        if (req.user.role !== 'owner') {
            return res.json({ success: false, message: "Unauthorized" })
        }
        
        // ✅ validate fields
        if (!bookingId || !status) {
            return res.json({ success: false, message: "Please provide bookingId and status" })
        }

        // ✅ validate status value
        const validStatuses = ['pending', 'confirmed', 'cancelled']
        if (!validStatuses.includes(status)) {
            return res.json({ success: false, message: "Invalid status — must be pending, confirmed or cancelled" })
        }

        const booking = await Booking.findById(bookingId)
        if (!booking) {
            return res.json({ success: false, message: "Booking not found" })
        }

        if(booking.owner.toString() !== _id.toString()){
            return res.json({success: false, message: "Unauthorized"})
        }
        
        booking.status = status;
        await booking.save()

        res.json({success:true, message: "Status updated"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to update booking for user
export const updateBooking = async (req, res) => {
    try {
        const {_id} = req.user;
        const {bookingId, pickupDate, returnDate, newCarId, cancel} = req.body;

        // ✅ validate bookingId
        if (!bookingId) {
            return res.json({success: false, message: "Please provide bookingId"})
        }

        // ✅ check booking exists
        const booking = await Booking.findById(bookingId)
        if (!booking) {
            return res.json({success: false, message: "Booking not found"})
        }

        // ✅ check booking belongs to user
        if (booking.user.toString() !== _id.toString()) {
            return res.json({success: false, message: "Unauthorized"})
        }

        // ✅ cannot update cancelled booking only
        if (booking.status === 'cancelled') {
            return res.json({success: false, message: "Cannot update cancelled booking"})
        }

        // ✅ handle cancel request
        if (cancel) {
            booking.status = 'cancelled'
            await booking.save()
            return res.json({success: true, message: "Booking cancelled successfully"})
        }

        // use existing values if not provided
        const updatedPickupDate = pickupDate ? new Date(pickupDate) : booking.pickupDate;
        const updatedReturnDate = returnDate ? new Date(returnDate) : booking.returnDate;
        // const carToBook = newCarId || booking.car.toString();

        // ✅ validate dates
        if (updatedPickupDate >= updatedReturnDate) {
            return res.json({success: false, message: "Return date must be after pickup date"})
        }
        if (updatedPickupDate < new Date()) {
            return res.json({success: false, message: "Pickup date cannot be in the past"})
        }

        // ✅ handle car change
        if (newCarId) {

            // validate new car exists
            const newCarData = await Car.findById(newCarId)
            if (!newCarData || newCarData.isDeleted || !newCarData.isAvaliable) {
                return res.json({success: false, message: "Selected car not found or unavailable"})
            }

            // ✅ check new car availability for requested dates
            const newCarConflict = await Booking.findOne({
                car: newCarId,
                _id: {$ne: bookingId},            // exclude current booking
                status: {$nin: ['cancelled']},
                pickupDate: {$lte: updatedReturnDate},
                returnDate: {$gte: updatedPickupDate}
            })
            if (newCarConflict) {
                // ✅ tell user which dates are conflicting
                return res.json({
                    success: false,
                    message: `Car is already booked from ${newCarConflict.pickupDate.toDateString()} to ${newCarConflict.returnDate.toDateString()}`
                })
            }

            // ✅ release old car — cancel old booking so old car is free for others
            booking.status = 'cancelled'
            await booking.save()

            // ✅ recalculate price for new car
            const noOfDays = Math.ceil((updatedReturnDate - updatedPickupDate) / (1000 * 60 * 60 * 24))
            const price = newCarData.pricePerDay * noOfDays;

            // ✅ create fresh booking for new car
            const newBooking = await Booking.create({
                car: newCarId,
                owner: newCarData.owner,
                user: _id,
                pickupDate: updatedPickupDate,
                returnDate: updatedReturnDate,
                price,
                status: 'pending'  // reset to pending for new car
            })

            return res.json({success: true, message: "Car changed and booking updated", booking: newBooking})
        }

        // ✅ same car — check date conflicts excluding current booking
        if (pickupDate || returnDate) {
            const conflict = await Booking.findOne({
                car: booking.car,
                _id: {$ne: bookingId},            // ✅ exclude current booking
                status: {$nin: ['cancelled']},
                pickupDate: {$lte: updatedReturnDate},
                returnDate: {$gte: updatedPickupDate}
            })

            if (conflict) {
                // ✅ tell user which dates are conflicting
                return res.json({
                    success: false,
                    message: `Car is already booked from ${conflict.pickupDate.toDateString()} to ${conflict.returnDate.toDateString()}`
                })
            }
        }

        // ✅ get car data for price recalculation
        const carData = await Car.findById(booking.car)
        if (!carData) {
            return res.json({success: false, message: "Car not found"})
        }

        // ✅ recalculate price based on updated dates
        const noOfDays = Math.ceil((updatedReturnDate - updatedPickupDate) / (1000 * 60 * 60 * 24))
        const price = carData.pricePerDay * noOfDays;

        // ✅ update booking
        booking.pickupDate = updatedPickupDate;
        booking.returnDate = updatedReturnDate;
        booking.price = price;
        await booking.save()

        res.json({success: true, message: "Booking updated", booking})

    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}