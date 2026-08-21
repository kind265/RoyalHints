
import React, { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

interface HeroProps {
  onNavigate: (page: any) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center bg-[#1A1A1A] overflow-hidden">
      {/* Full-bleed Background Image with Parallax */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none"
        style={{ transform: `scale(${1 + offsetY * 0.0004}) translateY(${offsetY * 0.05}px)` }}
      >
        <img 
          src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=2000" 
          alt="Royal Hints Curation" 
          className="w-full h-full object-cover object-center brightness-[0.7] contrast-110"
        />
      </div>

      {/* Multi-layered Dark Vignette and Gradient Overlay for Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111827]/95 via-[#111827]/80 to-[#111827]/60"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-[#1A1A1A]/70"></div>

      {/* Ambient Royal Blue Glow */}
      <div className="absolute top-1/3 left-10 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-[#2563EB]/25 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 sm:px-12 md:px-16 lg:px-24 py-28 sm:py-36">
        <div className="max-w-3xl">

          <h1 className="text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] sm:leading-[0.92] tracking-tighter mb-6 sm:mb-8 drop-shadow-lg">
            Books. Parts. <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.9)' }}>Fabric &</span> <br />
            <span className="text-[#3B82F6]">Fashion.</span>
          </h1>

          <p className="text-gray-200 text-sm sm:text-base md:text-lg max-w-xl mb-8 sm:mb-10 font-light leading-relaxed drop-shadow-md">
            The exclusive royal destination for collectors, fabricators, and designers. Every single item is cataloged in physical inventory, certified, and ready for swift dispatch.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md sm:max-w-none">
            <button 
              onClick={() => {
                const el = document.getElementById('catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#2563EB] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[10px] font-black text-xs uppercase tracking-[0.25em] hover:bg-[#1D4ED8] transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-98"
            >
              <ShoppingBag className="h-4 w-4" /> View In-Stock Catalog
            </button>
            <button 
              onClick={() => onNavigate('Marketplace')}
              className="border border-white/30 bg-white/5 backdrop-blur-md text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[10px] font-black text-xs uppercase tracking-[0.25em] hover:bg-white/15 hover:border-white transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              The Marketplace <ArrowRight className="h-4 w-4 text-[#60A5FA]" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Right Badge on Desktop */}
      <div className="absolute bottom-8 right-8 lg:bottom-12 lg:right-12 text-white/50 text-[10px] sm:text-xs tracking-[0.3em] hidden md:block font-black backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
        BOOKS • SPARE PARTS • FABRIC • FASHION
      </div>
    </section>
  );
};

export default Hero;

