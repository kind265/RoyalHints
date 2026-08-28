import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  User as UserIcon, 
  ShoppingCart, 
  Store, 
  PlusCircle, 
  LogOut, 
  ChevronRight, 
  Image as ImageIcon, 
  Briefcase, 
  Zap, 
  Bell, 
  Shield, 
  Eye, 
  Trash2, 
  ArrowRight, 
  CreditCard, 
  Truck, 
  FileText,
  Sparkles,
  PackageCheck,
  Search,
  ShieldCheck,
  Crown,
  Lock,
  Upload,
  Camera,
  Check,
  X,
  History,
  DollarSign,
  Package,
  MapPin,
  Tag,
  Clock,
  Edit3,
  ExternalLink,
  Filter,
  BarChart3,
  TrendingUp,
  BellRing,
  CheckCheck,
  Inbox
} from 'lucide-react';
import { User, BusinessPost, Product, ShipmentTracking, QuotationRequest, olderSourcingRequest, DashboardTab } from '../types';
import { GALLERY_PHOTO_PRESETS } from '../constants';
import OrderTracking from './OrderTracking';
import ShopByQuotation from './ShopByQuotation';
import NameWhatYouWant from './NameWhatYouWant';
import AdminAnalytics from './AdminAnalytics';
import { apiClient } from '../backend/api-client';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: any) => void;
  onAddPost: (post: Omit<BusinessPost, 'id' | 'userId' | 'userName' | 'timestamp'>) => void;
  onDeletePost?: (id: string) => void;
  onUpdatePost?: (post: BusinessPost) => void;
  posts: BusinessPost[];
  cartItems?: Product[];
  onRemoveFromCart?: (id: string) => void;
  shipments?: ShipmentTracking[];
  onConfirmDelivery?: (trackingNumber: string) => void;
  quotations?: QuotationRequest[];
  onAddQuotation?: (quote: Omit<QuotationRequest, 'id' | 'quoteNumber' | 'submittedAt' | 'status'>) => void;
  onAcceptQuoteToCart?: (quote: QuotationRequest) => void;
  olderRequests?: olderSourcingRequest[];
  onSubmitolderRequest?: (req: Omit<olderSourcingRequest, 'id' | 'referenceNumber' | 'submittedAt' | 'status' | 'adminRecipient'>) => void;
  onAcceptolderOfferToCart?: (req: olderSourcingRequest) => void;
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

const BUSINESS_CATEGORIES = [
  'Books',
  'Spare Parts',
  'Fabric',
  'Fashion',
  'Other Collections'
];

const CONDITION_OPTIONS = [
  'Brand New (Mint)',
  'Archival / Vintage Verified',
  'OEM Precision Machined',
  'Custom Hand-Crafted'
];

const LOCATION_PRESETS = [
  'Royal Hints Shop'
];

