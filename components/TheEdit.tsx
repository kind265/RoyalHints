
import React from 'react';
import { BookOpen, Wrench, Scissors, Zap, Check, ArrowRight } from 'lucide-react';
import { ProductCategory, Product } from '../types';

interface TheEditProps {
  onSelectCategory?: (category: ProductCategory) => void;
  onSelectProduct?: (product: Product) => void;
}

const TheEdit: React.FC<TheEditProps> = ({ onSelectCategory, onSelectProduct }) => {
  const pillars = [
    {
      title: 'Books',
      category: 'Books' as ProductCategory,
      desc: 'Museum-grade collector volumes and engineering manuals.',
      icon: BookOpen
    },
    {
      title: 'Spare Parts',
      category: 'Spare Parts' as ProductCategory,
      desc: 'Forged titanium hardware and micron-calibrated assemblies.',
      icon: Wrench
    },
    {
      title: 'Fabric',
      category: 'Fabric' as ProductCategory,
      desc: 'Grade-6A Mulberry silk and heavyweight Belgian linens.',
      icon: Scissors
    },
    {
      title: 'Fashion',
      category: 'Fashion' as ProductCategory,
      desc: 'Handcrafted virgin wool tailoring and Tuscan calfskin shoes.',
      icon: Zap
    }
  ];

  return (
    <section className="py-24 overflow-hidden bg-white" id="editorial">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Column: Visual Showcase */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-3xl"></div>
              <img 
                src="/assets/Russian_satin(Beige).jpg" 
                alt="Royal Hints Curation" 
                className="relative rounded-[16px] w-full h-auto shadow-2xl transition-all duration-700 hover:scale-[1.01]"
              />
              <div className="absolute -bottom-8 -right-8 w-60 bg-white p-6 rounded-[12px] shadow-2xl hidden md:block border border-blue-100">
                <p className="text-[#2563EB] font-black text-[10px] uppercase tracking-[0.25em] mb-2">
                  Inventory Guarantee
                </p>
                <p className="text-gray-600 text-xs leading-relaxed font-light">
                  Every item listed is physically held in verified warehouse stock with same-day dispatch certification.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Copy */}
          <div className="flex-1 order-1 lg:order-2 space-y-8">
            <div>
              <span className="text-[#2563EB] font-black text-xs uppercase tracking-[0.3em] block mb-3">
                THE SARTORIAL & INDUSTRIAL EDIT
              </span>
              <h2 className="text-[#1A1A1A] text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.05]">
                Books. Parts. <br />
                Fabric. Fashion. <br />
                <span className="text-[#2563EB]">Direct From Stock.</span>
              </h2>
            </div>

            <p className="text-gray-500 text-base md:text-lg font-light leading-relaxed max-w-xl">
              We eliminated the noise of generic commerce to specialize rigorously in four foundational disciplines of material excellence and craft.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      onSelectCategory?.(p.category);
                      const el = document.getElementById('catalog');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-4 rounded-[12px] bg-[#F8F9FA] border border-gray-100 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-sm text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors">
                        {p.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-500 font-light">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => {
                const el = document.getElementById('catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#1A1A1A] text-white px-10 py-5 rounded-[10px] font-black text-xs uppercase tracking-[0.25em] hover:bg-[#2563EB] transition-all transform hover:translate-x-1 shadow-xl hover:shadow-blue-500/25 flex items-center gap-3 group"
            >
              Browse In-Stock Registry <ArrowRight className="h-4 w-4 text-[#2563EB] group-hover:text-white" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TheEdit;

