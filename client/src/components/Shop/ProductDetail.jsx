import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import axios from 'axios';
import Navbar from '../common/Navbar';
import './ProductDetail.css';
import { useCart } from '../Shop/Createcart';

const ProductDetail = () => {
const { type, id } = useParams();
const navigate = useNavigate();
const location = useLocation(); // Get location object to access state
const { addToCart } = useCart();
const [selectedSize, setSelectedSize] = useState('');
const [selectedImage, setSelectedImage] = useState(0);
const [quantity, setQuantity] = useState(1);
const [itemDetails, setItemDetails] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchItemDetails = async () => {
    setLoading(true);
    setError(null);

    // 1. Try to get item from location state (for individual tops/bottoms from Shop page)
    if (location.state && location.state.item) {
      setItemDetails(location.state.item);
      setLoading(false);
      return;
    }

    // 2. If not in state, attempt to fetch only if it's an 'outfit'
    if (type === 'outfit' && id) {
      try {
        const response = await axios.get(`http://localhost:5000/api/outfits/${id}`);
        setItemDetails({ ...response.data, type: 'outfit' });
      } catch (err) {
        console.error(`Error fetching outfit details for ID ${id}:`, err);
        setError('Failed to load outfit details. Please try again later.');
      } finally {
        setLoading(false);
      }
    } else if (type === 'top' || type === 'bottom') {
      // This case means a direct URL access or refresh for an individual item.
      // Since your backend schema doesn't support fetching tops/bottoms by individual IDs,
      // we display an error or redirect.
      console.warn(`Direct access to individual ${type} item detail page via URL is not supported by backend.`);
      setError(`Failed to load ${type} details. Please navigate from the Shop page for individual items.`);
      setLoading(false);
    } else {
      setError('Invalid item type or ID provided.');
      setLoading(false);
    }
  };

  fetchItemDetails();
}, [id, type, location.state]); // Re-run effect if id, type, or location.state changes

const handleSizeSelect = (size) => {
  setSelectedSize(size);
};

const handleAddToBag = () => {
  if (!selectedSize) {
    alert('Please select a size');
    return;
  }
  addToCart(itemDetails, selectedSize, quantity);
  navigate('/cart');
};

const handleWishlist = () => {
  console.log('Added to wishlist:', itemDetails.name || itemDetails.description);
};

const handleBuyNow = () => {
  if (!selectedSize) {
    alert('Please select a size');
    return;
  }
  addToCart(itemDetails, selectedSize, quantity);
  navigate('/checkout');
};

if (loading) {
  return (
    <div className="product-detail-page">
      <Navbar />
      <div className="product-container">
        <div className="loading-spinner">Loading details...</div>
      </div>
    </div>
  );
}

if (error || !itemDetails) {
  return (
    <div className="product-detail-page">
      <Navbar />
      <div className="product-container">
        <div className="error-message">{error || 'Item not found'}</div>
      </div>
    </div>
  );
}

// Determine images based on item type
const itemImages = itemDetails.type === 'outfit' 
  ? [itemDetails.top.image_url, itemDetails.bottom.image_url]
  : [itemDetails.image_url];

// Determine breadcrumbs based on item type
const breadcrumbs = itemDetails.type === 'outfit'
  ? ["Home", "Mens Clothing", "Outfits", itemDetails.occasion, itemDetails.description]
  : ["Home", "Mens Clothing", itemDetails.type === 'top' ? "Tops" : "Bottoms", itemDetails.name];

