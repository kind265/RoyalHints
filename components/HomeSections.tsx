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
  return <section className="bg-white px-6 py-16 sm:px-10 lg:px-24"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.25em] text-[#2563EB]">Shop by category</p><h2 className="mt-3 text-4xl font-black tracking-[-.035em] text-[#172033]">Find exactly what you need.</h2></div><button onClick={() => onNavigate('Marketplace')} className="inline-flex items-center gap-2 self-start text-xs font-black uppercase tracking-[.16em] text-[#2563EB] underline underline-offset-4">Browse full catalogue <ArrowRight className="h-4 w-4" /></button></div><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map(([title, description, Icon]) => <button key={title} onClick={() => { onSelectCategory(title as ProductCategory); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }} className="group border border-slate-200 bg-[#f8fafc] p-6 text-left transition hover:-translate-y-1 hover:border-[#2563EB] hover:bg-[#eff6ff] hover:shadow-lg hover:shadow-blue-100"><Icon className="h-7 w-7 text-[#2563EB]" /><p className="mt-8 text-[10px] font-black uppercase tracking-[.2em] text-[#2563EB]">{title === 'Books' ? 'Essential picks' : title === 'Fashion' ? 'Best value' : title === 'Fabric' ? 'Premium materials' : 'Practical choice'}</p><h3 className="mt-2 text-xl font-black text-[#172033]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><ArrowRight className="mt-6 h-4 w-4 text-[#2563EB] transition group-hover:translate-x-1" /></button>)}</div></div></section>;
};
export default HomeSections;
