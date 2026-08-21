
import React from 'react';
import { Star, Instagram, Sparkles } from 'lucide-react';
import { REVIEWS, INSTAGRAM_IMAGES } from '../constants';

const SocialProof: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      {/* Review Marquee */}
      <div className="mb-24">
        <div className="max-w-screen-2xl mx-auto px-6 mb-12">
           <h2 className="text-center text-[#1A1A1A] text-3xl font-bold tracking-tight">Voices of Royalty</h2>
           <p className="text-center text-gray-500 text-sm mt-2">What our discerning clientele say about Royal Hints</p>
        </div>
        
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee flex whitespace-nowrap gap-8 py-4">
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <div 
                key={`${review.id}-${i}`} 
                className="inline-block w-[350px] p-8 bg-[#F8F9FA] border border-gray-100 rounded-[8px] shrink-0 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star key={starIdx} className="h-3.5 w-3.5 text-[#2563EB] fill-[#2563EB]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{review.content}"</p>
                <p className="text-[#1A1A1A] font-bold text-sm">— {review.user}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instagram Section: Auto-sliding marquee on Mobile (< md), 6-column Grid on Desktop (md+) */}
      <div>
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24 mb-8 sm:mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[#1A1A1A] text-xl font-bold">@royalhints_official</h3>
                <span className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="h-2.5 w-2.5" /> Live Stream
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Tag us to be featured in Royal Hints.</p>
            </div>

            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#2563EB] hover:text-[#1D4ED8] font-bold text-sm transition-colors py-2 px-3 rounded-lg hover:bg-blue-50"
            >
              <Instagram className="h-4 w-4" /> Follow Us
            </a>
          </div>
        </div>

        {/* MOBILE VIEW (< md): Continuous Infinite Auto-Sliding Marquee */}
        <div className="block md:hidden relative overflow-x-hidden py-2">
          <div className="animate-marquee-ig flex whitespace-nowrap gap-4">
            {[...INSTAGRAM_IMAGES, ...INSTAGRAM_IMAGES, ...INSTAGRAM_IMAGES].map((img, i) => (
              <div 
                key={`ig-mobile-${i}`} 
                className="w-[200px] h-[200px] shrink-0 rounded-[12px] overflow-hidden shadow-sm border border-gray-100 bg-gray-50 relative group"
              >
                <img 
                  src={img} 
                  alt={`Royal Hints Community ${i + 1}`} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#2563EB]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Instagram className="text-white h-6 w-6" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP VIEW (md+): Standard High-Resolution Grid */}
        <div className="hidden md:grid max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {INSTAGRAM_IMAGES.map((img, i) => (
            <div 
              key={`ig-desktop-${i}`} 
              className="group relative aspect-square overflow-hidden rounded-[12px] shadow-sm border border-gray-100 bg-gray-50"
            >
              <img 
                src={img} 
                alt={`Royal Hints Instagram Feature ${i + 1}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#2563EB]/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5 p-4 text-center">
                <Instagram className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase tracking-widest">#RoyalHints</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeIg {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .animate-marquee-ig {
          animation: marqueeIg 20s linear infinite;
        }
        .animate-marquee-ig:hover,
        .animate-marquee-ig:active {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default SocialProof;
