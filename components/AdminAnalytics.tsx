import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Sparkles, 
  Package, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  DollarSign, 
  Layers, 
  Filter, 
  Crown, 
  Briefcase, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  User,
  MapPin,
  RefreshCw,
  Search,
  Tag
} from 'lucide-react';
import { ShipmentTracking, BespokeSourcingRequest, QuotationRequest, BusinessPost, DashboardTab } from '../types';

interface AdminAnalyticsProps {
  shipments: ShipmentTracking[];
  bespokeRequests: BespokeSourcingRequest[];
  quotations?: QuotationRequest[];
  posts?: BusinessPost[];
  onNavigateTab: (tab: DashboardTab) => void;
  onNavigatePage: (page: string) => void;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  shipments,
  bespokeRequests,
  quotations = [],
  posts = [],
  onNavigateTab,
  onNavigatePage
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | '30d' | '7d'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Compute Total Items Sold Metrics
  const soldItemsList: Array<{
    orderId: string;
    trackingNumber: string;
    itemName: string;
    category: string;
    quantity: number;
    price: number;
    totalAmount: number;
    image: string;
    destination: string;
    status: string;
    orderDate?: string;
    buyer: string;
  }> = [];

  shipments.forEach(shipment => {
    shipment.items.forEach(item => {
      soldItemsList.push({
        orderId: shipment.orderId,
        trackingNumber: shipment.trackingNumber,
        itemName: item.name,
        category: item.category || 'General',
        quantity: item.quantity || 1,
        price: item.price,
        totalAmount: item.price * (item.quantity || 1),
        image: item.image,
        destination: shipment.destination,
        status: shipment.status,
        orderDate: shipment.orderDate || shipment.dispatchedDate || 'Recent',
        buyer: shipment.orderId
      });
    });
  });

  const totalItemsSold = soldItemsList.reduce((acc, item) => acc + item.quantity, 0);
  const totalSalesRevenue = soldItemsList.reduce((acc, item) => acc + item.totalAmount, 0);
  const deliveredShipmentsCount = shipments.filter(s => s.status === 'Delivered').length;
  const inTransitShipmentsCount = shipments.filter(s => s.status !== 'Delivered').length;

  // Category sales breakdown
  const categorySalesMap: Record<string, { count: number; revenue: number }> = {};
  soldItemsList.forEach(item => {
    const cat = item.category;
    if (!categorySalesMap[cat]) {
      categorySalesMap[cat] = { count: 0, revenue: 0 };
    }
    categorySalesMap[cat].count += item.quantity;
    categorySalesMap[cat].revenue += item.totalAmount;
  });

