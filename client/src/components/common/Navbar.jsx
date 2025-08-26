import React, { useRef, useState } from "react";
import { Link } from 'react-router-dom';
// Removed useSelector as it's not used in this file
import { CartIcon } from "./Carticon";

import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Shop/Createcart";

const Navbar = () => {
  const cartRef = useRef(null);
  const navigate = useNavigate();
  const { cartItems, getCartCount, removeFromCart, updateQuantity } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    number: ""
  });
  const [signupError, setSignupError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setLoginError("All fields are required.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(loginData.email)) {
      setLoginError("Invalid email format.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/login", loginData);
      localStorage.setItem('userEmail', loginData.email);
      setLoginError("");
      setLoginSuccess("Login successfully!");
      setShowLogin(false);
      // Optionally redirect to dashboard:
      window.location.href = "/userdashboard";
    } catch (err) {
      setLoginError(err.response?.data?.error || "Login failed.");
      setLoginSuccess("");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.address || !signupData.number) {
      setSignupError("All fields are required.");
      return;
    }
    if (signupData.password.length < 8) {
      setSignupError("Password must be at least 8 characters.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signupData.email)) {
      setSignupError("Invalid email format.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/signup", signupData);
      setSignupError("");
      setShowSignup(false);
    } catch (err) {
      setSignupError(err.response?.data?.error || "Signup failed.");
    }
  };

  const handleCartClick = () => {
    setShowCart(true);
    cartRef.current?.startAnimation();
    setTimeout(() => cartRef.current?.stopAnimation(), 500);
  };

  const handleRemoveItem = (id, type, size) => {
    removeFromCart(id, type, size);
  };

  const handleQuantityChange = (id, type, size, newQuantity) => {
    updateQuantity(id, type, size, newQuantity);
  };

  return (
    <nav className="flex justify-between items-center px-10 py-6 bg-[#111] text-white">
      <div className="text-2xl font-extrabold tracking-wide cursor-pointer hover:text-gray-400 transition">
        FITFORME
      </div>
      <div className="flex items-center gap-3 bg-[#1c1c1c] px-4 py-2 rounded-full">
        {["Home", "Shop", "userdashbord",'YourBill'].map((item) => (
          <button
            key={item}
            className={`text-sm px-4 py-1 rounded-full font-medium transition-all duration-200 ${
              item === "Home"
                ? "bg-white text-black"
                : "text-white hover:bg-white hover:text-black"
            }`}
            onClick={() => {
              if (item === "Shop") navigate("/shop");
              else if (item === "Home") navigate("/");
              else if (item === "userdashboard") navigate("/userdashboard");
              else if (item === "YourBill") navigate("/cart");
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 relative">
        
        <button className="text-sm hover:text-gray-400 transition" onClick={() => setShowLogin(true)}>
          Login
        </button>
        <button
          className="bg-white text-black px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-200 transition"
          onClick={() => setShowSignup(true)}
        >
          Sign up
        </button>
        <div className="relative">
          <CartIcon
            ref={cartRef}
            className="cursor-pointer hover:text-gray-300 transition"
            onClick={handleCartClick}
          />
          {getCartCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {getCartCount()}
            </span>
          )}
        </div>
      </div>
      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl relative border border-gray-200 text-gray-900">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowCart(false)}
              aria-label="Close cart modal"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Shopping Cart</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center">Your cart is empty.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {cartItems.map((item, index) => (
                  item && (
                    <div key={item.id || index} className="flex items-center gap-4 border-b py-4">
                      <img
                        src={item.image_url || "/placeholder.svg"} 
                        alt={item.name || item.description || "Cart Item"}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100?text=Item';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {item.name || item.description || 'Unknown Item'}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {/* Updated to use topColor and bottomColor for outfits */}
                          {item.type === 'outfit' 
                            ? `Top: ${item.topColor || 'N/A'}, Bottom: ${item.bottomColor || 'N/A'}` 
                            : `Color: ${item.color || 'N/A'}`}
                        </p>
                        {item.size && <p className="text-xs text-gray-600">Size: {item.size}</p>}
                        <p className="text-sm font-bold text-gray-900">
                          ₹{(item.price || 0) * item.quantity}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => handleQuantityChange(item.id, item.type, item.size, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => handleQuantityChange(item.id, item.type, item.size, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 text-sm"
                        onClick={() => handleRemoveItem(item.id, item.type, item.size)}
                      >
                        Remove
                      </button>
                    </div>
                  )
                ))}
                <div className="mt-4">
                  <p className="text-lg font-bold text-gray-900">
                    Total: ₹{cartItems.reduce((total, item) => total + (item ? (item.price || 0) * item.quantity : 0), 0)}
                  </p>
                  <button
                    className="w-full bg-black text-white py-2 rounded-lg mt-4 hover:bg-gray-800 transition"
                    onClick={() => navigate('/cart')}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-96 shadow-2xl relative border border-gray-200 animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowSignup(false)}
              aria-label="Close signup modal"
            >
              &times;
            </button>
            <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center tracking-tight">Sign Up</h2>
            <form className="space-y-4" onSubmit={handleSignupSubmit}>
              {/* Name */}
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-black">
                <span className="material-icons text-gray-400 mr-2">person</span>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  autoComplete="name"
                />
              </div>
              {/* Email */}
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-black">
                <span className="material-icons text-gray-400 mr-2">email</span>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
              {/* Address */}
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-black">
                <span className="material-icons text-gray-400 mr-2">home</span>
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400"
                  value={signupData.address}
                  onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                  autoComplete="street-address"
                />
              </div>
              {/* Number */}
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-black">
                <span className="material-icons text-gray-400 mr-2">phone</span>
                <input
                  type="text"
                  placeholder="Mobile Number"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400"
                  value={signupData.number}
                  onChange={(e) => setSignupData({ ...signupData, number: e.target.value })}
                  autoComplete="tel"
                />
              </div>
              {/* Password */}
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-black">
                <span className="material-icons text-gray-400 mr-2">lock</span>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
              {/* Error and Button */}
              {signupError && <p className="text-red-500 text-sm text-center">{signupError}</p>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-2 rounded-lg font-semibold shadow hover:from-gray-900 hover:to-black transition transform hover:scale-105"
              >
                Sign up
              </button>
            </form>
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-200" />
              <span className="mx-3 text-gray-400 text-sm">or</span>
              <div className="flex-grow h-px bg-gray-200" />
            </div>
            <div className="flex justify-between gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 transition shadow-sm">
                <FaGoogle className="text-red-500 text-xl" />
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 transition shadow-sm">
                <FaFacebook className="text-blue-600 text-xl" />
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 transition shadow-sm">
                <FaGithub className="text-black text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-96 shadow-2xl relative border border-gray-200 animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowLogin(false)}
              aria-label="Close login modal"
            >
              &times;
            </button>
            <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center tracking-tight">Login</h2>
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-black">
                <span className="material-icons text-gray-400 mr-2">email</span>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-black">
                <span className="material-icons text-gray-400 mr-2">lock</span>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  autoComplete="current-password"
                />
              </div>
              {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-2 rounded-lg font-semibold shadow hover:from-gray-900 hover:to-black transition transform hover:scale-105"
              >
                Login
              </button>
            </form>
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-200" />
              <span className="mx-3 text-gray-400 text-sm">or</span>
              <div className="flex-grow h-px bg-gray-200" />
            </div>
            <div className="flex justify-between gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 transition shadow-sm">
                <FaGoogle className="text-red-500 text-xl" />
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 transition shadow-sm">
                <FaFacebook className="text-blue-600 text-xl" />
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 transition shadow-sm">
                <FaGithub className="text-black text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
