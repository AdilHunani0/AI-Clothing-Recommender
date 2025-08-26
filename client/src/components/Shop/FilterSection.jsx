import React, { useState } from 'react';
import './FilterSection.css';

const FilterSection = ({ onFilterChange, onDisplayModeChange }) => {
  const [filters, setFilters] = useState({
    priceRange: '',
    color: '',
    occasion: '',
    itemType: 'both', // 'tops', 'bottoms', 'both'
    minPrice: '',
    maxPrice: ''
  });

  const [displayMode, setDisplayMode] = useState('combined'); // 'combined' or 'individual'

  const colors = [ 'Black', 'White', 'navy','burgundy','light_blue', 'Brown', 'Gray', 'Cream', 'Beige'];
  const occasions = ['Formal', 'Casual', 'Party', 'Sport', 'Business', 'Evening'];
  const priceRanges = [
    { label: 'Under ₹1000', min: 0, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: '₹2000 - ₹3000', min: 2000, max: 3000 },
    { label: '₹3000 - ₹5000', min: 3000, max: 5000 },
    { label: 'Above ₹5000', min: 5000, max: 999999 }
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (range) => {
    const newFilters = { 
      ...filters, 
      priceRange: range.label,
      minPrice: range.min,
      maxPrice: range.max
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    onDisplayModeChange(mode);
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: '',
      color: '',
      occasion: '',
      itemType: 'both',
      minPrice: '',
      maxPrice: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div
      className="filter-section"
      style={{
        maxHeight: '80vh',
        overflowY: 'auto',
        paddingRight: '8px'
      }}
    >
      <div className="filter-header">
        <h3>Filters</h3>
        <button onClick={clearFilters} className="clear-filters">
          Clear All
        </button>
      </div>

      {/* Display Mode Filter */}
      <div className="filter-group">
        <h4>Display Mode</h4>
        <div className="display-mode-options">
          <label className="display-mode-option">
            <input
              type="radio"
              name="displayMode"
              value="combined"
              checked={displayMode === 'combined'}
              onChange={(e) => handleDisplayModeChange(e.target.value)}
            />
            <span>Combined Outfits</span>
          </label>
          <label className="display-mode-option">
            <input
              type="radio"
              name="displayMode"
              value="individual"
              checked={displayMode === 'individual'}
              onChange={(e) => handleDisplayModeChange(e.target.value)}
            />
            <span>Individual Items</span>
          </label>
        </div>
      </div>

      {/* Item Type Filter - Only show in individual mode */}
      {displayMode === 'individual' && (
        <div className="filter-group">
          <h4>Item Type</h4>
          <div className="filter-options">
            <label className="filter-option">
              <input
                type="radio"
                name="itemType"
                value="both"
                checked={filters.itemType === 'both'}
                onChange={(e) => handleFilterChange('itemType', e.target.value)}
              />
              <span>Both Tops & Bottoms</span>
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="itemType"
                value="tops"
                checked={filters.itemType === 'tops'}
                onChange={(e) => handleFilterChange('itemType', e.target.value)}
              />
              <span>Tops Only</span>
            </label>
            <label className="filter-option">
              <input
                type="radio"
                name="itemType"
                value="bottoms"
                checked={filters.itemType === 'bottoms'}
                onChange={(e) => handleFilterChange('itemType', e.target.value)}
              />
              <span>Bottoms Only</span>
            </label>
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="filter-group">
        <h4>Price Range</h4>
        <div className="filter-options">
          {priceRanges.map((range, index) => (
            <label key={index} className="filter-option">
              <input
                type="radio"
                name="priceRange"
                checked={filters.priceRange === range.label}
                onChange={() => handlePriceRangeChange(range)}
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="filter-group">
        <h4>Color</h4>
        <div className="filter-options">
          {colors.map((color, index) => (
            <label key={index} className="filter-option">
              <input
                type="checkbox"
                checked={filters.color === color}
                onChange={(e) => handleFilterChange('color', e.target.checked ? color : '')}
              />
              <span>{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Occasion Filter - Only show in combined mode */}
      {displayMode === 'combined' && (
        <div className="filter-group">
          <h4>Occasion</h4>
          <div className="filter-options">
            {occasions.map((occasion, index) => (
              <label key={index} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.occasion === occasion}
                  onChange={(e) => handleFilterChange('occasion', e.target.checked ? occasion : '')}
                />
                <span>{occasion}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Custom Price Range */}
      <div className="filter-group">
        <h4>Custom Price Range</h4>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="price-input"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="price-input"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
