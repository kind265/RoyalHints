
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Collections from './components/Collections';
import TrendingGrid from './components/TrendingGrid';
import TheEdit from './components/TheEdit';
import SocialProof from './components/SocialProof';
import Footer from './components/Footer';
import Marketplace from './components/Marketplace';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import { User, BusinessPost, Review, Product } from './types';
import { ASSET_IMAGES, TRENDING_PRODUCTS } from './constants';

type Page = 'Home' | 'Marketplace' | 'Checkout' | 'Admin';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('Home');
  const [guestId, setGuestId] = useState<string | null>(() => localStorage.getItem('royalhints_guest_id'));
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('royalhints_admin_token'));
  const [adminLoginView, setAdminLoginView] = useState(false);
  const [marketplaceRefreshTick, setMarketplaceRefreshTick] = useState(0);
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('royalhints_products');
    return savedProducts ? JSON.parse(savedProducts) : TRENDING_PRODUCTS;
  });
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [posts, setPosts] = useState<BusinessPost[]>([]);

  // Handle URL-based routing
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      
      if (path === '/admin' || path.startsWith('/admin')) {
        setCurrentPage('Admin');
        if (!adminToken) {
          setAdminLoginView(true);
        }
      } else if (path === '/marketplace' || path.startsWith('/marketplace')) {
        setCurrentPage('Marketplace');
      } else if (path === '/checkout' || path.startsWith('/checkout')) {
        setCurrentPage('Checkout');
      } else {
        setCurrentPage('Home');
        setAdminLoginView(false);
      }
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [adminToken]);

  const loadMarketplacePosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      if (!response.ok) return;

      const data = await response.json();
      if (!Array.isArray(data.posts)) return;

      const mappedPosts: BusinessPost[] = data.posts.map((post: any) => ({
        id: post.id,
        userId: 'admin-royalhints',
        userName: 'Royal Hints Admin',
        title: post.title,
        description: post.description,
        image: post.image || ASSET_IMAGES.logo,
        category: post.category,
        timestamp: post.created_at ? new Date(post.created_at).getTime() : Date.now(),
        reviews: [],
      }));

      setPosts(mappedPosts);
    } catch (error) {
      console.warn('Unable to load marketplace posts from backend:', error);
      setPosts([]);
    }
  };

  useEffect(() => {
    loadMarketplacePosts();

    const timer = window.setInterval(() => {
      loadMarketplacePosts();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [marketplaceRefreshTick]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    setCartItems([products[0], products[1]].filter(Boolean));
    setWishlistItems([products[2], products[3]].filter(Boolean));

    return () => window.removeEventListener('scroll', handleScroll);
  }, [products]);

  useEffect(() => {
    localStorage.setItem('royalhints_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('royalhints_admin_token', adminToken);
    } else {
      localStorage.removeItem('royalhints_admin_token');
    }
  }, [adminToken]);

  const loginAdmin = async (email: string, password: string) => {
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
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
      throw new Error(data.message || 'Unable to login as admin');
    }

    setAdminToken(data.token);
    setAdminLoginView(false);
    return data;
  };

  const ensureGuestId = () => {
    if (guestId) return guestId;

    const createdGuestId = crypto.randomUUID();
    setGuestId(createdGuestId);
    localStorage.setItem('royalhints_guest_id', createdGuestId);
    return createdGuestId;
  };

  const guestUser: User = {
    id: guestId || 'guest-customer',
    name: 'Guest Customer',
    email: 'guest@royalhints.com',
    role: 'guest',
  };

  const catalogProducts: Product[] = posts.length > 0
    ? posts.map((post) => {
        const category = (['Books', 'Spare Parts', 'Fabric', 'Fashion'].includes(post.category) ? post.category : 'Books') as Product['category'];
        const stockCount = Math.max(0, post.stockCount ?? 1);

        return {
          id: post.id,
          name: post.title,
          price: 0,
          rating: 5,
          category,
          image: post.image || ASSET_IMAGES.logo,
          isNew: true,
          sku: `POST-${post.id}`,
          inStock: stockCount > 0,
          stockQuantity: stockCount,
          stockStatus: stockCount > 0 ? 'In Stock' : 'Limited Stock',
          warehouseLocation: 'Royal Hints Admin Stockroom',
          dispatchTime: 'Dispatches in 24 hours',
          description: post.description,
          highlights: ['Live backend listing', 'Verified by Royal Hints admin', 'Ready for dispatch'],
          specifications: {
            Source: 'Backend Catalog',
            Category: category,
            Status: stockCount > 0 ? 'In Stock' : 'Limited Stock',
          },
          variants: [
            {
              id: `variant-${post.id}`,
              name: 'Standard Stock Unit',
              stock: stockCount,
              sku: `POST-${post.id}`,
            },
          ],
          galleryImages: [post.image || ASSET_IMAGES.logo],
        };
      })
    : products;

  const adminUser: User = {
    id: 'admin-royalhints',
    name: 'Royal Hints Admin',
    email: 'admin@royalhints.com',
    role: 'admin',
  };

  const addPost = (newPost: Omit<BusinessPost, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    if (guestUser.role !== 'admin') return;

    const post: BusinessPost = {
      ...newPost,
      id: `mp-${Date.now()}`,
      userId: adminUser.id,
      userName: adminUser.name,
      timestamp: Date.now(),
      reviews: [],
    };
    setPosts(prev => [post, ...prev]);
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

  const addToCart = (product: Product) => {
    if (!cartItems.find(item => item.id === product.id)) {
      setCartItems(prev => [...prev, product]);
    }
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

  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProduct,
      id: `admin-${Date.now()}`,
    };
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => product.id === id ? { ...product, ...updates } : product));
    setCartItems(prev => prev.map(product => product.id === id ? { ...product, ...updates } : product));
    setWishlistItems(prev => prev.map(product => product.id === id ? { ...product, ...updates } : product));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    setCartItems(prev => prev.filter(product => product.id !== id));
    setWishlistItems(prev => prev.filter(product => product.id !== id));
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    
    // Update URL based on page
    const pathMap: Record<Page, string> = {
      'Home': '/',
      'Marketplace': '/marketplace',
      'Checkout': '/checkout',
      'Admin': '/admin',
    };
    
    const newPath = pathMap[page];
    window.history.pushState({ page }, '', newPath);
    
    if (page === 'Admin' && !adminToken) {
      setAdminLoginView(true);
    } else {
      setAdminLoginView(false);
    }
    
    window.scrollTo(0, 0);
  };

  return (
    <div className="relative min-h-screen bg-white selection:bg-[#FF6600] selection:text-white">
      {currentPage !== 'Checkout' && (
        <Header
          isScrolled={isScrolled}
          onNavigate={navigateTo}
          currentPage={currentPage}
          cartCount={cartItems.length}
          products={products}
          guestId={guestId}
        />
      )}

      <main className="pt-0">
        {currentPage === 'Home' && (
          <div className="animate-in fade-in duration-700">
            <Hero onNavigate={navigateTo} />
            <Collections />
            <TrendingGrid
              products={catalogProducts}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              wishlistIds={wishlistItems.map(i => i.id)}
            />
            <TheEdit />
            <SocialProof />
          </div>
        )}

        {currentPage === 'Marketplace' && (
          <div className="animate-in fade-in duration-700">
            <Marketplace posts={posts} user={guestUser} onAddReview={addReviewToPost} />
          </div>
        )}

        {currentPage === 'Checkout' && (
          <div className="animate-in fade-in duration-700">
            <Checkout
              cartItems={cartItems}
              guestId={guestId}
              onGuestIdChange={setGuestId}
              onNavigate={navigateTo}
              onComplete={() => {
                if (guestId) localStorage.setItem('royalhints_guest_id', guestId);
                clearCart();
              }}
            />
          </div>
        )}

        {currentPage === 'Admin' && (
          <div className="animate-in fade-in duration-700">
            <AdminDashboard
              products={products}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              adminToken={adminToken}
              onAdminLogin={loginAdmin}
              forceLoginView={adminLoginView}
              onSuccessfulAdminLogin={() => setAdminLoginView(false)}
              marketplaceRefreshTick={marketplaceRefreshTick}
              onMarketplaceRefresh={() => setMarketplaceRefreshTick((tick) => tick + 1)}
            />
          </div>
        )}
      </main>

      {['Home', 'Marketplace', 'Admin'].includes(currentPage) && <Footer />}
    </div>
  );
};

export default App;
