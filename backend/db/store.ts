import { db, pool } from '../../src/db';
import { products, businessPosts, shipments, quotations, bespokeRequests, users, userCarts, photoHistory, notificationReads, itemSubscribers } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { 
  Product, 
  BusinessPost, 
  ShipmentTracking, 
  QuotationRequest, 
  BespokeSourcingRequest, 
  User 
} from '../types';

const INITIAL_PRODUCTS: Product[] = [];
const INITIAL_POSTS: BusinessPost[] = [];
const INITIAL_SHIPMENTS: ShipmentTracking[] = [];
const INITIAL_QUOTATIONS: QuotationRequest[] = [];
const INITIAL_BESPOKE: BespokeSourcingRequest[] = [];
const INITIAL_USERS: User[] = [];

class PostgresStore {
  private seeded = false;

  async ensureSeeded() {
    if (this.seeded) return;
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is missing. Set the Render PostgreSQL URL in the environment before starting the app.');
      }

      await pool.connect();
      await pool.query('SELECT 1');
      console.log('database connected');

      await this.ensureSchema();
      console.log('tables created');

      const adminEmail = (process.env.ADMIN_EMAIL || 'chikusehopeson@gmail.com').trim().toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || 'hopeson@gmail.com@415';
      const adminUsername = adminEmail.split('@')[0] || 'royalhints-admin';
      const adminName = 'Royal Hints Administrator';

      await pool.query(
        `INSERT INTO users (id, name, email, username, password_hash, role, is_admin)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE SET
           username = EXCLUDED.username,
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           is_admin = EXCLUDED.is_admin`,
        [
          randomUUID(),
          adminName,
          adminEmail,
          adminUsername,
          adminPassword,
          'ADMIN',
          true
        ]
      );

      const adminRow = await pool.query(
        `SELECT email, username, role, is_admin FROM users WHERE email = $1`,
        [adminEmail]
      );

      if (adminRow.rowCount === 0) {
        throw new Error('Admin user was not created after seeding.');
      }

