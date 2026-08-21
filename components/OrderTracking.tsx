import React, { useState } from 'react';
import { 
  Truck, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  ShoppingBag, 
  Sparkles,
  ArrowRight,
  Building,
  HelpCircle,
  PartyPopper
} from 'lucide-react';
import { ShipmentTracking } from '../types';

interface OrderTrackingProps {
  shipments: ShipmentTracking[];
  onNavigate?: (page: any) => void;
  onConfirmDelivery?: (trackingNumber: string) => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ 
  shipments = [],
  onNavigate,
  onConfirmDelivery
}) => {
  const [selectedTrackingCode, setSelectedTrackingCode] = useState<string>(
    shipments.length > 0 ? shipments[0].trackingNumber : ''
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmingDeliveryShipment, setConfirmingDeliveryShipment] = useState<ShipmentTracking | null>(null);
  const [justConfirmedSuccess, setJustConfirmedSuccess] = useState<string | null>(null);

  // Local fallback for delivery status if no external handler is provided
  const [localConfirmedIds, setLocalConfirmedIds] = useState<Record<string, boolean>>({});

  const activeShipment = shipments.find(s => s.trackingNumber === selectedTrackingCode) || shipments[0];

  const isShipmentDelivered = (shipment?: ShipmentTracking) => {
    if (!shipment) return false;
    return shipment.status === 'Delivered' || 
           shipment.deliveryConfirmedByCustomer === true || 
           !!localConfirmedIds[shipment.trackingNumber];
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleConfirmReceipt = (shipment: ShipmentTracking) => {
    if (onConfirmDelivery) {
      onConfirmDelivery(shipment.trackingNumber);
    }
    setLocalConfirmedIds(prev => ({ ...prev, [shipment.trackingNumber]: true }));
    setConfirmingDeliveryShipment(null);
    setJustConfirmedSuccess(shipment.trackingNumber);
    setTimeout(() => {
      setJustConfirmedSuccess(null);
    }, 4000);
  };

  const activeIsDelivered = isShipmentDelivered(activeShipment);

  const calculateOrderTotal = (shipment: ShipmentTracking) => {
    return shipment.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse"></span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[#2563EB]">
              Startup Delivery System
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1A1A1A]">Order Tracking</h2>
          <p className="text-gray-500 font-normal text-xs sm:text-base mt-1">
            Simple 3-step tracking: Order Placed → Payment Verified → Confirm Delivery Received.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto shrink-0">
          <div className="bg-gray-50 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-gray-200/60 text-center">
            <p className="text-base sm:text-xl font-black text-[#1A1A1A]">{shipments.length}</p>
            <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-gray-400">Total Orders</p>
          </div>
          <div className="bg-blue-50/70 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-blue-100 text-center">
            <p className="text-base sm:text-xl font-black text-[#2563EB]">
              {shipments.filter(s => !isShipmentDelivered(s)).length}
            </p>
            <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-[#2563EB]">In Progress</p>
          </div>
          <div className="bg-emerald-50/70 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-emerald-100 text-center">
            <p className="text-base sm:text-xl font-black text-emerald-700">
              {shipments.filter(s => isShipmentDelivered(s)).length}
            </p>
            <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-emerald-700">Received</p>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {justConfirmedSuccess && (
        <div className="bg-emerald-500 text-white p-4 sm:p-5 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <PartyPopper className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-black text-sm sm:text-base">Delivery Receipt Confirmed!</h4>
              <p className="text-xs text-white/90">
                Thank you for confirming receipt of your items. Your order is now officially complete.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setJustConfirmedSuccess(null)}
            className="text-white/80 hover:text-white text-xs font-bold px-3 py-1 bg-white/10 rounded-lg shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Quick selector tabs for multiple shipments */}
      {shipments.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto p-3 sm:p-4 bg-gray-50 rounded-2xl border border-gray-200/80 no-scrollbar">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0 mr-1">
            Your Orders:
          </span>
          {shipments.map((s) => {
            const delivered = isShipmentDelivered(s);
            const isSelected = activeShipment?.trackingNumber === s.trackingNumber;

            return (
              <button
                key={s.trackingNumber}
                onClick={() => setSelectedTrackingCode(s.trackingNumber)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">{s.orderId}</span>
                <span className={`text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full ${
                  delivered 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {delivered ? 'Delivered' : 'In Transit'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {activeShipment ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Main Shipment Card */}
          <div className="bg-white border-2 border-blue-600/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl shadow-blue-500/5 relative overflow-hidden space-y-6 sm:space-y-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            {/* Top Bar with Order Ref & Live Status */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-gray-100 relative z-10">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="text-[11px] sm:text-xs font-mono text-gray-500 font-bold uppercase tracking-wider">
                    Order Reference: {activeShipment.orderId}
                  </span>
                  <div className="h-3 w-px bg-gray-200"></div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>Placed {activeShipment.orderDate || activeShipment.dispatchedDate || 'Recently'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-[#1A1A1A] font-mono break-all">
                    {activeShipment.trackingNumber}
                  </h3>
                  <button 
                    onClick={() => handleCopy(activeShipment.trackingNumber)}
                    className="p-1.5 sm:p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#2563EB] transition-colors shrink-0"
                    title="Copy Tracking Number"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <div className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                  activeIsDelivered 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-blue-50 text-[#2563EB] border-blue-200'
                }`}>
                  <span className={`h-2 w-2 rounded-full bg-current ${activeIsDelivered ? '' : 'animate-ping'}`}></span>
                  {activeIsDelivered ? 'Step 3/3: Delivered & Confirmed' : 'Step 2/3: En Route (Awaiting Delivery)'}
                </div>
              </div>
            </div>

            {/* 3-STEP ORDER TRACKING PROGRESS BAR */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#2563EB]" /> 3-Step Verification Pipeline
                </h4>
                <span className="text-[10px] sm:text-xs font-bold text-gray-400">
                  {activeIsDelivered ? '3 of 3 Completed' : '2 of 3 Completed'}
                </span>
              </div>

              {/* Steps Visual Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                
                {/* STEP 1: ORDERED (Auto-Verified) */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Step 1
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">Auto-Verified</span>
                        </div>
                        <h5 className="font-black text-sm sm:text-base text-[#1A1A1A] mt-0.5">
                          1. Order Placed
                        </h5>
                      </div>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/70 text-xs text-gray-600 space-y-1">
                    <p className="font-medium text-[11px] text-emerald-900">
                      ✓ Order details & items logged instantly.
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      Logged on: {activeShipment.orderDate || activeShipment.dispatchedDate || 'Aug 17, 2026'}
                    </p>
                  </div>
                </div>

                {/* STEP 2: PAYMENT (Auto-Verified) */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Step 2
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">Auto-Verified</span>
                        </div>
                        <h5 className="font-black text-sm sm:text-base text-[#1A1A1A] mt-0.5">
                          2. Payment Paid
                        </h5>
                      </div>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/70 text-xs text-gray-600 space-y-1">
                    <p className="font-medium text-[11px] text-emerald-900">
                      ✓ Payment processed & cleared automatically.
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      Method: {activeShipment.paymentMethod || 'Instant Verification'}
                    </p>
                  </div>
                </div>

                {/* STEP 3: DELIVERED (Interactive Confirmation Button / Verified) */}
                <div className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-hidden border transition-all ${
                  activeIsDelivered 
                    ? 'bg-emerald-50/60 border-emerald-200' 
                    : 'bg-blue-50/70 border-blue-200 ring-2 ring-blue-500/20 shadow-sm'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                        activeIsDelivered 
                          ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                          : 'bg-[#2563EB] text-white shadow-blue-500/30 animate-pulse'
                      }`}>
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            activeIsDelivered 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-blue-200 text-blue-900'
                          }`}>
                            Step 3
                          </span>
                          <span className={`text-[10px] font-bold ${activeIsDelivered ? 'text-emerald-700' : 'text-[#2563EB]'}`}>
                            {activeIsDelivered ? 'Confirmed' : 'Action Required'}
                          </span>
                        </div>
                        <h5 className="font-black text-sm sm:text-base text-[#1A1A1A] mt-0.5">
                          3. Delivered
                        </h5>
                      </div>
                    </div>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                      activeIsDelivered 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white border-2 border-blue-400 text-blue-500'
                    }`}>
                      {activeIsDelivered ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-ping"></span>
                      )}
                    </div>
                  </div>

                  {/* Confirmation Content & Button */}
                  <div className={`pt-2 border-t text-xs space-y-2.5 ${activeIsDelivered ? 'border-emerald-200/70' : 'border-blue-200'}`}>
                    {activeIsDelivered ? (
                      <div className="space-y-1">
                        <p className="font-bold text-[11px] text-emerald-900 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Delivery confirmed by you!
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          Confirmed: {activeShipment.deliveryConfirmedAt || 'Receipt acknowledged'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[11px] text-gray-700 font-medium mb-2 leading-tight">
                          When your parcel has reached you, press the button below to confirm receipt:
                        </p>
                        <button
                          onClick={() => setConfirmingDeliveryShipment(activeShipment)}
                          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Check className="h-4 w-4 stroke-[3]" /> Confirm Product Received
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Delivery Destination & Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-gray-100 relative z-10 text-xs">
              <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl border border-gray-100 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#2563EB]" /> Delivery Destination
                </p>
                <p className="font-bold text-[#1A1A1A] text-xs sm:text-sm leading-snug">
                  {activeShipment.destination}
                </p>
              </div>

              <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl border border-gray-100 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-[#2563EB]" /> Courier Service
                </p>
                <p className="font-bold text-[#1A1A1A] text-xs sm:text-sm">
                  {activeShipment.carrier || 'Royal Express Courier'}
                </p>
                <p className="text-[10px] text-gray-400">{activeShipment.serviceType || 'Direct Priority Drop'}</p>
              </div>

              <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl border border-gray-100 space-y-1 sm:col-span-2 lg:col-span-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Order Status
                </p>
                <p className="font-bold text-emerald-700 text-xs sm:text-sm">
                  {activeIsDelivered ? 'Delivered & Completed' : 'In Transit (Awaiting Arrival)'}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  {activeShipment.items.length} item(s) • Total: ${calculateOrderTotal(activeShipment).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Package Contents Breakdown (NO PRODUCT ID) */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-base sm:text-lg font-black text-[#1A1A1A] flex items-center gap-2">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#2563EB]" /> Items in this Order
              </h4>
              <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-full">
                {activeShipment.items.length} {activeShipment.items.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {/* List of items without any Product ID */}
            <div className="divide-y divide-gray-100">
              {activeShipment.items.map((item, idx) => (
                <div key={idx} className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-gray-100 border border-gray-100 shrink-0" 
                    />
                    <div className="min-w-0">
                      {item.category && (
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      )}
                      <h5 className="text-xs sm:text-sm font-bold text-[#1A1A1A] line-clamp-1 mt-0.5">
                        {item.name}
                      </h5>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Quantity: <span className="font-bold text-[#1A1A1A]">{item.quantity}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:block sm:text-right border-t sm:border-0 pt-2 sm:pt-0 border-gray-50">
                    <span className="text-[11px] text-gray-400 sm:hidden">Price:</span>
                    <div>
                      <p className="text-sm sm:text-base font-black text-[#1A1A1A] font-mono">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-gray-400 font-mono">
                          (${item.price.toFixed(2)} each)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total Footer */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/70 p-3.5 sm:p-4 rounded-xl">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total Order Valuation</p>
                <p className="text-xs text-gray-500">Paid in full upon checkout</p>
              </div>
              <div className="text-right">
                <p className="text-base sm:text-xl font-black text-[#1A1A1A] font-mono">
                  ${calculateOrderTotal(activeShipment).toFixed(2)}
                </p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                  ✓ Verified Payment
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 sm:p-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h4 className="text-base sm:text-lg font-black text-[#1A1A1A]">No Orders Found</h4>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Please enter a valid order reference number or tracking code.</p>
        </div>
      )}

      {/* CONFIRM DELIVERY RECEIVED MODAL */}
      {confirmingDeliveryShipment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-7 shadow-2xl space-y-4 sm:space-y-5 border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="h-10 w-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-[#1A1A1A]">
                  Confirm Product Received?
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">Order Ref: {confirmingDeliveryShipment.orderId}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-gray-600">
              <p>
                Have you received the package containing <strong>{confirmingDeliveryShipment.items.length} item(s)</strong> at your address?
              </p>
              
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 text-xs">
                <p className="font-bold text-[#1A1A1A]">Destination:</p>
                <p className="text-gray-500">{confirmingDeliveryShipment.destination}</p>
              </div>

              <p className="text-[11px] text-gray-400">
                Pressing confirm completes Step 3 in the tracking pipeline and marks your order as fully delivered.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingDeliveryShipment(null)}
                className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                Not Yet
              </button>
              <button
                type="button"
                onClick={() => handleConfirmReceipt(confirmingDeliveryShipment)}
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4 stroke-[3]" /> Yes, Received!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
