import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './components/Shop/Createcart';
import UserLayout from './components/layout/UserLayout';
import HeroSection from './components/layout/Hero';
import ImageUpload from './components/common/ImageUplod';
import Shop from './components/Shop/Shop';
import ProductDetail from './components/Shop/ProductDetail';
import UserDashboard from './components/dashboard/UserDashboard';
import CheckoutPage from './components/Shop/Checkoutpage';

export default function App() {
  // Get userEmail from localStorage (set after login in Navbar.jsx)
  const userEmail = localStorage.getItem('userEmail');

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<HeroSection />} />
            <Route path="upload" element={<ImageUpload />} />
          </Route>
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:type/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CheckoutPage />} />
          <Route path="/userdashboard" element={<UserDashboard userEmail={userEmail} />} />

        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

// After successful login in handleLoginSubmit:
// localStorage.setItem('userEmail', loginData.email);
