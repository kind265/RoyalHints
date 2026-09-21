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
    <section className="relative overflow-hidden border-b border-blue-100 bg-[#eff6ff] px-4 py-12 sm:px-10 sm:py-20 lg:px-24">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
        <div className="absolute left-0 top-16 h-px w-24 bg-[#2563EB]/30" />
        <div className="absolute right-0 top-28 h-px w-32 bg-[#2563EB]/30" />
        <div className="absolute bottom-12 left-[8%] h-16 w-16 rotate-45 border border-[#2563EB]/20" />
        <div className="absolute right-[10%] top-16 h-20 w-20 border-r border-t border-[#2563EB]/20" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-[category-rise_.7s_ease-out_both]">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#2563EB] sm:text-xs sm:tracking-[.25em]">01 / Shop by category</p>
            <h2 className="mt-2 max-w-xl text-2xl font-black tracking-[-.035em] text-[#172033] sm:mt-3 sm:text-4xl">Find exactly what you need.</h2>
          </div>
          <button onClick={() => onNavigate('Marketplace')} className="inline-flex items-center gap-2 self-start text-[10px] font-black uppercase tracking-[.12em] text-[#2563EB] underline underline-offset-4 transition hover:gap-3 sm:text-xs sm:tracking-[.16em]">Browse full catalogue <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 grid max-w-6xl gap-2.5 sm:mt-8 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(([title, description, Icon], index) => (
            <button
              key={title}
              onClick={() => { onSelectCategory(title as ProductCategory); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative min-h-[96px] rounded-xl border border-blue-100 bg-white p-3 text-left shadow-sm opacity-0 transition duration-500 hover:-translate-y-1 hover:border-[#2563EB] hover:shadow-lg hover:shadow-blue-200/40 animate-[category-card-in_.65s_ease-out_forwards] sm:min-h-[205px] sm:rounded-2xl sm:p-5 sm:hover:-translate-y-2 sm:hover:shadow-xl"
              style={{ animationDelay: `${180 + index * 110}ms` }}
            >
              <span className="absolute right-3 top-3 font-mono text-[9px] font-bold text-[#2563EB]/50 sm:right-5 sm:top-5 sm:text-[10px]">0{index + 1}</span>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[.18em] text-[#2563EB] sm:text-[9px] sm:tracking-[.2em]">{title === 'Books' ? 'Essential picks' : title === 'Fashion' ? 'Best value' : title === 'Fabric' ? 'Premium materials' : 'Practical choice'}</p>
                  <h3 className="mt-1 text-base font-black text-[#172033] sm:text-lg">{title}</h3>
                  <p className="mt-1 hidden max-w-[180px] text-[11px] leading-5 text-slate-500 sm:block">{description}</p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563EB] transition duration-500 group-hover:rotate-6 group-hover:bg-[#2563EB] group-hover:text-white sm:h-11 sm:w-11 sm:rounded-xl"><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
              </div>

              <p className="mt-2 max-w-[200px] text-[10px] leading-4 text-slate-500 sm:hidden">{description}</p>
              <ArrowRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-[#2563EB] transition group-hover:translate-x-1 sm:bottom-5 sm:right-5 sm:h-4 sm:w-4" />
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes category-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } } @keyframes category-card-in { from { opacity: 0; transform: translateY(22px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } } @media (prefers-reduced-motion: reduce) { .animate-\[category-rise_\.7s_ease-out_both\], .animate-\[category-card-in_\.65s_ease-out_forwards\] { animation: none; opacity: 1; } }`}</style>
    </section>
  );
};
export default HomeSections;
