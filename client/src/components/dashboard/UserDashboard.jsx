import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../Shop/Createcart";
import Navbar from "../common/Navbar"; // Import your Navbar

const UserDashboard = ({ userEmail, loginSuccess }) => {
  const [user, setUser] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const { cartItems } = useCart();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    address: "",
    number: "",
  });
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  // Fetch user details from MongoDB
  const fetchUserDetails = async () => {
    if (userEmail) {
      try {
        const res = await axios.get(`http://localhost:5000/api/user?email=${userEmail}`);
        setUser(res.data.user);
        setProfileForm({
          name: res.data.user.name || "",
          address: res.data.user.address || "",
          number: res.data.user.number || "",
        });
      } catch (err) {
        console.error("Error fetching user details:", err);
        setUpdateError("Failed to load user profile.");
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userEmail]);

  // Demo: Fetch purchase history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("purchaseHistory") || "[]");
    setPurchaseHistory(history.filter(h => h.email === userEmail));
  }, [userEmail]);

  // Demo: Add a "Buy Now" button to simulate a purchase
  const handleBuyNow = () => {
    const newHistory = [
      ...purchaseHistory,
      ...cartItems.map(item => ({
        email: userEmail,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        date: new Date().toLocaleString()
      }))
    ];
    localStorage.setItem("purchaseHistory", JSON.stringify(newHistory));
    setPurchaseHistory(newHistory);
    // Optionally clear cart after purchase simulation
    // clearCart(); 
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    setUpdateMessage("");
    setUpdateError("");
    try {
      const res = await axios.put("http://localhost:5000/api/user", {
        email: userEmail,
        ...profileForm,
      });
      setUser(res.data.user); // Update local user state with new data
      setUpdateMessage(res.data.message || "Profile updated successfully!");
      setIsEditingProfile(false); // Exit edit mode
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateError(err.response?.data?.error || "Failed to update profile.");
    }
  };

  if (!user) return (
    <div className="p-8 text-center text-gray-300 min-h-screen bg-[#111]">
      <Navbar /> {/* Add Navbar at the top */}
      Loading user dashboard...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111] pb-10">
      <Navbar /> {/* Add Navbar at the top */}
      <div className="max-w-3xl mx-auto p-8 bg-[#1c1c1c] rounded-2xl shadow-xl mt-10 border border-gray-700 text-gray-100">
        <h2 className="text-3xl font-extrabold mb-6 text-white text-center">User Dashboard</h2>
        
        {loginSuccess && (
          <p className="bg-green-700 text-white px-4 py-2 rounded-md mb-4 text-center">
            {loginSuccess}
          </p>
        )}
        {updateMessage && (
          <p className="bg-blue-700 text-white px-4 py-2 rounded-md mb-4 text-center">
            {updateMessage}
          </p>
        )}
        {updateError && (
          <p className="bg-red-700 text-white px-4 py-2 rounded-md mb-4 text-center">
            {updateError}
          </p>
        )}

        {/* Profile Section */}
        <div className="mb-8 p-6 border border-gray-700 rounded-lg bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-white">Your Profile</h3>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm"
            >
              {isEditingProfile ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>

          {isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email} // Email is not editable
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 cursor-not-allowed sm:text-sm text-gray-400"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
                />
              </div>
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-300">Mobile</label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={profileForm.number}
                  onChange={handleProfileFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="text-gray-300 space-y-2">
              <p><b>Name:</b> {user.name}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>Address:</b> {user.address || "Not provided"}</p>
              <p><b>Mobile:</b> {user.number || "Not provided"}</p>
            </div>
          )}
        </div>

        {/* Cart Items Section */}
        <div className="mb-8 p-6 border border-gray-700 rounded-lg bg-gray-800">
          <h3 className="font-bold text-xl mb-4 text-white">Current Cart Items</h3>
          {cartItems.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No items in cart.</p>
          ) : (
            <ul className="divide-y divide-gray-700"> {/* Darker divider */}
              {cartItems.map((item, idx) => (
                <li key={item.id + item.size + idx} className="py-3 flex items-center gap-4 text-gray-300">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name || item.description || "Cart Item"}
                    className="w-16 h-16 object-cover rounded-md border border-gray-600"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=Item';
                    }}
                  />
                  <div className="flex-1">
                    <span className="font-medium text-white">{item.name}</span> 
                    {item.size && <span className="text-sm text-gray-400 ml-2">({item.size})</span>}
                    {item.type === 'outfit' && (
                      <span className="text-sm text-gray-400 ml-2 block">
                        (Top: {item.topColor || 'N/A'}, Bottom: {item.bottomColor || 'N/A'})
                      </span>
                    )}
                    {item.color && item.type !== 'outfit' && (
                      <span className="text-sm text-gray-400 ml-2 block">(Color: {item.color})</span>
                    )}
                  </div>
                  <span className="font-semibold text-white">₹{item.price} x {item.quantity}</span>
                </li>
              ))}
            </ul>
          )}
          {cartItems.length > 0 && (
            <button
              className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
              onClick={handleBuyNow}
            >
              Simulate Purchase (Buy Now)
            </button>
          )}
        </div>

        {/* Purchase History Section */}
        <div className="p-6 border border-gray-700 rounded-lg bg-gray-800">
          <h3 className="font-bold text-xl mb-4 text-white">Purchase History</h3>
          {purchaseHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No purchase history.</p>
          ) : (
            <ul className="divide-y divide-gray-700"> {/* Darker divider */}
              {purchaseHistory.map((item, idx) => (
                <li key={idx} className="py-3 flex justify-between items-center text-gray-300">
                  <div>
                    <span className="font-medium text-white">{item.name}</span>
                    <span className="text-sm text-gray-400 ml-2">({item.quantity} pcs)</span>
                  </div>
                  <span className="font-semibold text-white">
                    ₹{item.price * item.quantity} <span className="text-xs text-gray-500 ml-2">({item.date})</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
