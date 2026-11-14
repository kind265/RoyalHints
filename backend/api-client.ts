import { 
  Product, 
  BusinessPost, 
  ShipmentTracking, 
  QuotationRequest, 
  BespokeSourcingRequest,
  User
} from '../types';

const API_BASE = '/api';

export const apiClient = {
  async exportDatabaseBackup(): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/backup`);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      if (response.status === 404) {
        throw new Error('The deployed backend does not include the backup endpoint yet. Redeploy the latest backend/server build, then try again.');
      }
      throw new Error(result?.message || 'Could not download the database backup.');
    }

    const backupFile = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = backupFile;
    link.download = `royal-hints-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(backupFile), 1000);
  },

  async restoreDatabaseBackup(backup: unknown): Promise<{ importedCounts: Record<string, number> }> {
    const response = await fetch(`${API_BASE}/admin/backup/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backup)
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error(result?.message || 'Could not restore the database backup.');
    }
    return { importedCounts: result.importedCounts };
  },

  // Health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (err) {
      console.error('API health check error:', err);
      return { status: 'offline', error: err };
    }
  },

  async subscribeToNewItems(email: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      return Boolean(json.success);
    } catch (err) {
      console.error('New item subscription error:', err);
      return false;
    }
  },

  // Products
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success || !Array.isArray(json.data)) {
        throw new Error(json.message || 'Could not load products.');
      }
      return json.data;
    } catch (err) {
      console.error('Fetch products error:', err);
      throw err;
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Create product error:', err);
      return null;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Update product error:', err);
      return null;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.error('Delete product error:', err);
      return false;
    }
  },

  // Venture Posts
  async getPosts(category?: string): Promise<BusinessPost[]> {
    try {
      const params = category ? `?category=${encodeURIComponent(category)}` : '';
      const res = await fetch(`${API_BASE}/posts${params}`);
      const json = await res.json();
      if (!res.ok || !json.success || !Array.isArray(json.data)) {
        throw new Error(json.message || 'Could not load marketplace listings.');
      }
      return json.data;
    } catch (err) {
      console.error('Fetch posts error:', err);
      throw err;
    }
  },

  async createPost(post: Partial<BusinessPost>): Promise<BusinessPost | null> {
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Create post error:', err);
      return null;
    }
  },

  async updatePost(id: string, updates: Partial<BusinessPost>): Promise<BusinessPost | null> {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Update post error:', err);
      return null;
    }
  },

  async getPostById(id: string): Promise<BusinessPost | null> {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`);
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Get post error:', err);
      return null;
    }
  },

  async deletePost(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
      const json = await res.json();
      return json.success;
    } catch (err) {
      console.error('Delete post error:', err);
      return false;
    }
  },

  // Tracking
  async getShipments(): Promise<ShipmentTracking[]> {
    try {
      const res = await fetch(`${API_BASE}/tracking`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error('Fetch shipments error:', err);
      return [];
    }
  },

  async trackOrder(query: string): Promise<ShipmentTracking | null> {
    try {
      const res = await fetch(`${API_BASE}/tracking/${encodeURIComponent(query)}`);
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Track order error:', err);
      return null;
    }
  },

  async createShipment(shipment: Partial<ShipmentTracking>): Promise<ShipmentTracking | null> {
    try {
      const res = await fetch(`${API_BASE}/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipment)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Create shipment error:', err);
      return null;
    }
  },

  async confirmDelivery(idOrTracking: string): Promise<ShipmentTracking | null> {
    try {
      const res = await fetch(`${API_BASE}/tracking/${encodeURIComponent(idOrTracking)}/confirm-delivery`, {
        method: 'POST'
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Confirm delivery error:', err);
      return null;
    }
  },

  async getPaidOrderReceipts(): Promise<ShipmentTracking[]> {
    try {
      const res = await fetch(`${API_BASE}/tracking/admin/receipts`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error('Fetch order receipts error:', err);
      return [];
    }
  },

  async confirmDeliveryByQr(token: string): Promise<{ orderId: string; trackingNumber: string; status: string; deliveryConfirmedAt?: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/tracking/scan/${encodeURIComponent(token)}`, { method: 'POST' });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('QR delivery confirmation error:', err);
      return null;
    }
  },

  async completePayChanguCheckout(reference: string): Promise<ShipmentTracking | null> {
    try {
      const res = await fetch(`${API_BASE}/payments/paychangu/complete/${encodeURIComponent(reference)}`, { method: 'POST' });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('PayChangu payment completion error:', err);
      return null;
    }
  },

  // Quotations
  async getQuotations(): Promise<QuotationRequest[]> {
    try {
      const res = await fetch(`${API_BASE}/quotations`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error('Fetch quotations error:', err);
      return [];
    }
  },

  async submitQuotation(quote: Partial<QuotationRequest>): Promise<QuotationRequest | null> {
    try {
      const res = await fetch(`${API_BASE}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Submit quotation error:', err);
      return null;
    }
  },

  async respondToQuotation(id: string, response: any): Promise<QuotationRequest | null> {
    try {
      const res = await fetch(`${API_BASE}/quotations/${id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Respond to quotation error:', err);
      return null;
    }
  },

  // Bespoke Sourcing
  async getBespokeRequests(): Promise<BespokeSourcingRequest[]> {
    try {
      const res = await fetch(`${API_BASE}/bespoke`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error('Fetch bespoke requests error:', err);
      return [];
    }
  },

  async submitBespokeRequest(reqData: Partial<BespokeSourcingRequest>): Promise<BespokeSourcingRequest | null> {
    try {
      const res = await fetch(`${API_BASE}/bespoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Submit bespoke request error:', err);
      return null;
    }
  },

  async respondToBespokeRequest(id: string, response: any): Promise<BespokeSourcingRequest | null> {
    try {
      const res = await fetch(`${API_BASE}/bespoke/${id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Respond to bespoke request error:', err);
      return null;
    }
  },

  // Analytics
  async getAnalytics() {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Get analytics error:', err);
      return null;
    }
  },

  // Auth
  async login(email: string, password?: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.error('Auth login error:', err);
      return null;
    }
  },

  async getSession(): Promise<User | null> {
    const res = await fetch(`${API_BASE}/auth/session`);
    const json = await res.json();
    return json.success ? json.data : null;
  },

  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error('Get users error:', err);
      return [];
    }
  },

  async getCart(userId: string): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/persistence/cart/${encodeURIComponent(userId)}`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async saveCart(userId: string, items: Product[]): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/persistence/cart/${encodeURIComponent(userId)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items })
    });
    const json = await res.json();
    return json.success ? json.data : items;
  },

  async getPhotoHistory(userId: string) {
    const res = await fetch(`${API_BASE}/persistence/photos/${encodeURIComponent(userId)}`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async addPhotoHistory(photo: { id: string; userId: string; title: string; category: string; url: string }) {
    const res = await fetch(`${API_BASE}/persistence/photos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(photo)
    });
    const json = await res.json();
    return json.success ? json.data : null;
  },

  async getNotificationReads(userId: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/persistence/notifications/${encodeURIComponent(userId)}`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async saveNotificationReads(userId: string, notificationIds: string[]): Promise<string[]> {
    const res = await fetch(`${API_BASE}/persistence/notifications/${encodeURIComponent(userId)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationIds })
    });
    const json = await res.json();
    return json.success ? json.data : notificationIds;
  }
};
