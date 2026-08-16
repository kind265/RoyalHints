
import React from 'react';
import { COLLECTIONS } from '../constants';
import { ProductCategory } from '../types';
import { ChevronRight, Box } from 'lucide-react';

interface CollectionsProps {
  onSelectCategory?: (category: ProductCategory) => void;
}

const Collections: React.FC<CollectionsProps> = ({ onSelectCategory }) => {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-white" id="collections">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <span className="text-[#FF6600] font-black text-xs uppercase tracking-[0.25em] block mb-3">
            Four Core Pillars
          </span>
          <h2 className="text-[#1A1A1A] text-5xl sm:text-6xl font-black tracking-tight mb-4">
            The Royal Curations
          </h2>
          <p className="text-gray-500 text-base max-w-2xl font-light">
            Exclusively focused on authentic literature & monographs, precision engineering spare parts, artisanal fabrics, and tailored sartorial fashion.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLLECTIONS.map((col) => (
            <div
              key={col.id}
              onClick={() => {
                onSelectCategory?.(col.title);
                const el = document.getElementById('catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group cursor-pointer relative"
            >
              {/* Card */}
              <div className="relative bg-white border border-gray-200 rounded-[12px] overflow-hidden hover:border-[#FF6600]/30 transition-all duration-300 flex flex-col h-full">
                
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 border-b border-gray-200">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/40 transition-colors duration-300"></div>

                  {/* Stock Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[9px] font-black uppercase tracking-widest bg-[#1A1A1A] text-[#FF6600]">
                      <Box className="h-3 w-3" />
                      {col.itemCount} In Stock
                    </span>
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute inset-0 flex items-end p-4 group-hover:p-5 transition-all duration-300">
                    <h3 className="text-white font-black text-xl tracking-tight group-hover:text-[#FF6600] transition-colors duration-300">
                      {col.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  {/* Tagline & Description */}
                  <div className="space-y-3">
                    <p className="text-[#FF6600] text-[10px] font-black uppercase tracking-[0.2em]">
                      {col.tagline}
                    </p>
                    <p className="text-gray-600 text-xs leading-relaxed font-light">
                      {col.description}
                    </p>
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] group-hover:text-[#FF6600] transition-colors">
                    <span>Explore</span>
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;