      console.log('admin seeded');
      this.seeded = true;
    } catch (err) {
      console.error('Failed to initialize PostgreSQL records:', err);
      throw err;
    }
  }

  private async ensureSchema() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id text PRIMARY KEY,
        name text NOT NULL,
        price double precision NOT NULL,
        rating double precision NOT NULL DEFAULT 5.0,
        category text NOT NULL,
        image text NOT NULL,
        is_new boolean DEFAULT true,
        sku text NOT NULL,
        in_stock boolean NOT NULL DEFAULT true,
        stock_quantity integer NOT NULL DEFAULT 10,
        stock_status text NOT NULL DEFAULT 'In Stock',
        warehouse_location text NOT NULL DEFAULT 'Main Vault',
        dispatch_time text NOT NULL DEFAULT 'Dispatches in 24 hours',
        description text NOT NULL DEFAULT '',
        highlights jsonb DEFAULT '[]'::jsonb,
        specifications jsonb DEFAULT '{}'::jsonb,
        variants jsonb DEFAULT '[]'::jsonb,
        gallery_images jsonb DEFAULT '[]'::jsonb,
        created_at timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS business_posts (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        user_name text NOT NULL,
        title text NOT NULL,
        description text DEFAULT '',
        image text NOT NULL,
        category text NOT NULL,
        timestamp text NOT NULL,
        price double precision,
        stock_count integer,
        sku text,
        condition text,
        location text,
        dispatch_time text,
        gallery_images jsonb DEFAULT '[]'::jsonb,
        reviews jsonb DEFAULT '[]'::jsonb,
        created_at timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS shipments (
        id text PRIMARY KEY,
        tracking_number text NOT NULL UNIQUE,
        order_id text NOT NULL,
        carrier text DEFAULT 'Royal Hints Courier',
        service_type text DEFAULT 'Courier Delivery',
        status text NOT NULL DEFAULT 'Order Placed',
        origin text DEFAULT 'Royal Hints Dispatch',
        destination text NOT NULL,
        estimated_delivery text,
        dispatched_date text,
        order_date text,
        payment_method text,
        delivery_confirmed_by_customer boolean DEFAULT false,
        delivery_confirmed_at text,
        items jsonb DEFAULT '[]'::jsonb,
        checkpoints jsonb DEFAULT '[]'::jsonb,
        created_at timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS quotations (
        id text PRIMARY KEY,
        quote_number text NOT NULL UNIQUE,
        user_id text NOT NULL,
        user_name text NOT NULL,
        user_email text NOT NULL,
        title text NOT NULL,
        category text NOT NULL,
        estimated_quantity integer NOT NULL DEFAULT 1,
        target_budget text NOT NULL,
        urgency text NOT NULL,
        specifications text DEFAULT '',
        delivery_location text NOT NULL,
        contact_number text NOT NULL,
        status text NOT NULL DEFAULT 'Under Review',
        submitted_at text NOT NULL,
        admin_quote jsonb,
        created_at timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS bespoke_requests (
        id text PRIMARY KEY,
        reference_number text NOT NULL UNIQUE,
        user_id text NOT NULL,
        user_name text NOT NULL,
        user_email text NOT NULL,
        item_name text NOT NULL,
        category text NOT NULL,
        maker_or_brand text,
        condition_preference text NOT NULL,
        budget_estimate text NOT NULL,
        urgency text NOT NULL,
        reference_link_or_image_url text,
        detailed_requirements text DEFAULT '',
        admin_recipient text NOT NULL,
        status text NOT NULL DEFAULT 'Received by Admin',
        submitted_at text NOT NULL,
        admin_response jsonb,
        created_at timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL UNIQUE,
        username text,
        password_hash text,
        avatar text,
        role text NOT NULL DEFAULT 'buyer',
        is_admin boolean DEFAULT false,
        created_at timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS rh_user_carts (
        user_id text PRIMARY KEY,
        items jsonb NOT NULL DEFAULT '[]'::jsonb,
        updated_at timestamp DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS rh_photo_history (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        title text NOT NULL,
        category text NOT NULL,
        url text NOT NULL,
        created_at timestamp DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS rh_notification_reads (
        user_id text PRIMARY KEY,
        notification_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
        updated_at timestamp DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS rh_item_subscribers (
        email text PRIMARY KEY,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS rh_login_history (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        email text NOT NULL,
        logged_in_at timestamp DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS rh_user_sessions (
        token text PRIMARY KEY,
        user_id text NOT NULL,
        email text NOT NULL,
        expires_at timestamp NOT NULL
      );
    `);

    await pool.query(`
      ALTER TABLE IF EXISTS products
        ADD COLUMN IF NOT EXISTS name text,
        ADD COLUMN IF NOT EXISTS price double precision DEFAULT 0,
        ADD COLUMN IF NOT EXISTS rating double precision DEFAULT 5.0,
        ADD COLUMN IF NOT EXISTS category text,
        ADD COLUMN IF NOT EXISTS image text,
        ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT true,
        ADD COLUMN IF NOT EXISTS sku text,
        ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true,
        ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 10,
        ADD COLUMN IF NOT EXISTS stock_status text DEFAULT 'In Stock',
        ADD COLUMN IF NOT EXISTS warehouse_location text DEFAULT 'Main Vault',
        ADD COLUMN IF NOT EXISTS dispatch_time text DEFAULT 'Dispatches in 24 hours',
        ADD COLUMN IF NOT EXISTS description text DEFAULT '',
        ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

      ALTER TABLE IF EXISTS business_posts
        ADD COLUMN IF NOT EXISTS user_id text,
        ADD COLUMN IF NOT EXISTS user_name text,
        ADD COLUMN IF NOT EXISTS title text,
        ADD COLUMN IF NOT EXISTS description text DEFAULT '',
        ADD COLUMN IF NOT EXISTS image text,
        ADD COLUMN IF NOT EXISTS category text,
        ADD COLUMN IF NOT EXISTS timestamp text,
        ADD COLUMN IF NOT EXISTS price double precision,
        ADD COLUMN IF NOT EXISTS stock_count integer,
        ADD COLUMN IF NOT EXISTS sku text,
        ADD COLUMN IF NOT EXISTS condition text,
        ADD COLUMN IF NOT EXISTS location text,
        ADD COLUMN IF NOT EXISTS dispatch_time text,
        ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS reviews jsonb DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

      ALTER TABLE IF EXISTS shipments
        ADD COLUMN IF NOT EXISTS tracking_number text,
        ADD COLUMN IF NOT EXISTS order_id text,
        ADD COLUMN IF NOT EXISTS carrier text DEFAULT 'Royal Hints Courier',
        ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'Courier Delivery',
        ADD COLUMN IF NOT EXISTS status text DEFAULT 'Order Placed',
        ADD COLUMN IF NOT EXISTS origin text DEFAULT 'Royal Hints Dispatch',
        ADD COLUMN IF NOT EXISTS destination text,
        ADD COLUMN IF NOT EXISTS estimated_delivery text,
        ADD COLUMN IF NOT EXISTS dispatched_date text,
        ADD COLUMN IF NOT EXISTS order_date text,
        ADD COLUMN IF NOT EXISTS payment_method text,
        ADD COLUMN IF NOT EXISTS delivery_confirmed_by_customer boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS delivery_confirmed_at text,
        ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS checkpoints jsonb DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

      ALTER TABLE IF EXISTS quotations
        ADD COLUMN IF NOT EXISTS quote_number text,
        ADD COLUMN IF NOT EXISTS user_id text,
        ADD COLUMN IF NOT EXISTS user_name text,
        ADD COLUMN IF NOT EXISTS user_email text,
        ADD COLUMN IF NOT EXISTS title text,
        ADD COLUMN IF NOT EXISTS category text,
        ADD COLUMN IF NOT EXISTS estimated_quantity integer DEFAULT 1,
        ADD COLUMN IF NOT EXISTS target_budget text,
        ADD COLUMN IF NOT EXISTS urgency text,
        ADD COLUMN IF NOT EXISTS specifications text DEFAULT '',
        ADD COLUMN IF NOT EXISTS delivery_location text,
        ADD COLUMN IF NOT EXISTS contact_number text,
        ADD COLUMN IF NOT EXISTS status text DEFAULT 'Under Review',
        ADD COLUMN IF NOT EXISTS submitted_at text,
        ADD COLUMN IF NOT EXISTS admin_quote jsonb,
        ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

      ALTER TABLE IF EXISTS bespoke_requests
        ADD COLUMN IF NOT EXISTS reference_number text,
        ADD COLUMN IF NOT EXISTS user_id text,
        ADD COLUMN IF NOT EXISTS user_name text,
        ADD COLUMN IF NOT EXISTS user_email text,
        ADD COLUMN IF NOT EXISTS item_name text,
        ADD COLUMN IF NOT EXISTS category text,
        ADD COLUMN IF NOT EXISTS maker_or_brand text,
        ADD COLUMN IF NOT EXISTS condition_preference text,
        ADD COLUMN IF NOT EXISTS budget_estimate text,
        ADD COLUMN IF NOT EXISTS urgency text,
        ADD COLUMN IF NOT EXISTS reference_link_or_image_url text,
        ADD COLUMN IF NOT EXISTS detailed_requirements text DEFAULT '',
        ADD COLUMN IF NOT EXISTS admin_recipient text,
        ADD COLUMN IF NOT EXISTS status text DEFAULT 'Received by Admin',
        ADD COLUMN IF NOT EXISTS submitted_at text,
        ADD COLUMN IF NOT EXISTS admin_response jsonb,
        ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

      ALTER TABLE IF EXISTS users
        ADD COLUMN IF NOT EXISTS name text,
        ADD COLUMN IF NOT EXISTS email text,
        ADD COLUMN IF NOT EXISTS username text,
        ADD COLUMN IF NOT EXISTS password_hash text,
        ADD COLUMN IF NOT EXISTS avatar text,
        ADD COLUMN IF NOT EXISTS role text DEFAULT 'buyer',
        ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();
    `);
  }

  // Products
  async getProducts(): Promise<Product[]> {
    await this.ensureSeeded();
    try {
      const rows = await db.select().from(products);
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        rating: r.rating,
        category: r.category as any,
        image: r.image,
        isNew: r.isNew ?? true,
        sku: r.sku,
        inStock: r.inStock,
        stockQuantity: r.stockQuantity,
        stockStatus: r.stockStatus as any,
        warehouseLocation: r.warehouseLocation,
        dispatchTime: r.dispatchTime,
        description: r.description,
        highlights: (r.highlights as string[]) || [],
        specifications: (r.specifications as Record<string, string>) || {},
        variants: (r.variants as any[]) || [],
        galleryImages: (r.galleryImages as string[]) || []
      }));
    } catch (error) {
      console.error('PostgreSQL getProducts error:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | undefined> {
    await this.ensureSeeded();
    try {
      const rows = await db.select().from(products).where(eq(products.id, id));
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        price: r.price,
        rating: r.rating,
        category: r.category as any,
        image: r.image,
        isNew: r.isNew ?? true,
        sku: r.sku,
        inStock: r.inStock,
        stockQuantity: r.stockQuantity,
        stockStatus: r.stockStatus as any,
        warehouseLocation: r.warehouseLocation,
        dispatchTime: r.dispatchTime,
        description: r.description,
        highlights: (r.highlights as string[]) || [],
        specifications: (r.specifications as Record<string, string>) || {},
        variants: (r.variants as any[]) || [],
        galleryImages: (r.galleryImages as string[]) || []
      };
    } catch (error) {
      console.error('PostgreSQL getProductById error:', error);
      return undefined;
    }
  }

  async createProduct(product: Product): Promise<Product> {
    await this.ensureSeeded();
    try {
      await db.insert(products).values({
        id: product.id,
        name: product.name,
        price: product.price,
        rating: product.rating,
        category: product.category,
        image: product.image,
        isNew: product.isNew ?? true,
        sku: product.sku,
        inStock: product.inStock,
        stockQuantity: product.stockQuantity,
        stockStatus: product.stockStatus,
        warehouseLocation: product.warehouseLocation,
        dispatchTime: product.dispatchTime,
        description: product.description,
        highlights: product.highlights,
        specifications: product.specifications,
        variants: product.variants,
        galleryImages: product.galleryImages || []
      });
      return product;
    } catch (error) {
      console.error('PostgreSQL createProduct error:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await this.ensureSeeded();
    try {
      await db.update(products).set({
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.price !== undefined ? { price: updates.price } : {}),
        ...(updates.category ? { category: updates.category } : {}),
        ...(updates.image ? { image: updates.image } : {}),
        ...(updates.inStock !== undefined ? { inStock: updates.inStock } : {}),
        ...(updates.stockQuantity !== undefined ? { stockQuantity: updates.stockQuantity } : {}),
        ...(updates.stockStatus ? { stockStatus: updates.stockStatus } : {}),
        ...(updates.warehouseLocation ? { warehouseLocation: updates.warehouseLocation } : {}),
        ...(updates.dispatchTime ? { dispatchTime: updates.dispatchTime } : {}),
        ...(updates.description ? { description: updates.description } : {}),
        ...(updates.highlights ? { highlights: updates.highlights } : {}),
        ...(updates.specifications ? { specifications: updates.specifications } : {}),
        ...(updates.variants ? { variants: updates.variants } : {}),
        ...(updates.galleryImages ? { galleryImages: updates.galleryImages } : {})
      }).where(eq(products.id, id));
      return (await this.getProductById(id)) || null;
    } catch (error) {
      console.error('PostgreSQL updateProduct error:', error);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.ensureSeeded();
    try {
      const res = await db.delete(products).where(eq(products.id, id));
      return true;
    } catch (error) {
      console.error('PostgreSQL deleteProduct error:', error);
      return false;
    }
  }

  // Posts
  async getPosts(): Promise<BusinessPost[]> {
    await this.ensureSeeded();
    try {
      const rows = await db.select().from(businessPosts).orderBy(desc(businessPosts.createdAt));
      return rows.map(r => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        title: r.title,
        description: r.description || '',
        image: r.image,
        category: r.category,
        timestamp: Number(r.timestamp) || Date.now(),
        price: r.price ?? undefined,
        stockCount: r.stockCount ?? undefined,
        sku: r.sku ?? undefined,
        condition: r.condition ?? undefined,
        location: r.location ?? undefined,
        dispatchTime: r.dispatchTime ?? undefined,
        galleryImages: (r.galleryImages as string[]) || [],
        reviews: (r.reviews as any[]) || []
      }));
    } catch (error) {
      console.error('PostgreSQL getPosts error:', error);
      return [];
    }
  }

  async createPost(post: BusinessPost): Promise<BusinessPost> {
    await this.ensureSeeded();
    try {
      await db.insert(businessPosts).values({
        id: post.id,
        userId: post.userId,
        userName: post.userName,
        title: post.title,
        description: post.description || '',
        image: post.image,
        category: post.category,
        timestamp: String(post.timestamp),
        price: post.price,
        stockCount: post.stockCount,
        sku: post.sku,
        condition: post.condition,
        location: post.location,
        dispatchTime: post.dispatchTime,
        galleryImages: post.galleryImages || [],
        reviews: post.reviews || []
      });
      return post;
    } catch (error) {
      console.error('PostgreSQL createPost error:', error);
      throw error;
    }
  }

  async getPostById(id: string): Promise<BusinessPost | undefined> {
    await this.ensureSeeded();
    try {
      const rows = await db.select().from(businessPosts).where(eq(businessPosts.id, id));
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        title: r.title,
        description: r.description || '',
        image: r.image,
        category: r.category,
        timestamp: Number(r.timestamp) || Date.now(),
        price: r.price ?? undefined,
        stockCount: r.stockCount ?? undefined,
        sku: r.sku ?? undefined,
        condition: r.condition ?? undefined,
        location: r.location ?? undefined,
        dispatchTime: r.dispatchTime ?? undefined,
        galleryImages: (r.galleryImages as string[]) || [],
        reviews: (r.reviews as any[]) || []
      };
    } catch (error) {
      console.error('PostgreSQL getPostById error:', error);
      return undefined;
    }
  }

  async updatePost(id: string, updates: Partial<BusinessPost>): Promise<BusinessPost | null> {
    await this.ensureSeeded();
    try {
      await db.update(businessPosts).set({
        ...(updates.title ? { title: updates.title } : {}),
        ...(updates.description !== undefined ? { description: updates.description } : {}),
        ...(updates.category ? { category: updates.category } : {}),
        ...(updates.image ? { image: updates.image } : {}),
        ...(updates.price !== undefined ? { price: updates.price } : {}),
        ...(updates.stockCount !== undefined ? { stockCount: updates.stockCount } : {}),
        ...(updates.sku !== undefined ? { sku: updates.sku } : {}),
        ...(updates.condition !== undefined ? { condition: updates.condition } : {}),
        ...(updates.location !== undefined ? { location: updates.location } : {}),
        ...(updates.dispatchTime !== undefined ? { dispatchTime: updates.dispatchTime } : {}),
        ...(updates.galleryImages !== undefined ? { galleryImages: updates.galleryImages } : {}),
        ...(updates.reviews ? { reviews: updates.reviews } : {})
      }).where(eq(businessPosts.id, id));
      return (await this.getPostById(id)) || null;
    } catch (error) {
      console.error('PostgreSQL updatePost error:', error);
      return null;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    await this.ensureSeeded();
    try {
      await db.delete(businessPosts).where(eq(businessPosts.id, id));
      return true;
    } catch (error) {
      console.error('PostgreSQL deletePost error:', error);
      return false;
    }
  }

  // Shipments
  async getShipments(): Promise<ShipmentTracking[]> {
    await this.ensureSeeded();
    try {
      const rows = await db.select().from(shipments).orderBy(desc(shipments.createdAt));
      return rows.map(r => ({
        id: r.id,
        trackingNumber: r.trackingNumber,
        orderId: r.orderId,
        carrier: r.carrier ?? undefined,
        serviceType: r.serviceType ?? undefined,
        status: r.status as any,
        origin: r.origin ?? undefined,
        destination: r.destination,
        estimatedDelivery: r.estimatedDelivery ?? undefined,
        dispatchedDate: r.dispatchedDate ?? undefined,
        orderDate: r.orderDate ?? undefined,
        paymentMethod: r.paymentMethod ?? undefined,
        deliveryConfirmedByCustomer: r.deliveryConfirmedByCustomer ?? false,
        deliveryConfirmedAt: r.deliveryConfirmedAt ?? undefined,
        items: (r.items as any[]) || [],
        checkpoints: (r.checkpoints as any[]) || []
      }));
    } catch (error) {
      console.error('PostgreSQL getShipments error:', error);
      return [];
    }
  }

  async getShipmentByTrackingNumber(trackingNum: string): Promise<ShipmentTracking | undefined> {
    await this.ensureSeeded();
    try {
      const all = await this.getShipments();
      return all.find(s => s.trackingNumber.toLowerCase() === trackingNum.toLowerCase() || s.orderId.toLowerCase() === trackingNum.toLowerCase());
    } catch (error) {
      console.error('PostgreSQL getShipmentByTrackingNumber error:', error);
      return undefined;
    }
  }

  async createShipment(shipment: ShipmentTracking): Promise<ShipmentTracking> {
    await this.ensureSeeded();
    try {
      await db.insert(shipments).values({
        id: shipment.id || `ship-${Date.now()}`,
        trackingNumber: shipment.trackingNumber,
        orderId: shipment.orderId,
        carrier: shipment.carrier,
        serviceType: shipment.serviceType,
        status: shipment.status,
        origin: shipment.origin,
        destination: shipment.destination,
        estimatedDelivery: shipment.estimatedDelivery,
        dispatchedDate: shipment.dispatchedDate,
        orderDate: shipment.orderDate,
        paymentMethod: shipment.paymentMethod,
        deliveryConfirmedByCustomer: shipment.deliveryConfirmedByCustomer ?? false,
        deliveryConfirmedAt: shipment.deliveryConfirmedAt,
        items: shipment.items,
        checkpoints: shipment.checkpoints || []
      });
      return shipment;
    } catch (error) {
      console.error('PostgreSQL createShipment error:', error);
      throw error;
    }
  }

  async updateShipment(idOrTracking: string, updates: Partial<ShipmentTracking>): Promise<ShipmentTracking | null> {
    await this.ensureSeeded();
    try {
      const existing = await this.getShipmentByTrackingNumber(idOrTracking);
      if (!existing) return null;

      await db.update(shipments).set({
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.deliveryConfirmedByCustomer !== undefined ? { deliveryConfirmedByCustomer: updates.deliveryConfirmedByCustomer } : {}),
        ...(updates.deliveryConfirmedAt ? { deliveryConfirmedAt: updates.deliveryConfirmedAt } : {}),
        ...(updates.checkpoints ? { checkpoints: updates.checkpoints } : {})
      }).where(eq(shipments.trackingNumber, existing.trackingNumber));

      return (await this.getShipmentByTrackingNumber(existing.trackingNumber)) || null;
    } catch (error) {
      console.error('PostgreSQL updateShipment error:', error);
      return null;
    }
  }

  // Quotations
  async getQuotations(): Promise<QuotationRequest[]> {
    await this.ensureSeeded();
    try {
      const rows = await db.select().from(quotations).orderBy(desc(quotations.createdAt));
      return rows.map(r => ({
        id: r.id,
        quoteNumber: r.quoteNumber,
        userId: r.userId,
        userName: r.userName,
        userEmail: r.userEmail,
        title: r.title,
        category: r.category as any,
        estimatedQuantity: r.estimatedQuantity,
        targetBudget: r.targetBudget,
        urgency: r.urgency as any,
        specifications: r.specifications || '',
        deliveryLocation: r.deliveryLocation,
        contactNumber: r.contactNumber,
        status: r.status as any,
        submittedAt: Number(r.submittedAt) || Date.now(),
        adminQuote: r.adminQuote as any
      }));
    } catch (error) {
      console.error('PostgreSQL getQuotations error:', error);
      return [];
    }
  }

  async createQuotation(quote: QuotationRequest): Promise<QuotationRequest> {
    await this.ensureSeeded();
    try {
      await db.insert(quotations).values({
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        userId: quote.userId,
        userName: quote.userName,
        userEmail: quote.userEmail,
        title: quote.title,
        category: quote.category,
        estimatedQuantity: quote.estimatedQuantity,
        targetBudget: quote.targetBudget,
        urgency: quote.urgency,
        specifications: quote.specifications,
        deliveryLocation: quote.deliveryLocation,
        contactNumber: quote.contactNumber,
        status: quote.status,
        submittedAt: String(quote.submittedAt),
        adminQuote: quote.adminQuote
      });
      return quote;
    } catch (error) {
      console.error('PostgreSQL createQuotation error:', error);
      throw error;
    }
  }

  async updateQuotation(id: string, updates: Partial<QuotationRequest>): Promise<QuotationRequest | null> {
    await this.ensureSeeded();
    try {
      await db.update(quotations).set({
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.adminQuote ? { adminQuote: updates.adminQuote } : {})
      }).where(eq(quotations.id, id));
      const all = await this.getQuotations();
      return all.find(q => q.id === id) || null;
    } catch (error) {
      console.error('PostgreSQL updateQuotation error:', error);
      return null;
    }
  }

  // Bespoke Requests
  async getBespokeRequests(): Promise<BespokeSourcingRequest[]> {
    await this.ensureSeeded();
    try {
      const rows = await db.select().from(bespokeRequests).orderBy(desc(bespokeRequests.createdAt));
      return rows.map(r => ({
        id: r.id,
        referenceNumber: r.referenceNumber,
        userId: r.userId,
        userName: r.userName,
        userEmail: r.userEmail,
        itemName: r.itemName,
        category: r.category as any,
        makerOrBrand: r.makerOrBrand ?? undefined,
        conditionPreference: r.conditionPreference as any,
        budgetEstimate: r.budgetEstimate,
        urgency: r.urgency as any,
        referenceLinkOrImageUrl: r.referenceLinkOrImageUrl ?? undefined,
        detailedRequirements: r.detailedRequirements || '',
        adminRecipient: r.adminRecipient,
        status: r.status as any,
        submittedAt: Number(r.submittedAt) || Date.now(),
        adminResponse: r.adminResponse as any
      }));
    } catch (error) {
      console.error('PostgreSQL getBespokeRequests error:', error);
      return [];
    }
  }

  async createBespokeRequest(req: BespokeSourcingRequest): Promise<BespokeSourcingRequest> {
    await this.ensureSeeded();
    try {
      await db.insert(bespokeRequests).values({
        id: req.id,
        referenceNumber: req.referenceNumber,
        userId: req.userId,
        userName: req.userName,
        userEmail: req.userEmail,
        itemName: req.itemName,
        category: req.category,
        makerOrBrand: req.makerOrBrand,
        conditionPreference: req.conditionPreference,
        budgetEstimate: req.budgetEstimate,
        urgency: req.urgency,
        referenceLinkOrImageUrl: req.referenceLinkOrImageUrl,
        detailedRequirements: req.detailedRequirements,
        adminRecipient: req.adminRecipient,
        status: req.status,
        submittedAt: String(req.submittedAt),
        adminResponse: req.adminResponse
      });
      return req;
    } catch (error) {
      console.error('PostgreSQL createBespokeRequest error:', error);
      throw error;
    }
  }

  async updateBespokeRequest(id: string, updates: Partial<BespokeSourcingRequest>): Promise<BespokeSourcingRequest | null> {
    await this.ensureSeeded();
    try {
      await db.update(bespokeRequests).set({
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.adminResponse ? { adminResponse: updates.adminResponse } : {})
      }).where(eq(bespokeRequests.id, id));
      const all = await this.getBespokeRequests();
      return all.find(b => b.id === id) || null;
    } catch (error) {
      console.error('PostgreSQL updateBespokeRequest error:', error);
      return null;
    }
  }

  async getCart(userId: string): Promise<Product[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(userCarts).where(eq(userCarts.userId, userId));
    return (rows[0]?.items as unknown as Product[]) || [];
  }

  async saveCart(userId: string, items: Product[]): Promise<Product[]> {
    await this.ensureSeeded();
    const serializedItems = items as any;
    await db.insert(userCarts).values({ userId, items: serializedItems }).onConflictDoUpdate({
      target: userCarts.userId,
      set: { items: serializedItems, updatedAt: new Date() }
    });
    return items;
  }

  async getPhotoHistory(userId: string) {
    await this.ensureSeeded();
    return db.select().from(photoHistory).where(eq(photoHistory.userId, userId)).orderBy(desc(photoHistory.createdAt));
  }

  async addPhotoHistory(photo: { id: string; userId: string; title: string; category: string; url: string }) {
    await this.ensureSeeded();
    const [created] = await db.insert(photoHistory).values(photo).returning();
    return created;
  }

  async getNotificationReads(userId: string): Promise<string[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(notificationReads).where(eq(notificationReads.userId, userId));
    return (rows[0]?.notificationIds as string[]) || [];
  }

  async saveNotificationReads(userId: string, notificationIds: string[]) {
    await this.ensureSeeded();
    await db.insert(notificationReads).values({ userId, notificationIds }).onConflictDoUpdate({
      target: notificationReads.userId,
      set: { notificationIds, updatedAt: new Date() }
    });
    return notificationIds;
  }

  async subscribeToNewItems(email: string) {
    await this.ensureSeeded();
    await db.insert(itemSubscribers).values({ email }).onConflictDoUpdate({
      target: itemSubscribers.email,
      set: { updatedAt: new Date() }
    });
  }

  async notifyItemSubscribers(post: BusinessPost) {
    await this.ensureSeeded();
    const rows = await db.select().from(itemSubscribers);
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.NOTIFICATION_FROM_EMAIL;
    if (!apiKey || !from || rows.length === 0) return;

    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
    await Promise.all(rows.map(async ({ email }) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: `New Royal Hints item: ${post.title}`,
          html: `<p>A new item has been posted on Royal Hints.</p><h2>${post.title}</h2><p>${post.description || ''}</p><p><a href="${baseUrl}/marketplace">View the new listing</a></p>`
        })
      });
      if (!response.ok) {
        console.error(`New item email failed for ${email}: ${await response.text()}`);
      }
    }));
  }

  async recordLogin(userId: string, email: string): Promise<string> {
    await this.ensureSeeded();
    const token = randomUUID();
    await pool.query(
      `INSERT INTO rh_login_history (id, user_id, email) VALUES ($1, $2, $3)`,
      [randomUUID(), userId, email.toLowerCase()]
    );
    await pool.query(
      `INSERT INTO rh_user_sessions (token, user_id, email, expires_at) VALUES ($1, $2, $3, now() + interval '30 days')`,
      [token, userId, email.toLowerCase()]
    );
    return token;
  }

  async registerBuyer(name: string, email: string, password: string): Promise<User> {
    await this.ensureSeeded();
    const normalizedEmail = email.trim().toLowerCase();
    const salt = randomBytes(16).toString('hex');
    const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO users (id, name, email, username, password_hash, role, is_admin)
       VALUES ($1, $2, $3, $4, $5, 'NORMAL_USER', false)
       RETURNING id, name, email, avatar, role, is_admin`,
      [id, name.trim(), normalizedEmail, normalizedEmail.split('@')[0], passwordHash]
    );
    const row = result.rows[0];
    return { id: row.id, name: row.name, email: row.email, avatar: row.avatar ?? undefined, role: 'buyer', isAdmin: false };
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    await this.ensureSeeded();
    const result = await pool.query(`SELECT password_hash FROM users WHERE email = $1`, [email.trim().toLowerCase()]);
    const stored = result.rows[0]?.password_hash as string | undefined;
    if (!stored || !stored.includes(':')) return false;
    const [salt, hash] = stored.split(':');
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  }

  async getSession(token: string): Promise<User | undefined> {
    await this.ensureSeeded();
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar, u.role, u.is_admin
       FROM rh_user_sessions s JOIN users u ON u.email = s.email
       WHERE s.token = $1 AND s.expires_at > now()`,
      [token]
    );
    const row = result.rows[0];
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar ?? undefined,
      role: String(row.role).toLowerCase() === 'admin' ? 'admin' : 'buyer',
      isAdmin: row.is_admin ?? false
    };
  }

  // Users
  async getUsers(): Promise<User[]> {
    await this.ensureSeeded();
    try {
      const rows = await db.select().from(users);
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        avatar: r.avatar ?? undefined,
        role: r.role?.toLowerCase() === 'admin' ? 'admin' : 'buyer',
        isAdmin: r.isAdmin ?? false
      }));
    } catch (error) {
      console.error('PostgreSQL getUsers error:', error);
      return [];
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureSeeded();
    try {
      const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        avatar: r.avatar ?? undefined,
        role: r.role?.toLowerCase() === 'admin' ? 'admin' : 'buyer',
        isAdmin: r.isAdmin ?? false
      };
    } catch (error) {
      console.error('PostgreSQL getUserByEmail error:', error);
      return undefined;
    }
  }

  async createUser(user: User): Promise<User> {
    await this.ensureSeeded();
    const createdUser = { ...user, id: this.normalizeId(user.id) };
    const databaseRole = user.isAdmin || user.role === 'admin' ? 'ADMIN' : 'NORMAL_USER';
    await db.insert(users).values({
      id: createdUser.id,
      name: user.name,
      email: user.email.toLowerCase(),
      avatar: user.avatar,
      role: databaseRole,
      isAdmin: user.isAdmin || false
    }).onConflictDoNothing();
    return createdUser;
  }

  private normalizeId(id?: string) {
    return id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      ? id
      : randomUUID();
  }
}

export const postgresStore = new PostgresStore();
