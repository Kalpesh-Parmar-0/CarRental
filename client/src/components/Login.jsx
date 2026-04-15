import React from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import {assets} from "../assets/assets";

const Login = () => {
  const { setShowLogin, axios, fetchUser, navigate } = useAppContext();
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();

      // ✅ check passwords match before hitting API
      if (state === "register" && password !== confirmPassword) {
        return toast.error("Passwords do not match");
      }

      // ✅ check password length
      if (password.length < 8) {
        return toast.error("Password must be at least 8 characters");
      }

      const { data } = await axios.post(`/api/user/${state}`, {
        name,
        email,
        password,
      });

      if (data.success) {
        await fetchUser();
        setShowLogin(false);
        navigate("/");
        toast.success(
          state === "login"
            ? "Logged in successfully"
            : "Account created successfully",
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ reset fields when switching between login and register
  const switchState = (newState) => {
    setState(newState);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-600 bg-black/50"
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>
        {state === "register" && (
          <div className="w-full">
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              type="text"
              required
            />
          </div>
        )}
        <div className="w-full ">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="email"
            required
          />
        </div>
        <div className="w-full ">
          <p>Password</p>
          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="minimum 8 characters"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              type={showPassword ? "text" : "password"}
              required
            />
            <img
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xs text-gray-500"
              src = {showPassword ? assets.eye_icon : assets.eye_close_icon}
            />
            
          </div>
        </div>

        {state === "register" && (
          <div className="w-full">
            <p>Confirm Password</p>
            <div className="relative">
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                placeholder="re-enter password"
                className={`border rounded w-full p-2 mt-1 outline-primary
                            ${
                              confirmPassword === ""
                                ? "border-gray-200" // ✅ neutral when empty
                                : confirmPassword === password
                                  ? "border-green-400" // ✅ green when matching
                                  : "border-red-400" // ✅ red when not matching
                            }`}
                type={showConfirmPassword ? "text" : "password"}
                required
              />
              <img
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xs text-gray-500"
                src = {showConfirmPassword ? assets.eye_icon : assets.eye_close_icon}
               />
            </div>
            {/* ✅ live feedback message */}
            {confirmPassword !== "" && confirmPassword !== password && (
              <p className="text-red-500 text-xs mt-1">
                Passwords do not match
              </p>
            )}
          </div>
        )}
        {state === "register" ? (
          <p>
            Already have account?{" "}
            <span
              onClick={() => switchState("login")}
              className="text-primary cursor-pointer"
            >
              click here
            </span>
          </p>
        ) : (
          <p>
            Create an account?{" "}
            <span
              onClick={() => switchState("register")}
              className="text-primary cursor-pointer"
            >
              click here
            </span>
          </p>
        )}
        <button className="bg-primary hover:bg-blue-800 transition-all text-white w-full py-2 rounded-md cursor-pointer">
          {state === "register" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
