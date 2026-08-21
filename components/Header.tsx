
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronDown, 
  LogOut, 
  LayoutDashboard, 
  Store, 
  Check, 
  Box, 
  BookOpen, 
  Wrench, 
  Layers, 
  Shirt, 
  Sparkles, 
  ArrowRight, 
  ShoppingCart, 
  User as UserIcon,
  Truck,
  FileText,
  Settings,
  Briefcase,
  PlusCircle,
  Crown,
  BarChart3
} from 'lucide-react';
import { User, Product, ProductCategory, ShipmentTracking, QuotationRequest, BusinessPost } from '../types';
import { CATEGORIES } from '../constants';

interface HeaderProps {
  isScrolled: boolean;
  onNavigate: (page: any) => void;
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  cartCount?: number;
  onSelectProduct?: (product: Product) => void;
  onSelectCategory?: (category: ProductCategory | 'All') => void;
  onAddToCart?: (product: Product) => void;
  selectedCategory?: ProductCategory | 'All';
  dashboardTab?: string;
  onSelectDashboardTab?: (tab: string) => void;
  shipments?: ShipmentTracking[];
  quotations?: QuotationRequest[];
  posts?: BusinessPost[];
  products?: Product[];
}

const Header: React.FC<HeaderProps> = ({ 
  isScrolled, 
  onNavigate, 
  user, 
  onLogout, 
  currentPage, 
  cartCount = 0,
  onSelectProduct,
  onSelectCategory,
  onAddToCart,
  selectedCategory = 'All',
  dashboardTab = 'account',
  onSelectDashboardTab = (_tab: string) => {},
  shipments = [],
  quotations = [],
  posts = [],
  products = []
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<ProductCategory | 'All'>('All');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin' || user?.isAdmin || user?.email?.toLowerCase() === 'admin@royalhints.com' || user?.email?.toLowerCase() === 'chikusehopeson@gmail.com';

  const categoriesList: ProductCategory[] = ['Books', 'Spare Parts', 'Fabric', 'Fashion'];

  const dashboardNavLinks = [
    { id: 'account', icon: UserIcon, label: 'My Profile' },
    { 
      id: 'tracking', 
      icon: Truck, 
      label: 'Order Tracking', 
      badge: shipments.filter(s => s.status !== 'Delivered').length > 0 
        ? `${shipments.filter(s => s.status !== 'Delivered').length} Live` 
        : undefined 
    },
    { 
      id: 'quotation', 
      icon: FileText, 
      label: 'Shop by Quotation',
      badge: quotations.filter(q => q.status === 'Quote Ready').length > 0
        ? 'Quote Ready' 
        : undefined 
    },
    { 
      id: 'bespoke', 
      icon: Sparkles, 
      label: 'Name What You Want',
      badge: 'Admin Direct' 
    },
    ...(isAdmin ? [
      { id: 'analytics', icon: BarChart3, label: 'Analytics Summary' },
      { id: 'my-posts', icon: Briefcase, label: 'Venture Management' },
      { id: 'post', icon: PlusCircle, label: 'Post Inventory' },
    ] : []),
    { id: 'cart', icon: ShoppingCart, label: 'Shopping Bag', badge: cartCount > 0 ? `${cartCount}` : undefined },
    { id: 'marketplace-link', icon: Store, label: 'Marketplace' },
    { id: 'settings', icon: Settings, label: 'Preferences' },
  ];

  // Category Icon Helper
  const getCategoryIcon = (category: ProductCategory | 'All', className = "h-3.5 w-3.5") => {
    switch (category) {
      case 'Books':
        return <BookOpen className={className} />;
      case 'Spare Parts':
        return <Wrench className={className} />;
      case 'Fabric':
        return <Layers className={className} />;
      case 'Fashion':
        return <Shirt className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Convert dynamic marketplace posts into unified Product format
  const marketplaceProducts: Product[] = posts.map(post => ({
    id: post.id,
    name: post.title,
    price: post.price ?? 150,
    rating: post.reviews && post.reviews.length > 0 
      ? Number((post.reviews.reduce((acc, r) => acc + r.rating, 0) / post.reviews.length).toFixed(1)) 
      : 5.0,
    category: (post.category as ProductCategory) || 'Books',
    image: post.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    sku: post.sku || `RH-${post.id.slice(-4).toUpperCase()}`,
    isNew: true,
    inStock: (post.stockCount ?? 1) > 0,
    stockQuantity: post.stockCount ?? 1,
    stockStatus: (post.stockCount ?? 1) > 5 ? 'In Stock' : (post.stockCount ?? 1) > 0 ? 'Low Stock' : 'Out of Stock',
    warehouseLocation: post.location || 'Verified Vault Registry',
    dispatchTime: post.dispatchTime || 'Dispatches in 24 hours',
    description: post.description || 'Verified authentic offering from Royal Hints Marketplace Registry.',
    highlights: [
      post.condition ? `Condition: ${post.condition}` : 'Certified authentic & verified',
      post.dispatchTime ? `Shipping: ${post.dispatchTime}` : 'Fast worldwide dispatch'
    ],
    specifications: {},
    variants: [
      {
        id: `var-${post.id}`,
        name: 'Standard In-Stock Spec',
        stock: post.stockCount ?? 1,
        sku: post.sku || `RH-${post.id.slice(-4).toUpperCase()}`
      }
    ]
  }));

  const allSearchableProducts = [...products, ...marketplaceProducts];

  // Filter products by selected category filter AND text query
  const filteredProducts = allSearchableProducts.filter(p => {
    const matchesCategory = searchCategory === 'All' || p.category.toLowerCase() === searchCategory.toLowerCase();
    if (!matchesCategory) return false;
    
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.highlights && p.highlights.some(h => h.toLowerCase().includes(query)))
    );
  });

  const searchResults = (searchQuery.trim().length > 0 || showSearchDropdown) ? filteredProducts : [];

  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    setShowSearchDropdown(false);
    setIsMobileSearchOpen(false);
  }, [currentPage]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
        setShowSearchDropdown(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
        setIsCategoryPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryNavClick = (cat: ProductCategory) => {
    setSearchCategory(cat);
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    if (currentPage !== 'Home') {
      onNavigate('Home');
    }
    setIsMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleProductSelect = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setSearchQuery('');
    setShowSearchDropdown(false);
    setIsMobileSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSelectCategory) {
      onSelectCategory(searchCategory);
    }
    if (currentPage !== 'Home') {
      onNavigate('Home');
    }
    setTimeout(() => {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    setShowSearchDropdown(false);
    setIsMobileSearchOpen(false);
  };

  const getPlaceholder = () => {
    switch (searchCategory) {
      case 'Books':
        return 'Search Books (monographs, authors, specs)...';
      case 'Spare Parts':
        return 'Search Spare Parts (calipers, bearings, SKU)...';
      case 'Fabric':
        return 'Search Fabric (silk, linen, weaves)...';
      case 'Fashion':
        return 'Search Fashion (blazers, shoes, sizes)...';
      default:
        return 'Search across Books, Parts, Fabric, Fashion...';
    }
  };

  return (
    <>
      <header 
        className="fixed top-0 left-0 w-full z-50 bg-[#111827]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl text-white px-4 sm:px-6 md:px-12 py-3 sm:py-3.5 transition-all duration-300"
      >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3 lg:gap-6">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group shrink-0" 
          onClick={() => onNavigate('Home')}
        >
          <div className="hidden sm:block">
            <span className="text-lg font-black tracking-tighter uppercase text-white group-hover:text-[#60A5FA] transition-colors">
              Royal Hints
            </span>
            <span className="block text-[8px] font-black uppercase tracking-[0.25em] text-[#60A5FA]">
              Books • Parts • Fabric • Fashion
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center space-x-5 shrink-0">
          {currentPage === 'Dashboard' ? (
            <button 
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-black uppercase tracking-wider text-white transition-all group shadow-sm"
              title="Open Dashboard Navigation Menu"
            >
              <Menu className="h-4 w-4 text-[#60A5FA] group-hover:scale-110 transition-transform" />
              <span>Dashboard Menu</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2563EB] text-white font-bold tracking-normal">
                {dashboardNavLinks.find(item => item.id === dashboardTab)?.label || 'Console'}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          ) : (
            <>
              <button 
                onClick={() => onNavigate('Marketplace')}
                className="text-[11px] uppercase font-black tracking-[0.2em] text-white hover:text-[#60A5FA] transition-all flex items-center gap-1.5 relative group py-1"
              >
                <Store className="h-3.5 w-3.5 text-[#60A5FA]" /> Marketplace
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-[#2563EB] transition-all ${currentPage === 'Marketplace' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
              
              {categoriesList.map((link) => {
                const isActive = currentPage === 'Home' && (selectedCategory === link || searchCategory === link);
                return (
                  <button 
                    key={link} 
                    onClick={() => handleCategoryNavClick(link)}
                    className={`text-[11px] uppercase font-black tracking-[0.2em] transition-all relative group py-1 flex items-center gap-1 ${
                      isActive ? 'text-[#60A5FA]' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link}
                    <span className={`absolute -bottom-1 left-0 h-[2px] bg-[#2563EB] transition-all ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* 4-CATEGORY INTEGRATED SEARCH BAR (DESKTOP / TABLET) */}
        <div className="relative hidden md:flex flex-1 max-w-xl mx-2" ref={searchContainerRef}>
          <form 
            onSubmit={handleSearchSubmit} 
            className="group flex items-center w-full rounded-full border border-white/15 bg-white/10 hover:bg-white/15 focus-within:bg-white focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB]/20 transition-all duration-300 shadow-inner"
          >
            {/* Category Dropdown Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
                className="flex items-center gap-1.5 pl-3.5 pr-2.5 py-2 text-[11px] font-black uppercase tracking-wider rounded-l-full border-r border-white/20 text-white group-focus-within:text-[#2563EB] group-focus-within:border-gray-200 transition-colors hover:bg-white/10 group-focus-within:hover:bg-blue-50/80"
                title="Filter by category"
              >
                {getCategoryIcon(searchCategory, "h-3.5 w-3.5 text-[#60A5FA] group-focus-within:text-[#2563EB]")}
                <span className="truncate max-w-[90px]">{searchCategory}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isCategoryPickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Category Dropdown Menu */}
              {isCategoryPickerOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-[14px] shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#1A1A1A]">
                  <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                    Filter by Category
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSearchCategory('All');
                      setIsCategoryPickerOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-xs font-bold flex items-center justify-between transition-colors hover:bg-blue-50/70 ${
                      searchCategory === 'All' ? 'text-[#2563EB] bg-blue-50/50 font-black' : 'text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      All Categories
                    </span>
                    {searchCategory === 'All' && <Check className="h-3.5 w-3.5 text-[#2563EB]" />}
                  </button>

                  {categoriesList.map((cat) => {
                    const count = allSearchableProducts.filter(p => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSearchCategory(cat);
                          setIsCategoryPickerOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-xs font-bold flex items-center justify-between transition-colors hover:bg-blue-50/70 ${
                          searchCategory === cat ? 'text-[#2563EB] bg-blue-50/50 font-black' : 'text-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {getCategoryIcon(cat, "h-3.5 w-3.5 text-[#2563EB]")}
                          {cat}
                        </span>
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          {count} in stock
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search Input Field */}
            <div className="relative flex-1 flex items-center">
              <input 
                type="text" 
                placeholder={getPlaceholder()} 
                className="w-full py-2.5 pl-3 pr-8 text-xs font-medium bg-transparent focus:outline-none text-white group-focus-within:text-[#1A1A1A] placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-4 py-2 text-[#60A5FA] group-focus-within:text-[#2563EB] hover:text-white transition-colors flex items-center justify-center shrink-0"
              title="Search catalog"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* REAL-TIME SEARCH RESULTS DROPDOWN WITH 4 CATEGORIES */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[16px] shadow-2xl border border-gray-100 p-3 z-50 overflow-hidden text-[#1A1A1A] animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Category Quick Filter Chips */}
              <div className="flex items-center gap-1.5 pb-2.5 mb-2 border-b border-gray-100 overflow-x-auto">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 pl-1 shrink-0">Filter:</span>
                <button
                  type="button"
                  onClick={() => setSearchCategory('All')}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 ${
                    searchCategory === 'All' 
                      ? 'bg-[#2563EB] text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSearchCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 shrink-0 ${
                      searchCategory === cat 
                        ? 'bg-[#2563EB] text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {getCategoryIcon(cat, "h-2.5 w-2.5")}
                    {cat}
                  </button>
                ))}
              </div>

              {/* Status Header */}
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>
                  {searchCategory === 'All' ? 'Verified In-Stock Products' : `${searchCategory} In-Stock Inventory`}
                </span>
                <span className="text-[#2563EB] font-bold">
                  {searchResults.length} {searchResults.length === 1 ? 'Item' : 'Items'} Available
                </span>
              </div>
              
              {/* Results List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 mt-1">
                {searchResults.length > 0 ? (
                  searchResults.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="p-2.5 rounded-[10px] hover:bg-blue-50/70 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-100 group-hover:scale-105 transition-transform" 
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1A1A1A] truncate group-hover:text-[#2563EB] transition-colors">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black bg-blue-100/80 text-[#2563EB] uppercase tracking-wider px-2 py-0.5 rounded">
                              {product.category}
                            </span>
                            <span className="text-[9px] font-mono text-gray-400 truncate">SKU: {product.sku}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-black text-[#2563EB]">${product.price.toFixed(2)}</p>
                          <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">In Stock</span>
                        </div>
                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-[#2563EB] hover:text-white transition-colors"
                            title="Add to Shopping Bag"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      No matching verified items in {searchCategory}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Try searching with other terms or switch to "All Categories"
                    </p>
                  </div>
                )}
              </div>

              {/* View in Catalog Action Footer */}
              {searchResults.length > 0 && (
                <div className="pt-2.5 mt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium pl-1">
                    Press Enter or click to inspect stock
                  </span>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                  >
                    View in Catalog <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-3 sm:space-x-5 shrink-0">
          
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            title="Search Products"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Cart Bag Icon */}
          <button 
            className="relative p-2 text-white hover:scale-110 transition-transform"
            onClick={() => onNavigate('Dashboard')}
            title="Shopping Bag"
          >
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-[#2563EB] text-white text-[9px] flex items-center justify-center rounded-full font-black shadow-lg shadow-blue-500/40">
              {cartCount}
            </span>
          </button>

          {/* User Account Button */}
          <div className="relative">
            {user ? (
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1 pr-2.5 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/15 transition-all"
              >
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-500/20">
                   {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">
                  {user.buyerUniqueId || user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onNavigate('Dashboard')}
                  className="text-[10px] font-black uppercase tracking-[0.2em] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/30 text-white hover:bg-[#2563EB] hover:border-[#2563EB] transition-all bg-white/5"
                >
                  Buyer Desk
                </button>
              </div>
            )}

            {isUserMenuOpen && user && (
              <div className="absolute right-0 mt-4 w-64 bg-[#111827] rounded-[12px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] py-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200 text-white border border-white/10">
                <div className="px-5 py-3 border-b border-white/10 mb-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest truncate">{user.name}</p>
                    {user.isAdmin && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase">Admin</span>
                    )}
                  </div>
                  {user.buyerUniqueId ? (
                    <p className="text-[10px] text-amber-300 font-mono font-bold mt-0.5">ID: {user.buyerUniqueId}</p>
                  ) : (
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.email}</p>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate('Dashboard');
                  }}
                  className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#2563EB] flex items-center gap-3 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard & Orders
                </button>
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 text-red-400 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="h-4 w-4" />Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Menu Toggle: Visible on all screen sizes for Dashboard; for other pages, visible on mobile/tablet (<xl) */}
          <button 
            className={`${currentPage === 'Dashboard' ? 'flex' : 'xl:hidden'} items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title={currentPage === 'Dashboard' ? "Dashboard Navigation Menu" : "Menu"}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <>
                <Menu className="h-6 w-6" />
                {currentPage === 'Dashboard' && (
                  <span className="hidden lg:inline text-[11px] font-black uppercase tracking-wider text-gray-200">
                    Menu
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH BAR EXPANDED VIEW */}
      {isMobileSearchOpen && (
        <div ref={mobileSearchRef} className="md:hidden pt-3 pb-2 animate-in slide-in-from-top duration-200">
          <div className="bg-white rounded-2xl p-3 shadow-2xl border border-gray-200 text-[#1A1A1A]">
            
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
              <Search className="h-4 w-4 text-[#2563EB] shrink-0" />
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium bg-transparent focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* 4 Categories Filter Tabs in Mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-b border-gray-100">
              <button
                onClick={() => setSearchCategory('All')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                  searchCategory === 'All' ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                All
              </button>
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSearchCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                    searchCategory === cat ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {getCategoryIcon(cat, "h-3 w-3")}
                  {cat}
                </button>
              ))}
            </div>

            {/* Live Filtered Results for Mobile */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 mt-2">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="py-2 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1A1A1A] truncate">{product.name}</p>
                        <p className="text-[9px] font-black text-[#2563EB] uppercase">{product.category}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#2563EB] shrink-0">${product.price.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-gray-400">
                  No products found in {searchCategory}
                </div>
              )}
            </div>

            <button
              onClick={handleSearchSubmit}
              className="w-full mt-2 bg-[#2563EB] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Show {filteredProducts.length} Results in Catalog
            </button>
          </div>
        </div>
      )}

      {/* Header Container Close */}
    </header>

    {/* PROJECTED FULLSCREEN / SIDEBAR NAVIGATION DRAWER (PORTALED TO DOCUMENT.BODY) */}
    {isMenuOpen && typeof document !== 'undefined' && createPortal(
      <div 
        className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className="w-full sm:max-w-md md:max-w-lg bg-[#1A1A1A] text-white flex flex-col p-6 sm:p-8 pt-16 sm:pt-20 overflow-y-auto h-full shadow-2xl border-l border-white/10 animate-in slide-in-from-right duration-300 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-7 w-7" />
          </button>
        
        {currentPage === 'Dashboard' ? (
          <>
            <div className="mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="text-[#2563EB] text-xs font-black uppercase tracking-[0.3em]">Royal Console</span>
              </div>
              <h3 className="text-white text-2xl sm:text-3xl font-black">Dashboard Navigation</h3>
              {user && (
                <p className="text-xs text-gray-400 font-mono mt-1">Signed in as <strong className="text-white">{user.name}</strong></p>
              )}
            </div>

            <nav className="flex flex-col space-y-2.5 flex-1 overflow-y-auto pr-1">
              {dashboardNavLinks.map((item) => {
                const isSelected = dashboardTab === item.id;
                return (
                  <button 
                    key={item.id} 
                    onClick={() => {
                      if (item.id === 'marketplace-link') {
                        onNavigate('Marketplace');
                      } else {
                        onSelectDashboardTab(item.id);
                      }
                      setIsMenuOpen(false);
                    }}
                    className={`text-lg sm:text-xl font-bold uppercase tracking-tight flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-lg shadow-blue-500/20'
                        : 'border-white/5 text-gray-200 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-[#2563EB]'}`} />
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                  </button>
                );
              })}

              <button 
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="text-lg font-bold uppercase tracking-tight flex items-center justify-between p-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all text-left mt-4"
              >
                <span className="flex items-center gap-3">
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </span>
              </button>
            </nav>
          </>
        ) : (
          <>
            <div className="mb-8">
              <span className="text-[#2563EB] text-xs font-black uppercase tracking-[0.3em]">Royal Hints Directory</span>
              <h3 className="text-white text-3xl font-black mt-1">Four Core Pillars</h3>
            </div>

            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => {
                  onNavigate('Marketplace');
                  setIsMenuOpen(false);
                }}
                className="text-2xl font-black text-white uppercase tracking-tight flex items-center justify-between border-b border-white/10 pb-4 text-left group hover:text-[#2563EB] transition-colors"
              >
                <span>Marketplace</span>
                <Store className="h-6 w-6 text-[#2563EB] group-hover:scale-110 transition-transform" />
              </button>
              {categoriesList.map((link) => (
                <button 
                  key={link} 
                  onClick={() => handleCategoryNavClick(link)}
                  className="text-2xl font-black text-white uppercase tracking-tight flex items-center justify-between border-b border-white/10 pb-4 text-left group hover:text-[#2563EB] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    {getCategoryIcon(link, "h-6 w-6 text-[#2563EB]")}
                    {link}
                  </span>
                  <ChevronRight className="h-6 w-6 text-[#2563EB] transition-transform group-hover:translate-x-2" />
                </button>
              ))}
            </nav>
            
            <div className="mt-auto pt-8 space-y-3">
              <button 
                onClick={() => {
                  onNavigate('Dashboard');
                  setIsMenuOpen(false);
                }}
                className="w-full bg-[#2563EB] text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.25em] shadow-2xl shadow-blue-500/30 hover:bg-[#1D4ED8] transition-colors"
              >
                {user ? `Active Dashboard (${user.buyerUniqueId || user.name.split(' ')[0]})` : 'Open Buyer Dashboard & Orders'}
              </button>

            </div>
          </>
        )}
        </div>
      </div>,
      document.body
    )}
  </>
  );
};

export default Header;