const DISPATCH_PRESETS = [
  'Dispatches in 24 hours',
  'Same-day express dispatch',
  '2-3 Business Days',
  'Priority Armored Express'
];

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  onNavigate, 
  onAddPost, 
  onDeletePost,
  onUpdatePost,
  posts, 
  cartItems = [], 
  onRemoveFromCart,
  shipments = [],
  onConfirmDelivery,
  quotations = [],
  onAddQuotation = () => {},
  onAcceptQuoteToCart = () => {},
  olderRequests = [],
  onSubmitolderRequest = () => {},
  onAcceptolderOfferToCart = () => {},
  initialTab = 'account',
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>((initialTab as DashboardTab) || 'account');
  
  // Post Inventory Form State
  const [postData, setPostData] = useState({ 
    title: '', 
    description: '', 
    category: BUSINESS_CATEGORIES[0], 
    image: '',
    price: 0,
    stockCount: 1,
    sku: '',
    condition: CONDITION_OPTIONS[0],
    location: LOCATION_PRESETS[0],
    dispatchTime: DISPATCH_PRESETS[0]
  });
  const [supportingImages, setSupportingImages] = useState<string[]>([]);

  const [showSuccess, setShowSuccess] = useState(false);

  // Photo Picker Modal & Upload History State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoModalTab, setPhotoModalTab] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Staged / Pending local image upload preview before admin confirms
  const [pendingUpload, setPendingUpload] = useState<{
    file: File;
    previewUrl: string;
    fileName: string;
    fileSizeFormatted: string;
    category: string;
    isEditing: boolean;
  } | null>(null);

  const [photoHistory, setPhotoHistory] = useState<Array<{ id: string; title: string; category: string; url: string }>>([]);

  // Venture Management filters and states
  const [ventureSearch, setVentureSearch] = useState('');
  const [ventureCategoryFilter, setVentureCategoryFilter] = useState('All');
  const [editingPost, setEditingPost] = useState<BusinessPost | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin' || user?.isAdmin || user?.email?.toLowerCase() === 'ruthmhone8@gmail.com.com' || user?.email?.toLowerCase() === 'chikusehopeson@gmail.com';

  // Admin Notifications for older Requests & Quotations
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'older' | 'quotation'>('all');
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  useEffect(() => {
    setNotificationsLoaded(false);
    apiClient.getNotificationReads(user.id).then(ids => {
      setReadNotificationIds(ids);
      setNotificationsLoaded(true);
    }).catch(() => setNotificationsLoaded(true));
    apiClient.getPhotoHistory(user.id).then(setPhotoHistory).catch(() => {});
  }, [user.id]);

  useEffect(() => {
    if (notificationsLoaded) {
      apiClient.saveNotificationReads(user.id, readNotificationIds).catch(() => {});
    }
  }, [user.id, readNotificationIds, notificationsLoaded]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Compose all alerts for the admin
  const adminNotifications = [
    ...olderRequests.map(req => ({
      id: `notif-older-${req.id || req.referenceNumber}`,
      requestId: req.id,
      type: 'older' as const,
      title: req.itemName,
      refNumber: req.referenceNumber,
      category: req.category,
      userName: req.userName,
      userEmail: req.userEmail,
      budget: req.budgetEstimate,
      urgency: req.urgency,
      status: req.status,
      submittedAtFormatted: typeof req.submittedAt === 'number' 
        ? new Date(req.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : String(req.submittedAt || 'Recently'),
      rawTime: typeof req.submittedAt === 'number' ? req.submittedAt : Date.now(),
      targetTab: 'older' as DashboardTab,
      actionLabel: 'Review Older'
    })),
    ...quotations.map(quote => ({
      id: `notif-quote-${quote.id || quote.quoteNumber}`,
      requestId: quote.id,
      type: 'quotation' as const,
      title: quote.title,
      refNumber: quote.quoteNumber,
      category: quote.category,
      userName: quote.userName,
      userEmail: quote.userEmail,
      budget: quote.targetBudget,
      quantity: quote.estimatedQuantity,
      status: quote.status,
      submittedAtFormatted: typeof quote.submittedAt === 'number'
        ? new Date(quote.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : String(quote.submittedAt || 'Recently'),
      rawTime: typeof quote.submittedAt === 'number' ? quote.submittedAt : Date.now(),
      targetTab: 'quotation' as DashboardTab,
      actionLabel: 'Review Quotation'
    }))
  ].sort((a, b) => (typeof b.rawTime === 'number' && typeof a.rawTime === 'number' ? b.rawTime - a.rawTime : 0));

  const unreadCount = adminNotifications.filter(n => !readNotificationIds.includes(n.id)).length;

  const filteredNotifications = adminNotifications.filter(n => {
    if (notificationFilter === 'older') return n.type === 'older';
    if (notificationFilter === 'quotation') return n.type === 'quotation';
    return true;
  });

  const handleMarkAllNotificationsRead = () => {
    setReadNotificationIds(adminNotifications.map(n => n.id));
  };

  const handleNotificationSelect = (notif: typeof adminNotifications[0]) => {
    if (!readNotificationIds.includes(notif.id)) {
      setReadNotificationIds(prev => [...prev, notif.id]);
    }
    setIsNotificationOpen(false);
    setActiveTab(notif.targetTab);
    onTabChange?.(notif.targetTab);
  };
  
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab as DashboardTab);
    }
  }, [initialTab]);

  // Local state for Preferences/Settings
  const [prefs, setPrefs] = useState({
    notifications: true,
    newsletter: false,
    visibility: true,
    twoFactor: false
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Calculate readable file size
    const sizeInKb = file.size / 1024;
    const fileSizeFormatted = sizeInKb > 1024 
      ? `${(sizeInKb / 1024).toFixed(2)} MB` 
      : `${Math.round(sizeInKb)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPendingUpload({
          file,
          previewUrl: dataUrl,
          fileName: file.name,
          fileSizeFormatted,
          category: isEditing ? (editingPost?.category || 'Custom') : postData.category,
          isEditing
        });
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so selecting the same file again triggers change
    e.target.value = '';
  };

  const handleConfirmPendingUpload = () => {
    if (!pendingUpload) return;

    const newPhotoItem = {
      id: `ph-local-${Date.now()}`,
      title: pendingUpload.fileName.replace(/\.[^/.]+$/, "") || 'Uploaded Photo',
      category: pendingUpload.category,
      url: pendingUpload.previewUrl
    };

    setPhotoHistory(prev => [newPhotoItem, ...prev]);
    apiClient.addPhotoHistory({ ...newPhotoItem, userId: user.id }).catch(() => {});

    if (pendingUpload.isEditing && editingPost) {
      setEditingPost({ ...editingPost, image: pendingUpload.previewUrl });
    } else {
      setPostData(prev => ({ ...prev, image: pendingUpload.previewUrl }));
    }

    setPendingUpload(null);
    setIsPhotoModalOpen(false);
  };

  const handleCancelPendingUpload = () => {
    setPendingUpload(null);
  };

  const handleSupportingFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        const url = event.target?.result as string;
        if (url) setSupportingImages(prev => [...prev, url]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSelectPhoto = (url: string) => {
    if (editingPost) {
      setEditingPost({ ...editingPost, image: url });
    } else {
      setPostData(prev => ({ ...prev, image: url }));
    }
    setIsPhotoModalOpen(false);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPost({
      title: postData.title,
      description: postData.description.trim() || undefined,
      category: postData.category,
      image: postData.image,
      price: Number(postData.price) || 0,
      stockCount: Number(postData.stockCount) || 1,
      sku: postData.sku || `RH-INV-${Date.now().toString().slice(-4)}`,
      condition: postData.condition,
      location: postData.location,
      dispatchTime: postData.dispatchTime,
      galleryImages: supportingImages
    });

    setPostData({ 
      title: '', 
      description: '', 
      category: BUSINESS_CATEGORIES[0], 
      image: '',
      price: 0,
      stockCount: 1,
      sku: '',
      condition: CONDITION_OPTIONS[0],
      location: LOCATION_PRESETS[0],
      dispatchTime: DISPATCH_PRESETS[0]
    });
    setSupportingImages([]);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setActiveTab('my-posts');
    }, 2000);
  };

  const handleSaveEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    onUpdatePost?.(editingPost);
    setEditingPost(null);
  };

  const handleDeletePost = (id: string) => {
    onDeletePost?.(id);
    setDeleteConfirmId(null);
  };

  const filteredVenturePosts = posts.filter(p => {
    const matchesCategory = ventureCategoryFilter === 'All' || p.category === ventureCategoryFilter;
    const query = ventureSearch.toLowerCase().trim();
    const matchesSearch = !query || 
      p.title.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      p.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-24 sm:pt-28 pb-24 px-3 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-screen-2xl mx-auto">
        {/* Workspace Area - Full Width */}
        <main className="w-full">
          <div className="bg-white rounded-2xl p-4 sm:p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100 min-h-[750px] animate-in fade-in duration-500">
            
            {/* ADMIN OPERATIONAL STATUS & NOTIFICATION BELL BAR */}
            {isAdmin && (
              <div className="mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Admin Clearance Badge & Quick Tab Selector */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-blue-200/60 text-[#1A1A1A]">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#1A1A1A]">
                      Admin Intelligence Desk
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <span>Active Workspace:</span>
                    <span className="font-bold text-gray-800 capitalize bg-gray-100 px-2 py-0.5 rounded-md">
                      {activeTab.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Right: Quick Action Hub & NOTIFICATION BELL */}
                <div className="flex items-center gap-2.5 self-end md:self-auto relative" ref={notificationRef}>
                  
                  {/* Quick Shortcut Buttons */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('analytics');
                      onTabChange?.('analytics');
                    }}
                    className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-[#1A1A1A] text-white shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <BarChart3 className="h-3.5 w-3.5 text-[#2563EB]" />
                    <span>Analytics</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('older');
                      onTabChange?.('older');
                    }}
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'Older'
                        ? 'bg-[#1A1A1A] text-white shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span>Older Sourcing</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                      {olderRequests.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('quotation');
                      onTabChange?.('quotation');
                    }}
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'quotation'
                        ? 'bg-[#1A1A1A] text-white shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    <span>Quotations</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-[#2563EB] font-bold">
                      {quotations.length}
                    </span>
                  </button>

                  {/* === ADMIN NOTIFICATION BELL BUTTON === */}
                  <div className="relative">
                    <button
                      type="button"
                      id="admin-notification-bell-btn"
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl border font-black text-xs uppercase tracking-wider transition-all shadow-sm ${
                        unreadCount > 0
                          ? 'bg-blue-50/90 hover:bg-blue-100 border-blue-300 text-[#2563EB]'
                          : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                      aria-label="Admin Notifications"
                      title="Admin Alerts: New Older Sourcing & Quotations"
                    >
                      <div className="relative">
                        {unreadCount > 0 ? (
                          <BellRing className="h-4 w-4 text-[#2563EB] animate-bounce" />
                        ) : (
                          <Bell className="h-4 w-4 text-gray-500" />
                        )}
                        {unreadCount > 0 && (
                          <span className="absolute -top-2 -right-2.5 h-4 min-w-[16px] px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="hidden xs:inline">Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold">
                          {unreadCount} New
                        </span>
                      )}
                    </button>

                    {/* === NOTIFICATIONS DROPDOWN POPOVER === */}
                    {isNotificationOpen && (
                      <div 
                        id="admin-notifications-popover"
                        className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                      >
                        {/* Popover Header */}
                        <div className="p-4 bg-gradient-to-r from-gray-900 via-[#1A1A1A] to-blue-950 text-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-blue-500/20 text-[#60A5FA] flex items-center justify-center">
                              <Bell className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="font-black text-xs uppercase tracking-wider text-white">
                                Sourcing & Quotation Alerts
                              </h4>
                              <p className="text-[10px] text-gray-300">
                                Real-time client submissions for Admin
                              </p>
                            </div>
                          </div>

                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllNotificationsRead}
                              className="text-[10px] font-bold text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                              title="Mark all alerts as read"
                            >
                              <CheckCheck className="h-3 w-3" /> Mark all read
                            </button>
                          )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 text-xs">
                          <button
                            type="button"
                            onClick={() => setNotificationFilter('all')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center ${
                              notificationFilter === 'all'
                                ? 'bg-white text-[#1A1A1A] shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            All ({adminNotifications.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setNotificationFilter('Older')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 ${
                              notificationFilter === 'older'
                                ? 'bg-amber-50 text-amber-900 border border-amber-200/60 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            older ({olderRequests.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setNotificationFilter('quotation')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 ${
                              notificationFilter === 'quotation'
                                ? 'bg-blue-50 text-blue-900 border border-blue-200/60 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            <FileText className="h-3 w-3 text-blue-500" />
                            Quotes ({quotations.length})
                          </button>
                        </div>

                        {/* Notification List Scroll Area */}
                        <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
                          {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notif) => {
                              const isUnread = !readNotificationIds.includes(notif.id);
                              return (
                                <div
                                  key={notif.id}
                                  onClick={() => handleNotificationSelect(notif)}
                                  className={`p-3.5 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer group flex items-start gap-3 relative ${
                                    isUnread ? 'bg-blue-50/30' : 'bg-white'
                                  }`}
                                >
                                  {/* Icon & Unread Indicator */}
                                  <div className="relative shrink-0 mt-0.5">
                                    <div
                                      className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                                        notif.type === 'older'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-blue-100 text-[#2563EB]'
                                      }`}
                                    >
                                      {notif.type === 'older' ? (
                                        <Sparkles className="h-4 w-4" />
                                      ) : (
                                        <FileText className="h-4 w-4" />
                                      )}
                                    </div>
                                    {isUnread && (
                                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#2563EB] ring-2 ring-white" />
                                    )}
                                  </div>

                                  {/* Notification Details */}
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span
                                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                          notif.type === 'Older'
                                            ? 'bg-amber-100/80 text-amber-800'
                                            : 'bg-blue-100/80 text-blue-800'
                                        }`}
                                      >
                                        {notif.type === 'Older' ? 'Older Sourcing' : 'Quotation Request'}
                                      </span>
                                      <span className="text-[10px] text-gray-400 font-medium">
                                        {notif.submittedAtFormatted}
                                      </span>
                                    </div>

                                    <h5 className="font-bold text-xs sm:text-sm text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors truncate">
                                      {notif.title}
                                    </h5>

                                    <p className="text-[11px] text-gray-500 truncate">
                                      By <span className="font-medium text-gray-800">{notif.userName}</span> ({notif.userEmail})
                                    </p>

                                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono font-bold">
                                        {notif.refNumber}
                                      </span>
                                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                                        Budget: {notif.budget}
                                      </span>
                                      {notif.type === 'quotation' && notif.quantity && (
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                                          Qty: {notif.quantity}
                                        </span>
                                      )}
                                      {notif.type === 'older' && notif.urgency && (
                                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">
                                          {notif.urgency}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="shrink-0 self-center text-gray-400 group-hover:text-[#2563EB] transition-colors">
                                    <ChevronRight className="h-4 w-4" />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-8 text-center space-y-2">
                              <Inbox className="h-10 w-10 text-gray-300 mx-auto" />
                              <p className="text-xs font-bold text-gray-600">No alerts found</p>
                              <p className="text-[10px] text-gray-400">
                                New Older sourcing & quotation submissions will appear here instantly.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Popover Footer */}
                        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-gray-400 font-medium">
                            {unreadCount} unread / {adminNotifications.length} total
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsNotificationOpen(false);
                              setActiveTab('analytics');
                              onTabChange?.('analytics');
                            }}
                            className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                          >
                            Open Telemetry Desk <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* 1. ORDER TRACKING SYSTEM */}
            {activeTab === 'tracking' && (
              <OrderTracking 
                shipments={shipments} 
                onNavigate={onNavigate}
                onConfirmDelivery={onConfirmDelivery}
              />
            )}

            {/* 2. SHOP BY QUOTATION */}
            {activeTab === 'quotation' && (
              <ShopByQuotation 
                quotations={quotations}
                onAddQuotation={onAddQuotation}
                onAcceptQuoteToCart={onAcceptQuoteToCart}
                user={user}
              />
            )}

            {/* 3. NAME WHAT YOU WANT (CONCIERGE SOURCING TO ADMIN) */}
            {activeTab === 'older' && (
              <NameWhatYouWant 
                requests={olderRequests}
                onSubmitRequest={onSubmitolderRequest}
                onAcceptolderOfferToCart={onAcceptolderOfferToCart}
                user={user}
              />
            )}

            {/* 3.5 ADMIN ANALYTICS SUMMARY */}
            {activeTab === 'analytics' && (
              !isAdmin ? (
                <div className="text-center py-16 sm:py-20 bg-gray-50 rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A] mb-2">Admin Telemetry Desk</h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                      Marketplace analytics, total units sold, and older sourcing request tracking are restricted to the Royal Hints Administration Desk.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button 
                      onClick={() => setActiveTab('account')}
                      className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#1D4ED8] transition-all"
                    >
                      Return to Profile
                    </button>
                  </div>
                </div>
              ) : (
                <AdminAnalytics
                  shipments={shipments}
                  olderRequests={olderRequests}
                  quotations={quotations}
                  posts={posts}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    onTabChange?.(tab);
                  }}
                  onNavigatePage={onNavigate}
                />
              )
            )}

            {/* 4. MY PROFILE */}
            {activeTab === 'account' && (
              <div className="space-y-8 sm:space-y-12">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 sm:mb-4 text-[#1A1A1A]">My Profile</h2>
                    <p className="text-gray-400 font-light text-sm sm:text-lg">Managing your premium digital identity and royal credentials.</p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-[#1A1A1A] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-blue-500/20 hover:scale-[1.01] transition-all self-start sm:self-auto"
                    >
                      <BarChart3 className="h-4 w-4 text-white" />
                      View Admin Analytics Summary
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 sm:gap-12 items-start">
                  <div className="relative group mx-auto md:mx-0">
                    <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-2xl shadow-blue-500/20 overflow-hidden">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                    </div>
                    <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-gray-100 hover:text-[#2563EB] transition-colors">
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full">
                    {!isAdmin && (
                      <div className="space-y-2 md:col-span-2 bg-blue-50/60 p-4 sm:p-5 rounded-2xl border border-blue-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#2563EB]">
                              Auto-Generated Unique Buyer ID (Username)
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                              Active
                            </span>
                          </div>
                          <p className="text-xl sm:text-2xl font-black text-[#1A1A1A] font-mono tracking-wider">
                            {user.buyerUniqueId || user.id}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Password-free royal access. Your dashboard was automatically activated upon order placement.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">Unique Member ID</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={user.buyerUniqueId || user.id} 
                        className="w-full p-4 sm:p-5 bg-gray-50 rounded-xl text-[#1A1A1A] border border-gray-100 font-mono font-bold opacity-80 text-xs sm:text-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">E-Mail Contact</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={user.email} 
                        className="w-full p-4 sm:p-5 bg-gray-50 rounded-xl text-[#1A1A1A] border border-gray-100 font-bold opacity-70 text-xs sm:text-sm" 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">Member Alias</label>
                      <input 
                        type="text" 
                        defaultValue={user.name} 
                        className="w-full p-4 sm:p-5 bg-white rounded-xl text-[#1A1A1A] border border-gray-200 focus:border-[#2563EB] focus:outline-none font-bold shadow-sm text-xs sm:text-sm" 
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">Short Bio</label>
                      <textarea 
                        className="w-full p-4 sm:p-5 bg-white rounded-xl text-[#1A1A1A] border border-gray-200 focus:border-[#2563EB] focus:outline-none font-medium text-xs sm:text-sm h-28 sm:h-32 resize-none leading-relaxed" 
                        placeholder="Define your place in the Royal Hints world..."
                        defaultValue="Collector of rare architectural folios and older luxury fabrics. Valued member of the Royal Hints Guild."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 sm:pt-12 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-black flex items-center gap-3">
                      <div className="h-6 sm:h-8 w-1.5 bg-[#2563EB] rounded-full"></div> 
                      {isAdmin ? 'Admin Intelligence & Portfolios' : 'Royal Metrics & Portfolios'}
                    </h3>

                    {isAdmin && (
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1"
                      >
                        Analytics Dashboard <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {isAdmin ? [
                      { 
                        label: 'Total Items Sold', 
                        val: shipments.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + (i.quantity || 1), 0), 0), 
                        action: () => setActiveTab('analytics'),
                        highlight: true
                      },
                      { 
                        label: 'Active older Sourcing', 
                        val: olderRequests.filter(r => r.status !== 'Fulfilled').length, 
                        action: () => setActiveTab('analytics'),
                        highlight: true
                      },
                      { 
                        label: 'Admin Postings', 
                        val: posts.length, 
                        action: () => setActiveTab('my-posts') 
                      },
                      { 
                        label: 'Pending Quotes', 
                        val: quotations.length, 
                        action: () => setActiveTab('quotation') 
                      },
                    ].map((stat) => (
                      <div 
                        key={stat.label} 
                        onClick={stat.action}
                        className={`p-4 sm:p-6 rounded-xl border transition-all cursor-pointer group ${
                          stat.highlight 
                            ? 'bg-blue-50/50 border-blue-200/80 hover:border-[#2563EB]' 
                            : 'bg-gray-50 border-transparent hover:border-[#2563EB]/30'
                        }`}
                      >
                        <p className="text-2xl sm:text-3xl font-black mb-1 text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors">{stat.val}</p>
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-gray-500 truncate">{stat.label}</p>
                      </div>
                    )) : [
                      { label: 'Active Shipments', val: shipments.filter(s => s.status !== 'Delivered').length, action: () => setActiveTab('tracking') },
                      { label: 'Pending Quotes', val: quotations.length, action: () => setActiveTab('quotation') },
                      { label: 'older Requests', val: olderRequests.length, action: () => setActiveTab('older') },
                      { label: 'Bag Items', val: cartItems.length, action: () => setActiveTab('cart') },
                    ].map((stat) => (
                      <div 
                        key={stat.label} 
                        onClick={stat.action}
                        className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-transparent hover:border-[#2563EB]/30 transition-all cursor-pointer group"
                      >
                        <p className="text-2xl sm:text-3xl font-black mb-1 text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors">{stat.val}</p>
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 truncate">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full sm:w-auto bg-[#1A1A1A] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-black text-xs uppercase tracking-[0.25em] hover:bg-[#2563EB] transition-all shadow-lg hover:shadow-blue-500/20">
                  Update Registry Profile
                </button>
              </div>
            )}

            {/* 5. VENTURE MANAGEMENT (ADMIN ONLY) - MOBILE OPTIMIZED */}
            {activeTab === 'my-posts' && (
              !isAdmin ? (
                <div className="text-center py-16 sm:py-20 bg-gray-50 rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A] mb-2">Administrative Registry</h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                      Publishing and editing marketplace inventory is reserved exclusively for the Royal Administration Desk. As a verified member, your account is configured for direct purchasing, order tracking, and older quotation inquiries.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button 
                      onClick={() => setActiveTab('tracking')}
                      className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#1D4ED8] transition-all"
                    >
                      Track Active Orders
                    </button>
                    <button 
                      onClick={() => onNavigate('Marketplace')}
                      className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-800 transition-all"
                    >
                      Browse Catalog
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-10">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest">Admin Control</span>
                        <span className="text-[10px] bg-blue-100 text-[#2563EB] px-2 py-0.5 rounded-full font-bold">
                          {posts.length} Active {posts.length === 1 ? 'Listing' : 'Listings'}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1A1A1A]">Venture Management</h2>
                      <p className="text-gray-400 font-light text-xs sm:text-base mt-0.5">
                        Active catalog listings published to the royal marketplace.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <button 
                        onClick={() => setActiveTab('analytics')}
                        className="flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-3 sm:py-3.5 rounded-xl text-xs font-bold transition-all shrink-0 w-full sm:w-auto"
                      >
                        <BarChart3 className="h-4 w-4 text-[#2563EB]" /> Analytics Summary
                      </button>
                      <button 
                        onClick={() => setActiveTab('post')}
                        className="flex items-center justify-center gap-2 bg-[#2563EB] text-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#1D4ED8] transition-all shrink-0 w-full sm:w-auto"
                      >
                        <PlusCircle className="h-4 w-4" /> Admin: Post Inventory
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Bar on Mobile */}
                  <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search ventures by title, SKU, or sector..."
                        value={ventureSearch}
                        onChange={(e) => setVentureSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
                      />
                      {ventureSearch && (
                        <button
                          onClick={() => setVentureSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Horizontal scroll category filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                      {['All', ...BUSINESS_CATEGORIES].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setVentureCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                            ventureCategoryFilter === cat
                              ? 'bg-[#1A1A1A] text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Listings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {filteredVenturePosts.map((post) => (
                      <div 
                        key={post.id} 
                        className="group border border-gray-200/90 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white flex flex-col hover:border-blue-300"
                      >
                        {/* Image banner with overlay chips */}
                        <div className="relative aspect-video bg-gray-100 overflow-hidden">
                          <img 
                            src={post.image} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            alt={post.title} 
                          />
                          
                          {/* Price Chip */}
                          <div className="absolute top-3 left-3 bg-[#1A1A1A]/85 backdrop-blur-md px-3 py-1 text-white text-xs font-black font-mono rounded-lg shadow-sm">
                            ${(post.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>

                          {/* Category Chip */}
                          <div className="absolute top-3 right-3 bg-[#2563EB] px-3 py-1 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                            {post.category}
                          </div>

                          {/* Stock & SKU footer on image */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-bold text-white">
                            <span className="bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-md flex items-center gap-1 font-mono">
                              <Package className="h-3 w-3 text-emerald-400" /> {post.stockCount || 10} in Vault
                            </span>
                            {post.sku && (
                              <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md font-mono text-gray-300">
                                {post.sku}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h4 className="font-black text-base sm:text-xl text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors leading-tight mb-2">
                              {post.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 font-light leading-relaxed">
                              {post.description || 'Curated royal marketplace offering with full vault authenticity certification.'}
                            </p>
                          </div>

                          {/* Metadata Badges */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-1.5 text-gray-600 truncate">
                              <MapPin className="h-3 w-3 text-[#2563EB] shrink-0" />
                              <span className="truncate">{post.location || 'No location set'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600 truncate">
                              <Tag className="h-3 w-3 text-amber-500 shrink-0" />
                              <span className="truncate">{post.condition || 'Mint Verified'}</span>
                            </div>
                          </div>

                          {/* Footer Action Bar */}
                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Market Live</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setEditingPost(post)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-[#2563EB] hover:text-white text-gray-700 rounded-lg text-xs font-bold transition-all"
                                title="Edit Venture"
                              >
                                <Edit3 className="h-3 w-3" /> Edit
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(post.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg text-xs font-bold transition-all"
                                title="Delete from Marketplace"
                              >
                                <Trash2 className="h-3 w-3" /> Kill
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredVenturePosts.length === 0 && (
                      <div className="col-span-full py-16 sm:py-28 bg-gray-50 rounded-2xl text-center border-2 border-dashed border-gray-200 p-6 space-y-4">
                        <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto" />
                        <div>
                          <p className="text-gray-600 font-black text-base sm:text-xl">
                            {ventureSearch ? 'No matching ventures found' : 'No published ventures in inventory'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                            {ventureSearch 
                              ? 'Try refining your search keyword or clearing the filter.' 
                              : 'Broadcast new official items to the Royal Hints marketplace with images, pricing, and stock details.'}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            if (ventureSearch) {
                              setVentureSearch('');
                              setVentureCategoryFilter('All');
                            } else {
                              setActiveTab('post');
                            }
                          }}
                          className="bg-[#2563EB] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2"
                        >
                          {ventureSearch ? 'Clear Filters' : 'Initiate First Venture'} <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* 6. POST INVENTORY / NEW VENTURE (ADMIN ONLY) - MOBILE OPTIMIZED */}
            {activeTab === 'post' && (
              !isAdmin ? (
                <div className="text-center py-16 sm:py-20 bg-gray-50 rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A] mb-2">Admin Publishing Required</h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                      Catalog posting is restricted to the Royal Hints Administration Desk. Royal members have exclusive purchasing privileges across all collections and customized quotation ordering.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button 
                      onClick={() => setActiveTab('account')}
                      className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#1D4ED8] transition-all"
                    >
                      Return to Profile
                    </button>
                    <button 
                      onClick={() => onNavigate('Marketplace')}
                      className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-800 transition-all"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-10 max-w-4xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest">Admin Control</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1A1A1A]">
                      Admin: Post Inventory Item
                    </h2>
                    <p className="text-gray-400 font-light text-xs sm:text-base mt-0.5">
                      Broadcast official curated items, pricing, photos, and ventures directly to the Royal Hints marketplace.
                    </p>
                  </div>

                  {showSuccess ? (
                    <div className="bg-[#2563EB]/10 border-2 border-[#2563EB]/30 text-[#2563EB] p-10 sm:p-20 rounded-2xl text-center space-y-4 sm:space-y-6 animate-in zoom-in-95 duration-500">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 bg-[#2563EB] text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/40">
                        <Zap className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-3xl font-black mb-2 uppercase tracking-tight text-[#1A1A1A]">
                          Venture & Inventory Published!
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-base font-light">
                          Your item is now live in the marketplace catalog and 48h New Arrivals stream.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form className="space-y-6 sm:space-y-8" onSubmit={handlePostSubmit}>
                      
                      {/* 1. VISUAL ASSET SELECTION (PHOTO HISTORY & SELECT FROM PHOTOS) */}
                      <div className="space-y-3 p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-500">
                            Visual Asset / Photo (Local History & Upload) *
                          </label>
                          <span className="text-[10px] text-gray-400 font-medium">
                            Select from local archive or upload device image
                          </span>
                        </div>

                        {/* Image Preview & Selection Controls */}
                        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                          {/* Image preview box */}
                          <div className="relative aspect-video md:w-64 h-36 md:h-36 rounded-xl bg-gray-200 overflow-hidden border border-gray-300 shrink-0 group">
                            {postData.image ? (
                              <>
                                <img 
                                  src={postData.image} 
                                  alt="Selected asset" 
                                  className="w-full h-full object-cover" 
                                />
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                                  <Check className="h-3 w-3 text-emerald-400" /> Active Asset
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                                <ImageIcon className="h-8 w-8 mb-1 opacity-50" />
                                <span>No Photo Chosen</span>
                              </div>
                            )}
                          </div>

                          {/* Photo selection action buttons */}
                          <div className="flex-1 flex flex-col justify-center gap-2.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* Open Photo Picker Modal */}
                              <button
                                type="button"
                                onClick={() => setIsPhotoModalOpen(true)}
                                className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20"
                              >
                                <History className="h-4 w-4" /> Select from Photos
                              </button>

                              {/* Upload / Camera input */}
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                              >
                                <Camera className="h-4 w-4 text-[#2563EB]" /> Upload Device Photo
                              </button>
                              <input 
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, false)}
                              />
                            </div>

                            {/* Direct URL input fallback */}
                            <div className="relative">
                              <input 
                                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#2563EB] transition-all"
                                placeholder="Or paste image URL (https://...)"
                                value={postData.image}
                                onChange={(e) => setPostData({ ...postData, image: e.target.value })}
                              />
                              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        {/* Inline Pending Upload Thumbnail Banner if staged without modal */}
                        {pendingUpload && !pendingUpload.isEditing && (
                          <div className="mt-3 p-3.5 sm:p-4 bg-blue-50/90 rounded-xl border border-blue-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-3">
                              <div className="relative h-14 w-14 rounded-lg overflow-hidden border-2 border-[#2563EB] shrink-0 shadow-sm">
                                <img 
                                  src={pendingUpload.previewUrl} 
                                  alt="Local Image Thumbnail" 
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/10" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 bg-[#2563EB] text-white text-[9px] font-black uppercase tracking-wider rounded">
                                    Preview Thumbnail
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono">
                                    {pendingUpload.fileSizeFormatted}
                                  </span>
                                </div>
                                <p className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1 mt-0.5">
                                  {pendingUpload.fileName}
                                </p>
                                <p className="text-[10px] text-blue-700">
                                  Review this thumbnail before confirming upload to inventory.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                              <button
                                type="button"
                                onClick={handleCancelPendingUpload}
                                className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-xs font-bold transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleConfirmPendingUpload}
                                className="flex-1 sm:flex-none px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                              >
                                <Check className="h-3.5 w-3.5" /> Confirm Image
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="pt-4 mt-2 border-t border-gray-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-500">
                              Supporting Photos (Optional)
                            </label>
                            <span className="text-[10px] text-gray-400">Add colorways, angles, or detail shots</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <label className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer">
                              <Upload className="h-4 w-4 text-[#2563EB]" /> Add Supporting Photos
                              <input type="file" accept="image/*" multiple className="hidden" onChange={handleSupportingFiles} />
                            </label>
                            <input
                              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-[#2563EB]"
                              placeholder="Paste supporting image URL and press Enter"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const url = e.currentTarget.value.trim();
                                  if (url) {
                                    setSupportingImages(prev => [...prev, url]);
                                    e.currentTarget.value = '';
                                  }
                                }
                              }}
                            />
                          </div>
                          {supportingImages.length > 0 && (
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                              {supportingImages.map((url, index) => (
                                <div key={`${url}-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white group">
                                  <img src={url} alt={`Supporting view ${index + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setSupportingImages(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
                                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label={`Remove supporting photo ${index + 1}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. ITEM TITLE & SECTOR */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                            Venture Brand / Item Title *
                          </label>
                          <input 
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all shadow-sm"
                            placeholder="e.g. Royal Atelier Silk Monograph, Klausen Titanium Motorsport Calipers"
                            value={postData.title}
                            onChange={(e) => setPostData({...postData, title: e.target.value})}
                          />
                        </div>

                        {/* Market Sector */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                            Market Sector / Category *
                          </label>
                          <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all cursor-pointer font-bold text-xs sm:text-sm"
                            value={postData.category}
                            onChange={(e) => setPostData({...postData, category: e.target.value})}
                          >
                            {BUSINESS_CATEGORIES.map(cat => (
                              <option key={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Price ($USD) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                              Price ($USD) *
                            </label>
                            <div className="flex items-center gap-1">
                              {[95, 250, 750, 1500].map(p => (
                                <button
                                  type="button"
                                  key={p}
                                  onClick={() => setPostData({ ...postData, price: p })}
                                  className="text-[9px] bg-gray-100 hover:bg-blue-100 hover:text-[#2563EB] px-1.5 py-0.5 rounded font-bold transition-colors"
                                >
                                  ${p}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="relative">
                            <input 
                              type="number"
                              required
                              min="1"
                              step="0.01"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3.5 sm:py-4 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-mono font-bold text-xs sm:text-sm"
                              placeholder="350.00"
                              value={postData.price}
                              onChange={(e) => setPostData({...postData, price: parseFloat(e.target.value) || 0})}
                            />
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Stock Count */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                            Available Inventory Units *
                          </label>
                          <div className="relative">
                            <input 
                              type="number"
                              required
                              min="1"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3.5 sm:py-4 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-mono font-bold text-xs sm:text-sm"
                              placeholder="15"
                              value={postData.stockCount}
                              onChange={(e) => setPostData({...postData, stockCount: parseInt(e.target.value, 10) || 1})}
                            />
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {/* SKU Reference Code */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                            SKU / Item Reference Code
                          </label>
                          <div className="relative">
                            <input 
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-3.5 sm:py-4 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-mono font-bold text-xs sm:text-sm"
                              placeholder="RH-INV-2026-X"
                              value={postData.sku}
                              onChange={(e) => setPostData({...postData, sku: e.target.value})}
                            />
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Condition Standard */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                            Condition Standard
                          </label>
                          <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all cursor-pointer font-bold text-xs sm:text-sm"
                            value={postData.condition}
                            onChange={(e) => setPostData({...postData, condition: e.target.value})}
                          >
                            {CONDITION_OPTIONS.map(cond => (
                              <option key={cond}>{cond}</option>
                            ))}
                          </select>
                        </div>

                        {/* Origin Vault Location */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                            Dispatch Origin Location
                          </label>
                          <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-5 py-3.5 sm:py-4 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all cursor-pointer font-bold text-xs sm:text-sm"
                            value={postData.location}
                            onChange={(e) => setPostData({...postData, location: e.target.value})}
                          >
                            {LOCATION_PRESETS.map(loc => (
                              <option key={loc}>{loc}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 3. OPTIONAL DESCRIPTION */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 ml-1">
                            The Mission Narrative & Specifications (Optional)
                          </label>
                          <span className="text-[10px] text-gray-400 italic">Optional</span>
                        </div>
                        <textarea 
                          rows={4}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all resize-none font-medium text-xs sm:text-sm leading-relaxed"
                          placeholder="Define the offering, artisan provenance, metallurgical tolerances, or craft specifications (optional)..."
                          value={postData.description}
                          onChange={(e) => setPostData({...postData, description: e.target.value})}
                        />
                      </div>

                      {/* Submit CTA */}
                      <button 
                        type="submit"
                        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-4 sm:py-5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.35em] transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 active:scale-[0.99]"
                      >
                        <PlusCircle className="h-5 w-5" /> Deploy Entry to Marketplace
                      </button>
                    </form>
                  )}
                </div>
              )
            )}

            {/* 7. SHOPPING BAG - MOBILE OPTIMIZED */}
            {activeTab === 'cart' && (
              <div className="space-y-6 sm:space-y-12 h-full flex flex-col">
                <div>
                  <span className="text-[#2563EB] font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] block mb-1">
                    Verified Bag
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1A1A1A]">Shopping Bag</h2>
                  <p className="text-gray-400 font-light text-xs sm:text-base mt-0.5">
                    Your curated selections ready for secure checkout.
                  </p>
                </div>

                <div className="flex-1 space-y-4 sm:space-y-6">
                  {cartItems.length > 0 ? (
                    <div className="space-y-4 sm:space-y-6">
                      {cartItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-colors"
                        >
                          <div className="h-40 sm:h-28 sm:w-28 w-full shrink-0 overflow-hidden rounded-xl bg-gray-200">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">
                                  {item.category}
                                </span>
                                <h4 className="text-base sm:text-xl font-black text-[#1A1A1A] mt-0.5 leading-snug">
                                  {item.name}
                                </h4>
                                {item.warehouseLocation && (
                                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                                    Dispatches from: {item.warehouseLocation}
                                  </p>
                                )}
                              </div>
                              <button 
                                onClick={() => onRemoveFromCart?.(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 shrink-0"
                                title="Remove from bag"
                              >
                                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/60 sm:border-0 sm:pt-0">
                              <p className="text-lg sm:text-2xl font-black text-[#2563EB]">
                                ${item.price.toFixed(2)}
                              </p>
                              <div className="flex items-center border border-gray-200 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 gap-4 bg-white shadow-sm">
                                <span className="text-xs text-gray-400 uppercase font-bold">Qty</span>
                                <span className="text-xs sm:text-sm font-black text-[#1A1A1A]">1</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 sm:py-28 text-center space-y-4 sm:space-y-6">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-200/80">
                        <ShoppingCart className="h-7 w-7 sm:h-9 sm:w-9 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-2xl font-black text-[#1A1A1A]">Your shopping bag is empty</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                          Explore our in-stock catalogs or request a custom quotation to add items.
                        </p>
                        <button 
                          onClick={() => onNavigate('Home')}
                          className="mt-5 inline-flex items-center gap-2 bg-[#2563EB] text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1D4ED8] transition-all shadow-md shadow-blue-500/20"
                        >
                          Explore Marketplace <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="pt-6 sm:pt-10 border-t border-gray-100 mt-auto">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                      <div className="space-y-1">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.25em]">
                          Estimated Total ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                        </p>
                        <p className="text-3xl sm:text-5xl font-black text-[#1A1A1A] tracking-tight">
                          ${cartTotal.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-bold bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                        <CreditCard className="h-4 w-4 text-[#2563EB] shrink-0" />
                        <span>Secure Escrow & Encrypted Checkout</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onNavigate('Checkout')}
                      className="w-full bg-[#2563EB] text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.35em] shadow-xl shadow-blue-500/25 hover:bg-[#1D4ED8] transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 8. PREFERENCES */}
            {activeTab === 'settings' && (
              <div className="space-y-8 sm:space-y-12">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 sm:mb-4 text-[#1A1A1A]">Preferences</h2>
                  <p className="text-gray-400 font-light text-xs sm:text-lg">Customizing your experience in the network.</p>
                </div>

                <div className="space-y-8">
                  {/* Toggle Groups */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                    {[
                      { id: 'notifications', label: 'Push Notifications', desc: 'Receive real-time alerts on your tracking & quotes.', icon: Bell, state: prefs.notifications },
                      { id: 'newsletter', label: 'Royal Edit', desc: 'Our curated editorial delivered to your inbox.', icon: Zap, state: prefs.newsletter },
                      { id: 'visibility', label: 'Network Presence', desc: 'Allow other members to find your profile.', icon: Eye, state: prefs.visibility },
                      { id: 'twoFactor', label: 'Vault Protection', desc: 'High-level 2FA security for your account.', icon: Shield, state: prefs.twoFactor },
                    ].map((setting) => (
                      <div key={setting.id} className="p-5 sm:p-8 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4 sm:gap-6 hover:bg-white hover:shadow-xl transition-all group hover:border-blue-200">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${setting.state ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/30' : 'bg-gray-200 text-gray-400'}`}>
                          <setting.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-base sm:text-xl mb-1">{setting.label}</h4>
                          <p className="text-xs sm:text-sm text-gray-500 font-light mb-4 sm:mb-6">{setting.desc}</p>
                          <button 
                            onClick={() => setPrefs(prev => ({ ...prev, [setting.id]: !prev[setting.id as keyof typeof prev] }))}
                            className={`relative h-6 w-12 rounded-full transition-colors flex items-center px-1 ${setting.state ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
                          >
                            <div className={`h-4 w-4 bg-white rounded-full transition-transform ${setting.state ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-8 sm:pt-12 border-t border-gray-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500 mb-4 sm:mb-6">Danger Protocol</h4>
                    <div className="p-6 sm:p-10 bg-red-50 rounded-2xl border border-red-100 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-center md:text-left">
                        <p className="text-lg sm:text-xl font-black text-red-600 mb-1">Deactivate Account</p>
                        <p className="text-xs sm:text-sm text-red-400 font-light">Permanently delete your data and membership.</p>
                      </div>
                      <button className="w-full md:w-auto bg-red-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.25em] hover:bg-red-700 transition-all shadow-xl shadow-red-500/20">
                        Destroy Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* PHOTO SELECTION MODAL (LOCAL PHOTO HISTORY & GALLERY) */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-[#1A1A1A] uppercase tracking-wider">
                    Select Asset from Photo History
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    Choose from historical curated archives or upload your own photo
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-gray-400 hover:text-gray-800 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Category tabs & Upload shortcut */}
            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {['All', 'Books', 'Spare Parts', 'Fabric', 'Fashion', 'Industrial & older'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPhotoModalTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      photoModalTab === tab
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-all"
              >
                <Upload className="h-3.5 w-3.5" /> Upload New Photo
              </button>
            </div>

            {/* Photo Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photoHistory
                .filter(item => photoModalTab === 'All' || item.category === photoModalTab)
                .map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => handleSelectPhoto(photo.url)}
                    className={`group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-[1.02] ${
                      (editingPost ? editingPost.image === photo.url : postData.image === photo.url)
                        ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-md'
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                      <span className="text-[9px] text-[#2563EB] bg-white/90 font-black uppercase px-1.5 py-0.5 rounded w-fit mb-0.5">
                        {photo.category}
                      </span>
                      <p className="text-white text-xs font-bold truncate leading-tight">
                        {photo.title}
                      </p>
                    </div>

                    {(editingPost ? editingPost.image === photo.url : postData.image === photo.url) && (
                      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-md">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-gray-400">
                {photoHistory.length} photos in local archive
              </span>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VENTURE MODAL */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1A1A1A] uppercase tracking-wider">
                    Edit Venture Listing
                  </h3>
                  <p className="text-[10px] text-gray-400">Ref #{editingPost.sku || editingPost.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingPost(null)}
                className="text-gray-400 hover:text-gray-800 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="space-y-4 text-xs">
              {/* Image banner & Change photo button */}
              <div className="space-y-2">
                <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Photo / Asset</label>
                <div className="flex gap-3 items-center">
                  <div className="h-20 w-32 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                    <img src={editingPost.image} alt={editingPost.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setIsPhotoModalOpen(true)}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <History className="h-3.5 w-3.5" /> Choose from Photo History
                    </button>
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Camera className="h-3.5 w-3.5" /> Upload Replacement Photo
                    </button>
                    <input 
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, true)}
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Title *</label>
                <input
                  required
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Category, Price, Stock Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Sector</label>
                  <select
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-xs focus:outline-none focus:border-[#2563EB]"
                  >
                    {BUSINESS_CATEGORIES.map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Price ($USD)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={editingPost.price || 0}
                    onChange={(e) => setEditingPost({ ...editingPost, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPost.stockCount || 0}
                    onChange={(e) => setEditingPost({ ...editingPost, stockCount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono font-bold text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Description (Optional) */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Narrative & Specs (Optional)</label>
                  <span className="text-gray-400 text-[10px]">Optional</span>
                </div>
                <textarea
                  rows={3}
                  value={editingPost.description || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, description: e.target.value })}
                  placeholder="Optional specifications..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#2563EB] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#1A1A1A]">Remove Venture?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to kill this catalog listing? It will be removed from the live marketplace.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(deleteConfirmId)}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-red-500/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PENDING IMAGE UPLOAD THUMBNAIL CONFIRMATION MODAL */}
      {pendingUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-gray-100 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1A1A1A]">
                    Confirm Image Upload
                  </h3>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Preview local thumbnail before finalizing asset
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelPendingUpload}
                className="text-gray-400 hover:text-gray-700 text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Thumbnail Preview Area */}
            <div className="space-y-3">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-900 border-2 border-blue-500/40 shadow-inner group">
                <img 
                  src={pendingUpload.previewUrl} 
                  alt="Pending local asset" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/75 backdrop-blur-sm rounded text-[9px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 shadow">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Local Thumbnail Preview
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/75 backdrop-blur-sm rounded text-[10px] font-mono font-bold text-gray-200 shadow">
                  {pendingUpload.fileSizeFormatted}
                </div>
              </div>

              {/* Metadata Details */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Selected File:</span>
                  <span className="font-bold text-gray-800 truncate max-w-[200px]" title={pendingUpload.fileName}>
                    {pendingUpload.fileName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Target Category:</span>
                  <span className="font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                    {pendingUpload.category}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Target Destination:</span>
                  <span className="font-bold text-gray-700">
                    {pendingUpload.isEditing ? 'Venture Listing Update' : 'New Inventory Post'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCancelPendingUpload}
                className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                Discard / Rechoose
              </button>
              <button
                type="button"
                onClick={handleConfirmPendingUpload}
                className="w-1/2 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Confirm & Use Image
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
