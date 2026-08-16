
import React, { useState } from 'react';
import { Product } from '../types';
// Added 'Zap' to the lucide-react imports to fix the "Cannot find name 'Zap'" error on line 112
import { ChevronLeft, Lock, ShieldCheck, CreditCard, Truck, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

interface CheckoutProps {
  cartItems: Product[];
  guestId?: string | null;
  onGuestIdChange?: (guestId: string | null) => void;
  onNavigate: (page: any) => void;
  onComplete: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, guestId, onGuestIdChange, onNavigate, onComplete }) => {
  const [step, setStep] = useState(1);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paychangu'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const shippingCost = shippingMethod === 'standard' ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleCompletePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setSubmitError('Your bag is empty. Add items before checking out.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      let currentGuestId = guestId;

      if (!currentGuestId) {
        const guestResponse = await fetch('http://localhost:5000/api/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        const guestData = await guestResponse.json();

        if (!guestResponse.ok || !guestData.guestId) {
          throw new Error(guestData.message || 'Unable to create guest customer');
        }

        currentGuestId = guestData.guestId;
        localStorage.setItem('royalhints_guest_id', currentGuestId);
        if (onGuestIdChange) onGuestIdChange(currentGuestId);
      }

      const cartPayload = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: 1,
      }));

      const cartResponse = await fetch(`http://localhost:5000/api/guest/${currentGuestId}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartPayload }),
      });

      const cartData = await cartResponse.json();
      if (!cartResponse.ok) {
        throw new Error(cartData.message || 'Unable to save guest cart data');
      }

      if (paymentMethod === 'paychangu') {
        const paymentResponse = await fetch('http://localhost:5000/api/payments/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestId: currentGuestId,
            items: cartPayload,
            amount: total,
            email: 'guest@royalhints.com',
            firstName: 'Guest',
            lastName: 'Customer',
          }),
        });

        const paymentData = await paymentResponse.json();
        if (!paymentResponse.ok) {
          throw new Error(paymentData.message || 'Unable to start PayChangu payment');
        }

        if (!paymentData.checkoutUrl) {
          throw new Error('PayChangu did not return a checkout URL');
        }

        window.location.href = paymentData.checkoutUrl;
        onComplete();
        return;
      }

      const orderResponse = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: currentGuestId,
          items: cartPayload,
          totalAmount: total,
          status: 'paid',
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Unable to place guest order');
      }

      setOrderConfirmed(true);
      onComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while placing your order.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-24 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="h-24 w-24 bg-[#FF6600] text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/30">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tighter mb-4 uppercase">Order Placed</h1>
        <p className="text-gray-500 text-lg font-light max-w-md mb-12">
          Your purchase is confirmed. We’ll send your order update and dispatch details as soon as your items are on the way.
        </p>
        <button 
          onClick={() => onNavigate('Home')}
          className="bg-[#FF6600] text-white px-12 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#FF6600] transition-all transform hover:-translate-y-1 shadow-2xl shadow-orange-500/20"
        >
          Return to Boutique
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row">
      {/* Left Column: Forms */}
      <div className="flex-1 bg-white px-6 md:px-12 lg:px-24 py-12 md:py-24">
        <div className="max-w-xl ml-auto">
          <button 
            onClick={() => onNavigate('Home')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#FF6600] transition-colors mb-12"
          >
            <ChevronLeft className="h-4 w-4" /> Continue Shopping
          </button>

          <div className="flex items-center gap-4 mb-12">
             <div className="h-10 w-10 bg-[#FF6600] rounded-lg flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20">RH</div>
             <h2 className="text-xl font-black uppercase tracking-tighter">Royal Hints Checkout</h2>
          </div>

          <form onSubmit={handleCompletePurchase} className="space-y-12">
            {/* Section 1: Contact */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A] flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-gray-100 text-[#FF6600] flex items-center justify-center text-[8px] font-bold">01</span>
                Contact Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <input required placeholder="Email for order updates" className="w-full bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all" />
              </div>
            </section>

            {/* Section 2: Shipping */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A] flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-gray-100 text-[#FF6600] flex items-center justify-center text-[8px] font-bold">02</span>
                Shipping Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="First Name" className="bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all" />
                <input required placeholder="Last Name" className="bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all" />
                <input required placeholder="Street Address" className="col-span-2 bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all" />
                <input required placeholder="City" className="bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all" />
                <input required placeholder="Postal Code" className="bg-gray-50 border border-gray-100 rounded-[8px] px-6 py-4 text-sm focus:outline-none focus:border-[#FF6600] focus:bg-white transition-all" />
              </div>

              <div className="mt-8 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logistics Method</p>
                 <div className="grid grid-cols-1 gap-3">
                   <label className={`flex justify-between items-center p-5 rounded-[12px] border cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-[#FF6600] bg-gray-50/40' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="hidden" />
                        <Truck className={`h-5 w-5 ${shippingMethod === 'standard' ? 'text-[#FF6600]' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">Standard Transit</p>
                          <p className="text-[10px] text-gray-400">3-5 Business Days</p>
                        </div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-[#FF6600]">Complimentary</span>
                   </label>
                   <label className={`flex justify-between items-center p-5 rounded-[12px] border cursor-pointer transition-all ${shippingMethod === 'priority' ? 'border-[#FF6600] bg-gray-50/40' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <input type="radio" name="shipping" checked={shippingMethod === 'priority'} onChange={() => setShippingMethod('priority')} className="hidden" />
                        <Zap className={`h-5 w-5 ${shippingMethod === 'priority' ? 'text-[#FF6600]' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">Priority Royal Express</p>
                          <p className="text-[10px] text-gray-400">Next Day Guaranteed</p>
                        </div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">MWK 25,000</span>
                   </label>
                 </div>
              </div>
            </section>

            {/* Section 3: Payment */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A] flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-gray-100 text-[#FF6600] flex items-center justify-center text-[8px] font-bold">03</span>
                Payment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`rounded-[10px] border px-4 py-3 text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#FF6600] bg-[#FFF4EB] text-[#1A1A1A]'
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.25em]">Card</div>
                  <div className="text-xs mt-1">Visa / Mastercard</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paychangu')}
                  className={`rounded-[10px] border px-4 py-3 text-left transition-all ${
                    paymentMethod === 'paychangu'
                      ? 'border-[#FF6600] bg-[#FFF4EB] text-[#1A1A1A]'
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.25em]">PayChangu</div>
                  <div className="text-xs mt-1">Mobile money + card</div>
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <div className="bg-[#1A1A1A] p-8 rounded-[12px] text-white space-y-6 relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6600] opacity-15 blur-3xl -mr-16 -mt-16"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <CreditCard className="h-8 w-8 text-[#FF6600]" />
                    <div className="flex gap-2">
                      <div className="h-5 w-8 bg-white/10 rounded-sm"></div>
                      <div className="h-5 w-8 bg-white/10 rounded-sm"></div>
                    </div>
                  </div>
                  <div className="space-y-4 relative z-10">
                     <input required placeholder="CARD NUMBER" className="w-full bg-white/5 border border-white/10 rounded-[8px] px-4 py-4 text-sm font-mono tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-[#FF6600]" />
                     <div className="grid grid-cols-2 gap-4">
                       <input required placeholder="EXPIRY (MM/YY)" className="bg-white/5 border border-white/10 rounded-[8px] px-4 py-4 text-sm font-mono tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-[#FF6600]" />
                       <input required placeholder="CVC" className="bg-white/5 border border-white/10 rounded-[8px] px-4 py-4 text-sm font-mono tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-[#FF6600]" />
                     </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[12px] border border-[#FF6600]/20 bg-[#FFF4EB] p-6 text-sm text-[#1A1A1A]">
                  <p className="font-black uppercase tracking-[0.2em] text-[10px] text-[#FF6600] mb-2">PayChangu checkout</p>
                  <p className="leading-relaxed text-gray-700">
                    You will be redirected to the secure PayChangu payment page to complete your purchase with card or mobile money.
                  </p>
                </div>
              )}
            </section>

            {submitError && (
              <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600">
                {submitError}
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FF6600] text-white py-8 rounded-[12px] font-black text-sm uppercase tracking-[0.4em] hover:bg-[#FF6600] transition-all transform hover:-translate-y-2 shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-4 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'} <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </button>

            <div className="flex justify-center items-center gap-8 pt-6">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Lock className="h-3 w-3 text-[#FF6600]" /> SSL Secured
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <ShieldCheck className="h-3 w-3 text-[#FF6600]" /> Fraud Protection
               </div>
            </div>
          </form>
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-[450px] bg-gray-50 border-l border-gray-100 px-6 md:px-12 py-12 md:py-24">
        <div className="sticky top-24 space-y-12">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A]">Order Summary</h3>
           
           <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {cartItems.map((item) => (
               <div key={item.id} className="flex gap-4 group">
                 <div className="h-20 w-20 bg-white rounded-[8px] border border-gray-100 overflow-hidden shrink-0">
                   <img src={item.image} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" />
                 </div>
                 <div className="flex-1 flex flex-col justify-center">
                    <p className="text-xs font-black uppercase tracking-widest mb-1">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.category}</p>
                    <p className="text-sm font-black mt-2 text-[#FF6600]">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(item.price)}</p>
                 </div>
               </div>
             ))}
           </div>

           <div className="pt-8 border-t border-gray-200 space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Subtotal</span>
                <span className="text-[#FF6600]">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Shipping Fee</span>
                <span className="text-[#FF6600]">{shippingCost === 0 ? 'MWK 0' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Estimated Tax (8%)</span>
                <span className="text-[#FF6600]">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(tax)}</span>
              </div>
              <div className="flex justify-between items-end pt-6 border-t border-gray-200">
                <span className="text-sm font-black uppercase tracking-[0.3em]">Total</span>
                <span className="text-4xl font-black tracking-tighter text-[#FF6600]">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(total)}</span>
              </div>
           </div>

           <div className="p-8 bg-white border border-gray-100 rounded-[12px] space-y-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF6600]">Sustainability Pledge</p>
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
