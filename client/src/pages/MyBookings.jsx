import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";

const MyBookings = () => {
  const { axios, user, currency, cars } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ car selector states
  const [showCarSelector, setShowCarSelector] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null); // full car object
  const [carSelectorIndex, setCarSelectorIndex] = useState(0); // current slide index

  const CARS_PER_VIEW = 3; // how many cards visible at once

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/user");
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openUpdateModal = (booking) => {
    setSelectedBooking(booking);
    setPickupDate(booking.pickupDate.split("T")[0]);
    setReturnDate(booking.returnDate.split("T")[0]);
    setSelectedCar(null);
    setCarSelectorIndex(0);
    setShowCarSelector(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setPickupDate("");
    setReturnDate("");
    setSelectedCar(null);
    setShowCarSelector(false);
  };

  // ✅ filter out current car and cancelled/deleted cars
  const availableCars = cars.filter(
    (car) =>
      car._id !== selectedBooking?.car?._id &&
      !car.isDeleted &&
      car.isAvaliable,
  );

  // ✅ carousel navigation for car selector
  const canGoPrev = carSelectorIndex > 0;
  const canGoNext = carSelectorIndex + CARS_PER_VIEW < availableCars.length;

  const handleCarSelectorNext = () => {
    if (canGoNext) setCarSelectorIndex((prev) => prev + 1);
  };

  const handleCarSelectorPrev = () => {
    if (canGoPrev) setCarSelectorIndex((prev) => prev - 1);
  };

  const visibleCars = availableCars.slice(
    carSelectorIndex,
    carSelectorIndex + CARS_PER_VIEW,
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        bookingId: selectedBooking._id,
        pickupDate,
        returnDate,
      };

      if (selectedCar) {
        payload.newCarId = selectedCar._id;
      }

      const { data } = await axios.post("/api/bookings/update", payload);

      if (data.success) {
        toast.success(data.message);
        closeModal();
        fetchMyBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      const { data } = await axios.post("/api/bookings/update", {
        bookingId,
        cancel: true,
      });
      if (data.success) {
        toast.success(data.message);
        fetchMyBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-400/15 text-green-600";
      case "cancelled":
        return "bg-red-400/15 text-red-600";
      case "pending":
        return "bg-yellow-400/15 text-yellow-600";
      default:
        return "bg-gray-400/15 text-gray-600";
    }
  };

  useEffect(() => {
    user && fetchMyBookings();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl"
    >
      <Title
        title="My Bookings"
        subTitle="View and manage your all car bookings"
        align="left"
      />

      <div>
        {bookings.length === 0 ? (
          <p className="text-gray-500 mt-12 text-center">No bookings found</p>
        ) : (
          bookings.map((booking, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12"
            >
              {/* car image and info */}
              <div className="md:col-span-1">
                <div className="rounded-md overflow-hidden mb-3">
                  <img
                    src={booking.car.images?.[0]?.url || booking.car.image}
                    className="w-full h-auto aspect-video object-cover"
                    alt=""
                  />
                </div>
                <p className="text-lg font-medium mt-2">
                  {booking.car.brand} {booking.car.model}
                </p>
                <p className="text-gray-500">
                  {booking.car.year} | {booking.car.category} |{" "}
                  {booking.car.location}
                </p>
              </div>

              {/* booking info */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <p className="px-3 py-1.5 bg-light rounded">
                    Booking #{index + 1}
                  </p>
                  <p
                    className={`px-3 py-1 text-xs rounded-full ${getStatusStyle(booking.status)}`}
                  >
                    {booking.status}
                  </p>
                </div>

                <div className="flex items-start gap-2 mt-3">
                  <img
                    src={assets.calendar_icon_colored}
                    className="w-4 h-4 mt-1"
                    alt=""
                  />
                  <div>
                    <p className="text-gray-500">Rental Period</p>
                    <p>
                      {booking.pickupDate.split("T")[0]} To{" "}
                      {booking.returnDate.split("T")[0]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-3">
                  <img
                    src={assets.location_icon_colored}
                    className="w-4 h-4 mt-1"
                    alt=""
                  />
                  <div>
                    <p className="text-gray-500">Pick-up Location</p>
                    <p>{booking.car.location}</p>
                  </div>
                </div>

                {booking.status !== "cancelled" && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => openUpdateModal(booking)}
                      className="px-4 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-all cursor-pointer text-xs"
                    >
                      Update Booking
                    </button>
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="px-4 py-1.5 border border-red-400 text-red-400 hover:bg-red-400 hover:text-white rounded-lg transition-all cursor-pointer text-xs"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>

              {/* price */}
              <div className="md:col-span-1 flex flex-col justify-between gap-6">
                <div className="text-sm text-gray-500 text-right">
                  <p>Total Price</p>
                  <h1 className="text-2xl font-semibold text-primary">
                    {currency}
                    {booking.price}
                  </h1>
                  <p>Booked on {booking.createdAt.split("T")[0]}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ✅ update booking modal */}
      <AnimatePresence>
        {showModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* modal header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Update Booking
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl"
                >
                  ✕
                </button>
              </div>

              {/* current car info */}
              <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
                <img
                  src={
                    selectedBooking.car.images?.[0]?.url ||
                    selectedBooking.car.image
                  }
                  className="w-16 h-12 object-cover rounded-lg"
                  alt=""
                />
                <div>
                  <p className="text-xs text-gray-400">Current Car</p>
                  <p className="font-medium">
                    {selectedBooking.car.brand} {selectedBooking.car.model}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {selectedBooking.car.location}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                {/* pickup date */}
                <div className="flex flex-col gap-1">
                  <label className="text-gray-600">Pickup Date</label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="border border-borderColor px-3 py-2 rounded-lg text-gray-700 outline-primary"
                    required
                  />
                </div>

                {/* return date */}
                <div className="flex flex-col gap-1">
                  <label className="text-gray-600">Return Date</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={pickupDate || new Date().toISOString().split("T")[0]}
                    className="border border-borderColor px-3 py-2 rounded-lg text-gray-700 outline-primary"
                    required
                  />
                </div>

                {/* ✅ change car section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-600">
                      Change Car
                      <span className="text-gray-400 text-xs ml-1">
                        (optional)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCarSelector(!showCarSelector)}
                      className="text-xs text-primary cursor-pointer hover:underline"
                    >
                      {showCarSelector ? "Hide Cars ▲" : "Browse Cars ▼"}
                    </button>
                  </div>

                  {/* ✅ selected new car preview */}
                  {selectedCar && (
                    <div className="flex items-center gap-3 p-2 border-2 border-primary rounded-lg bg-primary/5">
                      <img
                        src={selectedCar.images?.[0]?.url}
                        className="w-14 h-10 object-cover rounded-lg"
                        alt=""
                      />
                      <div className="flex-1">
                        <p className="font-medium text-xs">
                          {selectedCar.brand} {selectedCar.model}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {selectedCar.location} • {currency}
                          {selectedCar.pricePerDay}/day
                        </p>
                      </div>
                      {/* ✅ deselect car */}
                      <button
                        type="button"
                        onClick={() => setSelectedCar(null)}
                        className="text-gray-400 hover:text-red-400 cursor-pointer text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* ✅ car carousel selector */}
                  <AnimatePresence>
                    {showCarSelector && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {availableCars.length === 0 ? (
                          <p className="text-gray-400 text-xs text-center py-4">
                            No other cars available
                          </p>
                        ) : (
                          <div className="relative">
                            {/* car cards */}
                            <div className="grid grid-cols-3 gap-2 py-2">
                              {visibleCars.map((car) => (
                                <motion.div
                                  key={car._id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                  onClick={() => {
                                    setSelectedCar(car);
                                    setShowCarSelector(false);
                                  }}
                                  className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all hover:border-primary hover:shadow-md ${
                                    selectedCar?._id === car._id
                                      ? "border-primary"
                                      : "border-borderColor"
                                  }`}
                                >
                                  <img
                                    src={car.images?.[0]?.url}
                                    className="w-full h-16 object-cover"
                                    alt=""
                                  />
                                  <div className="p-1.5">
                                    <p className="font-medium text-xs truncate">
                                      {car.brand} {car.model}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                      {currency}
                                      {car.pricePerDay}/day
                                    </p>
                                    <p className="text-gray-400 text-xs truncate">
                                      {car.location}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* ✅ prev/next navigation */}
                            <div className="flex items-center justify-between mt-1">
                              <button
                                type="button"
                                onClick={handleCarSelectorPrev}
                                disabled={!canGoPrev}
                                className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                                  canGoPrev
                                    ? "border-primary text-primary hover:bg-primary hover:text-white"
                                    : "border-gray-200 text-gray-300 cursor-not-allowed"
                                }`}
                              >
                                ‹ Prev
                              </button>

                              {/* ✅ page indicator */}
                              <p className="text-xs text-gray-400">
                                {carSelectorIndex + 1}–
                                {Math.min(
                                  carSelectorIndex + CARS_PER_VIEW,
                                  availableCars.length,
                                )}{" "}
                                of {availableCars.length}
                              </p>

                              <button
                                type="button"
                                onClick={handleCarSelectorNext}
                                disabled={!canGoNext}
                                className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                                  canGoNext
                                    ? "border-primary text-primary hover:bg-primary hover:text-white"
                                    : "border-gray-200 text-gray-300 cursor-not-allowed"
                                }`}
                              >
                                Next ›
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 border border-borderColor rounded-lg text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-primary hover:bg-primary-dull text-white rounded-lg transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? "Updating..." : "Update Booking"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyBookings;
