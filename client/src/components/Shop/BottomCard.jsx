import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BottomCard.css';
import { useCart } from '../Shop/Createcart'; // Make sure this path is correct

const BottomCard = ({ bottom }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  const handleCardClick = () => {
    navigate(`/product/bottom/${bottom._id}`, {
      state: { item: { ...bottom, type: 'bottom' } }
    });
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation(); // Prevent triggering card click
    setShowSizeModal(true);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    addToCart(
      {
        ...bottom,
        _id: bottom._id,
        id: bottom._id,
        type: 'bottom'
      },
      size,
      1
    );
    setShowSizeModal(false);
    setSelectedSize('');
  };

  return (
    <>
      <div className="bottom-card">
        <div className="card-image">
          <img
            src={bottom.image_url || '/placeholder.svg'}
            alt={bottom.name}
            className="item-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x400?text=Bottom+Image';
            }}
          />
          <div className="item-type-badge">BOTTOM</div>
        </div>

        <div className="card-content">
          <h3 className="item-name">{bottom.name}</h3>
          <p className="item-category">Bottom Wear</p>

          <div className="item-details">
            <div className="price-section">
              <span className="price">₹{bottom.price}</span>
            </div>
            <div className="color-section">
              <span className="color-label">Color:</span>
              <span className="color-value">{bottom.color}</span>
            </div>
          </div>

          <div className="card-actions">
            <button className="add-to-cart-btn" onClick={handleAddToCartClick}>
              Add to Cart
            </button>
            <button className="view-details-btn" onClick={handleCardClick}>
              View Details
            </button>
          </div>
        </div>
      </div>

      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 shadow-lg text-gray-900">
            <h3 className="text-lg font-semibold mb-4">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`px-4 py-2 border rounded transition ${
                    selectedSize === size
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              className="mt-4 text-sm text-red-500 hover:text-red-700"
              onClick={() => setShowSizeModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomCard;
