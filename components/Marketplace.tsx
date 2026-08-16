
import React, { useState } from 'react';
import { Store, User, Clock, ArrowRight, Filter, Search, Star, MessageSquare, Send, Share2, Copy, Twitter, Facebook, Mail, X, Check } from 'lucide-react';
import { BusinessPost, Review, User as UserType } from '../types';

interface MarketplaceProps {
  posts: BusinessPost[];
  user: UserType | null;
  onAddReview: (postId: string, review: Omit<Review, 'id'>) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ posts, user, onAddReview }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeReviewPost, setActiveReviewPost] = useState<string | null>(null);
  const [sharingPost, setSharingPost] = useState<BusinessPost | null>(null);
  const [copied, setCopied] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, content: '' });

  const categories = [
    'All', 
    'Books', 
    'Spare Parts', 
    'Fabric', 
    'Fashion',
    'Industrial & Bespoke'
  ];
  
  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'All' || post.category === filter;
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || 
                          post.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleReviewSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') return;
    onAddReview(postId, {
      user: user.name,
      rating: newReview.rating,
      content: newReview.content,
    });
    setNewReview({ rating: 5, content: '' });
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
      color: 'hover:text-[#FF6600]',
      handler: (post: BusinessPost) => window.open(`mailto:?subject=${encodeURIComponent('Royal Venture: ' + post.title)}&body=${encodeURIComponent('Discover this venture on Royal Hints: ' + window.location.origin + '/venture/' + post.id)}`)
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Editorial Header */}
      <section className="bg-[#1A1A1A] pt-40 pb-32 px-6 md:px-12 lg:px-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FF6600]/10 rounded-full -mr-96 -mt-96 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FF6600]/15 rounded-full -ml-48 -mb-48 blur-[100px]"></div>

        <div className="max-w-screen-2xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
            <div className="max-w-2xl">
              <span className="text-[#FF6600] font-black text-[10px] uppercase tracking-[0.4em] block mb-6 animate-in slide-in-from-left-4 duration-700">The Royal Ecosystem</span>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-[0.85] mb-10 animate-in slide-in-from-left-6 duration-700">
                Royal <br />
                <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,102,0,0.5)' }}>Market</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed animate-in slide-in-from-left-8 duration-700">
                The premier destination for luxury craft and innovation. Discover prestigious services and boutique offerings curated by Royal Hints.
              </p>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-[8px] border border-white/10 text-center min-w-[200px] hover:border-[#FF6600]/40 transition-colors group">
                <p className="text-4xl font-bold text-[#1A1A1A] mb-1 group-hover:scale-110 transition-transform">{posts.length}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">Live Ventures</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-[8px] border border-white/10 text-center min-w-[200px] hover:border-[#FF6600]/40 transition-colors group">
                <p className="text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform">1.2k</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">Royal Visitors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Toolbar */}
      <div className="sticky top-20 bg-white/90 backdrop-blur-xl z-30 border-b border-gray-100 py-6">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === cat ? 'bg-[#FF6600] text-white shadow-lg shadow-orange-500/20' : 'bg-gray-50 text-gray-400 hover:text-[#FF6600] hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <input 
              type="text" 
              placeholder="Search ventures..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-full px-12 py-3 text-sm focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6600] transition-colors" />
          </div>
        </div>
      </div>

      {/* Discovery Grid */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 lg:px-24 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          {filteredPosts.map((post) => (
            <article 
              key={post.id} 
              className="group animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col h-full"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[8px] bg-gray-100 mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transform group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                   <div className="bg-white/90 backdrop-blur-md text-[#FF6600] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm shadow-xl">
                    {post.category}
                  </div>
                </div>
                {/* Share Floating Button */}
                <button 
                  onClick={() => setSharingPost(post)}
                  className="absolute bottom-6 right-6 p-3 bg-white/90 backdrop-blur-xl text-[#FF6600] rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-[#FF6600] hover:text-white"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-[#FF6600]/10 flex items-center justify-center">
                      <User className="h-2.5 w-2.5 text-[#FF6600]" />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{post.userName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-300 font-bold uppercase tracking-widest">
                    <Clock className="h-3 w-3" /> {new Date(post.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-[#1A1A1A] tracking-tight group-hover:text-[#1A1A1A] transition-colors duration-300 leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-gray-500 text-base leading-relaxed line-clamp-2 font-light">
                  {post.description}
                </p>

                <div className="pt-4 flex items-center justify-between">
                  <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#FF6600] group/btn transition-all hover:gap-5 hover:text-[#FF6600]">
                    Explore Venture 
                    <ArrowRight className="h-4 w-4 text-[#FF6600] group-hover/btn:scale-125 transition-all" />
                  </button>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setActiveReviewPost(activeReviewPost === post.id ? null : post.id)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#FF6600] transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" /> 
                      {post.reviews?.length || 0}
                    </button>
                    <button 
                      onClick={() => setSharingPost(post)}
                      className="text-gray-400 hover:text-[#FF6600] transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Review Section */}
                {activeReviewPost === post.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] mb-4">Royal Feedback</h4>
                    
                    <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {post.reviews && post.reviews.length > 0 ? (
                        post.reviews.map((rev) => (
                          <div key={rev.id} className="bg-gray-50 p-4 rounded-[8px]">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">{rev.user}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-2.5 w-2.5 ${i < rev.rating ? 'text-[#FF6600] fill-[#FF6600]' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 font-light leading-relaxed">{rev.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center py-4">Be the first to leave feedback</p>
                      )}
                    </div>

                    {user && user.role === 'admin' ? (
                      <form onSubmit={(e) => handleReviewSubmit(e, post.id)} className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                type="button"
                                key={num}
                                onClick={() => setNewReview({ ...newReview, rating: num })}
                                className="focus:outline-none"
                              >
                                <Star className={`h-4 w-4 transition-all ${num <= newReview.rating ? 'text-[#FF6600] fill-[#FF6600] scale-110' : 'text-gray-200 hover:text-gray-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="relative">
                          <textarea
                            required
                            placeholder="Share your royal experience..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-[8px] p-4 text-xs focus:outline-none focus:border-[#FF6600] transition-all resize-none"
                            rows={3}
                            value={newReview.content}
                            onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                          />
                          <button 
                            type="submit"
                            className="absolute bottom-3 right-3 p-2 bg-[#FF6600] text-white rounded-full hover:bg-[#FF6600] transition-colors shadow-lg shadow-orange-500/20"
                          >
                            <Send className="h-3 w-3" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-4 bg-[#F8F9FA] rounded-[8px] text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Reviews are managed by the admin team.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="py-40 text-center animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
              <Search className="h-10 w-10 text-gray-200" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-[#1A1A1A]">No Ventures Found</h3>
              <p className="text-gray-400 font-light max-w-sm mx-auto">We couldn't find any listings matching your search. Try refining your parameters.</p>
              <button 
                onClick={() => {setFilter('All'); setSearch('');}}
                className="text-[#FF6600] font-black text-[10px] uppercase tracking-widest hover:underline pt-4"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sharing Modal Overlay */}
      {sharingPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-md transition-opacity duration-500"
            onClick={() => setSharingPost(null)}
          ></div>
          
          <div className="relative bg-white w-full max-w-lg rounded-[12px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-100">
            <div className="bg-[#1A1A1A] p-10 text-center relative">
              <button 
                onClick={() => setSharingPost(null)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="h-20 w-20 bg-[#FF6600] rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/30">
                <Share2 className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-white text-3xl font-black uppercase tracking-tighter mb-2">Share Royal Venture</h2>
              <p className="text-gray-400 text-sm font-light">Share <span className="text-white font-bold">{sharingPost.title}</span> with your network.</p>
            </div>

            <div className="p-10 space-y-10">
              {/* Direct Link */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 ml-1">Venture Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-xs font-mono text-gray-500 truncate select-all">
                    {window.location.origin}/venture/{sharingPost.id}
                  </div>
                  <button 
                    onClick={() => handleCopyLink(sharingPost.id)}
                    className={`px-6 py-4 rounded-[8px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                      copied ? 'bg-[#FF6600] text-white' : 'bg-[#FF6600] text-white hover:bg-[#FF6600]'
                    }`}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Social Grid */}
              <div className="grid grid-cols-3 gap-6">
                {shareOptions.map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => opt.handler(sharingPost)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-[12px] border border-gray-50 hover:bg-gray-50 hover:border-[#FF6600]/30 transition-all group ${opt.color}`}
                  >
                    <opt.icon className="h-8 w-8 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#FF6600]">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 bg-gray-50 text-center">
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Royal Hints Member Network</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
};

export default Marketplace;