return (
  <div className="product-detail-page">
    <Navbar />
    
    <div className="product-container">
      <div className="breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            <span 
              className="breadcrumb-link"
              onClick={() => navigate('/shop')}
            >
              {crumb}
            </span>
            {index < breadcrumbs.length - 1 && <span className="breadcrumb-separator"> &gt; </span>}
          </span>
        ))}
      </div>

      <div className="product-content">
        <div className="product-images">
          <div className="image-thumbnails">
            {itemImages.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`${itemDetails.name || itemDetails.description} - ${itemDetails.type === 'outfit' ? (index === 0 ? 'Top' : 'Bottom') : itemDetails.type}`}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/80x80?text=${itemDetails.type === 'outfit' ? (index === 0 ? 'Top' : 'Bottom') : itemDetails.type}`;
                }}
              />
            ))}
          </div>
          <div className="main-image">
            <img
              src={itemImages[selectedImage] || "/placeholder.svg"}
              alt={itemDetails.name || itemDetails.description}
              className="product-main-image"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/500x500?text=${itemDetails.type === 'outfit' ? (selectedImage === 0 ? 'Top' : 'Bottom') : itemDetails.type}+Image`;
              }}
            />
          </div>
        </div>

        <div className="product-info">
          <div className="product-header">
            <h1 className="product-name">{itemDetails.name || itemDetails.description}</h1>
            <div className="product-brand">
              {itemDetails.type === 'outfit' ? 'Complete Outfit' : (itemDetails.type === 'top' ? 'Top Wear' : 'Bottom Wear')}
            </div>
          </div>

          {itemDetails.review && ( // Only show rating if available (e.g., for outfits)
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(itemDetails.review) ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">{itemDetails.review} (1247 reviews)</span>
            </div>
          )}

          <div className="product-price">
            <span className="current-price">₹{itemDetails.price || itemDetails.total_price}</span>
            {itemDetails.type === 'outfit' && ( // Only show original price and discount for outfits
              <>
                <span className="original-price">₹{Math.round(itemDetails.total_price * 1.5)}</span>
                <span className="discount">33% OFF</span>
              </>
            )}
          </div>

          <div className="product-description">
            {itemDetails.type === 'outfit' ? (
              <p>A complete {itemDetails.occasion} outfit featuring a {itemDetails.top.name} in {itemDetails.top.color} and {itemDetails.bottom.name} in {itemDetails.bottom.color}. Perfect for {itemDetails.occasion} occasions.</p>
            ) : (
              <p>{itemDetails.name} in {itemDetails.color}. Perfect for various occasions.</p>
            )}
          </div>

          {itemDetails.type === 'outfit' && ( // Show outfit components only for outfits
            <div className="outfit-details-section">
              <h3>Outfit Components</h3>
              <div className="outfit-components">
                <div className="component-item">
                  <h4>Top: {itemDetails.top.name}</h4>
                  <p><strong>Color:</strong> {itemDetails.top.color}</p>
                  <p><strong>Price:</strong> ₹{itemDetails.top.price}</p>
                </div>
                <div className="component-item">
                  <h4>Bottom: {itemDetails.bottom.name}</h4>
                  <p><strong>Color:</strong> {itemDetails.bottom.color}</p>
                  <p><strong>Price:</strong> ₹{itemDetails.bottom.price}</p>
                </div>
              </div>
            </div>
          )}

          <div className="size-selection">
            <h3>Select Size</h3>
            <div className="size-options">
              {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                <button
                  key={size}
                  className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity-selection">
            <h3>Quantity</h3>
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="add-to-bag-btn"
              onClick={handleAddToBag}
              disabled={!selectedSize}
            >
              BUY NOW
            </button>
            
            
          </div>

          <div className="product-details">
            <h3>Product Details</h3>
            <ul>
              {itemDetails.type === 'outfit' ? (
                <>
                  <li><strong>Occasion:</strong> {itemDetails.occasion}</li>
                  <li><strong>Top:</strong> {itemDetails.top.name} - {itemDetails.top.color}</li>
                  <li><strong>Bottom:</strong> {itemDetails.bottom.name} - {itemDetails.bottom.color}</li>
                  <li><strong>Total Price:</strong> ₹{itemDetails.total_price}</li>
                  <li><strong>Rating:</strong> {itemDetails.review}/5</li>
                  <li><strong>Tags:</strong> {itemDetails.tags.join(', ')}</li>
                </>
              ) : (
                <>
                  <li><strong>Name:</strong> {itemDetails.name}</li>
                  <li><strong>Category:</strong> {itemDetails.type === 'top' ? 'Top Wear' : 'Bottom Wear'}</li>
                  <li><strong>Color:</strong> {itemDetails.color}</li>
                  <li><strong>Price:</strong> ₹{itemDetails.price}</li>
                  {itemDetails.occasion && <li><strong>Occasion:</strong> {itemDetails.occasion}</li>}
                  {itemDetails.tags && <li><strong>Tags:</strong> {itemDetails.tags.join(', ')}</li>}
                </>
              )}
            </ul>
          </div>

          <div className="delivery-info">
            <h3>Delivery & Returns</h3>
            <div className="delivery-options">
              <div className="delivery-option">
                <span className="delivery-icon">🚚</span>
                <div>
                  <strong>Free Delivery</strong>
                  <p>On orders above ₹999</p>
                </div>
              </div>
              <div className="delivery-option">
                <span className="delivery-icon">↩️</span>
                <div>
                  <strong>Easy Returns</strong>
                  <p>15 days return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default ProductDetail;
