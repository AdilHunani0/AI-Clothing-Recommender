// import React, { useState, useEffect } from 'react';
// import Navbar from '../common/Navbar';
// import FilterSection from './FilterSection';
// import ClothingCard from './ClothingCard';
// import TopCard from './TopCard';
// import BottomCard from './BottomCard';
// import axios from 'axios';
// import './Shop.css';

// const Shop = () => {
//   const [outfits, setOutfits] = useState([]);
//   const [filteredOutfits, setFilteredOutfits] = useState([]);
//   const [individualItems, setIndividualItems] = useState({ tops: [], bottoms: [] });
//   const [filteredIndividualItems, setFilteredIndividualItems] = useState({ tops: [], bottoms: [] });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [displayMode, setDisplayMode] = useState('combined');
//   const [filters, setFilters] = useState({
//     priceRange: '',
//     color: '',
//     occasion: '',
//     itemType: 'both',
//     minPrice: '',
//     maxPrice: ''
//   });

//   // Fetch outfits from MongoDB
//   useEffect(() => {
//     const fetchOutfits = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get('http://localhost:5000/api/outfits');
//         setOutfits(response.data);
//         setFilteredOutfits(response.data);
        
//         const allTops = [];
//         const allBottoms = [];

//         response.data.forEach(outfit => {
//           if (outfit.top) {
//             // Ensure a unique string _id for client-side use
//             const topId = outfit.top._id ? String(outfit.top._id) : `top-${String(outfit._id)}-${outfit.top.name}-${outfit.top.color}`;
//             allTops.push({ ...outfit.top, _id: topId });
//           }
//           if (outfit.bottom) {
//             // Ensure a unique string _id for client-side use
//             const bottomId = outfit.bottom._id ? String(outfit.bottom._id) : `bottom-${String(outfit._id)}-${outfit.bottom.name}-${outfit.bottom.color}`;
//             allBottoms.push({ ...outfit.bottom, _id: bottomId });
//           }
//         });
        
//         // Deduplicate based on name and color, which will pick one of the generated _ids
//         const uniqueTops = Array.from(new Map(allTops.map(top => [`${top.name}-${top.color}`, top])).values());
//         const uniqueBottoms = Array.from(new Map(allBottoms.map(bottom => [`${bottom.name}-${bottom.color}`, bottom])).values());
        
//         setIndividualItems({ tops: uniqueTops, bottoms: uniqueBottoms });
//         setFilteredIndividualItems({ tops: uniqueTops, bottoms: uniqueBottoms });
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching outfits:', err);
//         setError('Failed to load outfits. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOutfits();
//   }, []);

//   // Apply filters for combined outfits
//   useEffect(() => {
//     let filtered = [...outfits];

//     // Filter by color (check both top and bottom colors)
//     if (filters.color) {
//       filtered = filtered.filter(outfit => 
//         outfit.top.color.toLowerCase().includes(filters.color.toLowerCase()) ||
//         outfit.bottom.color.toLowerCase().includes(filters.color.toLowerCase())
//       );
//     }

//     // Filter by occasion
//     if (filters.occasion) {
//       filtered = filtered.filter(outfit => 
//         outfit.occasion.toLowerCase().includes(filters.occasion.toLowerCase())
//       );
//     }

//     // Filter by price range
//     if (filters.minPrice || filters.maxPrice) {
//       const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
//       const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
      
//       filtered = filtered.filter(outfit => 
//         outfit.total_price >= minPrice && outfit.total_price <= maxPrice
//       );
//     }

//     setFilteredOutfits(filtered);
//   }, [outfits, filters]);

//   // Apply filters for individual items
//   useEffect(() => {
//     let filteredTops = [...individualItems.tops];
//     let filteredBottoms = [...individualItems.bottoms];

//     // Filter by color
//     if (filters.color) {
//       filteredTops = filteredTops.filter(top => 
//         top.color.toLowerCase().includes(filters.color.toLowerCase())
//       );
//       filteredBottoms = filteredBottoms.filter(bottom => 
//         bottom.color.toLowerCase().includes(filters.color.toLowerCase())
//       );
//     }

//     // Filter by price range
//     if (filters.minPrice || filters.maxPrice) {
//       const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
//       const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
      
//       filteredTops = filteredTops.filter(top => 
//         top.price >= minPrice && top.price <= maxPrice
//       );
//       filteredBottoms = filteredBottoms.filter(bottom => 
//         bottom.price >= minPrice && bottom.price <= maxPrice
//       );
//     }

//     setFilteredIndividualItems({ tops: filteredTops, bottoms: filteredBottoms });
//   }, [individualItems, filters]);

//   const handleFilterChange = (newFilters) => {
//     setFilters(newFilters);
//   };

//   const handleDisplayModeChange = (mode) => {
//     setDisplayMode(mode);
//   };

