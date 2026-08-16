import React, { useEffect, useMemo, useState } from 'react';
import { Box, CheckCircle2, ClipboardList, DollarSign, Image as ImageIcon, PackagePlus, Save, Search, Shield, Trash2 } from 'lucide-react';
import { ASSET_IMAGES, CATEGORIES } from '../constants';
import { Product, ProductCategory } from '../types';

type StockStatus = Product['stockStatus'];

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  adminToken?: string | null;
  onAdminLogin?: (email: string, password: string) => Promise<any>;
  forceLoginView?: boolean;
  onSuccessfulAdminLogin?: () => void;
  marketplaceRefreshTick?: number;
  onMarketplaceRefresh?: () => void;
}

const stockStatuses: StockStatus[] = ['In Stock', 'Low Stock', 'Ready to Ship', 'Limited Stock'];

const imageOptions = [
  { label: 'Book Front', value: ASSET_IMAGES.frontPage },
  { label: 'Book Back', value: ASSET_IMAGES.backPage },
  { label: 'Oil Bundle', value: ASSET_IMAGES.oilBundle },
  { label: 'Oil Product', value: ASSET_IMAGES.oil },
  { label: 'Satin Orange', value: ASSET_IMAGES.satinOrange },
  { label: 'Satin Beige', value: ASSET_IMAGES.satinBeige },
  { label: 'Satin Pink', value: ASSET_IMAGES.satinPink },
  { label: 'Satin Coffee', value: ASSET_IMAGES.satinCoffeeBrown },
  { label: 'Satin Olive', value: ASSET_IMAGES.satinOliveGreen },
  { label: 'Royal Hints Logo', value: ASSET_IMAGES.logo },
];

