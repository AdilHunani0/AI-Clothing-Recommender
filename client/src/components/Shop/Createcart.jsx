import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];
      console.log('CartProvider: Initializing cart from localStorage:', parsedCart);
      return parsedCart;
    } catch (e) {
      console.error("CartProvider: Error loading cart from localStorage:", e);
      return []; 
    }
  });

  useEffect(() => {
    console.log('CartProvider: cartItems state changed. Attempting to save to localStorage:', cartItems);
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      console.log('CartProvider: Cart saved to localStorage successfully.');
    } catch (e) {
      console.error("CartProvider: Error saving cart to localStorage:", e);
    }
  }, [cartItems]);

  const addToCart = (itemToAdd, size = 'M', quantity = 1) => {
    console.log('addToCart called with:', { itemToAdd, size, quantity });
    
    // --- Robust Input Validation ---
    if (!itemToAdd || typeof itemToAdd !== 'object') {
      console.error("addToCart: Invalid itemToAdd (not an object).", itemToAdd);
      return;
    }
    if (!itemToAdd._id) {
      console.error("addToCart: itemToAdd is missing '_id'.", itemToAdd);
      return;
    }
    if (!itemToAdd.type || (itemToAdd.type !== 'outfit' && itemToAdd.type !== 'top' && itemToAdd.type !== 'bottom')) {
      console.error("addToCart: itemToAdd has invalid or missing 'type'.", itemToAdd);
      return;
    }
    if (typeof size !== 'string' || size.length === 0) {
      console.warn("addToCart: Size is invalid or empty, defaulting to 'M'.", size);
      size = 'M';
    }
    if (typeof quantity !== 'number' || quantity < 1) {
      console.warn("addToCart: Quantity is invalid, defaulting to 1.", quantity);
      quantity = 1;
    }

    // --- Construct a consistent cart item structure ---
    let imageUrl = '/placeholder.svg';
    if (itemToAdd.type === 'outfit') {
      if (itemToAdd.top && itemToAdd.top.image_url) {
        imageUrl = itemToAdd.top.image_url;
      }
    } else if (itemToAdd.image_url) {
      imageUrl = itemToAdd.image_url;
    }

    const cartItem = {
      id: String(itemToAdd._id),
      type: itemToAdd.type,
      name: itemToAdd.name || itemToAdd.description || 'Unknown Item',
      price: itemToAdd.price || itemToAdd.total_price || 0,
      image_url: imageUrl, // Now explicitly set with robust fallback
      size: size,
      quantity: quantity,
      // Store colors more specifically for outfits
      color: itemToAdd.type !== 'outfit' ? itemToAdd.color || 'N/A' : undefined, // For individual tops/bottoms
      topColor: itemToAdd.type === 'outfit' && itemToAdd.top ? itemToAdd.top.color : undefined, // For outfits
      bottomColor: itemToAdd.type === 'outfit' && itemToAdd.bottom ? itemToAdd.bottom.color : undefined, // For outfits
      occasion: itemToAdd.occasion || 'N/A',
    };

    setCartItems((prevItems) => {
      console.log('addToCart: Previous cart items state (inside setCartItems):', prevItems);

      const existingCartItemIndex = prevItems.findIndex(
        (itemInCart) =>
          itemInCart.id === cartItem.id &&
          itemInCart.type === cartItem.type &&
          itemInCart.size === cartItem.size
      );

      let updatedItems;
      if (existingCartItemIndex > -1) {
        updatedItems = prevItems.map((itemInCart, index) =>
          index === existingCartItemIndex
            ? { ...itemInCart, quantity: itemInCart.quantity + quantity }
            : itemInCart
        );
        console.log('addToCart: Cart updated - Incremented quantity for existing item:', updatedItems);
      } else {
        updatedItems = [...prevItems, cartItem];
        console.log('addToCart: Cart updated - Added new item:', updatedItems); 
      }
      return updatedItems;
    });
  };

  const removeFromCart = (id, type, size) => {
    console.log('removeFromCart called for:', { id, type, size });
    setCartItems((prevItems) => {
      const filteredItems = prevItems.filter(
        (item) => !(item.id === id && item.type === type && item.size === size)
      );
      console.log('removeFromCart: New cart items after removal:', filteredItems);
      return filteredItems;
    });
  };

  const updateQuantity = (id, type, size, newQuantity) => {
    console.log('updateQuantity called for:', { id, type, size, newQuantity });
    if (newQuantity < 1) {
      console.warn('updateQuantity: New quantity is less than 1, removing item.');
      removeFromCart(id, type, size); // Remove item if quantity goes to 0 or less
      return;
    }
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id && item.type === type && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      );
      console.log('updateQuantity: New cart items after quantity update:', updatedItems);
      return updatedItems;
    });
  };

  const getCartCount = () => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    console.log('getCartCount: Current cart count:', count);
    return count;
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
