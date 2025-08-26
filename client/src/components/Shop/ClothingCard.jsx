import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClothingCard.css';
import { useCart } from '../Shop/Createcart';

const ClothingCard = ({ outfit }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');

  const handleCardClick = () => {
    // Navigate to product detail page for an outfit
    navigate(`/product/outfit/${outfit._id}`);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    // Navigate to product detail page for an outfit
    navigate(`/product/outfit/${outfit._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setShowSizeModal(true);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    addToCart({ ...outfit, id: outfit._id, type: 'outfit' }, size, 1);
    setShowSizeModal(false);
    setSelectedSize('');
  };

  return (
    <>
      <div className="clothing-card" onClick={handleCardClick}>
        <div className="card-images">
          <div className="image-container">
            <img 
              src={outfit.top.image_url || "/placeholder.svg"} 
              alt={`${outfit.top.name} - Top`} 
              className="outfit-image top-image"
              onError={(e) => {
                // e.target.src = 'https://via.placeholder.com/200x250?text=Top+Image';
              }}
            />
            <span className="image-label">Top</span>
          </div>
          <div className="image-container">
            <img 
              src={outfit.bottom.image_url || "/placeholder.svg"} 
              alt={`${outfit.bottom.name} - Bottom`} 
              className="outfit-image bottom-image"
              onError={(e) => {
                // e.target.src = 'https://via.placeholder.com/200x250?text=Bottom+Image'; 
              }}
            />
            <span className="image-label">Bottom</span>
          </div>
        </div>
        
        <div className="card-content">
          <h3 className="outfit-name">{outfit.description}</h3>
          <p className="outfit-description">{outfit.occasion} outfit</p>
          
          <div className="outfit-details">
            <div className="price-section">
              <span className="price">₹{outfit.total_price}</span>
            </div>
            
            <div className="rating-section">
              <span className="rating">⭐ {outfit.review}</span>
            </div>
          </div>

          <div className="outfit-colors">
            <div className="color-item">
              <span className="color-label">Top:</span>
              <span className="color-value">{outfit.top.color}</span>
            </div>
            <div className="color-item">
              <span className="color-label">Bottom:</span>
              <span className="color-value">{outfit.bottom.color}</span>
            </div>
          </div>
          
          <div className="outfit-tags">
            {outfit.tags && outfit.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="outfit-tag">{tag}</span>
            ))}
          </div>
          
          <div className="card-actions">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
            <button className="view-details-btn" onClick={handleViewDetails}>View Details</button>
          </div>
        </div>
      </div>

      {showSizeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray p-6 rounded-lg w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 border rounded ${selectedSize === size ? 'bg-black text-green-500' : 'bg-black-100'}`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              className="mt-4 text-red-500"
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

export default ClothingCard;
