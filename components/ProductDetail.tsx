import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Truck, 
  Box, 
  Star, 
  ShoppingBag, 
  Zap, 
  ChevronRight, 
  Layers, 
  AlertCircle,
  Building,
  RotateCcw
} from 'lucide-react';
import { Product, ProductVariant } from '../types';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, selectedVariant?: ProductVariant) => void;
  onDirectCheckout: (product: Product, quantity?: number, selectedVariant?: ProductVariant) => void;
  allProducts?: Product[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onSelectProduct,
  onAddToCart,
  onDirectCheckout,
  allProducts = []
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.[0] || {
      id: 'default',
      name: 'Standard In-Stock Spec',
      stock: product.stockQuantity,
      sku: product.sku
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.image);
  const [addedToast, setAddedToast] = useState(false);
  const galleryImages = Array.from(new Set([product.image, ...(product.galleryImages || [])]));

  // Compute live price with variant modifier
  const currentPrice = product.price + (selectedVariant.priceModifier || 0);
  const availableStock = selectedVariant.stock;

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (quantity > variant.stock) {
      setQuantity(Math.max(1, variant.stock));
    }
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedVariant);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    onDirectCheckout(product, quantity, selectedVariant);
  };

  // Related products in the same category
  const relatedInStock = allProducts.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  return (
    <div className="min-h-screen bg-white pt-28 pb-32">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#1A1A1A] text-white px-6 py-4 rounded-[12px] shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="h-8 w-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#2563EB]">Added to Shopping Bag</p>
            <p className="text-[11px] text-gray-300 font-medium">{quantity}x {product.name} ({selectedVariant.name})</p>
          </div>
        </div>
      )}

      {/* Breadcrumbs & Navigation Bar */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-gray-100">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-[#2563EB] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Catalog
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            <span>Royal Hints</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#2563EB]">{product.category}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#1A1A1A] truncate max-w-[200px] sm:max-w-none">{product.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-[#2563EB] border border-blue-200">
              <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse"></span>
              Live Stock Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Stock & Detail View */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Visual Gallery & Warehouse Certificate */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-[4/4] sm:aspect-[4/3] rounded-[16px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Category & New Badge */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-[#1A1A1A] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-md">
                  {product.category}
                </span>
                {product.isNew && (
                  <span className="bg-[#2563EB] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-md">
                    New Arrival
                  </span>
                )}
              </div>

              {/* Live Warehouse Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-[10px] border border-blue-100/80 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                    <Box className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">
                      {product.warehouseLocation}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">SKU: {selectedVariant.sku}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
                  {availableStock} Available
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-[10px] overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === img ? 'border-[#2563EB] ring-2 ring-blue-500/20' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="p-4 rounded-[12px] bg-[#F8F9FA] text-center space-y-1 border border-gray-100">
                <Truck className="h-5 w-5 text-[#2563EB] mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Fast Dispatch</p>
                <p className="text-[9px] text-gray-500">{product.dispatchTime}</p>
              </div>
              <div className="p-4 rounded-[12px] bg-[#F8F9FA] text-center space-y-1 border border-gray-100">
                <ShieldCheck className="h-5 w-5 text-[#2563EB] mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Authentic Guarantee</p>
                <p className="text-[9px] text-gray-500">100% Certified Spec</p>
              </div>
              <div className="p-4 rounded-[12px] bg-[#F8F9FA] text-center space-y-1 border border-gray-100">
                <RotateCcw className="h-5 w-5 text-[#2563EB] mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Easy Returns</p>
                <p className="text-[9px] text-gray-500">30-Day Royal Guarantee</p>
              </div>
            </div>
          </div>

          {/* Right Column: In-Stock Inventory Inspector & Purchase Controller */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              
              {/* Category & Stock Alert */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2563EB]">
                  Royal Hints {product.category} Inventory
                </span>
                <span className="text-xs font-mono text-gray-400">
                  REF #{selectedVariant.sku}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-[#2563EB] fill-[#2563EB]'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400 font-medium">(Verified Client Endorsements)</span>
              </div>

              {/* Price & Stock Overview Card */}
              <div className="bg-[#1A1A1A] text-white p-6 sm:p-8 rounded-[16px] relative overflow-hidden shadow-xl border border-white/5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#2563EB] opacity-15 blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 block mb-1">
                      Direct In-Stock Price
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
                        MWK {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {selectedVariant.priceModifier ? (
                        <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest">
                          (Includes Variant Spec +MWK {selectedVariant.priceModifier.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {availableStock > 5 ? 'In Stock & Ready' : `Only ${availableStock} Left In Stock`}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">{product.dispatchTime}</p>
                  </div>
                </div>

                {/* Stock Level Progress Indicator */}
                <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    <span>Warehouse Inventory Level</span>
                    <span className="text-[#2563EB] font-bold">{availableStock} Available Units</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (availableStock / 30) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-base leading-relaxed font-light">
                {product.description}
              </p>

              {/* Highlights */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Curated Highlights</h4>
                <ul className="space-y-2">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                      <div className="h-4 w-4 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* WHAT IS IN STOCK: Variant / Specification Selector */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#2563EB]" />
                    Select In-Stock Spec / Variant:
                  </label>
                  <span className="text-[11px] text-gray-400 font-bold">
                    {product.variants.length} Options Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => handleVariantChange(variant)}
                        className={`p-4 rounded-[12px] border text-left transition-all relative ${
                          isSelected
                            ? 'border-[#2563EB] bg-blue-50/40 shadow-sm ring-1 ring-[#2563EB]'
                            : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-black uppercase tracking-wide ${isSelected ? 'text-[#2563EB]' : 'text-[#1A1A1A]'}`}>
                            {variant.name}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-[#2563EB]" />}
                        </div>
                        <div className="flex justify-between items-center mt-2 text-[10px]">
                          <span className="text-gray-500 font-mono">{variant.sku}</span>
                          <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {variant.stock} in stock
                          </span>
                        </div>
                        {variant.priceModifier ? (
                          <div className="text-[10px] font-bold text-[#2563EB] mt-1">
                            +MWK {variant.priceModifier.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector & Action Controls */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  
                  {/* Quantity Controller */}
                  <div className="flex items-center border border-gray-200 rounded-[10px] bg-gray-50 p-1 self-start">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10 flex items-center justify-center text-lg font-bold text-gray-600 hover:text-[#2563EB] disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-black text-sm text-[#1A1A1A]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      disabled={quantity >= availableStock}
                      className="h-10 w-10 flex items-center justify-center text-lg font-bold text-gray-600 hover:text-[#2563EB] disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={handleAdd}
                    disabled={availableStock === 0}
                    className="flex-1 bg-[#2563EB] text-white py-4 px-8 rounded-[12px] font-black text-xs uppercase tracking-[0.25em] hover:bg-[#1D4ED8] transition-all transform hover:-translate-y-0.5 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add {quantity} to Bag • MWK {(currentPrice * quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </button>

                  {/* Buy Now / Direct Checkout */}
                  <button
                    onClick={handleBuyNow}
                    disabled={availableStock === 0}
                    className="bg-[#1A1A1A] text-white py-4 px-8 rounded-[12px] font-black text-xs uppercase tracking-[0.25em] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4 text-[#2563EB]" />
                    Instant Checkout
                  </button>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#2563EB]" />
                  Detailed Product & Stock Specifications
                </h4>

                <div className="bg-[#F8F9FA] rounded-[12px] border border-gray-100 overflow-hidden divide-y divide-gray-100">
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <div key={idx} className="flex justify-between px-5 py-3 text-xs">
                      <span className="font-bold text-gray-500 uppercase tracking-wider">{key}</span>
                      <span className="font-semibold text-[#1A1A1A] text-right max-w-[60%]">{val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-5 py-3 text-xs bg-blue-50/50">
                    <span className="font-bold text-[#2563EB] uppercase tracking-wider">Inventory Status</span>
                    <span className="font-black text-emerald-700">{availableStock} Units In-Stock & Dispatch-Ready</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RELATED IN-STOCK ITEMS IN THIS CATEGORY */}
        {relatedInStock.length > 0 && (
          <div className="mt-28 pt-16 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-[#2563EB] font-black text-xs uppercase tracking-widest block mb-2">
                  More in {product.category}
                </span>
                <h3 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                  Other Verified In-Stock {product.category}
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-medium">All items below are physically verified in warehouse stock.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedInStock.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct(rel)}
                  className="group bg-white rounded-[12px] overflow-hidden border border-gray-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                      {rel.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                      {rel.stockQuantity} in stock
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(rel.rating)
                                ? 'text-[#2563EB] fill-[#2563EB]'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">{rel.rating}</span>
                      </div>
                      <h4 className="text-[#1A1A1A] font-bold text-base group-hover:text-[#2563EB] transition-colors line-clamp-2">
                        {rel.name}
                      </h4>
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[#2563EB] font-black text-xl">{rel.price > 0 ? `MWK ${rel.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Price unavailable'}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#1A1A1A] flex items-center gap-1 transition-colors">
                        View Stock <ChevronRight className="h-3 w-3 text-[#2563EB]" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;
