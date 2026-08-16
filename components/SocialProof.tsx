
import React from 'react';
import { Star, Instagram } from 'lucide-react';
import { REVIEWS, INSTAGRAM_IMAGES } from '../constants';

const SocialProof: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      {/* Review Marquee */}
      <div className="mb-24">
        <div className="max-w-screen-2xl mx-auto px-6 mb-12">
           <h2 className="text-center text-[#1A1A1A] text-3xl font-bold tracking-tight">Voices of Royalty</h2>
           <p className="text-center text-gray-500 text-sm mt-2">What our clients say about Royal Hints</p>
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
                    <Star key={starIdx} className="h-3.5 w-3.5 text-[#FF6600] fill-[#FF6600]" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{review.content}"</p>
                <p className="text-[#FF6600] font-bold text-sm">— {review.user}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instagram Grid */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-[#1A1A1A] text-xl font-bold">@royalhints_official</h3>
            <p className="text-sm text-gray-500">Tag us to be featured on Royal Hints Royalty talk.</p>
          </div>
          <button className="flex items-center gap-2 text-[#FF6600] hover:text-[#FF6600] font-bold text-sm transition-colors">
            <Instagram className="h-4 w-4" /> Follow Us
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {INSTAGRAM_IMAGES.map((img, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-[8px] shadow-sm">
              <img 
                src={img} 
                alt="IG Social" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#FF6600]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="text-white h-6 w-6" />
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
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default SocialProof;
