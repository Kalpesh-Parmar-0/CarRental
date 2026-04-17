import React, { useState } from "react";
import { assets, ownerMenuLinks } from "../../assets/assets";
import { NavLink, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
// import { set } from "mongoose";

const Sidebar = () => {
  const { user, axios, fetchUser } = useAppContext();
  const location = useLocation();
  const [image, setImage] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateImage = async () => {
    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append("image", image);

      const { data } = await axios.post("/api/owner/update-profile", formData);

      if (data.success) {
        fetchUser();
        toast.success(data.message);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateName = async () => {
    if (!name.trim()) {
      return toast.error("Name cannot be empty");
    }
    if (name.trim() === user?.name) {
      setIsEditingName(false);
      return;
    }
    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append("name", name.trim());

      const { data } = await axios.post("/api/owner/update-profile", formData);

      if (data.success) {
        await fetchUser();
        toast.success("Name updated");
        setIsEditingName(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative min-h-screen md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-borderColor text-sm">
      <div className="group relative">
        <label htmlFor="image" className="cursor-pointer block">
          {/* ✅ show preview if new image selected */}
          {image ? (
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto object-cover"
            />
          ) : // ✅ show existing image if uploaded before
          user?.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto object-cover"
            />
          ) : (
            // ✅ show first letter of name if no image
            <div className="h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto bg-primary text-white flex items-center justify-center font-semibold text-lg md:text-2xl select-none">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}

          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />

          {/* ✅ hover overlay with edit icon */}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <img src={assets.edit_icon} alt="" className="w-4 h-4" />
          </div>
        </label>
      </div>

      {/* ✅ save button — only when new image selected */}
      {image && (
        <button
          onClick={updateImage}
          disabled={isUpdating}
          //   className="absolute top-0 right-0 flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-lg cursor-pointer transition-all"
          className="absolute top-0 right-0 flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs rounded-lg cursor-pointer transition-all disabled:opacity-60"
        >
          {isUpdating ? "..." : "Save"}
          <img
            src={assets.check_icon}
            width={13}
            alt=""
            className="brightness-200"
          />
        </button>
      )}

      {/* ✅ editable name section */}
      <div className="mt-2 flex items-center gap-1 justify-center max-md:hidden">
        {isEditingName ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateName();
                if (e.key === "Escape") {
                  setIsEditingName(false);
                  setName(user?.name || "");
                }
              }}
              className="border border-primary rounded px-2 py-0.5 text-sm outline-none w-28 text-center"
              autoFocus
            />
            {/* ✅ confirm name */}
            <button
              onClick={updateName}
              disabled={isUpdating}
              className="text-green-500 hover:text-green-600 cursor-pointer disabled:opacity-60"
            >
              <img src={assets.check_icon} width={13} alt="" />
            </button>
            {/* ✅ cancel edit */}
            <button
              onClick={() => {
                setIsEditingName(false);
                setName(user?.name || "");
              }}
              className="text-red-400 hover:text-red-500 cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-1 group/name cursor-pointer"
            onClick={() => setIsEditingName(true)}
          >
            <p className="text-base">{user?.name}</p>
            {/* ✅ edit icon appears on hover */}
            <img
              src={assets.edit_icon}
              alt=""
              className="w-3 h-3 opacity-0 group-hover/name:opacity-60 transition-opacity"
            />
          </div>
        )}
      </div>

      <div className="w-full">
        {ownerMenuLinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${link.path === location.pathname ? "bg-primary/10 text-primary" : "text-gray-600"}`}
          >
            <img
              src={
                link.path === location.pathname ? link.coloredIcon : link.icon
              }
              alt="car-icon"
            />
            <span className="max-md:hidden">{link.name}</span>
            <div
              className={`${link.path === location.pathname && "bg-primary "} w-1.5 h-8 rounded-l right-0 absolute`}
            ></div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