const initialForm = {
  name: '',
  price: '0',
  category: 'Books' as ProductCategory,
  image: ASSET_IMAGES.frontPage,
  sku: '',
  stockQuantity: '1',
  stockStatus: 'In Stock' as StockStatus,
  warehouseLocation: '',
  dispatchTime: 'Dispatches in 24 hours',
  description: '',
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  adminToken,
  onAdminLogin,
  forceLoginView,
  onSuccessfulAdminLogin,
  marketplaceRefreshTick,
  onMarketplaceRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'post' | 'inventory'>('post');
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendPosts, setBackendPosts] = useState<Array<{ id: string; title: string; category: string; description: string; image?: string; created_at?: string }>>([]);
  const [loginForm, setLoginForm] = useState({
    email: 'admin@royalhints.com',
    password: 'RoyalHintsAdmin#2026',
  });

  const loadBackendPosts = async () => {
    if (!adminToken) {
      setBackendPosts([]);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/posts', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const rawText = await response.text();
      let data: any = {};

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (error) {
          throw new Error('The admin backend is not responding with valid JSON. Check that the backend is running and not blocked by a port conflict.');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch backend posts');
      }

      setBackendPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load admin backend posts', error);
      setBackendPosts([]);
    }
  };

  useEffect(() => {
    loadBackendPosts();

    if (!adminToken) return;

    const timer = window.setInterval(() => {
      loadBackendPosts();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [adminToken, marketplaceRefreshTick]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  }, [products, search]);

  const totalStock = products.reduce((sum, product) => sum + product.stockQuantity, 0);
  const lowStockCount = products.filter((product) => product.stockQuantity <= 10 || product.stockStatus === 'Low Stock').length;

  const flashSaved = (message: string) => {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(''), 2500);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = form.name.trim();
    if (!cleanName) return;

    try {
      setIsSubmitting(true);
      setLoginError('');

      let token = adminToken;
      if (!token && onAdminLogin) {
        await onAdminLogin(loginForm.email.trim(), loginForm.password);
        token = localStorage.getItem('royalhints_admin_token');
      }

      if (!token) {
        throw new Error('Admin login required to publish inventory.');
      }

      onSuccessfulAdminLogin?.();

      const backendPayload = {
        title: cleanName,
        description: form.description.trim() || 'Freshly listed Royal Hints stock item.',
        category: form.category,
        image: form.image,
      };

      const response = await fetch('http://localhost:5000/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(backendPayload),
      });

      const rawText = await response.text();
      let data: any = {};

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (error) {
          throw new Error('The admin backend is not responding with valid JSON. Check that the backend is running and not blocked by a port conflict.');
        }
      }

      if (!response.ok) {
        throw new Error(data.message || 'Unable to publish item to the backend');
      }

      if (data.post) {
        setBackendPosts((prev) => [data.post, ...prev]);
      }

      await loadBackendPosts();
      onMarketplaceRefresh?.();

      onAddProduct({
        name: cleanName,
        price: Number(form.price) || 0,
        rating: 5,
        category: form.category,
        image: form.image,
        isNew: true,
        sku: form.sku.trim() || `RH-${form.category.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-5)}`,
        inStock: Number(form.stockQuantity) > 0,
        stockQuantity: Math.max(0, Number(form.stockQuantity) || 0),
        stockStatus: form.stockStatus,
        warehouseLocation: form.warehouseLocation.trim() || 'Royal Hints Main Stockroom',
        dispatchTime: form.dispatchTime.trim() || 'Dispatches in 24 hours',
        description: form.description.trim() || 'Freshly listed Royal Hints stock item.',
        highlights: [
          'Verified physical stock item',
          'Admin listed and ready for catalog display',
          'Inventory count can be updated from the admin dashboard',
        ],
        specifications: {
          Source: 'Royal Hints Admin',
          Category: form.category,
          Status: form.stockStatus,
        },
        variants: [
          {
            id: `v-${Date.now()}`,
            name: 'Standard Stock Unit',
            stock: Math.max(0, Number(form.stockQuantity) || 0),
            sku: form.sku.trim() || `RH-${Date.now().toString().slice(-5)}`,
          },
        ],
        galleryImages: [form.image],
      });

      setForm(initialForm);
      setActiveTab('inventory');
      flashSaved(`You have added "${cleanName}" to the marketplace.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to publish stock item';
      setLoginError(message);
      flashSaved(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStock = (product: Product, stockQuantity: number) => {
    const safeStock = Math.max(0, stockQuantity);
    onUpdateProduct(product.id, {
      stockQuantity: safeStock,
      inStock: safeStock > 0,
      stockStatus: safeStock === 0 ? 'Limited Stock' : product.stockStatus,
      variants: product.variants.map((variant, index) => index === 0 ? { ...variant, stock: safeStock } : variant),
    });
  };

  if (forceLoginView || !adminToken) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pt-32 pb-24 px-4 md:px-12 lg:px-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1A1A1A] text-white rounded-[12px] p-8 md:p-12 shadow-xl shadow-black/5 border border-white/10">
            <div className="inline-flex items-center gap-2 text-[#FF6600] text-[10px] font-black uppercase tracking-[0.3em] mb-5">
              <Shield className="h-4 w-4" /> Admin Access
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Please sign in</h1>
            <p className="text-gray-400 mb-8">Access the admin publishing dashboard to list inventory and manage the storefront catalog.</p>

            {loginError && (
              <div className="rounded-[10px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700 mb-6">
                {loginError}
              </div>
            )}

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  setLoginError('');
                  setIsSubmitting(true);

                  if (!onAdminLogin) {
                    throw new Error('Admin login handler is unavailable.');
                  }

                  await onAdminLogin(loginForm.email.trim(), loginForm.password.trim());
                  onSuccessfulAdminLogin?.();
                } catch (error) {
                  const message = error instanceof Error ? error.message : 'Unable to login as admin';
                  setLoginError(message);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-5"
            >
              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Email</span>
                <input
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold text-[#1A1A1A] focus:outline-none focus:border-[#FF6600]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold text-[#1A1A1A] focus:outline-none focus:border-[#FF6600]"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF6600] text-white py-5 rounded-[10px] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-[#FF6600] transition-all shadow-xl shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in to admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-32 pb-24 px-4 md:px-12 lg:px-24">
      <div className="max-w-screen-2xl mx-auto space-y-10">
        <section className="bg-[#1A1A1A] text-white rounded-[12px] p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 h-64 w-64 bg-[#FF6600]/20 blur-3xl rounded-full -mr-24 -mt-24"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 text-[#FF6600] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                <Shield className="h-4 w-4" /> Admin Control
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">Inventory Dashboard</h1>
              <p className="text-gray-400 mt-4 max-w-2xl">Post what is physically in stock, adjust live quantities, and keep the storefront catalog accurate.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="bg-white/5 border border-white/10 rounded-[8px] p-5">
                <p className="text-3xl font-black text-[#1A1A1A]">{products.length}</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black">Items</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[8px] p-5">
                <p className="text-3xl font-black">{totalStock}</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black">Units</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[8px] p-5">
                <p className="text-3xl font-black text-[#1A1A1A]">{lowStockCount}</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-black">Low</p>
              </div>
            </div>
          </div>
        </section>

        {savedMessage && (
          <div className="bg-gray-50 border border-gray-100 text-[#FF6600] rounded-[8px] px-5 py-4 flex items-center gap-3 text-sm font-bold">
            <CheckCircle2 className="h-5 w-5" /> {savedMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('post')}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'post' ? 'bg-[#FF6600] text-white shadow-lg shadow-orange-500/20' : 'bg-white text-gray-500 border border-gray-100 hover:text-[#FF6600]'}`}
          >
            <PackagePlus className="h-4 w-4" /> Post Stock
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-[#FF6600] text-white shadow-lg shadow-orange-500/20' : 'bg-white text-gray-500 border border-gray-100 hover:text-[#FF6600]'}`}
          >
            <ClipboardList className="h-4 w-4" /> Update Inventory
          </button>
        </div>

        {activeTab === 'post' && (
          <div className="bg-white rounded-[12px] p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
            {!adminToken && (
              <div className="rounded-[10px] border border-[#FF6600]/20 bg-[#FFF4EB] p-5 text-[#1A1A1A]">
                <h3 className="text-lg font-black tracking-tight mb-3">Admin login required</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Email</span>
                    <input
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-3 font-bold focus:outline-none focus:border-[#FF6600]"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Password</span>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-3 font-bold focus:outline-none focus:border-[#FF6600]"
                    />
                  </label>
                </div>
              </div>
            )}

            {loginError && (
              <div className="rounded-[10px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                {loginError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-[#1A1A1A]">Post What Is In Stock</h2>
                <p className="text-gray-400 text-sm mt-2">This creates a new product card on the public catalog and stores it through the admin backend.</p>
              </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Product Name</span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold focus:outline-none focus:border-[#FF6600]" placeholder="Russian Satin Orange" />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Category</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold focus:outline-none focus:border-[#FF6600]">
                    {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">SKU</span>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold focus:outline-none focus:border-[#FF6600]" placeholder="RH-FB-1001" />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Price</span>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold focus:outline-none focus:border-[#FF6600]" />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Stock Count</span>
                  <input type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold focus:outline-none focus:border-[#FF6600]" />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Stock Status</span>
                  <select value={form.stockStatus} onChange={(e) => setForm({ ...form, stockStatus: e.target.value as StockStatus })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold focus:outline-none focus:border-[#FF6600]">
                    {stockStatuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Dispatch Time</span>
                  <input value={form.dispatchTime} onChange={(e) => setForm({ ...form, dispatchTime: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold focus:outline-none focus:border-[#FF6600]" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Warehouse Location</span>
                  <input value={form.warehouseLocation} onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold focus:outline-none focus:border-[#FF6600]" placeholder="Main Stockroom - Shelf A1" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Description</span>
                  <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-medium resize-none focus:outline-none focus:border-[#FF6600]" placeholder="Describe the stock item customers will see." />
                </label>
              </div>

              <div className="space-y-5">
                <label className="space-y-2 block">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-gray-400">Product Image</span>
                  <select value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-5 py-4 font-bold focus:outline-none focus:border-[#FF6600]">
                    {imageOptions.map((image) => <option key={image.label} value={image.value}>{image.label}</option>)}
                  </select>
                </label>
                <div className="rounded-[10px] overflow-hidden border border-gray-100 bg-gray-50">
                  <img src={form.image} alt="Selected product preview" className="w-full aspect-[4/5] object-cover" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FF6600] text-white py-5 rounded-[10px] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-[#FF6600] transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <PackagePlus className="h-5 w-5" /> {isSubmitting ? 'Publishing...' : 'Publish Stock Item'}
                </button>
              </div>
            </div>
          </form>
        </div>
        )}

        {activeTab === 'inventory' && (
          <section className="bg-white rounded-[12px] p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div>
                <h2 className="text-3xl font-black text-[#1A1A1A]">Update Inventory</h2>
                <p className="text-gray-400 text-sm mt-2">Changes update the storefront immediately in this browser and are saved locally.</p>
              </div>
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-5 py-3 text-sm font-bold focus:outline-none focus:border-[#FF6600]" placeholder="Search stock..." />
              </div>
            </div>

            {backendPosts.length > 0 && (
              <div className="rounded-[12px] border border-[#FF6600]/20 bg-[#FFF4EB] p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FF6600]">Persisted backend listings</p>
                    <h3 className="text-xl font-black text-[#1A1A1A] mt-2">Marketplace records</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {backendPosts.map((post) => (
                    <div key={post.id} className="bg-white border border-[#FF6600]/10 rounded-[10px] p-4 shadow-sm relative group">
                      {post.image && <img src={post.image} alt={post.title} className="h-28 w-full rounded-[8px] object-cover mb-3" />}
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FF6600]">{post.category}</p>
                      <h4 className="mt-2 font-black text-[#1A1A1A]">{post.title}</h4>
                      <p className="mt-2 text-xs text-gray-500 line-clamp-3">{post.description}</p>
                      {post.created_at && (
                        <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-gray-400">
                          {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                      <button 
                        onClick={async () => {
                          console.log('Delete button clicked for post:', post.id);
                          if (!adminToken) {
                            console.log('No admin token found');
                            return;
                          }
                          try {
                            console.log('Attempting to delete post with token:', adminToken.substring(0, 10) + '...');
                            const response = await fetch(`http://localhost:5000/api/admin/posts/${post.id}`, {
                              method: 'DELETE',
                              headers: {
                                Authorization: `Bearer ${adminToken}`,
                              },
                            });
                            
                            console.log('Delete response status:', response.status);
                            
                            if (response.ok) {
                              console.log('Delete successful');
                              setBackendPosts(prev => prev.filter(p => p.id !== post.id));
                              onMarketplaceRefresh?.();
                              flashSaved(`Post "${post.title}" has been removed from marketplace.`);
                            } else {
                              const data = await response.json();
                              console.log('Delete failed:', data);
                              throw new Error(data.message || 'Unable to delete post');
                            }
                          } catch (error) {
                            const message = error instanceof Error ? error.message : 'Unable to delete post';
                            console.error('Delete error:', message);
                            setLoginError(message);
                            flashSaved(message);
                          }
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove from marketplace"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="grid grid-cols-1 xl:grid-cols-[96px_1fr_140px_140px_170px_120px] gap-4 items-center border border-gray-100 rounded-[10px] p-4 hover:border-gray-200 transition-colors">
                  <img src={product.image} alt={product.name} className="h-24 w-24 rounded-[8px] object-cover bg-gray-100" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">{product.category} / {product.sku}</p>
                    <h3 className="font-black text-lg text-[#1A1A1A] truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{product.warehouseLocation}</p>
                  </div>
                  <label className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Price</span>
                    <input type="number" min="0" step="0.01" value={product.price} onChange={(e) => onUpdateProduct(product.id, { price: Number(e.target.value) || 0 })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-3 py-2 font-bold focus:outline-none focus:border-[#FF6600]" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><Box className="h-3 w-3" /> Units</span>
                    <input type="number" min="0" value={product.stockQuantity} onChange={(e) => updateStock(product, Number(e.target.value) || 0)} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-3 py-2 font-bold focus:outline-none focus:border-[#FF6600]" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Status</span>
                    <select value={product.stockStatus} onChange={(e) => onUpdateProduct(product.id, { stockStatus: e.target.value as StockStatus })} className="w-full bg-gray-50 border border-gray-200 rounded-[8px] px-3 py-2 font-bold focus:outline-none focus:border-[#FF6600]">
                      {stockStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <button onClick={() => onDeleteProduct(product.id)} className="h-10 rounded-[8px] bg-gray-50 text-gray-500 hover:bg-gray-500 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-24 text-center text-gray-400">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-200" />
                <p className="font-black">No inventory items match that search.</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Save className="h-4 w-4 text-[#FF6600]" /> Inventory changes are saved to local storage.
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
