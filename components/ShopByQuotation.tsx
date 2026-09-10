import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Zap, 
  PackageCheck, 
  ShoppingCart, 
  ChevronRight, 
  FileCheck, 
  Building2, 
  Printer, 
  Layers, 
  Wrench, 
  BookOpen, 
  Shirt, 
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { QuotationRequest, ProductCategory, User } from '../types';

interface ShopByQuotationProps {
  quotations: QuotationRequest[];
  onAddQuotation: (quote: Omit<QuotationRequest, 'id' | 'quoteNumber' | 'submittedAt' | 'status'>) => void;
  onAcceptQuoteToCart: (quote: QuotationRequest) => void;
  user: User;
}

const QUOTATION_CATEGORIES: (ProductCategory | 'Industrial & Bespoke')[] = [
  'Books',
  'Spare Parts',
  'Fabric',
  'Fashion'
];

export const ShopByQuotation: React.FC<ShopByQuotationProps> = ({
  quotations = [],
  onAddQuotation,
  onAcceptQuoteToCart,
  user
}) => {
  const [subTab, setSubTab] = useState<'request' | 'ledger'>('request');
  const [selectedQuoteSlip, setSelectedQuoteSlip] = useState<QuotationRequest | null>(null);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: QUOTATION_CATEGORIES[0],
    estimatedQuantity: 1,
    targetBudget: '',
    urgency: 'Standard (5-7 Days)' as QuotationRequest['urgency'],
    specifications: '',
    deliveryLocation: '',
    contactNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddQuotation({
      ...formData,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    });

    setIsSuccessSubmitted(true);
    setTimeout(() => {
      setIsSuccessSubmitted(false);
      setSubTab('ledger');
    }, 2000);

    setFormData({
      title: '',
      category: QUOTATION_CATEGORIES[0],
      estimatedQuantity: 1,
      targetBudget: '',
      urgency: 'Standard (5-7 Days)',
      specifications: '',
      deliveryLocation: '',
      contactNumber: ''
    });
  };

  const handleAccept = (quote: QuotationRequest) => {
    onAcceptQuoteToCart(quote);
    setAcceptedId(quote.id);
    setTimeout(() => setAcceptedId(null), 2500);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Books': return <BookOpen className="h-4 w-4" />;
      case 'Spare Parts': return <Wrench className="h-4 w-4" />;
      case 'Fabric': return <Layers className="h-4 w-4" />;
      case 'Fashion': return <Shirt className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: QuotationRequest['status']) => {
    switch (status) {
      case 'Quote Ready':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Quote Ready ($ Offer)
          </span>
        );
      case 'Approved & Locked':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
            In Bag
          </span>
        );
      case 'Declined':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 shrink-0">
            Declined
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shrink-0">
            <Clock className="h-3 w-3" />
            Under Valuation Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[#2563EB]">
              Institutional & Bulk Procurement
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1A1A1A]">Shop by Quotation</h2>
          <p className="text-gray-400 font-light text-xs sm:text-base mt-1">
            Request official price quotations, bulk production runs, technical fabric mill orders, and custom spare part batches.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 sm:flex items-center bg-gray-100 p-1 sm:p-1.5 rounded-xl shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('request')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-black uppercase tracking-wider text-center transition-all ${
              subTab === 'request'
                ? 'bg-white text-[#1A1A1A] shadow-sm'
                : 'text-gray-500 hover:text-[#1A1A1A]'
            }`}
          >
            Request Quote
          </button>
          <button
            onClick={() => setSubTab('ledger')}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              subTab === 'ledger'
                ? 'bg-white text-[#1A1A1A] shadow-sm'
                : 'text-gray-500 hover:text-[#1A1A1A]'
            }`}
          >
            My Quotes
            <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold">
              {quotations.length}
            </span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: REQUEST QUOTATION FORM */}
      {subTab === 'request' && (
        <div className="space-y-6 sm:space-y-8">
          {isSuccessSubmitted ? (
            <div className="bg-blue-50/60 border-2 border-[#2563EB]/20 rounded-2xl p-8 sm:p-16 text-center space-y-4 sm:space-y-6 animate-in zoom-in-95 duration-500">
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-[#2563EB] text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-500/30">
                <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A] uppercase tracking-tight">
                  Quotation Proposal Submitted
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-xs sm:text-sm">
                  Your specifications have been routed to the Royal Procurement Desk. You will receive an official itemized quotation breakdown shortly.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Informational Guidance */}
              <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-transparent p-4 sm:p-6 rounded-2xl border border-blue-100/80 flex items-start gap-3 sm:gap-4">
                <div className="h-9 w-9 sm:h-10 sm:w-10 bg-[#2563EB] text-white rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-black uppercase tracking-wider text-[#1A1A1A]">
                    How Royal Hints Quotation Works
                  </p>
                  <p className="text-gray-600 leading-relaxed font-medium text-[11px] sm:text-xs">
                    Submit your target volume and technical specifications. Our certified supply network will prepare an authenticated quotation with volume pricing, guaranteed lead time, and insured delivery options.
                  </p>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Project Title */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Quotation Subject / Project Reference *
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-sm sm:text-base focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Sector Category */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Commodity Sector *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all cursor-pointer"
                  >
                    {QUOTATION_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Volume / Quantity */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Estimated Quantity / Units Required *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.estimatedQuantity}
                    onChange={(e) => setFormData({ ...formData, estimatedQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                  />
                </div>

                {/* Budget Range */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Target Budget Allocation
                  </label>
                  <input
                    value={formData.targetBudget}
                    onChange={(e) => setFormData({ ...formData, targetBudget: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                  />
                </div>

                {/* Sourcing Urgency */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Required Delivery Window
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all cursor-pointer"
                  >
                    <option>Standard (5-7 Days)</option>
                    <option>Express (48 Hours)</option>
                    <option>Rush Critical (24 Hours)</option>
                  </select>
                </div>

                {/* Technical Specifications */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Detailed Technical Specifications & Quality Criteria *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Specify dimensions, quality grade, binding materials, tolerances, certifications (e.g. Ti-6Al-4V, Grade 6A Mulberry Silk, FSC Leather)..."
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-medium text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Delivery Location */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Delivery Location
                  </label>
                  <input
                    required
                    placeholder="Enter your delivery location"
                    value={formData.deliveryLocation}
                    onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                  />
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Direct Contact Telephone
                  </label>
                  <input
                    required
                    placeholder="+265 991 234 567"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-[#2563EB] text-white py-4 sm:py-5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] hover:bg-[#1D4ED8] transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5"
              >
                <Send className="h-4 w-4" /> Quotation Request
              </button>
            </form>
          )}
        </div>
      )}

      {/* SUBTAB 2: MY QUOTATIONS & PRICING SLIPS LEDGER */}
      {subTab === 'ledger' && (
        <div className="space-y-6">
          {quotations.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {quotations.map((quote) => (
                <div 
                  key={quote.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 md:p-8 hover:border-blue-300 hover:shadow-xl transition-all space-y-4 sm:space-y-6"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="p-1.5 bg-blue-50 text-[#2563EB] rounded-md">
                          {getCategoryIcon(quote.category)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">
                          {quote.category}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono text-gray-400 font-bold ml-1">
                          #{quote.quoteNumber}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-xl font-black text-[#1A1A1A]">{quote.title}</h4>
                    </div>

                    {getStatusBadge(quote.status)}
                  </div>

                  {/* Specification Breakdown Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 bg-gray-50/70 p-3 sm:p-4 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black text-gray-400">Target Volume</p>
                      <p className="font-bold text-[#1A1A1A] mt-0.5 text-xs sm:text-sm">{quote.estimatedQuantity} Units</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black text-gray-400">Budget Range</p>
                      <p className="font-bold text-[#1A1A1A] mt-0.5 text-xs sm:text-sm">{quote.targetBudget}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black text-gray-400">Delivery Window</p>
                      <p className="font-bold text-[#1A1A1A] mt-0.5 text-xs sm:text-sm">{quote.urgency}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black text-gray-400">Destination</p>
                      <p className="font-bold text-[#1A1A1A] mt-0.5 truncate text-xs sm:text-sm">{quote.deliveryLocation}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 font-medium leading-relaxed bg-white p-3 rounded-lg border border-gray-100">
                    <span className="font-bold text-gray-800">Specs: </span> {quote.specifications}
                  </p>

                  {/* Official Admin Prepared Quote Card if available */}
                  {quote.adminQuote ? (
                    <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4 sm:p-6 rounded-2xl border-2 border-blue-200/80 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#2563EB]">
                            Verified Official Quotation
                          </span>
                          <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                            <p className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight font-mono">
                              ${quote.adminQuote.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                            <span className="text-xs text-gray-500 font-bold">
                              (MWK {quote.adminQuote.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / unit)
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <button
                            onClick={() => setSelectedQuoteSlip(quote)}
                            className="px-3.5 sm:px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Printer className="h-3.5 w-3.5" /> View Official Slip
                          </button>

                          <button
                            onClick={() => handleAccept(quote)}
                            disabled={acceptedId === quote.id}
                            className="px-5 sm:px-6 py-2.5 bg-[#2563EB] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                          >
                            {acceptedId === quote.id ? (
                              <>
                                <Check className="h-4 w-4" /> Added to Bag!
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4" /> Accept & Move to Bag
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-blue-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-[11px] sm:text-xs text-gray-600">
                        <p>
                          <span className="font-bold text-[#1A1A1A]">Curator Notes:</span> {quote.adminQuote.officialNotes}
                        </p>
                        <span className="text-[10px] font-mono text-gray-500 shrink-0">
                          {quote.adminQuote.validityDate}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between gap-3 text-xs text-amber-800 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>Specialist valuation in progress. Official pricing will be released within 24 hours.</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 sm:py-24 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-4">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto" />
              <h4 className="text-base sm:text-lg font-black text-[#1A1A1A]">No Quotations Submitted Yet</h4>
              <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
                Need bespoke quantities or custom industrial specs? Click below to request your first official quotation.
              </p>
              <button
                onClick={() => setSubTab('request')}
                className="bg-[#2563EB] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2"
              >
                Create Quotation <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Official Quotation Slip Modal */}
      {selectedQuoteSlip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-[#2563EB] text-white rounded-lg flex items-center justify-center font-black text-xs">
                  RH
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-[#1A1A1A] uppercase tracking-wider">
                    Official Quotation Slip
                  </h3>
                  <p className="text-[10px] font-mono text-gray-400">
                    Ref: #{selectedQuoteSlip.quoteNumber}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedQuoteSlip(null)}
                className="text-gray-400 hover:text-[#1A1A1A] text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 text-xs">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl space-y-1.5 sm:space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Client:</span>
                  <span className="font-bold text-[#1A1A1A]">{selectedQuoteSlip.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Project:</span>
                  <span className="font-bold text-[#1A1A1A]">{selectedQuoteSlip.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Category:</span>
                  <span className="font-bold text-[#1A1A1A]">{selectedQuoteSlip.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Quantity:</span>
                  <span className="font-bold text-[#1A1A1A]">{selectedQuoteSlip.estimatedQuantity} Units</span>
                </div>
              </div>

              {selectedQuoteSlip.adminQuote && (
                <div className="border border-blue-200 bg-blue-50/50 p-3 sm:p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                    <span>Unit Price:</span>
                    <span>MWK {selectedQuoteSlip.adminQuote.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm sm:text-base font-black text-[#2563EB] pt-2 border-t border-blue-200">
                    <span>Total Net Quote:</span>
                    <span>MWK {selectedQuoteSlip.adminQuote.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 pt-1">
                    * Includes comprehensive insurance, customs dispatch clearance, and certificates of conformity.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button 
                onClick={() => setSelectedQuoteSlip(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
              >
                Close Slip
              </button>
              {selectedQuoteSlip.adminQuote && (
                <button 
                  onClick={() => {
                    handleAccept(selectedQuoteSlip);
                    setSelectedQuoteSlip(null);
                  }}
                  className="flex-1 bg-[#2563EB] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1D4ED8] transition-colors"
                >
                  Accept & Add to Bag
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopByQuotation;
