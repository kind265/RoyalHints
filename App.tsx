import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import TrendingGrid from './components/TrendingGrid';
import TheEdit from './components/TheEdit';
import SocialProof from './components/SocialProof';
import Footer from './components/Footer';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Checkout from './components/Checkout';
import ProductDetail from './components/ProductDetail';
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

type Page = 'Home' | 'Auth' | 'Admin' | 'Dashboard' | 'Marketplace' | 'Checkout';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
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
    }
    return 'Home';
  });
  const [dashboardTab, setDashboardTab] = useState<string>('account');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('royalhints_user') || localStorage.getItem('primepulse_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [cartItems, setCartItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('royalhints_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('royalhints_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [posts, setPosts] = useState<BusinessPost[]>(() => {
    const savedPosts = localStorage.getItem('royalhints_posts');
    return savedPosts ? JSON.parse(savedPosts) : [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('royalhints_products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  // Tracking, Quotations, and Bespoke Requests State
  const [shipments, setShipments] = useState<ShipmentTracking[]>(() => {
    const saved = localStorage.getItem('royalhints_shipments');
    return saved ? JSON.parse(saved) : [];
  });

  const [quotations, setQuotations] = useState<QuotationRequest[]>(() => {
    const saved = localStorage.getItem('royalhints_quotations');
    return saved ? JSON.parse(saved) : [];
  });

  const [bespokeRequests, setBespokeRequests] = useState<BespokeSourcingRequest[]>(() => {
    const saved = localStorage.getItem('royalhints_bespoke_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Load from PostgreSQL Backend API on mount
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
    
    const savedUser = localStorage.getItem('royalhints_user') || localStorage.getItem('primepulse_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('royalhints_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('royalhints_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    localStorage.setItem('royalhints_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('royalhints_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('royalhints_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('royalhints_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('royalhints_bespoke_requests', JSON.stringify(bespokeRequests));
  }, [bespokeRequests]);

  const handleLogin = async (u: User) => {
    setUser(u);
    localStorage.setItem('royalhints_user', JSON.stringify(u));
    // Also notify PostgreSQL backend session
    await apiClient.login(u.email);
    setCurrentPage('Dashboard');
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('royalhints_user');
    localStorage.removeItem('primepulse_user');
    setCurrentPage('Home');
    window.scrollTo(0, 0);
  };

  const deletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await apiClient.deletePost(postId);
    } catch (e) {
      console.error('Delete post error:', e);
    }
  };

  const updatePost = async (updatedPost: BusinessPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    try {
      await apiClient.updatePost(updatedPost.id, updatedPost);
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
    setPosts(prev => [post, ...prev]);
    try {
      await apiClient.createPost(post);
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

  const toggleWishlist = (product: Product) => {
    setWishlistItems(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const moveToCart = (product: Product) => {
    toggleWishlist(product);
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
      image: 'assets/jacket.png',
      rating: 5.0,
      sku: quote.quoteNumber,
      inStock: true,
      stockQuantity: quote.estimatedQuantity,
      stockStatus: 'Ready to Send',
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
      image: req.referenceLinkOrImageUrl || 'assets/coffie.png',
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
    // 1. Auto-activate buyer user session with unique ID as username
    if (orderData.buyerUser) {
      setUser(orderData.buyerUser);
      localStorage.setItem('royalhints_user', JSON.stringify(orderData.buyerUser));
      apiClient.login(orderData.buyerUser.email).catch(() => {});
    }

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
    
    // Update browser URL for clean routing
    try {
      if (page === 'Admin') {
        window.history.pushState(null, '', '/admin');
      } else if (page === 'Home') {
        window.history.pushState(null, '', '/');
      } else {
        window.history.pushState(null, '', `/${page.toLowerCase()}`);
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
      
      <main className="pt-0">
        {selectedProduct ? (
          <div className="animate-in fade-in duration-500">
            <ProductDetail
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              onSelectProduct={handleSelectProduct}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              isWishlisted={wishlistItems.some(i => i.id === selectedProduct.id)}
              onDirectCheckout={handleDirectCheckout}
              allProducts={[
                ...products,
                ...posts.map(p => ({
                  id: p.id,
                  name: p.title,
                  price: p.price ?? 150,
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
                <Hero onNavigate={navigateTo} />
                <TrendingGrid 
                  onSelectProduct={handleSelectProduct}
                  onAddToCart={addToCart} 
                  onToggleWishlist={toggleWishlist} 
                  wishlistIds={wishlistItems.map(i => i.id)} 
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  posts={posts}
                  products={products}
                  onNavigate={navigateTo}
                />
                <TheEdit onSelectProduct={handleSelectProduct} />
                <SocialProof />
              </div>
            )}

            {(currentPage === 'Auth' || currentPage === 'Admin') && (
              <div className="animate-in slide-in-from-bottom-8 fade-in duration-700">
                <Auth onLogin={handleLogin} onNavigateHome={() => navigateTo('Home')} />
              </div>
            )}

            {currentPage === 'Dashboard' && (
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
                  wishlistItems={wishlistItems}
                  onToggleWishlist={toggleWishlist}
                  onMoveToCart={moveToCart}
                  shipments={shipments}
                  onConfirmDelivery={handleConfirmDelivery}
                  quotations={quotations}
                  onAddQuotation={handleAddQuotation}
                  onAcceptQuoteToCart={handleAcceptQuoteToCart}
                  bespokeRequests={bespokeRequests}
                  onSubmitBespokeRequest={handleAddBespokeRequest}
                  onAcceptBespokeOfferToCart={handleAcceptBespokeOfferToCart}
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
                  onNavigate={navigateTo} 
                  onComplete={clearCart}
                  onOrderPlaced={handleOrderPlaced}
                />
              </div>
            )}
          </>
        )}
      </main>

      {['Home', 'Marketplace', 'Dashboard'].includes(currentPage) && <Footer />}
    </div>
  );
};

export default App;
