
import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Menu, X, ChevronRight, Store, Box } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { PRODUCTS } from '../constants';

interface HeaderProps {
  isScrolled: boolean;
  onNavigate: (page: any) => void;
  currentPage: string;
  cartCount?: number;
  onSelectProduct?: (product: Product) => void;
  onSelectCategory?: (category: ProductCategory) => void;
  products?: Product[];
  guestId?: string | null;
}

const Header: React.FC<HeaderProps> = ({
  isScrolled,
  onNavigate,
  currentPage,
  cartCount = 0,
  onSelectProduct,
  onSelectCategory,
  products = PRODUCTS,
  guestId,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const navLinks: ProductCategory[] = ['Books', 'Spare Parts', 'Fabric', 'Fashion'];
  const isDark = currentPage === 'Home' && !isScrolled;

  const searchResults = searchQuery.trim().length > 0
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    setIsMenuOpen(false);
    setShowSearchDropdown(false);
  }, [currentPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (cat: ProductCategory) => {
    if (onSelectCategory) onSelectCategory(cat);
    if (currentPage !== 'Home') onNavigate('Home');

    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleProductSelect = (product: Product) => {
    if (onSelectProduct) onSelectProduct(product);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 py-4 md:px-12 ${
        !isDark ? 'bg-white shadow-xl shadow-black/5' : 'bg-transparent text-white'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('Home')}
        >
          <div className="hidden sm:block">
            <span className={`text-xl font-black tracking-tighter uppercase transition-all group-hover:text-[#FF6600] ${!isDark ? 'text-[#1A1A1A]' : 'text-white'}`}>
              Royal Hints
            </span>
            <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-[#FF6600]">
              Books • Fabric • Fashion
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center space-x-8">
          <button
            onClick={() => onNavigate('Marketplace')}
            className={`text-[11px] uppercase font-black tracking-[0.2em] hover:text-[#FF6600] transition-all flex items-center gap-2 relative group ${
              !isDark ? 'text-[#1A1A1A]' : 'text-white'
            }`}
          >
            <Store className="h-4 w-4 text-[#FF6600]" /> Marketplace
            <span className={`absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FF6600] transition-all group-hover:w-full ${currentPage === 'Marketplace' ? 'w-full' : ''}`}></span>
          </button>

          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => handleCategoryClick(link)}
              className={`text-[11px] uppercase font-black tracking-[0.2em] hover:text-[#FF6600] transition-all relative group ${
                !isDark ? 'text-[#1A1A1A]' : 'text-white'
              }`}
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FF6600] transition-all group-hover:w-full"></span>
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="relative hidden md:block" ref={searchRef}>
            <div className="relative group">
              <input
                type="text"
                placeholder="Search......"
                className={`pl-10 pr-4 py-2 text-xs font-bold tracking-wider rounded-full border transition-all duration-300 w-48 focus:w-72 focus:bg-white focus:text-[#1A1A1A] focus:border-[#FF6600] ${
                  !isDark
                    ? 'bg-gray-100/80 border-gray-200 text-[#1A1A1A]'
                    : 'bg-white/10 border-white/20 text-white placeholder-white/60'
                }`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
              />
              <Search className={`absolute left-3.5 top-2.5 h-3.5 w-3.5 transition-colors ${!isDark ? 'text-gray-400 group-focus-within:text-[#FF6600]' : 'text-white/60 group-focus-within:text-[#FF6600]'}`} />
            </div>

            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[12px] shadow-2xl border border-gray-100 py-3 z-50 overflow-hidden text-[#1A1A1A] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>Verified In-Stock Inventory</span>
                  <span className="text-[#FF6600]">{searchResults.length} Found</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="p-3 hover:bg-gray-50/60 cursor-pointer transition-colors flex items-center gap-3 group"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1A1A1A] truncate group-hover:text-[#FF6600]">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {product.category}
                            </span>
                            <span className="text-[9px] font-mono text-gray-400">• {product.sku}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-[#FF6600]">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(product.price)}</p>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-[#FF6600] bg-gray-50 px-1.5 py-0.5 rounded">
                            <Box className="h-2.5 w-2.5" />
                            {product.stockQuantity} In Stock
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-gray-400 font-medium">
                      No in-stock item matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            className="relative p-2 hover:scale-110 transition-transform"
            onClick={() => onNavigate('Checkout')}
          >
            <ShoppingBag className={`h-6 w-6 ${!isDark ? 'text-[#1A1A1A]' : 'text-white'}`} />
            <span className="absolute top-0 right-0 h-4 w-4 bg-[#FF6600] text-white text-[9px] flex items-center justify-center rounded-full font-black shadow-lg shadow-orange-500/30">
              {cartCount}
            </span>
          </button>

          <div className="relative">
            <div className={`flex items-center gap-3 rounded-full border px-3 py-2 ${!isDark ? 'border-black/5 bg-white/80 text-[#1A1A1A]' : 'border-white/20 bg-white/5 text-white'}`}>
              <div className="h-2.5 w-2.5 rounded-full bg-[#FF6600] shadow-[0_0_8px_rgba(255,102,0,0.9)]"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.25em]">
                {guestId ? 'Guest Active' : 'Guest Mode'}
              </span>
            </div>
          </div>

          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={`h-7 w-7 ${!isDark ? 'text-[#1A1A1A]' : 'text-white'}`} />
            ) : (
              <Menu className={`h-7 w-7 ${!isDark ? 'text-[#1A1A1A]' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 top-0 bg-[#1A1A1A] z-[100] lg:hidden flex flex-col p-8 pt-24 overflow-y-auto animate-in slide-in-from-right duration-500">
          <button
            className="absolute top-6 right-6 text-white p-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="h-8 w-8" />
          </button>

          <div className="mb-8">
            <span className="text-[#FF6600] text-xs font-black uppercase tracking-[0.3em]">Royal Hints Directory</span>
            <h3 className="text-white text-2xl font-black mt-1">Core Categories</h3>
          </div>

          <nav className="flex flex-col space-y-6">
            <button
              onClick={() => {
                onNavigate('Marketplace');
                setIsMenuOpen(false);
              }}
              className="text-3xl font-black text-white uppercase tracking-tighter flex items-center justify-between group border-b border-white/10 pb-4 text-left"
            >
              Marketplace <Store className="h-6 w-6 text-[#FF6600]" />
            </button>
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => handleCategoryClick(link)}
                className="text-3xl font-black text-white uppercase tracking-tighter flex items-center justify-between group border-b border-white/10 pb-4 text-left"
              >
                {link}
                <ChevronRight className="h-6 w-6 text-[#FF6600] transition-transform group-active:translate-x-2" />
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-10">
            <button
              onClick={() => {
                onNavigate('Checkout');
                setIsMenuOpen(false);
              }}
              className="w-full bg-[#FF6600] text-white py-5 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-orange-500/30 hover:bg-[#FF6600] transition-colors"
            >
              Continue to Cart
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
