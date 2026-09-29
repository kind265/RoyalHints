
import React, { useState } from 'react';
import { Send, Twitter, Instagram, Facebook } from 'lucide-react';

interface FooterProps { onNavigate?: (page: any, tab?: string) => void; }

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      setError('Email is required');
      setSuccess(false);
    } else if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setSuccess(false);
    } else {
      setError('');
      setSuccess(true);
      setEmail('');
      // In a real app, you would call an API here
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <footer className="bg-[#1A1A1A] text-white pt-24 pb-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Col */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tighter text-white">Royal Marketplace</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
               Browse quality products at best prices.
            </p>
            <div className="flex gap-4">
              <button className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white transition-all shadow-sm">
                <Twitter className="h-4 w-4" />
              </button>
              <button className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white transition-all shadow-sm">
                <Instagram className="h-4 w-4" />
              </button>
              <button className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white transition-all shadow-sm">
                <Facebook className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-8 text-[#2563EB]">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              {['Books', 'Spare Parts', 'Fabric', 'Fashion'].map((category) => <li key={category}><button onClick={() => onNavigate?.('Home')} className="hover:text-white transition-colors">{category}</button></li>)}
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-8 text-[#2563EB]">Customer Care</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><button onClick={() => onNavigate?.('Privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate?.('Terms')} className="hover:text-white transition-colors">Terms and Conditions</button></li>
              <li><button onClick={() => onNavigate?.('OrderTracking')} className="hover:text-white transition-colors">Track My Older</button></li>
              <li><button onClick={() => onNavigate?.('Contact')} className="hover:text-white transition-colors">Support</button></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-8 text-[#2563EB]">Royal Ecosystem</h4>
            <p className="text-gray-400 text-sm mb-6">Join the royal registry for verified arrivals.</p>
            <form className="relative" onSubmit={handleSubmit} noValidate>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter email" 
                  className={`w-full bg-white/5 border rounded-[8px] px-4 py-4 text-sm focus:outline-none transition-colors ${
                    error ? 'border-red-500' : 'border-white/10 focus:border-[#2563EB]'
                  }`}
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-2 h-10 w-10 bg-[#2563EB] rounded-[8px] flex items-center justify-center hover:bg-[#1D4ED8] transition-colors shadow-md"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-[#2563EB] text-[10px] mt-2 font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                  Welcome to Royal Hints!
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          <p>© 2026 ROYAL HINTS INC. ALL RIGHTS RESERVED. | Powered by Arkode Tech</p>
          <div className="flex items-center gap-6 sm:gap-8">
            <button onClick={() => onNavigate?.('Privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate?.('Terms')} className="hover:text-white transition-colors">Terms and Conditions</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