  const categoryBreakdown = Object.entries(categorySalesMap).map(([category, data]) => ({
    category,
    count: data.count,
    revenue: data.revenue,
    percentage: totalItemsSold > 0 ? Math.round((data.count / totalItemsSold) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // 2. Compute Active Bespoke Sourcing Requests Metrics
  const activeBespokeRequests = bespokeRequests.filter(req => req.status !== 'Fulfilled');
  const fulfilledBespokeRequests = bespokeRequests.filter(req => req.status === 'Fulfilled');

  // Status breakdown of active bespoke requests
  const bespokeStatusCounts = {
    received: activeBespokeRequests.filter(r => r.status === 'Received by Admin').length,
    assigned: activeBespokeRequests.filter(r => r.status === 'Sourcing Specialist Assigned').length,
    located: activeBespokeRequests.filter(r => r.status === 'AT OUR SHOP IN LILONGWE').length,
    quoted: activeBespokeRequests.filter(r => r.status === 'Quoted & Ready').length,
  };

  // Category breakdown of active bespoke requests
  const bespokeCategoryMap: Record<string, number> = {};
  activeBespokeRequests.forEach(req => {
    bespokeCategoryMap[req.category] = (bespokeCategoryMap[req.category] || 0) + 1;
  });

  // Filtered sold items for ledger table
  const filteredSoldItems = soldItemsList.filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.itemName.toLowerCase().includes(q) || 
      item.orderId.toLowerCase().includes(q) ||
      item.trackingNumber.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#2563EB] text-[10px] font-black uppercase tracking-wider">
              Administrative Intelligence
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Live Updates</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1A1A1A]">
            Analytics Summary
          </h2>
          <p className="text-gray-400 font-light text-xs sm:text-base mt-1">
            Real time metrics for marketplace sales, order fulfillment, and sourcing requests.
          </p>
        </div>

        {/* Quick Nav Action Shortcuts */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => onNavigateTab('bespoke')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all"
          >
            Sourcing Desk
          </button>
          <button
            onClick={() => onNavigateTab('my-posts')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#2563EB] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
          >
            <Briefcase className="h-3.5 w-3.5" /> Manage Ventures
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: TOTAL ITEMS SOLD (Core Requirement) */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-50/70 via-white to-white rounded-2xl border border-blue-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-11 w-11 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <TrendingUp className="h-3 w-3" /> Live Orders
            </span>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 mb-1">
              Total Items Sold
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">
                {totalItemsSold}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Units Cleared
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100/90 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Delivered & In Transit:</span>
            <span className="font-bold text-[#1A1A1A]">
              {deliveredShipmentsCount} Delivered / {inTransitShipmentsCount} In Transit
            </span>
          </div>
        </div>

        {/* Card 2: ACTIVE BESPOKE SOURCING REQUESTS (Core Requirement) */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-50/70 via-white to-white rounded-2xl border border-amber-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full border border-amber-300/60">
              Active
            </span>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 mb-1">
              Active Requests
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">
                {activeBespokeRequests.length}
              </span>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                In Pipeline
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100/90 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Shop Located & Ready:</span>
            <span className="font-bold text-[#1A1A1A]">
              {bespokeStatusCounts.located + bespokeStatusCounts.quoted} of {activeBespokeRequests.length}
            </span>
          </div>
        </div>

        {/* Card 3: GROSS MERCHANDISE REVENUE */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
              Gross Volume
            </span>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 mb-1">
              Total Sales Volume
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight font-mono">
                MWK{totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Avg Transaction:</span>
            <span className="font-mono font-bold text-[#1A1A1A]">
              MWK{totalItemsSold > 0 ? (totalSalesRevenue / totalItemsSold).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        {/* Card 4: ACTIVE CATALOG & QUOTATIONS */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="h-11 w-11 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-md">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
              Catalog & Quotes
            </span>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400 mb-1">
              Live Listings & Quotes
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight">
                {posts.length}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Listings / {quotations.length} Quotes
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Shop Capacity:</span>
            <span className="font-bold text-emerald-600">Operational</span>
          </div>
        </div>

      </div>

      {/* 3. Breakdown Section: Sourcing Request Pipeline & Sales by Sector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left: Active Bespoke Sourcing Pipeline Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-7 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A]">
                  Active Sourcing Queue
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeBespokeRequests.length} active custom procurement missions
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('bespoke')}
              className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#2563EB] hover:text-[#1D4ED8] self-start sm:self-auto"
            >
              Open Desk <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Status Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-medium">Received</p>
              <p className="text-lg font-black text-[#1A1A1A] mt-0.5">{bespokeStatusCounts.received}</p>
            </div>
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-center">
              <p className="text-xs text-blue-600 font-medium">Assigned</p>
              <p className="text-lg font-black text-blue-700 mt-0.5">{bespokeStatusCounts.assigned}</p>
            </div>
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100 text-center">
              <p className="text-xs text-amber-700 font-medium">Shop</p>
              <p className="text-lg font-black text-amber-800 mt-0.5">{bespokeStatusCounts.located}</p>
            </div>
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-center">
              <p className="text-xs text-emerald-700 font-medium">Quoted & Ready</p>
              <p className="text-lg font-black text-emerald-800 mt-0.5">{bespokeStatusCounts.quoted}</p>
            </div>
          </div>

          {/* Active Bespoke Request Cards List */}
          <div className="space-y-3.5">
            {activeBespokeRequests.map((req) => (
              <div 
                key={req.id}
                className="p-4 bg-gray-50/90 hover:bg-blue-50/30 rounded-xl border border-gray-200/70 hover:border-blue-200 transition-all space-y-3 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-[#1A1A1A] text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                        {req.referenceNumber}
                      </span>
                      <span className="text-[10px] font-bold text-[#2563EB] bg-blue-100/70 px-2 py-0.5 rounded-md">
                        {req.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Target: <span className="font-bold text-gray-700">{req.budgetEstimate}</span>
                      </span>
                    </div>
                    <h4 className="font-black text-sm sm:text-base text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {req.itemName}
                    </h4>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    req.status === 'Located in Vault Network' 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : req.status === 'Quoted & Ready'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : req.status === 'Sourcing Specialist Assigned'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="text-xs text-gray-500 font-light line-clamp-2 bg-white p-2.5 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-700">Requirements:</span> {req.detailedRequirements}
                </div>

                {req.adminResponse && (
                  <div className="flex flex-wrap items-center justify-between text-[11px] gap-2 pt-1 border-t border-gray-200/60">
                    <span className="text-gray-500">
                      Curator: <strong className="text-gray-800">{req.adminResponse.assignedSpecialist}</strong>
                    </span>
                    {req.adminResponse.directOfferPrice && (
                      <span className="font-mono font-bold text-emerald-600">
                        Offered: MWK{req.adminResponse.directOfferPrice.toLocaleString()}
                      </span>
                    )}
                    <button 
                      onClick={() => onNavigateTab('bespoke')}
                      className="text-[#2563EB] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      View in Desk <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {activeBespokeRequests.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-black text-sm text-[#1A1A1A]">No Active Sourcing Requests</p>
                <p className="text-xs text-gray-400 mt-0.5">All procurement submissions are fulfilled.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sector Sales Distribution & Quick Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Category Sales Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-base sm:text-lg font-black text-[#1A1A1A]">
                  Items Sold by Sector
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                {totalItemsSold} Total Units
              </span>
            </div>

            <div className="space-y-4">
              {categoryBreakdown.map((item) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1A1A1A]">{item.category}</span>
                    <div className="flex items-center gap-2 font-mono text-gray-500">
                      <span className="font-bold text-gray-800">{item.count} {item.count === 1 ? 'unit' : 'units'}</span>
                      <span>(MWK{item.revenue.toLocaleString()})</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 8)}%` }}
                    />
                  </div>
                </div>
              ))}

              {categoryBreakdown.length === 0 && (
                <p className="text-xs text-gray-400 py-4 text-center">No sales records logged yet.</p>
              )}
            </div>
          </div>

          {/* Administrative Summary Snapshot Card */}
          <div className="bg-[#111827] text-white rounded-2xl p-5 sm:p-7 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Registry Telemetry</span>
            </div>
            
            <h4 className="text-lg font-black tracking-tight text-white">
              Royal Hints Commercial Summary
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/10">
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="text-gray-400 text-[10px] uppercase font-bold">Total Dispatches</p>
                <p className="text-xl font-black text-white font-mono mt-0.5">{shipments.length}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="text-gray-400 text-[10px] uppercase font-bold">Fulfillment Rate</p>
                <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                  {shipments.length > 0 ? Math.round((deliveredShipmentsCount / shipments.length) * 100) : 100}%
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Complete Sales & Sold Items Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-7 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#2563EB]" />
              <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A]">
                Sold Items & Fulfillment Ledger
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Audited record of all inventory units sold and dispatches processed
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter sold items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-[#2563EB] w-48 sm:w-56"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#2563EB]"
            >
              <option value="All">All Categories</option>
              <option value="Books">Books</option>
              <option value="Spare Parts">Spare Parts</option>
              <option value="Fabric">Fabric</option>
              <option value="Fashion">Fashion</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50/70">
                <th className="py-3 px-4 rounded-l-xl">Sold Item</th>
                <th className="py-3 px-3">Order Ref</th>
                <th className="py-3 px-3">Sector</th>
                <th className="py-3 px-3 text-center">Qty Sold</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredSoldItems.map((sold, idx) => (
                <tr key={`${sold.orderId}-${idx}`} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={sold.image} 
                        alt={sold.itemName}
                        className="h-10 w-10 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-200" 
                      />
                      <div>
                        <p className="font-black text-gray-900 text-xs sm:text-sm line-clamp-1">
                          {sold.itemName}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {sold.destination}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-gray-700 whitespace-nowrap">
                    {sold.orderId}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2563EB] text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                      {sold.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold font-mono text-gray-900">
                    {sold.quantity}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-gray-600">
                    MWK{sold.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#1A1A1A]">
                    MWK{sold.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      sold.status === 'Delivered' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    }`}>
                      {sold.status === 'Delivered' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {sold.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onNavigateTab('tracking')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-[#2563EB] hover:text-white rounded-lg text-[10px] font-bold transition-all"
                    >
                      Track
                    </button>
                  </td>
                </tr>
              ))}

              {filteredSoldItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No sold items match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
