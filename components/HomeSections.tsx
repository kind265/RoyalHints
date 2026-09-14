import React from 'react';
import { ArrowRight, BookOpen, Layers, Scissors, Wrench } from 'lucide-react';
import { ProductCategory } from '../types';

interface HomeSectionsProps {
  onNavigate: (page: any, tab?: string) => void;
  onSelectCategory: (category: ProductCategory) => void;
}

const HomeSections: React.FC<HomeSectionsProps> = ({ onNavigate, onSelectCategory }) => {
  const categories = [
    ['Books', 'Knowledge, stories, and useful reads.', BookOpen],
    ['Spare Parts', 'Practical components for the work ahead.', Wrench],
    ['Fabric', 'Materials for making something lasting.', Layers],
    ['Fashion', 'Considered pieces for everyday expression.', Scissors]
  ] as const;
  return (
    <section className="relative overflow-hidden border-b border-blue-100 bg-[#eff6ff] px-6 py-16 sm:px-10 sm:py-20 lg:px-24">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
        <div className="absolute left-0 top-16 h-px w-24 bg-[#2563EB]/30" />
        <div className="absolute right-0 top-28 h-px w-32 bg-[#2563EB]/30" />
        <div className="absolute bottom-12 left-[8%] h-16 w-16 rotate-45 border border-[#2563EB]/20" />
        <div className="absolute right-[10%] top-16 h-20 w-20 border-r border-t border-[#2563EB]/20" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-[category-rise_.7s_ease-out_both]">
            <p className="text-xs font-black uppercase tracking-[.25em] text-[#2563EB]">01 / Shop by category</p>
            <h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-.035em] text-[#172033] sm:text-4xl">Find exactly what you need.</h2>
          </div>
          <button onClick={() => onNavigate('Marketplace')} className="inline-flex items-center gap-2 self-start text-xs font-black uppercase tracking-[.16em] text-[#2563EB] underline underline-offset-4 transition hover:gap-3">Browse full catalogue <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="mt-8 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(([title, description, Icon], index) => (
            <button
              key={title}
              onClick={() => { onSelectCategory(title as ProductCategory); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative min-h-[205px] rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-sm opacity-0 transition duration-500 hover:-translate-y-2 hover:border-[#2563EB] hover:shadow-xl hover:shadow-blue-200/50 animate-[category-card-in_.65s_ease-out_forwards]"
              style={{ animationDelay: `${180 + index * 110}ms` }}
            >
              <span className="absolute right-5 top-5 font-mono text-[10px] font-bold text-[#2563EB]/50">0{index + 1}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563EB] transition duration-500 group-hover:rotate-6 group-hover:bg-[#2563EB] group-hover:text-white"><Icon className="h-5 w-5" /></span>
              <p className="mt-7 text-[9px] font-black uppercase tracking-[.2em] text-[#2563EB]">{title === 'Books' ? 'Essential picks' : title === 'Fashion' ? 'Best value' : title === 'Fabric' ? 'Premium materials' : 'Practical choice'}</p>
              <h3 className="mt-1 text-lg font-black text-[#172033]">{title}</h3>
              <p className="mt-2 max-w-[190px] text-xs leading-5 text-slate-500">{description}</p>
              <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-[#2563EB] transition group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes category-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } } @keyframes category-card-in { from { opacity: 0; transform: translateY(22px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } } @media (prefers-reduced-motion: reduce) { .animate-\[category-rise_\.7s_ease-out_both\], .animate-\[category-card-in_\.65s_ease-out_forwards\] { animation: none; opacity: 1; } }`}</style>
    </section>
  );
};
export default HomeSections;
