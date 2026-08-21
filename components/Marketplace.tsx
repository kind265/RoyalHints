
import React, { useState, useEffect } from 'react';
import { 
  Store, 
  User, 
  Clock, 
  ArrowRight, 
  Filter, 
  Search, 
  Star, 
  MessageSquare, 
  Send, 
  Share2, 
  Copy, 
  Twitter, 
  Facebook, 
  Mail, 
  X, 
  Check, 
  Sparkles, 
  Timer, 
  PlusCircle,
  Inbox,
  ShieldCheck,
  Crown,
  ShoppingCart
} from 'lucide-react';
import { BusinessPost, Review, User as UserType, Product, ProductCategory } from '../types';

interface MarketplaceProps {
  posts: BusinessPost[];
  user: UserType | null;
  onAddReview: (postId: string, review: Omit<Review, 'id'>) => void;
  onNavigate?: (page: any) => void;
  onAddPost?: (post: Omit<BusinessPost, 'id' | 'userId' | 'userName' | 'timestamp'>) => void;
  onAddToCart?: (product: Product) => void;
}

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

const Marketplace: React.FC<MarketplaceProps> = ({ posts, user, onAddReview, onNavigate, onAddPost, onAddToCart }) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [activeReviewPost, setActiveReviewPost] = useState<string | null>(null);
  const [sharingPost, setSharingPost] = useState<BusinessPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [boughtPostId, setBoughtPostId] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, content: '' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.isAdmin || user?.email?.toLowerCase() === 'admin@royalhints.com' || user?.email?.toLowerCase() === 'chikusehopeson@gmail.com';
  const [newPostForm, setNewPostForm] = useState({
    title: '',
    description: '',
    category: 'Books',
    image: '',
    price: 350,
    stockCount: 10,
    condition: 'Brand New (Mint)',
    location: 'Geneva Central Vault',
    dispatchTime: 'Dispatches in 24 hours'
  });

  const categories = [
    'All', 
    'New Arrivals',
    'Books', 
    'Spare Parts', 
    'Fabric', 
    'Fashion'
  ];

  // Helper to check if a post was created within the last 48 hours
  const isPostNewArrival = (timestamp: number) => {
    return (Date.now() - timestamp) <= FORTY_EIGHT_HOURS_MS;
  };

  // Helper to get remaining time within the 48-hour window
  const getRemainingHours = (timestamp: number) => {
    const elapsed = Date.now() - timestamp;
    const remainingMs = FORTY_EIGHT_HOURS_MS - elapsed;
    if (remainingMs <= 0) return 0;
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  const newArrivalsCount = posts.filter(p => isPostNewArrival(p.timestamp)).length;

  const filteredPosts = posts.filter(post => {
    const isNew = isPostNewArrival(post.timestamp);
    
    let matchesFilter = true;
    if (filter === 'New Arrivals') {
      matchesFilter = isNew;
    } else if (filter !== 'All') {
      matchesFilter = post.category === filter;
    }

    const query = search.toLowerCase().trim();
    const matchesSearch = !query || 
      post.title.toLowerCase().includes(query) || 
      post.description.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query) ||
      post.userName.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const handleReviewSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!user) return;
    onAddReview(postId, {
      user: user.name,
      rating: newReview.rating,
      content: newReview.content,
    });
    setNewReview({ rating: 5, content: '' });
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddPost) return;
    onAddPost({
      title: newPostForm.title,
      description: newPostForm.description,
      category: newPostForm.category,
      image: newPostForm.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      stockCount: Number(newPostForm.stockCount) || 10,
      price: Number(newPostForm.price) || 350,
      condition: newPostForm.condition || 'Brand New (Mint)',
      location: newPostForm.location || 'Geneva Central Vault',
      dispatchTime: newPostForm.dispatchTime || 'Dispatches in 24 hours',
      sku: `RH-MP-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setIsCreateModalOpen(false);
    setNewPostForm({
      title: '',
      description: '',
      category: 'Books',
      image: '',
      price: 350,
      stockCount: 10,
      condition: 'Brand New (Mint)',
      location: 'Geneva Central Vault',
      dispatchTime: 'Dispatches in 24 hours'
    });
    setFilter('New Arrivals');
  };

  const handleCopyLink = (postId: string) => {
    const url = `${window.location.origin}/venture/${postId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { 
      name: 'Twitter', 
      icon: Twitter, 
      color: 'hover:text-[#1DA1F2]',
      handler: (post: BusinessPost) => window.open(`https://twitter.com/intent/tweet?text=Check out ${post.title} on Royal Hints!&url=${encodeURIComponent(window.location.origin + '/venture/' + post.id)}`)
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      color: 'hover:text-[#4267B2]',
      handler: (post: BusinessPost) => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/venture/' + post.id)}`)
    },
    { 
      name: 'Email', 
      icon: Mail, 
      color: 'hover:text-[#2563EB]',
      handler: (post: BusinessPost) => window.open(`mailto:?subject=${encodeURIComponent('Royal Venture: ' + post.title)}&body=${encodeURIComponent('Discover this venture on Royal Hints: ' + window.location.origin + '/venture/' + post.id)}`)
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-32 pt-28 sm:pt-32">
      {/* Marketplace Top Header */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 md:px-12 lg:px-24 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[#2563EB] font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] block mb-1">
            The Royal Ecosystem
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight">
            Royal Marketplace
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-light mt-1">
            Browse certified royal ventures, boutique craftsmanship, and 48 hour new arrivals.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="self-start sm:self-auto bg-[#2563EB] text-white px-5 py-2.5 sm:py-3 rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#1D4ED8] transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 shrink-0"
          >
            <Crown className="h-4 w-4 text-amber-300" />
            Admin: Post Venture
          </button>
        )}
      </div>

      {/* Discovery Toolbar */}
      <div className="sticky top-[64px] sm:top-[68px] bg-white/95 backdrop-blur-xl z-30 border-y border-gray-100 py-3 sm:py-4 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 md:px-12 lg:px-24 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          
          {/* Category & New Arrivals Filter Tabs: Single horizontal line on mobile with smooth scrolling */}
          <div className="flex flex-nowrap lg:flex-wrap items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const isSelected = filter === cat;
              const isNewArrivalsTab = cat === 'New Arrivals';

              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                    isSelected 
                      ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/25 scale-105' 
                      : isNewArrivalsTab
                        ? 'bg-blue-50/80 text-[#2563EB] hover:bg-blue-100/80 border border-blue-200'
                        : 'bg-gray-50 text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100'
                  }`}
                >
                  {isNewArrivalsTab}
                  <span>{cat}</span>
                  {isNewArrivalsTab && (
                    <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#2563EB] text-white'
                    }`}>
                      {newArrivalsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80 group">
            <input 
              type="text" 
              placeholder="Search ventures, artisans, categories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-8 py-2.5 text-xs focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all placeholder:text-gray-400 font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-[#2563EB] transition-colors" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discovery Grid */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 md:px-12 lg:px-24 mt-8 sm:mt-16">
        
        {/* Banner when viewing New Arrivals */}
        {filter === 'New Arrivals' && (
          <div className="mb-6 sm:mb-10 bg-gradient-to-r from-blue-50 via-white to-blue-50/50 p-4 sm:p-6 rounded-[12px] sm:rounded-[16px] border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                  48 Hour New Arrivals Window
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Products in this section stay active for exactly 48 hours from initial publication, after which they seamlessly transition into the general catalog.
                </p>
              </div>
            </div>
            <div className="text-[10px] sm:text-xs font-black text-[#2563EB] uppercase tracking-widest bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-200 shadow-sm shrink-0">
              {filteredPosts.length} Active {filteredPosts.length === 1 ? 'Posting' : 'Postings'}
            </div>
          </div>
        )}

        {/* Post Grid: 2 per row on Mobile, 2 on MD, 3 on LG */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-10 lg:gap-12">
            {filteredPosts.map((post) => {
              const isNew = isPostNewArrival(post.timestamp);
              const remainingTime = getRemainingHours(post.timestamp);

              return (
                <article 
                  key={post.id} 
                  className="group animate-in fade-in slide-in-from-bottom-6 duration-500 flex flex-col h-full bg-white rounded-[12px] sm:rounded-[16px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-square sm:aspect-[16/10] overflow-hidden bg-gray-100">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Category and 48h Badge */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-1.5 max-w-[85%]">
                      <div className="bg-[#1A1A1A]/90 backdrop-blur-md text-white text-[7px] sm:text-[9px] font-black uppercase tracking-wider sm:tracking-[0.2em] px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-md shadow-lg truncate">
                        {post.category}
                      </div>
                      
                      {isNew && (
                        <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#2563EB] text-white text-[7px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-3 sm:py-1 rounded-md shadow-lg animate-pulse truncate">
                          <span className="truncate">{remainingTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Share Floating Button */}
                    <button 
                      onClick={() => setSharingPost(post)}
                      className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 p-1.5 sm:p-2.5 bg-white/90 backdrop-blur-xl text-[#1A1A1A] rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-[#2563EB] hover:text-white"
                      title="Share Venture"
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                  
                  <div className="p-3 sm:p-6 space-y-2 sm:space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5 sm:space-y-3">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                          <div className="h-4 w-4 sm:h-6 sm:w-6 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-[8px] sm:text-xs font-black shrink-0">
                            {post.userName ? post.userName.charAt(0) : 'R'}
                          </div>
                          <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider truncate max-w-[85px] sm:max-w-[150px]">
                            {post.userName}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-wider shrink-0">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" /> 
                          {new Date(post.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      <h3 className="text-xs sm:text-2xl font-bold text-[#1A1A1A] tracking-tight group-hover:text-[#2563EB] transition-colors leading-tight line-clamp-1 sm:line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="hidden sm:block text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-3 font-normal">
                        {post.description}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-4 border-t border-gray-100 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {post.stockCount ? (
                          <span className="text-[8px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-200">
                            {post.stockCount} Avail
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4">
                        <button 
                          onClick={() => setActiveReviewPost(activeReviewPost === post.id ? null : post.id)}
                          className="flex items-center gap-1 text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-gray-400 hover:text-[#2563EB] transition-colors"
                        >
                          <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> 
                          {post.reviews?.length || 0}
                        </button>
                        <button 
                          onClick={() => setSharingPost(post)}
                          className="text-gray-400 hover:text-[#2563EB] transition-colors"
                          title="Share"
                        >
                          <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Direct Buy Button for Buyers */}
                    <button
                      onClick={() => {
                        if (onAddToCart) {
                          const itemPrice = post.price || 150;
                          onAddToCart({
                            id: `mp-item-${post.id}`,
                            name: post.title,
                            description: post.description || 'Verified authentic Royal Hints catalog offering.',
                            price: itemPrice,
                            category: (post.category === 'Industrial & Bespoke' ? 'Spare Parts' : post.category) as ProductCategory,
                            image: post.image,
                            rating: 5.0,
                            reviewsCount: post.reviews?.length || 1,
                            sku: post.sku || `RH-MP-${post.id.slice(-4)}`,
                            inStock: true
                          });
                          setBoughtPostId(post.id);
                          setTimeout(() => setBoughtPostId(null), 2000);
                        }
                      }}
                      className="w-full mt-1 sm:mt-2 bg-[#1A1A1A] hover:bg-[#2563EB] text-white py-2 sm:py-3 rounded-[6px] sm:rounded-[8px] text-[9px] sm:text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm active:scale-95"
                    >
                      {boughtPostId === post.id ? (
                        <>
                          <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
                          Added!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span className="sm:hidden">Buy • ${(post.price || 150).toFixed(0)}</span>
                          <span className="hidden sm:inline">Purchase Item • ${(post.price || 150).toFixed(2)}</span>
                        </>
                      )}
                    </button>

                    {/* Review Section */}
                    {activeReviewPost === post.id && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                        <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] mb-2 sm:mb-3">
                          Verified Feedback
                        </h4>
                        
                        <div className="space-y-2 sm:space-y-3 mb-3 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                          {post.reviews && post.reviews.length > 0 ? (
                            post.reviews.map((rev) => (
                              <div key={rev.id} className="bg-gray-50 p-2 sm:p-3 rounded-[6px] sm:rounded-[8px]">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">{rev.user}</span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-2 w-2 sm:h-2.5 sm:w-2.5 ${i < rev.rating ? 'text-[#2563EB] fill-[#2563EB]' : 'text-gray-200'}`} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-normal leading-relaxed">{rev.content}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest text-center py-2">No reviews yet</p>
                          )}
                        </div>

                        {user ? (
                          <form onSubmit={(e) => handleReviewSubmit(e, post.id)} className="space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Rating:</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <button
                                    type="button"
                                    key={num}
                                    onClick={() => setNewReview({ ...newReview, rating: num })}
                                    className="focus:outline-none"
                                  >
                                    <Star className={`h-3 w-3 sm:h-3.5 sm:w-3.5 transition-all ${num <= newReview.rating ? 'text-[#2563EB] fill-[#2563EB]' : 'text-gray-200'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="relative">
                              <textarea
                                required
                                placeholder="Write feedback..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-[6px] sm:rounded-[8px] p-2.5 sm:p-3 text-[10px] sm:text-xs focus:outline-none focus:border-[#2563EB] transition-all resize-none"
                                rows={2}
                                value={newReview.content}
                                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                              />
                              <button 
                                type="submit"
                                className="absolute bottom-2.5 right-2.5 p-1.5 bg-[#2563EB] text-white rounded-full hover:bg-[#1D4ED8] transition-colors shadow-md"
                              >
                                <Send className="h-3 w-3" />
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="p-3 bg-[#F8F9FA] rounded-[8px] text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Sign in to leave feedback</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* BLANK / EMPTY STATE */
          <div className="py-28 sm:py-36 text-center bg-[#F8F9FA] rounded-[24px] border border-dashed border-gray-200 px-6 animate-in zoom-in-95 duration-300">
            <div className="h-20 w-20 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              {filter === 'New Arrivals' ? <Clock className="h-9 w-9" /> : <Inbox className="h-9 w-9" />}
            </div>
            
            <div className="max-w-md mx-auto space-y-3">
              <h3 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
                {filter === 'New Arrivals' 
                  ? 'No Active 48-Hour New Arrivals' 
                  : `No Ventures in ${filter}`
                }
              </h3>
              
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                {filter === 'New Arrivals'
                  ? 'Products only remain in New Arrivals for exactly 48 hours after being posted. There are currently no new postings within this 48-hour window.'
                  : search 
                    ? `No postings matching "${search}". Try adjusting your keywords.`
                    : `No postings found in this category.`
                }
              </p>

              <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
                {filter === 'New Arrivals' && (
                  <button 
                    onClick={() => setFilter('All')}
                    className="px-6 py-3 rounded-full bg-[#1A1A1A] text-white text-xs font-black uppercase tracking-wider hover:bg-black transition-all shadow-md"
                  >
                    Browse All Marketplace Ventures
                  </button>
                )}
                
                {user ? (
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 rounded-full bg-[#2563EB] text-white text-xs font-black uppercase tracking-wider hover:bg-[#1D4ED8] transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Post New Venture
                  </button>
                ) : onNavigate ? (
                  <a href="#">
                    <button 
                      className="px-6 py-3 rounded-full bg-[#2563EB] text-white text-xs font-black uppercase tracking-wider hover:bg-[#1D4ED8] transition-all"
                    >
                      Sign In to Publish
                    </button>
                  </a>
                ) : null}

                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="text-[#2563EB] font-black text-xs uppercase tracking-wider hover:underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE VENTURE / PRODUCT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-lg rounded-[16px] shadow-2xl overflow-hidden border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1A1A1A] p-6 sm:p-8 text-white flex items-center justify-between">
              <div>
                <span className="text-[#2563EB] text-[9px] font-black uppercase tracking-[0.3em]">Royal Venture Launch</span>
                <h3 className="text-xl sm:text-2xl font-black">Publish to Marketplace</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Will appear in both Marketplace and New Arrivals (for 48 hours).</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="p-6 sm:p-8 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                  Venture / Product Title
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Handcrafted Titanium Calipers"
                  value={newPostForm.title}
                  onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 text-xs focus:outline-none focus:border-[#2563EB] text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                    Category Pillar
                  </label>
                  <select
                    value={newPostForm.category}
                    onChange={(e) => setNewPostForm({ ...newPostForm, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-3 py-3 text-xs focus:outline-none focus:border-[#2563EB] text-[#1A1A1A]"
                  >
                    <option value="Books">Books</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Fabric">Fabric</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Industrial & Bespoke">Industrial & Bespoke</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                    Price ($USD)
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={newPostForm.price}
                    onChange={(e) => setNewPostForm({ ...newPostForm, price: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 text-xs focus:outline-none focus:border-[#2563EB] text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                    Available Units / Vault Stock
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={newPostForm.stockCount}
                    onChange={(e) => setNewPostForm({ ...newPostForm, stockCount: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 text-xs focus:outline-none focus:border-[#2563EB] text-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                    Dispatch Location
                  </label>
                  <input 
                    type="text" 
                    value={newPostForm.location}
                    onChange={(e) => setNewPostForm({ ...newPostForm, location: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 text-xs focus:outline-none focus:border-[#2563EB] text-[#1A1A1A]"
                    placeholder="Geneva Central Vault"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                  Image URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  value={newPostForm.image}
                  onChange={(e) => setNewPostForm({ ...newPostForm, image: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-[10px] px-4 py-3 text-xs focus:outline-none focus:border-[#2563EB] text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                  Description & Specifications
                </label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Describe your craft, materials, specifications, and delivery details..."
                  value={newPostForm.description}
                  onChange={(e) => setNewPostForm({ ...newPostForm, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-[10px] p-3 text-xs focus:outline-none focus:border-[#2563EB] text-[#1A1A1A] resize-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full bg-[#2563EB] text-white py-4 rounded-[12px] font-black text-xs uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Publish Live (Active in New Arrivals for 48h)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sharing Modal Overlay */}
      {sharingPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-md transition-opacity duration-500"
            onClick={() => setSharingPost(null)}
          ></div>
          
          <div className="relative bg-white w-full max-w-lg rounded-[12px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-blue-100">
            <div className="bg-[#1A1A1A] p-8 sm:p-10 text-center relative">
              <button 
                onClick={() => setSharingPost(null)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-[#2563EB] rounded-full mx-auto flex items-center justify-center mb-4 sm:mb-6 shadow-2xl shadow-blue-500/30">
                <Share2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h2 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-2">Share Royal Venture</h2>
              <p className="text-gray-400 text-xs sm:text-sm font-light">Share <span className="text-white font-bold">{sharingPost.title}</span> with your network.</p>
            </div>

            <div className="p-8 sm:p-10 space-y-8 sm:space-y-10">
              {/* Direct Link */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 ml-1">Venture Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[8px] px-4 sm:px-6 py-3.5 sm:py-4 text-xs font-mono text-gray-500 truncate select-all">
                    {window.location.origin}/venture/{sharingPost.id}
                  </div>
                  <button 
                    onClick={() => handleCopyLink(sharingPost.id)}
                    className={`px-5 sm:px-6 py-3.5 sm:py-4 rounded-[8px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                      copied ? 'bg-green-500 text-white' : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                    }`}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Social Grid */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {shareOptions.map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => opt.handler(sharingPost)}
                    className={`flex flex-col items-center gap-2.5 p-4 sm:p-6 rounded-[12px] border border-gray-100 hover:bg-gray-50 hover:border-[#2563EB]/30 transition-all group ${opt.color}`}
                  >
                    <opt.icon className="h-6 w-6 sm:h-8 sm:w-8 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#1A1A1A]">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gray-50 text-center">
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Royal Hints Member Network</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
};

export default Marketplace;

