import React from 'react';
import Atropos from 'atropos/react';
import 'atropos/css';
import img from './hero.jpg'; // Replaced with placeholder for v0 preview
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();
  const heroImageUrl = "/placeholder.svg?width=1200&height=600&text=Fashion+Hero+Background"; // Placeholder image

  return (
    <div className="text-white text-center py-14 bg-gradient-to-b from-black to-[#111] min-h-[calc(100vh-96px)] flex items-center justify-center">
      <Atropos
        className="mx-auto w-full max-w-[1200px] h-[500px] px-4 relative rounded-xl overflow-hidden" // Medium width and height
        activeOffset={40}
        shadow={false}
      >
        <img
          src={img}
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover -z-10 opacity-50"
          data-atropos-offset="-5"
        />
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black opacity-40 -z-10" data-atropos-offset="-5"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full p-4"> {/* Centering content */}
          <p
            className="border border-gray-700 bg-gray-900 bg-opacity-50 rounded-full inline-block px-4 py-1 text-xs mb-4 text-gray-300" // Darker border, background, and text
            data-atropos-offset="2"
          >
            New spring collection 2023
          </p>
          <h1
            className="text-4xl md:text-6xl font-bold max-w-3xl mx-auto mb-6 leading-tight text-white drop-shadow-lg" // Ensured white text, added drop-shadow
            data-atropos-offset="5"
          >
            Where style speaks, trends resonate, fashion flourishes
          </h1>
          <p
            className="text-sm text-gray-300 mb-8 max-w-xl mx-auto" // Kept gray-300 for description
            data-atropos-offset="3"
          >
            Unveiling a fashion destination where trends blend seamlessly with your individual style aspirations. Discover today!
          </p>
          <button
            className="bg-white text-black px-8 py-3 rounded-full font-semibold flex items-center gap-2 mx-auto text-lg hover:bg-gray-200 transition-all duration-300 shadow-lg" // Larger button, better hover, shadow
            data-atropos-offset="6"
            onClick={() => navigate('/upload')}
          >
            FIND YOUR FIT <span className="ml-2">→</span>
          </button>
        </div>
      </Atropos>
    </div>
  );
}
