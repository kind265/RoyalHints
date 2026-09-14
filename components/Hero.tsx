
import React, { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';

interface HeroProps {
  onNavigate: (page: any) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const slides = [
    { image: '/assets/Bookshelve.jfif', label: 'Curated collections' },
    { image: '/assets/20758848277947023.jfif', label: 'Everyday essentials' },
    { image: '/assets/Engine.jfif', label: 'Considered details' },
    { image: '/assets/DarkGreenFabric.jfif', label: 'Selected with care' },
    { image: '/assets/1138355243343560932.jfif', label: 'Made to be found' }
  ];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative min-h-[620px] overflow-hidden border-b border-blue-100 bg-[#172033] sm:min-h-[720px]">
      <div className="absolute inset-0">
            {slides.map((slide, index) => <img key={slide.image} src={slide.image} alt={slide.label} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`} />)}
        <div className="absolute inset-0 bg-[#172033]/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#172033]/55 via-transparent to-[#172033]/80" />
      </div>
      <div className="relative z-10 flex min-h-[620px] flex-col items-center justify-center px-6 text-center text-white sm:min-h-[720px]">
        <p className="text-xs font-black uppercase tracking-[.28em] text-blue-200">Royal Hints · {slides[activeSlide].label}</p>
        <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-[-.02em] sm:text-5xl lg:text-6xl">Everything you need, sourced with confidence.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/85">Discover verified books, spare parts, fabric, fashion, and hard-to-find essentials at clear prices, with reliable delivery and real support.</p>
        <div className="mt-8 flex w-full max-w-sm flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row"><button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-4 text-xs font-black uppercase tracking-[.18em] text-white shadow-lg shadow-blue-950/30 transition hover:bg-[#1d4ed8] sm:w-auto"><ShoppingBag className="h-4 w-4" /> Shop now <ArrowRight className="h-4 w-4" /></button><button onClick={() => onNavigate('About')} className="w-full rounded-lg border border-white/50 bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-[.18em] text-white backdrop-blur transition hover:bg-white hover:text-[#2563EB] sm:w-auto">Our story</button></div>
      </div>
      <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 gap-2">{slides.map((slide, index) => <button key={slide.image} aria-label={`Show image ${index + 1}`} onClick={() => setActiveSlide(index)} className={`h-2 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/60'}`} />)}</div>
    </section>
  );
};

export default Hero;

