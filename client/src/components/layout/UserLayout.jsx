import React from 'react';
import { Outlet } from 'react-router-dom';

import AboutUs from './About';
import Footer from './Fotter';
import  Navbar  from '../common/Navbar';
import WhyChooseUs from './WhyChooseUs';


export const UserLayout = () => (
  <>
    <Navbar />
   



    {/* The child route (HeroSection or ImageUpload) renders here */}
    <Outlet />
     <AboutUs />
      <WhyChooseUs />
     <Footer />

   
    
  </>
);

export default UserLayout;