import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "motion/react";

const ManageCars = () => {
  const { isOwner, axios, currency } = useAppContext();
  const [cars, setCars] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [carData, setCarData] = useState({});
  const [newImages, setNewImages] = useState([]);
  const [deleteImageFileIds, setDeleteImageFileIds] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState([]);

  const fetchOwnerCars = async () => {
    try {
      const { data } = await axios.get("/api/owner/cars");
      if (data.success) {
        setCars(data.cars);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post("/api/owner/toggle-car", { carId });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteCar = async (carId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this car?",
      );
      if (!confirm) return;
      const { data } = await axios.post("/api/owner/delete-car", { carId });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openUpdateModal = (car) => {
    setSelectedCar(car);
    // ✅ prefill all fields including category and fuel_type
    setCarData({
      brand: car.brand || "",
      model: car.model || "",
      year: car.year || "",
      pricePerDay: car.pricePerDay || "",
      category: car.category || "", // ✅ fixed
      transmission: car.transmission || "",
      fuel_type: car.fuel_type || "", // ✅ fixed
      seating_capacity: car.seating_capacity || "",
      location: car.location || "",
      description: car.description || "",
    });
    setFeatures(car.features || []);
    setNewImages([]);
    setDeleteImageFileIds([]);
    setFeatureInput("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCar(null);
    setCarData({});
    setNewImages([]);
    setDeleteImageFileIds([]);
    setFeatures([]);
    setFeatureInput("");
  };

  // ✅ toggle — click once to mark delete, click again to deselect
  const toggleDeleteImage = (fileId) => {
    setDeleteImageFileIds(
      (prev) =>
        prev.includes(fileId)
          ? prev.filter((id) => id !== fileId) // ✅ deselect
          : [...prev, fileId], // select for deletion
    );
  };

  const handleNewImages = (e) => {
    const selected = Array.from(e.target.files);
    const currentKept =
      (selectedCar?.images?.length || 0) - deleteImageFileIds.length;
    const total = currentKept + newImages.length + selected.length;

    if (total > 5) {
      toast.error(
        `Max 5 images. You can add ${5 - currentKept - newImages.length} more.`,
      );
      return;
    }
    setNewImages((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    const trimmed = featureInput.trim().replace(/,$/, "");
    if (!trimmed) return;
    if (features.includes(trimmed)) {
      toast.error("Feature already added");
      return;
    }
    setFeatures((prev) => [...prev, trimmed]);
    setFeatureInput("");
  };

  const removeFeature = (index) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("carId", selectedCar._id);
      formData.append("carData", JSON.stringify({ ...carData, features }));
      if (deleteImageFileIds.length > 0) {
        formData.append(
          "deleteImageFileIds",
          JSON.stringify(deleteImageFileIds),
        );
      }
      newImages.forEach((img) => formData.append("images", img));

      const { data } = await axios.post("/api/owner/update-car", formData);
      if (data.success) {
        toast.success(data.message);
        closeModal();
        fetchOwnerCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    isOwner && fetchOwnerCars();
  }, [isOwner]);

  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      <Title
        title="Manage Cars"
        subtitle="View all listed cars, update their details or remove them from the booking platform."
      />

      <div className="max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6">
        <table className="w-full border-collapse text-left text-sm text-gray-600">
          <thead className="text-gray-500">
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium max-md:hidden">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => (
              <tr key={index} className="border-t border-borderColor">
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={car.images?.[0]?.url}
                    alt=""
                    className="h-12 w-16 rounded-md object-cover"
                  />
                  <div className="max-md:hidden">
                    <p className="font-medium">
                      {car.brand} {car.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      {car.seating_capacity} seats | {car.transmission}
                    </p>
                  </div>
                </td>
                <td className="p-3 max-md:hidden">{car.category}</td>
                <td className="p-3">
                  {currency}
                  {car.pricePerDay}/day
                </td>
                <td className="p-3 max-md:hidden">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${car.isAvaliable ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
                  >
                    {car.isAvaliable ? "Available" : "Not available"}
                  </span>
                </td>
                {/* ✅ actions — text buttons instead of icons so color is visible */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {/* toggle */}
                    <button
                      onClick={() => toggleAvailability(car._id)}
                      title={
                        car.isAvaliable ? "Mark unavailable" : "Mark available"
                      }
                      className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer transition-all"
                    >
                      <img
                        src={
                          car.isAvaliable
                            ? assets.eye_close_icon
                            : assets.eye_icon
                        }
                        alt="toggle"
                        className="w-5 h-5"
                      />
                    </button>

                    {/* ✅ edit — text button so always visible */}
                    <button
                      onClick={() => openUpdateModal(car)}
                      className="px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md cursor-pointer transition-all font-medium"
                    >
                      Edit
                    </button>

                    {/* delete */}
                    <button
                      onClick={() => deleteCar(car._id)}
                      title="Delete car"
                      className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 cursor-pointer transition-all"
                    >
                      <img
                        src={assets.delete_icon}
                        alt="delete"
                        className="w-5 h-5"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* update car modal */}
      <AnimatePresence>
        {showModal && selectedCar && (
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
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Update — {selectedCar.brand} {selectedCar.model}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleUpdate}
                className="flex flex-col gap-4 text-sm text-gray-600"
              >
                {/* existing images */}
                <div>
                  <label className="text-gray-600 font-medium">
                    Current Images
                    <span className="text-gray-400 ml-1 text-xs">
                      — click to mark/unmark for deletion
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCar.images?.map((img, index) => (
                      <div
                        key={index}
                        onClick={() => toggleDeleteImage(img.fileId)}
                        className="relative cursor-pointer group"
                      >
                        <img
                          src={img.url}
                          alt=""
                          className={`h-20 w-28 object-cover rounded-lg border-2 transition-all ${
                            deleteImageFileIds.includes(img.fileId)
                              ? "border-red-500 opacity-40"
                              : "border-borderColor hover:border-red-300"
                          }`}
                        />
                        {/* ✅ delete overlay */}
                        {deleteImageFileIds.includes(img.fileId) && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-red-500/20">
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded mb-1">
                              Marked
                            </span>
                            <span className="text-red-600 text-xs font-medium">
                              Click to undo
                            </span>
                          </div>
                        )}
                        {/* main badge */}
                        {index === 0 &&
                          !deleteImageFileIds.includes(img.fileId) && (
                            <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                              Main
                            </span>
                          )}
                      </div>
                    ))}

                    {/* add new images */}
                    {selectedCar.images?.length -
                      deleteImageFileIds.length +
                      newImages.length <
                      5 && (
                      <label
                        htmlFor="new-car-images"
                        className="h-20 w-28 border-2 border-dashed border-borderColor rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all"
                      >
                        <img
                          src={assets.upload_icon}
                          alt=""
                          className="h-5 mb-1 opacity-40"
                        />
                        <p className="text-xs text-gray-400">Add Photo</p>
                        <input
                          type="file"
                          id="new-car-images"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={handleNewImages}
                        />
                      </label>
                    )}
                  </div>

                  {/* new image previews */}
                  {newImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt=""
                            className="h-20 w-28 object-cover rounded-lg border-2 border-green-400"
                          />
                          <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                            New
                          </span>
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* brand model */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label>Brand</label>
                    <input
                      type="text"
                      value={carData.brand}
                      onChange={(e) =>
                        setCarData({ ...carData, brand: e.target.value })
                      }
                      className="px-3 py-2 border border-borderColor rounded-md outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label>Model</label>
                    <input
                      type="text"
                      value={carData.model}
                      onChange={(e) =>
                        setCarData({ ...carData, model: e.target.value })
                      }
                      className="px-3 py-2 border border-borderColor rounded-md outline-none"
                      required
                    />
                  </div>
                </div>

                {/* year price seats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label>Year</label>
                    <input
                      type="number"
                      value={carData.year}
                      onChange={(e) =>
                        setCarData({ ...carData, year: e.target.value })
                      }
                      className="px-3 py-2 border border-borderColor rounded-md outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label>Price/Day ({currency})</label>
                    <input
                      type="number"
                      value={carData.pricePerDay}
                      onChange={(e) =>
                        setCarData({ ...carData, pricePerDay: e.target.value })
                      }
                      className="px-3 py-2 border border-borderColor rounded-md outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label>Seats</label>
                    <input
                      type="number"
                      value={carData.seating_capacity}
                      onChange={(e) =>
                        setCarData({
                          ...carData,
                          seating_capacity: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-borderColor rounded-md outline-none"
                      required
                    />
                  </div>
                </div>

                {/* ✅ category transmission fuel — prefilled correctly */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label>Category</label>
                    <select
                      value={carData.category}
                      onChange={(e) =>
                        setCarData({ ...carData, category: e.target.value })
                      }
                      className="px-3 py-2 border border-borderColor rounded-md outline-none"
                    >
                      <option value="">Select</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Wagon">Wagon</option>
                      <option value="Van">Van</option>
                      <option value="Minivan">Minivan</option>
                      <option value="Pickup Truck">Pickup Truck</option>
                      <option value="Crossover">Crossover</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Sports">Sports</option>
                      <option value="Electric">Electric</option>
                      <option value="Off-Road">Off-Road</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label>Transmission</label>
                    <select
                      value={carData.transmission}
                      onChange={(e) =>
                        setCarData({ ...carData, transmission: e.target.value })
                      }
                      className="px-3 py-2 border border-borderColor rounded-md outline-none"
                    >
                      <option value="">Select</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="Semi-Automatic">Semi-Automatic</option>
                      <option value="CVT">CVT</option>
                      <option value="DCT">DCT</option>
                      <option value="AMT">AMT</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label>Fuel Type</label>
                    <select
                      value={carData.fuel_type}
                      onChange={(e) =>
                        setCarData({ ...carData, fuel_type: e.target.value })
                      }
                      className="px-3 py-2 border border-borderColor rounded-md outline-none"
                    >
                      <option value="">Select</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                      <option value="CNG">CNG</option>
                      <option value="LPG">LPG</option>
                    </select>
                  </div>
                </div>

                {/* location */}
                <div className="flex flex-col gap-1">
                  <label>Location</label>
                  <input
                    type="text"
                    value={carData.location}
                    onChange={(e) =>
                      setCarData({ ...carData, location: e.target.value })
                    }
                    placeholder="e.g. Ahmedabad, Mumbai..."
                    className="px-3 py-2 border border-borderColor rounded-md outline-none"
                    required
                  />
                </div>

                {/* description */}
                <div className="flex flex-col gap-1">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={carData.description}
                    onChange={(e) =>
                      setCarData({ ...carData, description: e.target.value })
                    }
                    className="px-3 py-2 border border-borderColor rounded-md outline-none"
                    required
                  />
                </div>

                {/* features */}
                <div className="flex flex-col gap-1">
                  <label>
                    Features{" "}
                    <span className="text-gray-400 text-xs">
                      (Enter or comma to add)
                    </span>
                  </label>
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1">
                      {features.map((f, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {f}
                          <button
                            type="button"
                            onClick={() => removeFeature(i)}
                            className="hover:text-red-500 cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                      placeholder="e.g. Bluetooth, GPS..."
                      className="flex-1 px-3 py-2 border border-borderColor rounded-md outline-none"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 cursor-pointer text-xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 border border-borderColor rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-2 bg-primary hover:bg-primary-dull text-white rounded-lg cursor-pointer disabled:opacity-60"
                  >
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageCars;
