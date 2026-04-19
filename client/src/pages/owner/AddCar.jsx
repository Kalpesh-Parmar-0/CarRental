import React, { useState } from "react";
import Title from "../../components/owner/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddCar = () => {
  const { axios, currency, fetchCities } = useAppContext();

  const [images, setImages] = useState([]); // ✅ array instead of single
  const [featureInput, setFeatureInput] = useState(""); // ✅ feature text input
  const [features, setFeatures] = useState([]); // ✅ features array
  const [isLoading, setIsLoading] = useState(false);

  const [car, setCar] = useState({
    brand: "",
    model: "",
    year: 0,
    pricePerDay: 0,
    category: "",
    transmission: "",
    fuel_type: "",
    seating_capacity: 0,
    location: "",
    description: "",
  });

  // ✅ handle multiple image selection
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalImages = images.length + selectedFiles.length;

    if (totalImages > 5) {
      toast.error(
        `You can only upload max 5 images. You have ${images.length} already.`,
      );
      return;
    }
    setImages((prev) => [...prev, ...selectedFiles]);
    e.target.value = ""; // ✅ reset input so same file can be reselected
  };

  // ✅ remove a specific image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ add feature on Enter or comma
  const handleFeatureKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFeature();
    }
  };

  const addFeature = () => {
    const trimmed = featureInput.trim().replace(/,$/, ""); // remove trailing comma
    if (!trimmed) return;
    if (features.includes(trimmed)) {
      toast.error("Feature already added");
      return;
    }
    setFeatures((prev) => [...prev, trimmed]);
    setFeatureInput("");
  };

  // ✅ remove a feature tag
  const removeFeature = (index) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // ✅ validate at least 1 image
    if (images.length === 0) {
      return toast.error("Please upload at least 1 image");
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      // ✅ append all images with same key "images"
      images.forEach((img) => formData.append("images", img));

      formData.append("carData", JSON.stringify({ ...car, features }));

      const { data } = await axios.post("/api/owner/add-car", formData);

      if (data.success) {
        toast.success(data.message);
        fetchCities(); // ✅ refresh cities after adding car
        // reset all
        setImages([]);
        setFeatures([]);
        setFeatureInput("");
        setCar({
          brand: "",
          model: "",
          year: 0,
          pricePerDay: 0,
          category: "",
          transmission: "",
          fuel_type: "",
          seating_capacity: 0,
          location: "",
          description: "",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-10 flex-1">
      <Title
        title="Add New Car"
        subtitle="Fill in details to list a new car for booking, including pricing, availability and car specification"
      />

      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl"
      >
        {/* ✅ multiple image upload */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-600">
            Car Images
            <span className="text-gray-400 ml-1 text-xs">
              ({images.length}/5 uploaded)
            </span>
          </label>

          {/* image previews */}
          <div className="flex flex-wrap gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`car-${index}`}
                  className="h-20 w-28 object-cover rounded-lg border border-borderColor"
                />
                {/* ✅ remove button on hover */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  ✕
                </button>
                {/* ✅ first image badge */}
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}

            {/* ✅ add more images button — hidden when 5 reached */}
            {images.length < 5 && (
              <label
                htmlFor="car-images"
                className="h-20 w-28 border-2 border-dashed border-borderColor rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              >
                <img
                  src={assets.upload_icon}
                  alt=""
                  className="h-6 mb-1 opacity-50"
                />
                <p className="text-xs text-gray-400">Add Photo</p>
                <input
                  type="file"
                  id="car-images"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">
            First image will be shown as main image. Max 5 images.
          </p>
        </div>

        {/* car brand and model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col w-full">
            <label>Brand</label>
            <input
              type="text"
              placeholder="e.g. BMW, Mercedes, Audi..."
              required
              className="px-3 py-2 border border-borderColor rounded-md outline-none"
              value={car.brand}
              onChange={(e) => setCar({ ...car, brand: e.target.value })}
            />
          </div>
          <div className="flex flex-col w-full">
            <label>Model</label>
            <input
              type="text"
              placeholder="e.g. X5, E-Class, M4..."
              required
              className="px-3 py-2 border border-borderColor rounded-md outline-none"
              value={car.model}
              onChange={(e) => setCar({ ...car, model: e.target.value })}
            />
          </div>
        </div>

        {/* year price category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col w-full">
            <label>Year</label>
            <input
              type="number"
              placeholder="2025"
              required
              className="px-3 py-2 border border-borderColor rounded-md outline-none"
              value={car.year}
              onChange={(e) => setCar({ ...car, year: e.target.value })}
            />
          </div>
          <div className="flex flex-col w-full">
            <label>Daily Price ({currency})</label>
            <input
              type="number"
              placeholder="100"
              required
              className="px-3 py-2 border border-borderColor rounded-md outline-none"
              value={car.pricePerDay}
              onChange={(e) => setCar({ ...car, pricePerDay: e.target.value })}
            />
          </div>
          <div className="flex flex-col w-full">
            <label>Category</label>
            <select
              onChange={(e) => setCar({ ...car, category: e.target.value })}
              value={car.category}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">Select a category</option>
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
              <option value="Hybrid">Hybrid</option>
              <option value="Off-Road">Off-Road</option>
            </select>
          </div>
        </div>

        {/* transmission fuel seating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col w-full">
            <label>Transmission</label>
            <select
              onChange={(e) => setCar({ ...car, transmission: e.target.value })}
              value={car.transmission}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">Select transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
              <option value="CVT">CVT (Continuously Variable)</option>
              <option value="DCT">DCT (Dual Clutch)</option>
              <option value="AMT">AMT (Automated Manual)</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label>Fuel Type</label>
            <select
              onChange={(e) => setCar({ ...car, fuel_type: e.target.value })}
              value={car.fuel_type}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">Select fuel type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Plug-in Hybrid">Plug-in Hybrid</option>
              <option value="CNG">CNG (Compressed Natural Gas)</option>
              <option value="LPG">LPG (Liquefied Petroleum Gas)</option>
              <option value="Hydrogen">Hydrogen</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label>Seating Capacity</label>
            <input
              type="number"
              placeholder="4"
              required
              className="px-3 py-2 border border-borderColor rounded-md outline-none"
              value={car.seating_capacity}
              onChange={(e) =>
                setCar({ ...car, seating_capacity: e.target.value })
              }
            />
          </div>
        </div>

        {/* location */}
        <div className="flex flex-col w-full">
          <label>Location</label>
          <input
            type="text"
            placeholder="e.g. Ahmedabad, Mumbai, New York..."
            required
            className="px-3 py-2 border border-borderColor rounded-md outline-none"
            value={car.location}
            onChange={(e) => setCar({ ...car, location: e.target.value })}
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter the city where your car is available for pickup
          </p>
        </div>

        {/* description */}
        <div className="flex flex-col w-full">
          <label>Description</label>
          <textarea
            rows={4}
            placeholder="e.g. A luxury SUV with a spacious interior and powerful engine."
            required
            className="px-3 py-2 border border-borderColor rounded-md outline-none"
            value={car.description}
            onChange={(e) => setCar({ ...car, description: e.target.value })}
          />
        </div>

        {/* ✅ features input */}
        <div className="flex flex-col w-full">
          <label>
            Features
            <span className="text-gray-400 ml-1 text-xs">
              (press Enter or comma to add)
            </span>
          </label>

          {/* feature tags */}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 mt-1">
              {features.map((feature, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="hover:text-red-500 cursor-pointer ml-1"
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
              onKeyDown={handleFeatureKeyDown}
              placeholder="e.g. Bluetooth, GPS, Heated Seats..."
              className="flex-1 px-3 py-2 border border-borderColor rounded-md outline-none"
            />
            {/* ✅ add button */}
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-all cursor-pointer text-xs"
            >
              + Add
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Added: {features.length} feature{features.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer disabled:opacity-60"
          disabled={isLoading}
        >
          <img src={assets.tick_icon} alt="" />
          {isLoading ? "Listing..." : "List Your Car"}
        </button>
      </form>
    </div>
  );
};

export default AddCar;
