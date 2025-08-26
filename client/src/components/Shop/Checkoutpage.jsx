import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import { useCart } from './Createcart';
import Confetti from 'react-confetti';

const CheckoutPage = () => {
  const { cartItems, getCartCount } = useCart();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subtotal = cartItems.reduce((total, item) => total + (item ? (item.price || 0) * item.quantity : 0), 0);
  const shippingCost = subtotal >= 999 ? 0 : 50;

  // Apply discount only if correct code entered
  const discountAmount = discountApplied ? subtotal * 0.1 : 0; 
  const totalBill = subtotal - discountAmount + shippingCost;

  const handleApplyDiscount = () => {
    if (discountCode.trim().toLowerCase() === "10%discount") {
      setDiscountApplied(true);
      setErrorMessage("");
    } else {
      setDiscountApplied(false);
      setErrorMessage("Invalid discount code. Please try again.");
    }
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items before placing an order.");
      navigate('/shop');
      return;
    }

    console.log("Placing order with items:", cartItems);
    console.log("Total bill:", totalBill);

    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      alert("Order Placed Successfully! (This is a simulation)");
      navigate('/');
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#111] text-gray-100">
      <Navbar />
      {showConfetti && (
        <Confetti
          particleCount={50}
          spread={90}
          startVelocity={20}
          elementSize={20}
          lifetime={150}
          gravity={0.35}
          colors={["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3"]}
        />
      )}

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Checkout Summary</h1>

        {/* Cart Items */}
        <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Your Order ({getCartCount()} items)</h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Your cart is empty. Please add items to proceed.</p>
          ) : (
            <ul className="divide-y divide-gray-700">
              {cartItems.map((item, idx) => (
                item && (
                  <li key={item.id + item.size + idx} className="py-4 flex items-center gap-4">
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name || "Cart Item"}
                      className="w-20 h-20 object-cover rounded-md border border-gray-600"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=Item';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-lg">{item.name || 'Unknown Item'}</h3>
                      <p className="text-sm text-gray-400">Size: {item.size}</p>
                      {item.type === 'outfit' ? (
                        <p className="text-sm text-gray-400">Top Color: {item.topColor || 'N/A'}, Bottom Color: {item.bottomColor || 'N/A'}</p>
                      ) : (
                        <p className="text-sm text-gray-400">Color: {item.color || 'N/A'}</p>
                      )}
                      <p className="text-md font-semibold text-white">₹{item.price} x {item.quantity}</p>
                    </div>
                    <span className="text-lg font-bold text-white">₹{(item.price || 0) * item.quantity}</span>
                  </li>
                )
              ))}
            </ul>
          )}
        </div>

        {/* Discount Code Input */}
        <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Have a Discount Code?</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter discount code"
              className="flex-1 p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleApplyDiscount}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              Apply
            </button>
          </div>
          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
          {discountApplied && <p className="text-green-500 mt-2">Discount Applied! 10% off your subtotal.</p>}
        </div>

        {/* Bill Summary */}
        <div className="bg-[#1c1c1c] p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Order Summary</h2>
          <div className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span>Subtotal ({getCartCount()} items):</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-green-400">
                <span>Discount (10%):</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{shippingCost === 0 ? <span className="text-green-500">FREE</span> : `₹${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-white border-t border-gray-600 pt-4 mt-4">
              <span>Total:</span>
              <span>₹{totalBill.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={cartItems.length === 0}
          className={`w-full py-4 rounded-lg font-semibold text-xl transition-colors duration-200 ${
            cartItems.length === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
