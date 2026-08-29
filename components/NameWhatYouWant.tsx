import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  Mail, 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  DollarSign, 
  Eye, 
  ExternalLink, 
  ShoppingCart, 
  Check, 
  AlertCircle, 
  Compass, 
  Search, 
  Building,
  ArrowRight,
  BookOpen,
  Wrench,
  Layers,
  Shirt,
  HelpCircle,
  Zap,
  Lock
} from 'lucide-react';
import { BespokeSourcingRequest, ProductCategory, User } from '../types';

interface NameWhatYouWantProps {
  requests: BespokeSourcingRequest[];
  onSubmitRequest: (req: Omit<BespokeSourcingRequest, 'id' | 'referenceNumber' | 'submittedAt' | 'status' | 'adminRecipient'>) => void;
  onAcceptBespokeOfferToCart?: (req: BespokeSourcingRequest) => void;
  user: User;
}

const SOURCING_CATEGORIES = [
  'Books',
  'Spare Parts',
  'Fabric',
  'Fashion',
  'Other Collection'
];

export const NameWhatYouWant: React.FC<NameWhatYouWantProps> = ({
  requests = [],
  onSubmitRequest,
  onAcceptBespokeOfferToCart,
  user
}) => {
  const [subTab, setSubTab] = useState<'submit' | 'history'>('submit');
  const [showAdminDeskModal, setShowAdminDeskModal] = useState(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);
  const [dispatchedRef, setDispatchedRef] = useState<string>('');
  const [acceptedId, setAcceptedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    itemName: '',
    category: SOURCING_CATEGORIES[0] as any,
    makerOrBrand: '',
    conditionPreference: 'Brand New (Mint)' as BespokeSourcingRequest['conditionPreference'],
    budgetEstimate: '',
    urgency: 'Within 7 Days' as BespokeSourcingRequest['urgency'],
    referenceLinkOrImageUrl: '',
    detailedRequirements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refCode = `RH-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    setDispatchedRef(refCode);

    onSubmitRequest({
      ...formData,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    });

    setIsSuccessSubmitted(true);
    setTimeout(() => {
      setIsSuccessSubmitted(false);
      setSubTab('history');
    }, 2400);

    setFormData({
      itemName: '',
      category: SOURCING_CATEGORIES[0] as any,
      makerOrBrand: '',
      conditionPreference: 'Brand New (Mint)',
      budgetEstimate: '',
      urgency: 'Within 7 Days',
      referenceLinkOrImageUrl: '',
      detailedRequirements: ''
    });
  };

  const handleAcceptOffer = (req: BespokeSourcingRequest) => {
    onAcceptBespokeOfferToCart?.(req);
    setAcceptedId(req.id);
    setTimeout(() => setAcceptedId(null), 2500);
  };

  const getStatusBadge = (status: BespokeSourcingRequest['status']) => {
    switch (status) {
      case 'AT OUR SHOP IN LILONGWE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            AT OUR SHOP
          </span>
        );
      case 'Quoted & Ready':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Quoted & Available
          </span>
        );
      case 'Sourcing Specialist Assigned':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5" />
            Curator Hunting
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            Received by Admin Desk
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#2563EB] text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
              <Mail className="h-2.5 w-2.5" /> Direct Admin Contact
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              admin@royalhints.com
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1A1A1A]">Name What You Want</h2>
          <p className="text-gray-400 font-light text-xs sm:text-base mt-1">
            Tell our Marketing Desk exactly what item, custom part, or fabric you desire.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="grid grid-cols-2 sm:flex items-center bg-gray-100 p-1 sm:p-1.5 rounded-xl shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setSubTab('submit')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-black uppercase tracking-wider text-center transition-all ${
                subTab === 'submit'
                  ? 'bg-white text-[#1A1A1A] shadow-sm'
                  : 'text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              Name Item
            </button>
            <button
              onClick={() => setSubTab('history')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                subTab === 'history'
                  ? 'bg-white text-[#1A1A1A] shadow-sm'
                  : 'text-gray-500 hover:text-[#1A1A1A]'
              }`}
            >
              Sourcing Ledger
              <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold">
                {requests.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: BESPOKE SOURCING SUBMISSION FORM */}
      {subTab === 'submit' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Admin Line Banner */}
          <div className="bg-[#1A1A1A] text-white p-4 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB] opacity-20 blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
                <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                  Have an out of catalog request? We will source it.
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                  Whether an item that does not belong to our bussiness listing just name it and submit your specification directly to the Royal Marketing Desk.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3.5 sm:px-5 sm:py-4 rounded-xl border border-white/10 shrink-0 text-left space-y-1 w-full md:w-auto">
                <p className="text-[8px] sm:text-[9px] uppercase tracking-widest font-black text-gray-400">Direct Marketing Desk</p>
                <p className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#2563EB]" /> admin@royalhints.com
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active (24/7)
                </p>
              </div>
            </div>
          </div>

          {isSuccessSubmitted ? (
            <div className="bg-blue-50/70 border-2 border-[#2563EB]/20 rounded-2xl p-8 sm:p-16 text-center space-y-4 sm:space-y-6 animate-in zoom-in-95 duration-500">
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-[#2563EB] text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
                <Send className="h-8 w-8 sm:h-9 sm:w-9" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-[#2563EB] uppercase tracking-wider">
                  Ticket Reference: {dispatchedRef}
                </span>
                <h3 className="text-xl sm:text-3xl font-black text-[#1A1A1A] uppercase tracking-tight">
                  Directly Messaged Our Marketing Desk
                </h3>
                <p className="text-gray-600 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
                  Your request have been directly sent to<strong className="text-[#1A1A1A]">admin@royalhints.com</strong>. And Our Sourcing Specialist has been assigned to search our global network.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Item Name */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    What are you looking for? (Item Name & Title) *
                  </label>
                  <input
                    required
                    placeholder="e.g., The Greatest Battle Ever Fought(Book)"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-sm sm:text-base focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all shadow-sm"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all cursor-pointer"
                  >
                    {SOURCING_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Brand / Maker */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Preferred Brand, Author, or Originality
                  </label>
                  <input
                    placeholder="William Marrion Branham(Author)"
                    value={formData.makerOrBrand}
                    onChange={(e) => setFormData({ ...formData, makerOrBrand: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                  />
                </div>

                {/* Condition Preference */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Condition Standard *
                  </label>
                  <select
                    value={formData.conditionPreference}
                    onChange={(e) => setFormData({ ...formData, conditionPreference: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all cursor-pointer"
                  >
                    <option>Brand New (Mint)</option>
                    <option>Archival / Vintage Verified</option>
                    <option>Precision Machined</option>
                    <option>Custom Hand-Crafted</option>
                  </select>
                </div>

                {/* Target Budget */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Target Budget Allocation (MWK) *
                  </label>
                  <input
                    required
                    placeholder="e.g., $3,500 or $10,000 - $15,000"
                    value={formData.budgetEstimate}
                    onChange={(e) => setFormData({ ...formData, budgetEstimate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                  />
                </div>

                {/* Urgency */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Sourcing Timeline
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all cursor-pointer"
                  >
                    <option>Within 7 Days</option>
                    <option>Urgent Sourcing</option>
                    <option>Flexible</option>
                  </select>
                </div>

                {/* Reference URL */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Reference Image URL / Technical Link (Optional)
                  </label>
                  <input
                    placeholder="https://..."
                    value={formData.referenceLinkOrImageUrl}
                    onChange={(e) => setFormData({ ...formData, referenceLinkOrImageUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                  />
                </div>

                {/* Detailed Requirements */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                    Specific Requirements, Dimensions, or Provide Some Notes *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please provide specific requirements, dimensions, or any additional notes..."
                    value={formData.detailedRequirements}
                    onChange={(e) => setFormData({ ...formData, detailedRequirements: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 font-medium text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-[#1A1A1A] hover:bg-[#2563EB] text-white py-4 sm:py-5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.35em] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2.5"
              >
                <Send className="h-4 w-4" /> Send Request
              </button>
            </form>
          )}
        </div>
      )}

      {/* SUBTAB 2: SOURCING HISTORY LEDGER */}
      {subTab === 'history' && (
        <div className="space-y-6">
          {requests.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-6 md:p-8 hover:border-blue-300 hover:shadow-xl transition-all space-y-4 sm:space-y-6"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">
                          {req.category}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono text-gray-400 font-bold ml-1">
                          Ref: #{req.referenceNumber}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-[11px] sm:text-xs text-gray-500 font-mono">
                          Target: {req.budgetEstimate}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-xl font-black text-[#1A1A1A]">{req.itemName}</h4>
                    </div>

                    {getStatusBadge(req.status)}
                  </div>

                  {/* Criteria Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 bg-gray-50/70 p-3 sm:p-4 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black text-gray-400">Maker</p>
                      <p className="font-bold text-[#1A1A1A] mt-0.5 truncate text-xs sm:text-sm">{req.makerOrBrand || 'Open Sourcing'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black text-gray-400">Standard</p>
                      <p className="font-bold text-[#1A1A1A] mt-0.5 text-xs sm:text-sm">{req.conditionPreference}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black text-gray-400">Urgency</p>
                      <p className="font-bold text-[#1A1A1A] mt-0.5 text-xs sm:text-sm">{req.urgency}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] uppercase tracking-wider font-black text-gray-400">Messaged To</p>
                      <p className="font-bold text-[#2563EB] mt-0.5 truncate font-mono text-xs sm:text-sm">{req.adminRecipient}</p>
                    </div>
                  </div>

                  {/* Requirements description */}
                  <p className="text-xs text-gray-600 font-medium leading-relaxed bg-white p-3 rounded-lg border border-gray-100">
                    <span className="font-bold text-gray-800">Requirements: </span> {req.detailedRequirements}
                  </p>

                  {/* Admin Response Block */}
                  {req.adminResponse ? (
                    <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white p-4 sm:p-6 rounded-2xl border-2 border-blue-200/80 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                            RH
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#1A1A1A]">
                              {req.adminResponse.assignedSpecialist}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Royal Hints Marketer Response • {req.adminResponse.responseDate}
                            </p>
                          </div>
                        </div>

                        {req.adminResponse.directOfferPrice && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto justify-between">
                            <div className="text-left sm:text-right">
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#2563EB]">
                                Direct Price
                              </span>
                              <p className="text-xl sm:text-2xl font-black text-[#1A1A1A] font-mono">
                                MWK{req.adminResponse.directOfferPrice.toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAcceptOffer(req)}
                              disabled={acceptedId === req.id}
                              className="w-full sm:w-auto px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 shrink-0"
                            >
                              {acceptedId === req.id ? (
                                <>
                                  <Check className="h-4 w-4" /> Added to Bag!
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4" /> Buy Sourced Item
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-3 sm:p-4 bg-white/90 rounded-xl border border-blue-100/80 text-xs text-gray-700 leading-relaxed font-medium">
                        {req.adminResponse.adminMessage}
                      </div>

                      {req.adminResponse.networkLocationFound && (
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>Vault Origin: {req.adminResponse.networkLocationFound}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200/60 flex items-center justify-between text-xs text-gray-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                        <span>Transmitted to Marketing Desk. Our team is actively searching other market.</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 sm:py-24 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-4">
              <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto" />
              <h4 className="text-base sm:text-lg font-black text-[#1A1A1A]">No Requests Active</h4>
              <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
                Need anything absent from our marketplace? Name what you want and our team will locate it.
              </p>
              <button
                onClick={() => setSubTab('submit')}
                className="bg-[#2563EB] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2"
              >
                Submit New Request <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
};

export default NameWhatYouWant;
