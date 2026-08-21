
import React, { useState } from 'react';
import { Product, User } from '../types';
import { ChevronLeft, Lock, ShieldCheck, CreditCard, Truck, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

interface CheckoutProps {
  cartItems: Product[];
  onNavigate: (page: any, tab?: string) => void;
  onComplete: () => void;
  onOrderPlaced?: (orderData: { 
    orderId: string; 
    trackingNumber: string; 
    items: Product[]; 
    shippingAddress: string;
    buyerUser?: User;
  }) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, onNavigate, onComplete, onOrderPlaced }) => {
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [generatedTracking, setGeneratedTracking] = useState('');
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [generatedUserId, setGeneratedUserId] = useState('');

  const [addressData, setAddressData] = useState({
    email: 'client.registry@royalhints.com',
    firstName: 'Royal Hints',
    lastName: 'Sterling',
    address: 'Lilongwe, Likuni NRC Campus',
    city: 'Lilongwe',
    postalCode: '265'
  });

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const shippingCost = shippingMethod === 'standard' ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleCompletePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const trk = `RH-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const ord = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const uniqueUserId = `RH-USR-${Math.floor(1000 + Math.random() * 9000)}`;
    
    setGeneratedTracking(trk);
    setGeneratedOrderId(ord);
    setGeneratedUserId(uniqueUserId);
    
    const buyerUser: User = {
      id: uniqueUserId,
      name: `${addressData.firstName} ${addressData.lastName}`.trim() || `Client ${uniqueUserId}`,
      email: addressData.email || `${uniqueUserId.toLowerCase()}@client.royalhints.com`,
      role: 'buyer',
      isAdmin: false,
      buyerUniqueId: uniqueUserId,
      activatedViaOrder: ord
    };

    if (onOrderPlaced) {
      onOrderPlaced({
        orderId: ord,
        trackingNumber: trk,
        items: [...cartItems],
        shippingAddress: `${addressData.address}, ${addressData.city} ${addressData.postalCode}`,
        buyerUser
      });
    }

    setOrderConfirmed(true);
    onComplete();
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 py-24 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-tr from-[#2563EB] to-blue-400 text-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30 ring-8 ring-blue-50">
          <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter mb-2 uppercase">Royal Order Confirmed</h1>
        <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Payment Verified • Auto-Activated Member Account</p>
        
        {/* Buyer Identity & Consignment Voucher */}
        <div className="bg-gradient-to-br from-gray-900 to-[#1A1A1A] text-white p-6 sm:p-8 rounded-2xl max-w-lg w-full mb-8 shadow-2xl border border-white/10 text-left font-mono text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-amber-400 font-black tracking-widest text-[11px] uppercase flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Auto-Generated Buyer Identity
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Active</span>
          </div>

          <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Your Unique User ID (Username):</span>
              <span className="font-black text-white text-base sm:text-lg tracking-wider text-amber-300">{generatedUserId}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block text-[10px] uppercase tracking-wider">Dashboard Status:</span>
              <span className="font-bold text-emerald-400">Activated</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between">
              <span className="text-gray-400">ORDER REFERENCE:</span>
              <span className="font-bold text-white">{generatedOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CONSIGNMENT TRACKING:</span>
              <span className="font-black text-[#60A5FA]">{generatedTracking}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">DISPATCH DESTINATION:</span>
              <span className="font-medium text-gray-200 truncate max-w-[240px]">{addressData.city}, {addressData.postalCode}</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-300 font-sans leading-relaxed pt-2 border-t border-white/10">
            No password required. Your unique ID <strong className="text-white">{generatedUserId}</strong> acts as your permanent buyer username, linking your order tracking, quotations, and concierge requests.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button 
            onClick={() => onNavigate('Dashboard', 'tracking')}
            className="flex-1 bg-[#2563EB] text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Truck className="h-4 w-4" /> Open Activated Dashboard
          </button>
          <button 
            onClick={() => onNavigate('Home')}
            className="bg-gray-100 text-gray-800 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            Return to Boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row">
      {/* Left Column: Forms */}
      <div className="flex-1 bg-white px-6 md:px-12 lg:px-24 py-12 md:py-24">
        <div className="max-w-xl ml-auto">
          <button 
            onClick={() => onNavigate('Dashboard')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#2563EB] transition-colors mb-12"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Bag
          </button>

          <div className="flex items-center gap-4 mb-8">
             <div className="h-10 w-10 bg-[#2563EB] rounded-lg flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">RH</div>
             <div>
               <h2 className="text-xl font-black uppercase tracking-tighter">Royal Hints Checkout</h2>
               <p className="text-xs text-gray-400 font-medium">Automatic Buyer ID activation with zero password friction</p>
             </div>
          </div>

          <form onSubmit={handleCompletePurchase} className="space-y-12">
            {/* Section 1: Contact */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A] flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-[8px] font-bold">01</span>
                Contact Registry
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <input 
                  required 
                  type="email"
                  value={addressData.email}
                  onChange={(e) => setAddressData({ ...addressData, email: e.target.value })}
                  placeholder="Email for order confirmation & unique ID activation" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium" 
                />
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                  <input type="checkbox" defaultChecked className="rounded-sm border-gray-300 text-[#2563EB] focus:ring-[#2563EB]" />
                  Auto-activate member dashboard and send consignment updates
                </div>
              </div>
            </section>

            {/* Section 2: Shipping */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A] flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-[8px] font-bold">02</span>
                Shipping Destination
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  required 
                  value={addressData.firstName}
                  onChange={(e) => setAddressData({ ...addressData, firstName: e.target.value })}
                  placeholder="First Name" 
                  className="bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium" 
                />
                <input 
                  required 
                  value={addressData.lastName}
                  onChange={(e) => setAddressData({ ...addressData, lastName: e.target.value })}
                  placeholder="Last Name" 
                  className="bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium" 
                />
                <input 
                  required 
                  value={addressData.address}
                  onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                  placeholder="Street Address" 
                  className="col-span-2 bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium" 
                />
                <input 
                  required 
                  value={addressData.city}
                  onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                  placeholder="City" 
                  className="bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium" 
                />
                <input 
                  required 
                  value={addressData.postalCode}
                  onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
                  placeholder="Postal Code" 
                  className="bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-medium" 
                />
              </div>

              <div className="mt-8 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logistics Method</p>
                 <div className="grid grid-cols-1 gap-3">
                   <label className={`flex justify-between items-center p-5 rounded-[12px] border cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-[#2563EB] bg-blue-50/40' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="hidden" />
                        <Truck className={`h-5 w-5 ${shippingMethod === 'standard' ? 'text-[#2563EB]' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">Standard Transit</p>
                          <p className="text-[10px] text-gray-400">3-5 Business Days</p>
                        </div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-[#2563EB]">Complimentary</span>
                   </label>
                   <label className={`flex justify-between items-center p-5 rounded-[12px] border cursor-pointer transition-all ${shippingMethod === 'priority' ? 'border-[#2563EB] bg-blue-50/40' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <input type="radio" name="shipping" checked={shippingMethod === 'priority'} onChange={() => setShippingMethod('priority')} className="hidden" />
                        <Zap className={`h-5 w-5 ${shippingMethod === 'priority' ? 'text-[#2563EB]' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">Priority Royal Express</p>
                          <p className="text-[10px] text-gray-400">Next Day Guaranteed</p>
                        </div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">$25.00</span>
                   </label>
                 </div>
              </div>
            </section>

            {/* Section 3: Payment */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A] flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-[8px] font-bold">03</span>
                Vault Transaction
              </h3>
              <div className="bg-[#1A1A1A] p-8 rounded-[12px] text-white space-y-6 relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB] opacity-15 blur-3xl -mr-16 -mt-16"></div>
                <div className="flex justify-between items-start relative z-10">
                  <CreditCard className="h-8 w-8 text-[#2563EB]" />
                  <div className="flex gap-2">
                    <div className="h-5 w-8 bg-white/10 rounded-sm"></div>
                    <div className="h-5 w-8 bg-white/10 rounded-sm"></div>
                  </div>
                </div>
                <div className="space-y-4 relative z-10">
                   <input required placeholder="CARD NUMBER" className="w-full bg-white/5 border border-white/10 rounded-[8px] px-4 py-4 text-sm font-mono tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-[#2563EB]" />
                   <div className="grid grid-cols-2 gap-4">
                     <input required placeholder="EXPIRY (MM/YY)" className="bg-white/5 border border-white/10 rounded-[8px] px-4 py-4 text-sm font-mono tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-[#2563EB]" />
                     <input required placeholder="CVC" className="bg-white/5 border border-white/10 rounded-[8px] px-4 py-4 text-sm font-mono tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-[#2563EB]" />
                   </div>
                </div>
              </div>
            </section>

            <button 
              type="submit"
              className="w-full bg-[#2563EB] text-white py-8 rounded-[12px] font-black text-sm uppercase tracking-[0.4em] hover:bg-[#1D4ED8] transition-all transform hover:-translate-y-2 shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 group"
            >
              Complete Order <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </button>

            <div className="flex justify-center items-center gap-8 pt-6">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Lock className="h-3 w-3 text-[#2563EB]" /> SSL Secured
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <ShieldCheck className="h-3 w-3 text-[#2563EB]" /> Fraud Protection
               </div>
            </div>
          </form>
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-[450px] bg-gray-50 border-l border-gray-100 px-6 md:px-12 py-12 md:py-24">
        <div className="sticky top-24 space-y-12">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A]">Purchase Summary</h3>
           
           <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {cartItems.map((item) => (
               <div key={item.id} className="flex gap-4 group">
                 <div className="h-20 w-20 bg-white rounded-[8px] border border-gray-100 overflow-hidden shrink-0">
                   <img src={item.image} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" />
                 </div>
                 <div className="flex-1 flex flex-col justify-center">
                    <p className="text-xs font-black uppercase tracking-widest mb-1">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.category}</p>
                    <p className="text-sm font-black mt-2 text-[#2563EB]">${item.price.toFixed(2)}</p>
                 </div>
               </div>
             ))}
           </div>

           <div className="pt-8 border-t border-gray-200 space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Subtotal</span>
                <span className="text-[#1A1A1A]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Shipping Fee</span>
                <span className="text-[#1A1A1A]">{shippingCost === 0 ? 'COMPLIMENTARY' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Estimated Tax (8%)</span>
                <span className="text-[#1A1A1A]">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-6 border-t border-gray-200">
                <span className="text-sm font-black uppercase tracking-[0.3em]">Total</span>
                <span className="text-4xl font-black tracking-tighter text-[#1A1A1A]">${total.toFixed(2)}</span>
              </div>
           </div>

           <div className="p-8 bg-white border border-gray-100 rounded-[12px] space-y-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">Sustainability Pledge</p>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Your Royal Hints order supports our carbon-neutral shipping initiative and luxury boutique artisan partners.
              </p>
           </div>
        </div>
      </div>

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
      `}</style>
    </div>
  );
};

export default Checkout;
