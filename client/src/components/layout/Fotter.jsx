import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-10 px-4 md:px-8 lg:px-16 border-t border-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="col-span-1 md:col-span-1">
          <h3 className="text-2xl font-extrabold tracking-wide text-white mb-4">FITFORME</h3>
          <p className="text-sm leading-relaxed">
            Your ultimate destination for modern and curated fashion. Discover trends, personalize your style, and shop with confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors duration-200">Home</Link></li>
            <li><Link to="/shop" className="hover:text-white transition-colors duration-200">Shop</Link></li>
            <li><Link to="/sale" className="hover:text-white transition-colors duration-200">Sale</Link></li>
            <li><Link to="/userdashboard" className="hover:text-white transition-colors duration-200">Dashboard</Link></li>
            <li><Link to="/showcase" className="hover:text-white transition-colors duration-200">Showcase</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Customer Service</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="hover:text-white transition-colors duration-200">Contact Us</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors duration-200">FAQ</Link></li>
            <li><Link to="/returns" className="hover:text-white transition-colors duration-200">Returns & Exchanges</Link></li>
            <li><Link to="/shipping" className="hover:text-white transition-colors duration-200">Shipping Information</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Connect With Us */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Connect With Us</h4>
          <p className="text-sm mb-4">Stay updated on our latest collections and offers.</p>
          <div className="flex space-x-4 mb-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FaFacebookF size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FaTwitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FaInstagram size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
              <FaLinkedinIn size={20} />
            </a>
          </div>
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} CHICX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
