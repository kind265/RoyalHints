import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TrendingGrid from './components/TrendingGrid';
import HomeSections from './components/HomeSections';
import Footer from './components/Footer';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Checkout from './components/Checkout';
import ProductDetail from './components/ProductDetail';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PublicLookupPage from './components/PublicLookupPage';
import FreshStock from './components/FreshStock';
import QualitySection from './components/QualitySection';
import LegalPage from './components/LegalPage';
import { Bot, MessageCircle } from 'lucide-react';
import { 
  User, 
  BusinessPost, 
  Review, 
  Product, 
  ProductCategory, 
  ProductVariant,
  ShipmentTracking,
  QuotationRequest,
  BespokeSourcingRequest
} from './types';
import { apiClient } from './backend/api-client';

type Page = 'Home' | 'Auth' | 'Admin' | 'Dashboard' | 'Marketplace' | 'Checkout' | 'About' | 'Contact' | 'OrderTracking' | 'CompletePayment' | 'Terms' | 'Privacy';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || search.includes('admin') || hash.includes('admin')) {
        return 'Admin';
      }
      if (path.startsWith('/marketplace') || hash.includes('marketplace')) {
        return 'Marketplace';
      }
      if (path.startsWith('/dashboard') || hash.includes('dashboard')) {
        return 'Dashboard';
      }
      if (path.startsWith('/checkout') || hash.includes('checkout')) {
        return 'Checkout';
      }
      if (path.startsWith('/about')) return 'About';
      if (path.startsWith('/contact')) return 'Contact';
      if (path.startsWith('/order-tracking')) return 'OrderTracking';
      if (path.startsWith('/complete-payment')) return 'CompletePayment';
      if (path.startsWith('/terms')) return 'Terms';
      if (path.startsWith('/privacy')) return 'Privacy';
    }
    return 'Home';
  });
  const [dashboardTab, setDashboardTab] = useState<string>('account');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [user, setUser] = useState<User | null>(() => {
    return null;
  });
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  
  const [posts, setPosts] = useState<BusinessPost[]>(() => {
    return [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    return [];
  });

  // Tracking, Quotations, and Bespoke Requests State
  const [shipments, setShipments] = useState<ShipmentTracking[]>(() => {
    return [];
  });

  const [quotations, setQuotations] = useState<QuotationRequest[]>(() => {
    return [];
  });

  const [bespokeRequests, setBespokeRequests] = useState<BespokeSourcingRequest[]>(() => {
    return [];
  });

  // Load from PostgreSQL Backend API on mount
  useEffect(() => {
    apiClient.getSession().then(savedUser => {
      if (savedUser) setUser(savedUser);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const [fetchedPosts, fetchedProducts, fetchedShipments, fetchedQuotations, fetchedBespoke] = await Promise.all([
          apiClient.getPosts(),
          apiClient.getProducts(),
          apiClient.getShipments(),
          apiClient.getQuotations(),
          apiClient.getBespokeRequests()
        ]);

        if (Array.isArray(fetchedPosts)) setPosts(fetchedPosts);
        if (Array.isArray(fetchedProducts)) setProducts(fetchedProducts);
        if (Array.isArray(fetchedShipments)) setShipments(fetchedShipments);
        if (Array.isArray(fetchedQuotations)) setQuotations(fetchedQuotations);
        if (Array.isArray(fetchedBespoke)) setBespokeRequests(fetchedBespoke);
      } catch (err) {
        console.warn('Backend sync warning (using cached state):', err);
      }
    };

    syncWithBackend();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setCartLoaded(false);
      return;
    }
    setCartLoaded(false);
    apiClient.getCart(user.id).then(items => {
      setCartItems(items);
      setCartLoaded(true);
    }).catch(() => setCartLoaded(true));
  }, [user]);

  useEffect(() => {
    if (user && cartLoaded) apiClient.saveCart(user.id, cartItems).catch(err => console.error('Save cart error:', err));
  }, [user, cartItems, cartLoaded]);

  const handleLogin = (u: User) => {
    setUser(u);

    if (u.role === 'admin' || u.isAdmin) {
      setLoginNotice(null);
      setCurrentPage('Dashboard');
    } else {
      setLoginNotice('Your account is auto-created when you place an order. Continue shopping and your profile will be saved automatically.');
      setCurrentPage('Home');
    }

    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setUser(null);
    setLoginNotice(null);
    setCurrentPage('Home');
    window.scrollTo(0, 0);
  };

  const deletePost = async (postId: string) => {
    try {
      const deleted = await apiClient.deletePost(postId);
      if (deleted) {
        await apiClient.deleteProduct(postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
        setProducts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (e) {
      console.error('Delete post error:', e);
    }
  };

  const updatePost = async (updatedPost: BusinessPost) => {
    try {
      const savedPost = await apiClient.updatePost(updatedPost.id, updatedPost);
      if (savedPost) {
        const savedProduct = await apiClient.updateProduct(updatedPost.id, {
          name: updatedPost.title,
          price: updatedPost.price ?? 0,
          category: updatedPost.category as ProductCategory,
          image: updatedPost.image,
          sku: updatedPost.sku,
          inStock: (updatedPost.stockCount ?? 0) > 0,
          stockQuantity: updatedPost.stockCount ?? 0,
          description: updatedPost.description || '',
          warehouseLocation: updatedPost.location,
          dispatchTime: updatedPost.dispatchTime,
          galleryImages: updatedPost.galleryImages || []
        });
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? savedPost : p));
        if (savedProduct) setProducts(prev => prev.map(p => p.id === updatedPost.id ? savedProduct : p));
      }
    } catch (e) {
      console.error('Update post error:', e);
    }
  };

  const addPost = async (newPost: Omit<BusinessPost, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    if (!user) return;
    const post: BusinessPost = {
      ...newPost,
      id: `mp-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      timestamp: Date.now(),
      reviews: [],
    };
    try {
      const savedPost = await apiClient.createPost(post);
      if (!savedPost) return;

      if (user.role === 'admin' || user.isAdmin) {
        const savedProduct = await apiClient.createProduct({
          id: savedPost.id,
          name: savedPost.title,
          price: savedPost.price ?? 0,
          category: savedPost.category as ProductCategory,
          image: savedPost.image,
          sku: savedPost.sku,
          inStock: (savedPost.stockCount ?? 0) > 0,
          stockQuantity: savedPost.stockCount ?? 0,
          description: savedPost.description || '',
          warehouseLocation: savedPost.location,
          dispatchTime: savedPost.dispatchTime,
          galleryImages: savedPost.galleryImages || []
        });
        if (savedProduct) setProducts(prev => [savedProduct, ...prev]);
      }
      setPosts(prev => [savedPost, ...prev]);
    } catch (e) {
      console.error('Create post error:', e);
    }
  };

  const addReviewToPost = (postId: string, review: Omit<Review, 'id'>) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const newReview: Review = {
          ...review,
          id: `rev-${Date.now()}`,
        };
        return {
          ...post,
          reviews: [...(post.reviews || []), newReview],
        };
      }
      return post;
    }));
  };

  const addToCart = (product: Product, quantity: number = 1, variant?: ProductVariant) => {
    setCartItems(prev => {
      const itemWithVariant = variant ? {
        ...product,
        price: product.price + (variant.priceModifier || 0),
        name: `${product.name} (${variant.name})`,
        sku: variant.sku
      } : product;

      if (!prev.find(item => item.id === itemWithVariant.id && item.sku === itemWithVariant.sku)) {
        return [...prev, itemWithVariant];
      }
      return prev;
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const moveToCart = (product: Product) => {
    addToCart(product);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Quotation handlers
  const handleAddQuotation = async (newQuote: Omit<QuotationRequest, 'id' | 'quoteNumber' | 'submittedAt' | 'status'>) => {
    const num = Math.floor(100 + Math.random() * 900);
    const quote: QuotationRequest = {
      ...newQuote,
      id: `quo-${Date.now()}`,
      quoteNumber: `RH-QUO-${new Date().getFullYear()}-${num}`,
      submittedAt: Date.now(),
      status: 'Under Review'
    };
    const created = await apiClient.submitQuotation(quote);
    setQuotations(prev => [created || quote, ...prev]);
  };

  const handleAcceptQuoteToCart = (quote: QuotationRequest) => {
    const quoteProduct: Product = {
      id: `prod-${quote.id}`,
      name: `Quotation Order: ${quote.title}`,
      description: `Official Quotation #${quote.quoteNumber} (${quote.estimatedQuantity} units). ${quote.specifications}`,
      price: quote.adminQuote ? quote.adminQuote.totalAmount : 0,
      category: (quote.category === 'Industrial & Bespoke' ? 'Spare Parts' : quote.category) as ProductCategory,
      image: '/assets/jacket.png',
      rating: 5.0,
      sku: quote.quoteNumber,
      inStock: true,
      stockQuantity: quote.estimatedQuantity,
      stockStatus: 'Ready to Ship',
      warehouseLocation: 'Lilongwe',
      dispatchTime: 'Dispatches in 24 hours',
      highlights: ['Custom manufactured', 'Full warranty coverage'],
      specifications: {},
      variants: []
    };
    addToCart(quoteProduct);
    setQuotations(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Approved & Locked' } : q));
  };

  // Bespoke Sourcing Handlers
  const handleAddBespokeRequest = async (newReq: Omit<BespokeSourcingRequest, 'id' | 'referenceNumber' | 'submittedAt' | 'status' | 'adminRecipient'>) => {
    const ref = Math.floor(1000 + Math.random() * 9000);
    const req: BespokeSourcingRequest = {
      ...newReq,
      id: `bespoke-${Date.now()}`,
      referenceNumber: `RH-REQ-${ref}`,
      submittedAt: Date.now(),
      status: 'Received by Admin',
      adminRecipient: 'admin@royalhints.com',
    };
    const created = await apiClient.submitBespokeRequest(req);
    setBespokeRequests(prev => [created || req, ...prev]);
  };

  const handleAcceptBespokeOfferToCart = (req: BespokeSourcingRequest) => {
    const bespokeProduct: Product = {
      id: `prod-${req.id}`,
      name: `Bespoke Sourced: ${req.itemName}`,
      description: `Bespoke Concierge item (${req.category}) sourced directly via Admin Desk #${req.referenceNumber}. Condition: ${req.conditionPreference}.`,
      price: req.adminResponse?.directOfferPrice || 0,
      category: (req.category === 'Industrial & Bespoke' || req.category === 'Rare Collectible' ? 'Spare Parts' : req.category) as ProductCategory,
      image: req.referenceLinkOrImageUrl || '/assets/coffie.png',
      rating: 5.0,
      sku: req.referenceNumber,
      inStock: true,
      stockQuantity: 1,
      stockStatus: 'In Stock',
      warehouseLocation: req.adminResponse?.networkLocationFound || 'Royal Hints Dispatch',
      dispatchTime: 'Dispatch after admin confirmation',
      highlights: ['Custom sourced item'],
      specifications: {},
      variants: []
    };
    addToCart(bespokeProduct);
  };

  // Listen for browser popstate and URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || search.includes('admin') || hash.includes('admin')) {
        setCurrentPage('Admin');
      } else if (path.startsWith('/marketplace') || hash.includes('marketplace')) {
        setCurrentPage('Marketplace');
      } else if (path.startsWith('/dashboard') || hash.includes('dashboard')) {
        setCurrentPage('Dashboard');
      } else if (path.startsWith('/checkout') || hash.includes('checkout')) {
        setCurrentPage('Checkout');
      } else if (path.startsWith('/about')) {
        setCurrentPage('About');
      } else if (path.startsWith('/contact')) {
        setCurrentPage('Contact');
      } else if (path.startsWith('/order-tracking')) {
        setCurrentPage('OrderTracking');
      } else if (path.startsWith('/complete-payment')) {
        setCurrentPage('CompletePayment');
      } else if (path.startsWith('/terms')) {
        setCurrentPage('Terms');
      } else if (path.startsWith('/privacy')) {
        setCurrentPage('Privacy');
      } else {
        setCurrentPage('Home');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Order Placement & Automated Shipment Creation in PostgreSQL + Buyer Auto-Activation
  const handleOrderPlaced = async (orderData: { 
    orderId: string; 
    trackingNumber: string; 
    items: Product[]; 
    shippingAddress: string;
    buyerUser?: User;
  }) => {
    const formattedDate = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const newShipment: ShipmentTracking = {
      id: `ship-${Date.now()}`,
      trackingNumber: orderData.trackingNumber,
      orderId: orderData.orderId,
      status: 'In Transit',
      carrier: 'Royal Hints Logistics',
      serviceType: 'Courier Delivery',
      origin: 'Royal Hints Dispatch',
      destination: orderData.shippingAddress,
      dispatchedDate: formattedDate,
      orderDate: formattedDate,
      estimatedDelivery: 'Pending courier update',
      paymentMethod: 'Verified Card / Wire Escrow',
      deliveryConfirmedByCustomer: false,
      items: orderData.items.map((it) => ({
        name: it.name,
        category: it.category,
        quantity: 1,
        image: it.image,
        price: it.price
      })),
      checkpoints: [
        {
          id: `cp-1`,
          title: 'Order Placed & Escrow Funded',
          location: orderData.shippingAddress,
          timestamp: `${formattedDate} • Confirmed`,
          completed: true,
          isCurrent: true
        }
      ]
    };
    setShipments([newShipment, ...shipments]);
    await apiClient.createShipment(newShipment);
  };

  // Delivery confirmation handler when customer presses "Confirm Product Received"
  const handleConfirmDelivery = async (trackingNumber: string) => {
    const formattedDate = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    setShipments(prev => prev.map(s => {
      if (s.trackingNumber === trackingNumber) {
        return {
          ...s,
          status: 'Delivered',
          deliveryConfirmedByCustomer: true,
          deliveryConfirmedAt: formattedDate,
          estimatedDelivery: `Delivered & Confirmed on ${formattedDate}`
        };
      }
      return s;
    }));
    await apiClient.confirmDelivery(trackingNumber);
  };

  const navigateTo = (page: Page, tab?: string) => {
    setSelectedProduct(null);
    setCurrentPage(page);
    if (tab) {
      setDashboardTab(tab);
    }
    setLoginNotice(null);
    
    // Update browser URL for clean routing
    try {
      if (page === 'Admin') {
        window.history.pushState(null, '', '/admin');
      } else if (page === 'Home') {
        window.history.pushState(null, '', '/');
      } else {
        const route = page === 'CompletePayment' ? 'complete-payment' : page === 'OrderTracking' ? 'order-tracking' : page.toLowerCase();
        window.history.pushState(null, '', `/${route}`);
      }
    } catch {
      // Fallback for isolated iframe environments
    }

    window.scrollTo(0, 0);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    window.scrollTo(0, 0);
  };

  const handleSelectCategory = (cat: ProductCategory | 'All') => {
    setSelectedCategory(cat);
    if (selectedProduct) {
      setSelectedProduct(null);
    }
  };

  const handleDirectCheckout = (product: Product, quantity: number = 1, variant?: ProductVariant) => {
    addToCart(product, quantity, variant);
    setSelectedProduct(null);
    setCurrentPage('Checkout');
    window.scrollTo(0, 0);
  };

  return (
    <div className="relative min-h-screen bg-white selection:bg-[#2563EB] selection:text-white">
      {currentPage !== 'Checkout' && (
        <Header 
          isScrolled={isScrolled} 
          onNavigate={navigateTo} 
          user={user} 
          onLogout={handleLogout}
          currentPage={currentPage}
          cartCount={cartItems.length}
          onSelectProduct={handleSelectProduct}
          onSelectCategory={handleSelectCategory}
          onAddToCart={addToCart}
          selectedCategory={selectedCategory}
          dashboardTab={dashboardTab}
          onSelectDashboardTab={(tab) => {
            setDashboardTab(tab);
            if (currentPage !== 'Dashboard') {
              setCurrentPage('Dashboard');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          shipments={shipments}
          quotations={quotations}
          posts={posts}
          products={products}
        />
      )}
      
      <main className={currentPage === 'Checkout' ? 'pt-0' : 'pt-20 sm:pt-24'}>
        {selectedProduct ? (
          <div className="animate-in fade-in duration-500">
            <ProductDetail
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              onSelectProduct={handleSelectProduct}
              onAddToCart={addToCart}
              onDirectCheckout={handleDirectCheckout}
              allProducts={[
                ...products,
                ...posts.map(p => ({
                  id: p.id,
                  name: p.title,
                  price: p.price ?? 0,
                  rating: 5.0,
                  category: p.category as any,
                  image: p.image,
                  sku: p.sku || `RH-${p.id.slice(-4)}`,
                  isNew: true,
                  inStock: (p.stockCount ?? 1) > 0,
                  stockQuantity: p.stockCount ?? 1,
                  stockStatus: 'In Stock' as const,
                  warehouseLocation: p.location || 'Shop',
                  dispatchTime: p.dispatchTime || '24h',
                  description: p.description || '',
                  galleryImages: p.galleryImages || [],
                  highlights: [],
                  specifications: {},
                  variants: []
                }))
              ]}
            />
          </div>
        ) : (
          <>
            {currentPage === 'Home' && (
              <div className="animate-in fade-in duration-700">
                {loginNotice && (
                  <div className="max-w-6xl mx-auto px-4 pt-6 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 text-blue-900 px-4 py-3 text-sm font-medium shadow-sm">
                      {loginNotice}
                    </div>
                  </div>
                )}
                <Hero onNavigate={navigateTo} />
                <HomeSections onNavigate={navigateTo} onSelectCategory={setSelectedCategory} />
                <TrendingGrid 
                  onSelectProduct={handleSelectProduct}
                  onAddToCart={addToCart} 
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  posts={posts}
                  products={products}
                  onNavigate={navigateTo}
                />
                <FreshStock products={products} onSelectProduct={handleSelectProduct} onAddToCart={addToCart} />
                <QualitySection />
              </div>
            )}

            {(currentPage === 'Auth' || currentPage === 'Admin') && (
              <div className="animate-in slide-in-from-bottom-8 fade-in duration-700">
                <Auth onLogin={handleLogin} onNavigateHome={() => navigateTo('Home')} />
              </div>
            )}

            {currentPage === 'Dashboard' && !user && (
              <div className="animate-in slide-in-from-bottom-8 fade-in duration-700">
                <Auth onLogin={handleLogin} onNavigateHome={() => navigateTo('Home')} />
              </div>
            )}

            {currentPage === 'Dashboard' && user && (
              <div className="animate-in fade-in duration-700">
                <Dashboard 
                  user={user || {
                    id: 'guest-session',
                    name: 'Guest Session',
                    email: '',
                    role: 'buyer',
                    isAdmin: false,
                    buyerUniqueId: 'guest-session'
                  }} 
                  onLogout={handleLogout} 
                  onNavigate={navigateTo}
                  onAddPost={addPost}
                  onDeletePost={deletePost}
                  onUpdatePost={updatePost}
                  posts={user && (user.role === 'admin' || user.isAdmin || user.email?.toLowerCase() === 'admin@royalhints.com') ? posts : posts.filter(p => user ? p.userId === user.id : true)}
                  cartItems={cartItems}
                  onRemoveFromCart={removeFromCart}
                  shipments={shipments}
                  onConfirmDelivery={handleConfirmDelivery}
                  quotations={quotations}
                  onAddQuotation={handleAddQuotation}
                  onAcceptQuoteToCart={handleAcceptQuoteToCart}
                  olderRequests={bespokeRequests}
                  onSubmitolderRequest={handleAddBespokeRequest}
                  onAcceptolderOfferToCart={handleAcceptBespokeOfferToCart}
                  initialTab={dashboardTab}
                  onTabChange={setDashboardTab}
                />
              </div>
            )}

            {currentPage === 'Marketplace' && (
              <div className="animate-in fade-in duration-700">
                <Marketplace 
                  posts={posts} 
                  user={user} 
                  onAddReview={addReviewToPost} 
                  onNavigate={navigateTo}
                  onAddPost={addPost}
                  onAddToCart={addToCart}
                />
              </div>
            )}

            {currentPage === 'Checkout' && (
              <div className="animate-in fade-in duration-700">
                <Checkout 
                  cartItems={cartItems} 
                  user={user}
                  onNavigate={navigateTo} 
                  onComplete={clearCart}
                  onOrderPlaced={handleOrderPlaced}
                />
              </div>
            )}

            {currentPage === 'About' && <AboutPage onNavigate={navigateTo} />}
            {currentPage === 'Contact' && <ContactPage onNavigate={navigateTo} />}
            {currentPage === 'OrderTracking' && <PublicLookupPage mode="tracking" onNavigate={navigateTo} />}
            {currentPage === 'CompletePayment' && <PublicLookupPage mode="payment" onNavigate={navigateTo} />}
            {currentPage === 'Terms' && <LegalPage type="terms" onNavigate={navigateTo} />}
            {currentPage === 'Privacy' && <LegalPage type="privacy" onNavigate={navigateTo} />}
          </>
        )}
      </main>

      <div className="fixed right-4 top-1/2 z-[60] flex -translate-y-1/2 flex-col gap-3">
        <a href="https://wa.me/265999323805" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-900/20 transition hover:scale-105 hover:bg-[#1ebe5d]"><MessageCircle className="h-6 w-6" /></a>
        <button type="button" aria-label="Open Royal Hints assistant" title="Open assistant" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg shadow-blue-900/25 transition hover:scale-105 hover:bg-[#1d4ed8]"><Bot className="h-6 w-6" /></button>
      </div>

      {['Home', 'Marketplace', 'Dashboard', 'About', 'Contact', 'OrderTracking', 'CompletePayment', 'Terms', 'Privacy'].includes(currentPage) && <Footer onNavigate={navigateTo} />}
    </div>
  );
};

export default App;