//   // Helper function to get item count based on itemType filter
//   const getItemCount = () => {
//     if (displayMode === 'combined') {
//       return `${filteredOutfits.length} outfits found`;
//     } else {
//       const { itemType } = filters;
//       if (itemType === 'tops') {
//         return `${filteredIndividualItems.tops.length} tops found`;
//       } else if (itemType === 'bottoms') {
//         return `${filteredIndividualItems.bottoms.length} bottoms found`;
//       } else {
//         return `${filteredIndividualItems.tops.length} tops, ${filteredIndividualItems.bottoms.length} bottoms found`;
//       }
//     }
//   };

//   // Helper function to check if section should be shown
//   const shouldShowSection = (sectionType) => {
//     if (displayMode === 'combined') return false;
//     const { itemType } = filters;
//     return itemType === 'both' || itemType === sectionType;
//   };

//   if (loading) {
//     return (
//       <div className="shop-page">
//         <Navbar />
//         <div className="shop-content">
//           <div className="loading-spinner">Loading outfits...</div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="shop-page">
//         <Navbar />
//         <div className="shop-content">
//           <div className="error-message">{error}</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="shop-page">
//       <Navbar />
//       <div className="shop-container">
//         <FilterSection 
//           onFilterChange={handleFilterChange} 
//           onDisplayModeChange={handleDisplayModeChange}
//         />
        
//         <div className="shop-main">
//           <div className="shop-header">
//             <h1>
//               {displayMode === 'combined' ? 'Fashion Outfits' : 'Individual Items'}
//             </h1>
//             <p>{getItemCount()}</p>
//           </div>
          
//           {displayMode === 'combined' ? (
//             <div className="outfits-grid">
//               {filteredOutfits.length > 0 ? (
//                 filteredOutfits.map((outfit) => (
//                   <ClothingCard key={outfit._id} outfit={outfit} />
//                 ))
//               ) : (
//                 <div className="no-results">
//                   <p>No outfits found matching your filters.</p>
//                   <p>Try adjusting your search criteria.</p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="individual-items-container">
//               {shouldShowSection('tops') && (
//                 <div className="tops-section">
//                   <h2>Tops ({filteredIndividualItems.tops.length})</h2>
//                   <div className="items-grid">
//                     {filteredIndividualItems.tops.length > 0 ? (
//                       filteredIndividualItems.tops.map((top) => (
//                         <TopCard key={top._id} top={top} />
//                       ))
//                     ) : (
//                       <div className="no-results">
//                         <p>No tops found matching your filters.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
              
//               {shouldShowSection('bottoms') && (
//                 <div className="bottoms-section">
//                   <h2>Bottoms ({filteredIndividualItems.bottoms.length})</h2>
//                   <div className="items-grid">
//                     {filteredIndividualItems.bottoms.length > 0 ? (
//                       filteredIndividualItems.bottoms.map((bottom) => (
//                         <BottomCard key={bottom._id} bottom={bottom} />
//                       ))
//                     ) : (
//                       <div className="no-results">
//                         <p>No bottoms found matching your filters.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Shop;



// Shop.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import FilterSection from './FilterSection';
import ClothingCard from './ClothingCard';
import TopCard from './TopCard';
import BottomCard from './BottomCard';
import axios from 'axios';
import './Shop.css';

