
import React from 'react';
import { ShoppingCart, Star, Heart, Box, Check, ArrowRight } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../constants';
import { Product, ProductCategory } from '../types';

interface TrendingGridProps {
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: string[];
  selectedCategory?: ProductCategory | 'All';
  onCategoryChange?: (category: ProductCategory | 'All') => void;
  products?: Product[];
}

const TrendingGrid: React.FC<TrendingGridProps> = ({ 
  onSelectProduct,
  onAddToCart, 
  onToggleWishlist, 
  wishlistIds = [],
  selectedCategory = 'All',
  onCategoryChange,
  products = PRODUCTS
}) => {
  const categoriesList: (ProductCategory | 'All')[] = ['All', 'Books', 'Spare Parts', 'Fabric', 'Fashion'];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <section className="bg-[#F8F9FA] py-24 px-6 md:px-12 lg:px-24" id="catalog">
      <div className="max-w-screen-2xl mx-auto">
        
        {/* Section Header & Category Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[#FF6600] font-black text-xs uppercase tracking-[0.25em] block mb-2">
              Verified Stock Registry
            </span>
            <h2 className="text-[#1A1A1A] text-4xl sm:text-5xl font-black tracking-tight mb-2">
              What's In Stock
            </h2>
            <p className="text-gray-500 text-sm font-light">
              Select any product to inspect live warehouse counts, variant allocations, and dispatch times.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button 
                  key={cat}
                  onClick={() => onCategoryChange?.(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#FF6600] text-white shadow-lg shadow-orange-500/25 scale-105' 
                      : 'bg-white text-[#FF6600] hover:text-[#FF6600] hover:bg-gray-50/50 shadow-sm border border-gray-200/70'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="grid grid-cols-1">
            <div className="bg-white border border-dashed border-[#FF6600]/30 rounded-[20px] p-12 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6600]/10 text-[#FF6600]">
                <Box className="h-8 w-8" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF6600] mb-3">
                Stock Registry Empty
              </p>
              <h3 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-3">
                No published items yet
              </h3>
              <p className="max-w-xl mx-auto text-gray-500 text-base leading-relaxed">
                The backend has no live inventory published yet. Once an admin lists a product, it will appear here automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              return (
                <div 
                  key={product.id} 
                  className="group relative bg-white rounded-[16px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100/90 hover:border-orange-300 flex flex-col justify-between cursor-pointer"
                  onClick={() => onSelectProduct?.(product)}
                >
                {/* Image Section */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Category & New Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className="bg-[#1A1A1A] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md">
                      {product.category}
                    </span>
                    {product.isNew && (
                      <span className="bg-[#FF6600] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md">
                        New
                      </span>
                    )}
                  </div>

                  {/* Live In-Stock Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/95 backdrop-blur-md text-[#FF6600] shadow-md border border-gray-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse"></span>
                      {product.stockQuantity} in stock
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist?.(product);
                    }}
                    className={`absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-md ${
                      isWishlisted ? 'text-gray-500' : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>

                  {/* Quick Add Overlay on Hover */}
                  <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/60 to-transparent">
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart?.(product);
                        }}
                        className="flex-1 bg-[#FF6600] text-white py-3 rounded-[10px] font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#FF6600] transition-colors shadow-lg"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" /> Quick Add
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct?.(product);
                        }}
                        className="bg-white text-[#FF6600] px-3.5 py-3 rounded-[10px] font-black text-[11px] uppercase tracking-wider flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                        title="View Full In-Stock Details"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-[#FF6600] fill-[#FF6600]' : 'text-gray-200'}`} 
                          />
                        ))}
                        <span className="text-[11px] text-gray-500 ml-1 font-bold">{product.rating}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">{product.sku}</span>
                    </div>

                    <h3 className="text-[#1A1A1A] font-bold text-base line-clamp-2 group-hover:text-[#1A1A1A] transition-colors mb-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-400 text-xs line-clamp-2 font-light">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block">In-Stock Price</span>
                      <span className="text-[#FF6600] font-black text-xl">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(product.price)}</span>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600] group-hover:text-[#FF6600] flex items-center gap-1 transition-colors">
                      View Stock <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}

      </div>
    </section>
  );
};

export default TrendingGrid;
