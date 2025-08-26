import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopCard.css';
import { useCart } from '../Shop/Createcart';

const TopCard = ({ top }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/product/top/${top._id}`, { state: { item: { ...top, type: 'top' } } });
  };

  const handleAddToCart = (e) => {
    setShowSizeModal(true);

  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    addToCart(
      { ...top, _id: top._id, id: top._id, type: 'top' },
      size,
      1
    );
    setShowSizeModal(false);
    setSelectedSize('');
  };

  return (
    <>
      <div className="top-card">
        <div className="card-image">
          <img
            src={top.image_url || "/placeholder.svg"}
            alt={top.name}
            className="item-image"
            onError={(e) => {
              // e.target.src = 'https://via.placeholder.com/300x400?text=Top+Image';
            }}
          />
          <div className="item-type-badge">TOP</div>
        </div>

        <div className="card-content">
          <h3 className="item-name">{top.name}</h3>
          <p className="item-category">Top Wear</p>

          <div className="item-details">
            <div className="price-section">
              <span className="price">₹{top.price}</span>
            </div>
            <div className="color-section">
              <span className="color-label">Color:</span>
              <span className="color-value">{top.color}</span>
            </div>
          </div>

          <div className="card-actions">
            <button className="add-to-cart-btn" onClick={() => {
              handleAddToCart()
            }}>
              Add to Cart
            </button>
            <button className="view-details-btn" onClick={handleViewDetails}>
              View Details
            </button>
          </div>
        </div>
      </div>

      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-center mb-4 text-gray-800">Select a Size</h2>

            <div className="flex flex-wrap justify-center gap-3">
              {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 border rounded-lg transition-all duration-200 
              ${selectedSize === size
                      ? 'bg-black text-white border-black'
                      : 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                    }`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              className="mt-6 text-red-600 hover:underline block mx-auto"
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

export default TopCard;