const Shop = () => {
  const [outfits, setOutfits] = useState([]);
  const [filteredOutfits, setFilteredOutfits] = useState([]);
  const [individualItems, setIndividualItems] = useState({ tops: [], bottoms: [] });
  const [filteredIndividualItems, setFilteredIndividualItems] = useState({ tops: [], bottoms: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayMode, setDisplayMode] = useState('combined');
  const [filters, setFilters] = useState({
    priceRange: '',
    color: '',
    occasion: '',
    itemType: 'both',
    minPrice: '',
    maxPrice: ''
  });

  const handleAddToCart = (item) => {
    console.log('Adding to cart:', item); // Replace this with your cart logic
    // You can use context, redux, or localStorage to store the cart
  };

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/outfits');
        setOutfits(response.data);
        setFilteredOutfits(response.data);
        
        const allTops = [];
        const allBottoms = [];

        response.data.forEach(outfit => {
          if (outfit.top) {
            const topId = outfit.top._id ? String(outfit.top._id) : `top-${String(outfit._id)}-${outfit.top.name}-${outfit.top.color}`;
            allTops.push({ ...outfit.top, _id: topId });
          }
          if (outfit.bottom) {
            const bottomId = outfit.bottom._id ? String(outfit.bottom._id) : `bottom-${String(outfit._id)}-${outfit.bottom.name}-${outfit.bottom.color}`;
            allBottoms.push({ ...outfit.bottom, _id: bottomId });
          }
        });

        const uniqueTops = Array.from(new Map(allTops.map(top => [`${top.name}-${top.color}`, top])).values());
        const uniqueBottoms = Array.from(new Map(allBottoms.map(bottom => [`${bottom.name}-${bottom.color}`, bottom])).values());

        setIndividualItems({ tops: uniqueTops, bottoms: uniqueBottoms });
        setFilteredIndividualItems({ tops: uniqueTops, bottoms: uniqueBottoms });
        setError(null);
      } catch (err) {
        console.error('Error fetching outfits:', err);
        setError('Failed to load outfits. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOutfits();
  }, []);

  useEffect(() => {
    let filtered = [...outfits];

    if (filters.color) {
      filtered = filtered.filter(outfit => 
        outfit.top.color.toLowerCase().includes(filters.color.toLowerCase()) ||
        outfit.bottom.color.toLowerCase().includes(filters.color.toLowerCase())
      );
    }

    if (filters.occasion) {
      filtered = filtered.filter(outfit => 
        outfit.occasion.toLowerCase().includes(filters.occasion.toLowerCase())
      );
    }

    if (filters.minPrice || filters.maxPrice) {
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;

      filtered = filtered.filter(outfit => 
        outfit.total_price >= minPrice && outfit.total_price <= maxPrice
      );
    }

    setFilteredOutfits(filtered);
  }, [outfits, filters]);

  useEffect(() => {
    let filteredTops = [...individualItems.tops];
    let filteredBottoms = [...individualItems.bottoms];

    if (filters.color) {
      filteredTops = filteredTops.filter(top => 
        top.color.toLowerCase().includes(filters.color.toLowerCase())
      );
      filteredBottoms = filteredBottoms.filter(bottom => 
        bottom.color.toLowerCase().includes(filters.color.toLowerCase())
      );
    }

    if (filters.minPrice || filters.maxPrice) {
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;

      filteredTops = filteredTops.filter(top => 
        top.price >= minPrice && top.price <= maxPrice
      );
      filteredBottoms = filteredBottoms.filter(bottom => 
        bottom.price >= minPrice && bottom.price <= maxPrice
      );
    }

    setFilteredIndividualItems({ tops: filteredTops, bottoms: filteredBottoms });
  }, [individualItems, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
  };

  const getItemCount = () => {
    if (displayMode === 'combined') {
      return `${filteredOutfits.length} outfits found`;
    } else {
      const { itemType } = filters;
      if (itemType === 'tops') {
        return `${filteredIndividualItems.tops.length} tops found`;
      } else if (itemType === 'bottoms') {
        return `${filteredIndividualItems.bottoms.length} bottoms found`;
      } else {
        return `${filteredIndividualItems.tops.length} tops, ${filteredIndividualItems.bottoms.length} bottoms found`;
      }
    }
  };

  const shouldShowSection = (sectionType) => {
    if (displayMode === 'combined') return false;
    const { itemType } = filters;
    return itemType === 'both' || itemType === sectionType;
  };

  if (loading) {
    return (
      <div className="shop-page">
        <Navbar />
        <div className="shop-content">
          <div className="loading-spinner">Loading outfits...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-page">
        <Navbar />
        <div className="shop-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <Navbar />
      <div className="shop-container">
        <FilterSection 
          onFilterChange={handleFilterChange} 
          onDisplayModeChange={handleDisplayModeChange}
        />
        
        <div className="shop-main">
          <div className="shop-header">
            <h1>{displayMode === 'combined' ? 'Fashion Outfits' : 'Individual Items'}</h1>
            <p>{getItemCount()}</p>
          </div>
          
          {displayMode === 'combined' ? (
            <div className="outfits-grid">
              {filteredOutfits.length > 0 ? (
                filteredOutfits.map((outfit) => (
                  <ClothingCard key={outfit._id} outfit={outfit} onAddToCart={handleAddToCart} />
                ))
              ) : (
                <div className="no-results">
                  <p>No outfits found matching your filters.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="individual-items-container">
              {shouldShowSection('tops') && (
                <div className="tops-section">
                  <h2>Tops ({filteredIndividualItems.tops.length})</h2>
                  <div className="items-grid">
                    {filteredIndividualItems.tops.length > 0 ? (
                      filteredIndividualItems.tops.map((top) => (
                        <TopCard key={top._id} top={top} onAddToCart={handleAddToCart} />
                      ))
                    ) : (
                      <div className="no-results">
                        <p>No tops found matching your filters.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {shouldShowSection('bottoms') && (
                <div className="bottoms-section">
                  <h2>Bottoms ({filteredIndividualItems.bottoms.length})</h2>
                  <div className="items-grid">
                    {filteredIndividualItems.bottoms.length > 0 ? (
                      filteredIndividualItems.bottoms.map((bottom) => (
                        <BottomCard key={bottom._id} bottom={bottom} onAddToCart={handleAddToCart} />
                      ))
                    ) : (
                      <div className="no-results">
                        <p>No bottoms found matching your filters.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
