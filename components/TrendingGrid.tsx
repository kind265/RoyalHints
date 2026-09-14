import React, { useState } from 'react';
import { ShoppingCart, Star, ArrowRight, Plus, Check, Box, PlusCircle, ShieldCheck } from 'lucide-react';
import { Product, ProductCategory, BusinessPost } from '../types';

interface TrendingGridProps {
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  selectedCategory?: ProductCategory | 'All';
  onCategoryChange?: (category: ProductCategory | 'All') => void;
  posts?: BusinessPost[];
  products?: Product[];
  onNavigate?: (page: any, tab?: string) => void;
}

const TrendingGrid: React.FC<TrendingGridProps> = ({ 
  onSelectProduct,
  onAddToCart, 
  selectedCategory = 'All',
  onCategoryChange,
  posts = [],
  products = [],
  onNavigate
}) => {
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Convert dynamic marketplace posts into unified Product format for the homepage stock grid
  const marketplaceProducts: Product[] = posts.map(post => ({
    id: post.id,
    name: post.title,
    price: post.price ?? 0,
    rating: post.reviews && post.reviews.length > 0 
      ? Number((post.reviews.reduce((acc, r) => acc + r.rating, 0) / post.reviews.length).toFixed(1)) 
      : 5.0,
    category: (post.category as ProductCategory) || 'Books',
    image: post.image || '/assets/Frontpage.jpg',
    sku: post.sku || `RH-${post.id.slice(-4).toUpperCase()}`,
    isNew: true,
    inStock: (post.stockCount ?? 1) > 0,
    stockQuantity: post.stockCount ?? 1,
    stockStatus: (post.stockCount ?? 1) > 5 ? 'In Stock' : (post.stockCount ?? 1) > 0 ? 'Low Stock' : 'Out of Stock',
    warehouseLocation: post.location || '',
    dispatchTime: post.dispatchTime || '',
    description: post.description || '',
    highlights: [
      post.condition ? `Condition: ${post.condition}` : 'Certified authentic & verified',
      post.dispatchTime ? `Shipping: ${post.dispatchTime}` : 'Fast worldwide dispatch',
      'Escrow protection & verified merchant'
    ],
    specifications: {},
    galleryImages: post.galleryImages || [],
    variants: [
      {
        id: `var-${post.id}`,
        name: 'Standard In-Stock Spec',
        stock: post.stockCount ?? 1,
        sku: post.sku || `RH-${post.id.slice(-4).toUpperCase()}`
      }
    ]
  }));

  // Admin inventory is mirrored in both tables; the shared ID keeps one card visible.
  const allInStockProducts = Array.from(
    new Map([...products, ...marketplaceProducts].map(product => [product.id, product])).values()
  );

  const filteredProducts = selectedCategory === 'All'
    ? allInStockProducts
    : allInStockProducts.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleMobileAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart?.(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  return (
    <section className="bg-[#F8F9FA] py-16 sm:py-24 px-4 sm:px-8 md:px-12 lg:px-24" id="catalog">
      <div className="max-w-screen-2xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-16 gap-5 sm:gap-6">
          <div>
            <span className="text-[#2563EB] font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] block mb-1.5 sm:mb-2">
              Verified Stock Registry
            </span>
            <h2 className="text-[#1A1A1A] text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-1 sm:mb-2">
              Trending now
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm font-light">
              Select any product to inspect live warehouse counts, variant allocations, and dispatch times.
            </p>
          </div>

        </div>

        {/* Product Cards Grid or Graceful Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => {
              const isJustAdded = addedProductId === product.id;

              return (
                <div 
                  key={product.id} 
                  className="group relative bg-white rounded-[12px] sm:rounded-[16px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-300 flex flex-col justify-between cursor-pointer"
                  onClick={() => onSelectProduct?.(product)}
                >
                  {/* Image Section */}
                  <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-gray-100">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />

                    {/* Stock tag on mobile / desktop */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#1A1A1A]/80 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-white">
                      {product.category}
                    </div>

                    {/* Quick Add Overlay on Hover (Desktop) */}
                    <div className="hidden sm:block absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/60 to-transparent">
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart?.(product);
                          }}
                          className="flex-1 bg-[#2563EB] text-white py-3 rounded-[10px] font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1D4ED8] transition-colors shadow-lg"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> Add To Bag
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct?.(product);
                          }}
                          className="bg-white text-[#1A1A1A] px-3.5 py-3 rounded-[10px] font-black text-[11px] uppercase tracking-wider flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                          title="View Full In-Stock Details"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-3 sm:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#2563EB] fill-[#2563EB]" />
                          <span className="text-[10px] sm:text-[11px] text-gray-700 font-bold">{product.rating}</span>
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-mono text-gray-400 truncate max-w-[70px] sm:max-w-none">{product.sku}</span>
                      </div>

                      <h3 className="text-[#1A1A1A] font-bold text-xs sm:text-base line-clamp-1 sm:line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="hidden sm:block text-gray-400 text-xs line-clamp-2 font-light mt-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] sm:text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                          Price
                        </span>
                        <span className="text-sm sm:text-xl font-black text-[#1A1A1A]">
                          MWK {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Mobile Add to Cart button */}
                      <div className="sm:hidden">
                        <button
                          onClick={(e) => handleMobileAddToCart(e, product)}
                          className={`p-2 rounded-full transition-all active:scale-95 flex items-center justify-center ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#1A1A1A] text-white hover:bg-[#2563EB]'
                          }`}
                          title="Add to bag"
                        >
                          {isJustAdded ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <span className="hidden sm:flex text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] group-hover:text-[#2563EB] items-center gap-1 transition-colors">
                        Shop all <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-10 sm:p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#2563EB]">
              <Box className="w-8 h-8 opacity-80" />
            </div>
            <span className="text-[#2563EB] font-black text-[10px] uppercase tracking-[0.25em] block mb-1.5">
              Registry Empty
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight mb-2">
              No Stock Listed Currently
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Items added in the Marketplace or Inventory will automatically display in this field.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate?.('Marketplace')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20"
              >
                <PlusCircle className="h-4 w-4" /> Go to Marketplace
              </button>
              
            </div>
          </div>
        )}

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TrendingGrid;
