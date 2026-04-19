import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
// ✅ send cookies with every request automatically
axios.defaults.withCredentials = true;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  // const [token, setToken] = useState(null)
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cars, setCars] = useState([]);
  const [cities, setCities] = useState([]);

  // function to check if user has logged in
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data");
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner");
      } else {
        // ✅ don't navigate — user might just not be logged in yet
        setUser(null);
        setIsOwner(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to fetch all cars from server
  const fetchCars = async () => {
    try {
      const { data } = await axios.get("/api/user/cars");
      data.success ? setCars(data.cars) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchCities = async () => {
    try {
      const { data } = await axios.get("/api/user/cities");
      data.success ? setCities(data.cities) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to logout user
  const logout = async () => {
    try {
      const { data } = await axios.post("/api/user/logout");
      if (data.success) {
        setUser(null);
        setIsOwner(false);
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // useEffect to retrieve the token from local storage
  useEffect(() => {
    fetchUser();
    fetchCars();
    fetchCities();
  }, []);

  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    isOwner,
    setIsOwner,
    fetchUser,
    fetchCars,
    showLogin,
    setShowLogin,
    logout,
    cars,
    setCars,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    cities,
    setCities,
    fetchCities,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
