import React from 'react';
import { Sparkles, Palette, Truck } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Sparkles,
      title: "Premium Quality",
      description: "We meticulously select the finest fabrics and craftsmanship for lasting comfort and style.",
    },
    {
      icon: Palette,
      title: "Curated Styles",
      description: "Our fashion experts handpick the latest trends and timeless pieces to elevate your wardrobe.",
    },
    {
      icon: Truck,
      title: "Seamless Experience",
      description: "Enjoy fast delivery, easy returns, and dedicated customer support for a worry-free shopping journey.",
    },
  ];

  return (
    <section className="bg-[#111] text-white py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-white">Why Choose FITFORME</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center text-center">
              <div className="bg-gray-700 rounded-full p-4 mb-6">
                <feature.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
