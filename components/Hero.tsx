
import React, { useEffect, useState } from 'react';
import { ArrowRight, Box, Sparkles } from 'lucide-react';
import { ASSET_IMAGES } from '../constants';

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
    <section className="relative h-screen min-h-[700px] flex flex-col lg:flex-row bg-[#1A1A1A] overflow-hidden">
      {/* Ambient Orange Glow */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#FF6600]/20 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Left Column: Bold Typography */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-24 z-10 py-24">
        <div 
          className="transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${offsetY * 0.1}px)` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-[#FF6600]/20 text-[#FF6600] border border-[#FF6600]/30">
              <Sparkles className="h-3 w-3" />
              Verified In-Stock Registry
            </span>
          </div>

          <h1 className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.92] tracking-tighter mb-8">
            Fabric. <br />
            <span className="text-transparent border-white" style={{ WebkitTextStroke: '1px white' }}>Books &</span> <br />
            <span className="text-[#FF6600]">Spare Parts.</span>
          </h1>

          <p className="text-gray-300 text-base md:text-lg max-w-lg mb-10 font-light leading-relaxed">
            The exclusive royal destination for collectors, fabricators, designers, and connoisseurs. Every single item is cataloged in physical inventory, certified, and ready for swift dispatch.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                const el = document.getElementById('catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#FF6600] text-white px-10 py-5 rounded-[10px] font-black text-xs uppercase tracking-[0.25em] hover:bg-[#FF6600] transition-all transform hover:-translate-y-1 shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <Box className="h-4 w-4" /> View In-Stock Catalog
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('collections');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border border-white/25 text-white px-10 py-5 rounded-[10px] font-black text-xs uppercase tracking-[0.25em] hover:bg-white/10 hover:border-white transition-all flex items-center justify-center gap-2"
            >
              The 4 Pillars <ArrowRight className="h-4 w-4 text-[#FF6600]" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: High-Res Visual Showcase */}
      <div className="relative flex-1 h-[50vh] lg:h-full overflow-hidden">
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{ transform: `scale(${1 + offsetY * 0.0005})` }}
        >
          <img 
            src={ASSET_IMAGES.logo} 
            alt="Royal Hints Curation" 
            className="w-full h-full object-cover contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#1A1A1A]/40 to-[#1A1A1A] lg:block hidden"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent lg:hidden block"></div>
        </div>
        
        {/* Decorative Badge */}
        <div className="absolute bottom-12 right-12 text-white/60 text-xs tracking-[0.25em] hidden md:block font-black">
          ROYAL HINTS • BOOKS • PARTS • FABRIC • FASHION
        </div>
      </div>
    </section>
  );
};

export default Hero;
