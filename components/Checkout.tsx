
import React, { useState, useEffect } from 'react';
import { Product, ShipmentTracking, User } from '../types';
import { ChevronLeft, Lock, ShieldCheck, CreditCard, Truck, CheckCircle2, ArrowRight, Zap, Landmark, X, Minus, Plus } from 'lucide-react';
import { apiClient } from '../backend/api-client';

interface CheckoutProps {
  cartItems: Product[];
  user?: User | null;
  onNavigate: (page: any, tab?: string) => void;
  onComplete: () => void;
  onRemoveFromCart?: (id: string) => void;
  onUpdateCartQuantity?: (id: string, sku: string, change: number) => void;
  onPaymentCompleted?: (shipment: ShipmentTracking) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, user, onNavigate, onComplete, onRemoveFromCart, onUpdateCartQuantity, onPaymentCompleted }) => {
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paychangu'>('card');
  const [isPayChanguLoading, setIsPayChanguLoading] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<'success' | 'cancelled' | 'pending' | null>(null);
  const [gatewayMessage, setGatewayMessage] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [generatedTracking, setGeneratedTracking] = useState('');
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [paidShipment, setPaidShipment] = useState<ShipmentTracking | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const [addressData, setAddressData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const shippingCost = shippingMethod === 'standard' ? 0 : 25;
  const total = subtotal + shippingCost;

  const formatCurrency = (value: number) => `MWK ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const status = params.get('status')?.toLowerCase();
    const reference = params.get('tx_ref') || params.get('reference');

    if (status === 'cancelled' || status === 'failed' || payment === 'cancelled' || payment === 'failed') {
      setGatewayStatus('cancelled');
      setGatewayMessage('Payment was not completed. You can return to checkout and try again.');
      return;
    }

    if (!reference) {
      if (payment === 'return' || status === 'success' || payment === 'success') {
        setGatewayStatus('pending');
        setGatewayMessage('Payment reference was not returned. Please contact support before trying to pay again.');
      }
      return;
    }

    setIsVerifyingPayment(true);
    apiClient.completePayChanguCheckout(reference).then(shipment => {
      if (!shipment) {
        setGatewayStatus('pending');
        setGatewayMessage('We could not verify this payment yet. Please contact support with your payment reference.');
        return;
      }
      setPaidShipment(shipment);
      setGeneratedTracking(shipment.trackingNumber);
      setGeneratedOrderId(shipment.orderId);
      setGatewayStatus('success');
      setGatewayMessage('PayChangu confirmed your payment. Your order receipt and tracking ID are now ready.');
      setOrderConfirmed(true);
      onPaymentCompleted?.(shipment);
      onComplete();
    }).finally(() => setIsVerifyingPayment(false));
  }, []);

  const handleHostedPayment = async () => {
    const checkedAmount = Number((total || 0).toFixed(2));
    const firstName = addressData.firstName || 'Royal';
    const lastName = addressData.lastName || 'Hints';
    const email = addressData.email || 'customer@royalhints.com';

    setIsPayChanguLoading(true);

    try {
      const response = await fetch('/api/payments/paychangu/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: checkedAmount,
          email,
          phone: '',
          firstName,
          lastName,
          reference: `RH-${Date.now()}`,
          callbackUrl: `${window.location.origin}/api/payments/paychangu/callback`,
          returnUrl: `${window.location.origin}/checkout?payment=return`,
          metadata: {
            orderType: 'checkout',
            currency: 'MWK',
            paymentMethod,
            checkoutOrder: {
              customer: {
                email: addressData.email,
                firstName: addressData.firstName,
                lastName: addressData.lastName
              },
              destination: `${addressData.address}, ${addressData.city} ${addressData.postalCode}`,
              items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                image: item.image,
                sku: item.sku,
                price: item.price,
                quantity: item.quantity || 1
              }))
            }
          }
        })
      });

      const json = await response.json();

      if (!response.ok || !json.success || !json.data?.redirectUrl) {
        throw new Error(json.message || 'The card payment session could not be created.');
      }

      window.location.href = json.data.redirectUrl;
      return;
    } catch (error: any) {
      window.alert(error?.message || 'Card payment could not be started. Please try again.');
    } finally {
      setIsPayChanguLoading(false);
    }
  };

  const handleCompletePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    await handleHostedPayment();
  };

  if (isVerifyingPayment) {
    return <div className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center"><span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563EB]" /><h1 className="mt-6 text-2xl font-black text-[#172033]">Verifying your payment</h1><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">We are checking the transaction directly with PayChangu before creating your order ID.</p></div>;
  }

  if (gatewayStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 py-24 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/30 ring-8 ring-orange-50">
          <X className="h-10 w-10 sm:h-12 sm:w-12" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter mb-2 uppercase">Payment Cancelled</h1>
        <p className="text-sm text-gray-600 max-w-lg mb-8">{gatewayMessage}</p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => setGatewayStatus(null)}
            className="flex-1 bg-[#2563EB] text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-xl shadow-blue-500/20"
          >
            Try Again
          </button>
          <button
            onClick={() => onNavigate('Home')}
            className="bg-gray-100 text-gray-800 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (orderConfirmed && gatewayStatus === 'success' && paidShipment) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 py-24 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-tr from-[#2563EB] to-blue-400 text-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30 ring-8 ring-blue-50">
          <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tighter mb-2 uppercase">Royal Order Confirmed</h1>
  <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">{gatewayStatus === 'success' ? 'Payment Verified • Order Processing' : 'Payment Verified • Order Processing'}</p>
        
        {/* Buyer Identity & Consignment Voucher */}
        <div className="bg-gradient-to-br from-gray-900 to-[#1A1A1A] text-white p-6 sm:p-8 rounded-2xl max-w-lg w-full mb-8 shadow-2xl border border-white/10 text-left font-mono text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-blue-200 font-black tracking-widest text-[11px] uppercase flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Paid order receipt
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Active</span>
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
            {gatewayMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button 
            onClick={() => onNavigate('OrderTracking')}
            className="flex-1 bg-[#2563EB] text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Truck className="h-4 w-4" /> Track Your Order
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
               <p className="text-xs text-gray-400 font-medium">Secure checkout for registered Royal Hints customers</p>
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
                  Send order confirmation and delivery updates
                </div>
                <p className="text-xs leading-5 text-gray-500">
                  Item payment is processed online. Delivery fees are paid directly to the courier upon delivery.
                </p>
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
                          <p className="text-[10px] text-gray-400">3 - 5 Business Days</p>
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
                      <span className="text-xs font-black uppercase tracking-widest">MWK10000.00</span>
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

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#2563EB] bg-blue-50/40' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-[#2563EB]" />
                    <CreditCard className="h-5 w-5 text-[#2563EB]" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Card Payment</p>
                      <p className="text-[10px] text-gray-500">Visa / Mastercard / Bank Card</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">USD / MWK</span>
                </label>

                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'paychangu' ? 'border-[#2563EB] bg-blue-50/40' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'paychangu'} onChange={() => setPaymentMethod('paychangu')} className="accent-[#2563EB]" />
                    <Landmark className="h-5 w-5 text-[#2563EB]" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">PayChangu</p>
                      <p className="text-[10px] text-gray-500">Malawi Kwacha payment gateway</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">MWK</span>
                </label>
              </div>

              {paymentMethod === 'card' ? (
                <div className="bg-[#1A1A1A] p-8 rounded-[12px] text-white space-y-6 relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB] opacity-15 blur-3xl -mr-16 -mt-16"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <CreditCard className="h-8 w-8 text-[#2563EB]" />
                    <div className="flex gap-2">
                      <div className="h-5 w-8 bg-white/10 rounded-sm"></div>
                      <div className="h-5 w-8 bg-white/10 rounded-sm"></div>
                    </div>
                  </div>
                  <div className="relative z-10 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-gray-300">
                    You will be redirected to our secure PayChangu card checkout. Your card details are entered directly on the payment provider&apos;s secure page and are never stored by Royal Hints.
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] p-6 rounded-[12px] text-white border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Landmark className="h-7 w-7 text-emerald-400" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">PayChangu</p>
                      <p className="text-[10px] text-slate-300">Secure Malawi Kwacha checkout</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-4 text-sm leading-relaxed text-slate-200">
                    You will be redirected to PayChangu to complete payment in MWK. The amount due is <span className="font-black text-white">{formatCurrency(total)}</span>.
                  </div>
                </div>
              )}
            </section>

            <button 
              type="submit"
              disabled={isPayChanguLoading}
              className="w-full bg-[#2563EB] text-white py-8 rounded-[12px] font-black text-sm uppercase tracking-[0.4em] hover:bg-[#1D4ED8] transition-all transform hover:-translate-y-2 shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPayChanguLoading ? 'Opening secure checkout...' : paymentMethod === 'paychangu' ? 'Pay with PayChangu' : 'Pay securely by card'} <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
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
      <div className="w-full lg:w-[450px] bg-gray-50 border-l border-gray-100 px-6 md:px-12 py-12 md:py-24 order-first lg:order-none">
        <div className="sticky top-24 space-y-12">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A]">Purchase Summary</h3>
           
           <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {cartItems.map((item) => (
                 <div key={item.id} className="flex gap-4 group">
                 <div className="h-20 w-20 bg-white rounded-[8px] border border-gray-100 overflow-hidden shrink-0">
                   <img src={item.image} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" />
                 </div>
                 <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-widest mb-1">{item.name}</p>
                      <button type="button" onClick={() => onRemoveFromCart?.(item.id)} aria-label={`Remove ${item.name} from cart`} title="Remove from cart" className="shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.category}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-black text-[#2563EB]">{formatCurrency(item.price * (item.quantity || 1))}</p>
                      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
                        <button type="button" onClick={() => onUpdateCartQuantity?.(item.id, item.sku, -1)} aria-label={`Subtract one ${item.name}`} className="rounded-md p-1 text-gray-500 transition hover:bg-blue-50 hover:text-[#2563EB]"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="min-w-5 text-center text-xs font-black">{item.quantity || 1}</span>
                        <button type="button" onClick={() => onUpdateCartQuantity?.(item.id, item.sku, 1)} aria-label={`Add one ${item.name}`} className="rounded-md p-1 text-gray-500 transition hover:bg-blue-50 hover:text-[#2563EB]"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                 </div>
               </div>
             ))}
           </div>

           <div className="pt-8 border-t border-gray-200 space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Subtotal</span>
                <span className="text-[#1A1A1A]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                <span>Shipping Fee</span>
                <span className="text-[#1A1A1A]">{shippingCost === 0 ? 'COMPLIMENTARY' : formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between items-end pt-6 border-t border-gray-200">
                <span className="text-sm font-black uppercase tracking-[0.3em]">Total</span>
                <span className="text-4xl font-black tracking-tighter text-[#1A1A1A]">{formatCurrency(total)}</span>
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
