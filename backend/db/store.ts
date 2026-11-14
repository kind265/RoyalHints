import { db, pool } from '../../src/db';
import { products, businessPosts, shipments, quotations, bespokeRequests, users, userCarts, photoHistory, notificationReads, itemSubscribers } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { RowDataPacket } from 'mysql2';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { 
  Product, 
  ProductCategory,
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

const normalizeCatalogCategory = (category: string): ProductCategory =>
  category === 'Fabric' ? 'Homeware' : category as ProductCategory;

const parseJsonColumn = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

class MariaDbStore {
  private seeded = false;
  private initialization: Promise<void> | null = null;

  async ensureSeeded() {
    if (this.seeded) return;
    if (!this.initialization) {
      this.initialization = this.initialize();
    }

    try {
      await this.initialization;
    } catch (error) {
      this.initialization = null;
      throw error;
    }
  }

  private async initialize() {
    try {
      const hasHostConfiguration = Boolean(
        process.env.MYSQL_HOST &&
        process.env.MYSQL_DATABASE &&
        process.env.MYSQL_USER &&
        process.env.MYSQL_PASSWORD
      );
      if (!hasHostConfiguration) {
        throw new Error(
          'MariaDB configuration is missing. Set MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, and MYSQL_PASSWORD in the hosting environment.'
        );
      }

      const connection = await pool.getConnection();
      connection.release();
      console.log('MariaDB connected');

      await this.ensureSchema();
      console.log('tables created');

      const adminEmail = (process.env.ADMIN_EMAIL || 'chikusehopeson@gmail.com').trim().toLowerCase();
      const adminPassword = process.env.ADMIN_PASSWORD || 'hopeson@gmail.com@415';
      const adminPasswordSalt = randomBytes(16).toString('hex');
      const adminPasswordHash = `${adminPasswordSalt}:${scryptSync(adminPassword, adminPasswordSalt, 64).toString('hex')}`;
      const adminUsername = adminEmail.split('@')[0] || 'royalhints-admin';
      const adminName = 'Royal Hints Administrator';

      await pool.query(
        `INSERT INTO users (id, name, email, username, password_hash, role, is_admin)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           username = VALUES(username),
           password_hash = VALUES(password_hash),
           name = VALUES(name),
           role = VALUES(role),
           is_admin = VALUES(is_admin)`,
        [
          randomUUID(),
          adminName,
          adminEmail,
          adminUsername,
          adminPasswordHash,
          'ADMIN',
          true
        ]
      );

      const [adminRows] = await pool.query(
        `SELECT email, username, role, is_admin FROM users WHERE email = ?`,
        [adminEmail]
      );

      if (!Array.isArray(adminRows) || adminRows.length === 0) {
        throw new Error('Admin user was not created after seeding.');
      }

      console.log('admin seeded');
      this.seeded = true;
    } catch (err) {
      console.error('Failed to initialize MariaDB records:', err);
      throw err;
    }
  }

  private async ensureSchema() {
    const statements = [
      `CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(191) PRIMARY KEY, name VARCHAR(512) NOT NULL, price DOUBLE NOT NULL,
        rating DOUBLE NOT NULL DEFAULT 5.0, category VARCHAR(128) NOT NULL, image LONGTEXT NOT NULL,
        is_new BOOLEAN DEFAULT TRUE, sku VARCHAR(255) NOT NULL, in_stock BOOLEAN NOT NULL DEFAULT TRUE,
        stock_quantity INT NOT NULL DEFAULT 10, stock_status VARCHAR(64) NOT NULL DEFAULT 'In Stock',
        warehouse_location VARCHAR(512) NOT NULL DEFAULT 'Main Vault',
        dispatch_time VARCHAR(512) NOT NULL DEFAULT 'Dispatches in 24 hours',
        description LONGTEXT NOT NULL, highlights JSON, specifications JSON, variants JSON,
        gallery_images JSON, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS business_posts (
        id VARCHAR(191) PRIMARY KEY, user_id VARCHAR(191) NOT NULL, user_name VARCHAR(512) NOT NULL,
        title VARCHAR(512) NOT NULL, description LONGTEXT, image LONGTEXT NOT NULL,
        category VARCHAR(128) NOT NULL, timestamp VARCHAR(64) NOT NULL, price DOUBLE,
        stock_count INT, sku VARCHAR(255), \`condition\` VARCHAR(255), location VARCHAR(512),
        dispatch_time VARCHAR(512), gallery_images JSON, reviews JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS shipments (
        id VARCHAR(191) PRIMARY KEY, tracking_number VARCHAR(191) NOT NULL UNIQUE,
        order_id VARCHAR(191) NOT NULL, carrier VARCHAR(255) DEFAULT 'Royal Hints Courier',
        service_type VARCHAR(255) DEFAULT 'Courier Delivery', status VARCHAR(128) NOT NULL DEFAULT 'Order Placed',
        origin VARCHAR(512) DEFAULT 'Royal Hints Dispatch', destination LONGTEXT NOT NULL,
        estimated_delivery LONGTEXT, dispatched_date VARCHAR(255), order_date VARCHAR(255),
        payment_method VARCHAR(255), payment_reference VARCHAR(191) UNIQUE, scan_token VARCHAR(191) UNIQUE,
        paid_at VARCHAR(64), delivery_confirmed_by_customer BOOLEAN DEFAULT FALSE,
        delivery_confirmed_at VARCHAR(64), items JSON, checkpoints JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS rh_pending_checkout_orders (
        payment_reference VARCHAR(191) PRIMARY KEY, amount DOUBLE NOT NULL, currency VARCHAR(16) NOT NULL,
        order_data JSON NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS quotations (
        id VARCHAR(191) PRIMARY KEY, quote_number VARCHAR(191) NOT NULL UNIQUE,
        user_id VARCHAR(191) NOT NULL, user_name VARCHAR(512) NOT NULL, user_email VARCHAR(320) NOT NULL,
        title VARCHAR(512) NOT NULL, category VARCHAR(128) NOT NULL,
        estimated_quantity INT NOT NULL DEFAULT 1, target_budget VARCHAR(255) NOT NULL,
        urgency VARCHAR(128) NOT NULL, specifications LONGTEXT, delivery_location LONGTEXT NOT NULL,
        contact_number VARCHAR(128) NOT NULL, status VARCHAR(128) NOT NULL DEFAULT 'Under Review',
        submitted_at VARCHAR(64) NOT NULL, admin_quote JSON, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS bespoke_requests (
        id VARCHAR(191) PRIMARY KEY, reference_number VARCHAR(191) NOT NULL UNIQUE,
        user_id VARCHAR(191) NOT NULL, user_name VARCHAR(512) NOT NULL, user_email VARCHAR(320) NOT NULL,
        item_name VARCHAR(512) NOT NULL, category VARCHAR(128) NOT NULL,
        maker_or_brand VARCHAR(512), condition_preference VARCHAR(255) NOT NULL,
        budget_estimate VARCHAR(255) NOT NULL, urgency VARCHAR(128) NOT NULL,
        reference_link_or_image_url LONGTEXT, detailed_requirements LONGTEXT,
        admin_recipient VARCHAR(320) NOT NULL, status VARCHAR(128) NOT NULL DEFAULT 'Received by Admin',
        submitted_at VARCHAR(64) NOT NULL, admin_response JSON, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(191) PRIMARY KEY, name VARCHAR(512) NOT NULL, email VARCHAR(191) NOT NULL UNIQUE,
        username VARCHAR(191), password_hash VARCHAR(255), avatar LONGTEXT,
        role VARCHAR(64) NOT NULL DEFAULT 'buyer', is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS rh_user_carts (
        user_id VARCHAR(191) PRIMARY KEY, items JSON NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS rh_photo_history (
        id VARCHAR(191) PRIMARY KEY, user_id VARCHAR(191) NOT NULL, title VARCHAR(512) NOT NULL,
        category VARCHAR(128) NOT NULL, url LONGTEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS rh_notification_reads (
        user_id VARCHAR(191) PRIMARY KEY, notification_ids JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS rh_item_subscribers (
        email VARCHAR(191) PRIMARY KEY, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS rh_login_history (
        id VARCHAR(191) PRIMARY KEY, user_id VARCHAR(191) NOT NULL, email VARCHAR(320) NOT NULL,
        logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS rh_user_sessions (
        token VARCHAR(191) PRIMARY KEY, user_id VARCHAR(191) NOT NULL, email VARCHAR(320) NOT NULL,
        expires_at TIMESTAMP NOT NULL, INDEX rh_user_sessions_email_idx (email),
        INDEX rh_user_sessions_expiry_idx (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    ];
    for (const statement of statements) await pool.query(statement);
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
        category: normalizeCatalogCategory(r.category),
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
      console.error('MariaDB getProducts error:', error);
      throw error;
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
        category: normalizeCatalogCategory(r.category),
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
      console.error('MariaDB getProductById error:', error);
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
      console.error('MariaDB createProduct error:', error);
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
      console.error('MariaDB updateProduct error:', error);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.ensureSeeded();
    try {
      const res = await db.delete(products).where(eq(products.id, id));
      return true;
    } catch (error) {
      console.error('MariaDB deleteProduct error:', error);
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
        category: normalizeCatalogCategory(r.category),
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
      console.error('MariaDB getPosts error:', error);
      throw error;
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
      console.error('MariaDB createPost error:', error);
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
        category: normalizeCatalogCategory(r.category),
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
      console.error('MariaDB getPostById error:', error);
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
      console.error('MariaDB updatePost error:', error);
      return null;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    await this.ensureSeeded();
    try {
      await db.delete(businessPosts).where(eq(businessPosts.id, id));
      return true;
    } catch (error) {
      console.error('MariaDB deletePost error:', error);
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
        paymentReference: r.paymentReference ?? undefined,
        paidAt: r.paidAt ?? undefined,
        deliveryConfirmedByCustomer: r.deliveryConfirmedByCustomer ?? false,
        deliveryConfirmedAt: r.deliveryConfirmedAt ?? undefined,
        items: (r.items as any[]) || [],
        checkpoints: (r.checkpoints as any[]) || []
      }));
    } catch (error) {
      console.error('MariaDB getShipments error:', error);
      return [];
    }
  }

  async getShipmentByTrackingNumber(trackingNum: string): Promise<ShipmentTracking | undefined> {
    await this.ensureSeeded();
    try {
      const all = await this.getShipments();
      return all.find(s => s.trackingNumber.toLowerCase() === trackingNum.toLowerCase() || s.orderId.toLowerCase() === trackingNum.toLowerCase());
    } catch (error) {
      console.error('MariaDB getShipmentByTrackingNumber error:', error);
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
        paymentReference: shipment.paymentReference,
        scanToken: shipment.scanToken,
        paidAt: shipment.paidAt,
        deliveryConfirmedByCustomer: shipment.deliveryConfirmedByCustomer ?? false,
        deliveryConfirmedAt: shipment.deliveryConfirmedAt,
        items: shipment.items,
        checkpoints: shipment.checkpoints || []
      });
      return shipment;
    } catch (error) {
      console.error('MariaDB createShipment error:', error);
      throw error;
    }
  }

  async savePendingCheckout(reference: string, amount: number, currency: string, orderData: Record<string, unknown>) {
    await this.ensureSeeded();
    await pool.query(
      `INSERT INTO rh_pending_checkout_orders (payment_reference, amount, currency, order_data)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE payment_reference = VALUES(payment_reference)`,
      [reference, amount, currency, JSON.stringify(orderData)]
    );
  }

  async getPendingCheckout(reference: string) {
    await this.ensureSeeded();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT payment_reference, amount, currency, order_data
       FROM rh_pending_checkout_orders WHERE payment_reference = ?`,
      [reference]
    );
    const row = rows[0];
    if (!row) return null;
    return {
      reference: row.payment_reference,
      amount: Number(row.amount),
      currency: row.currency,
      orderData: parseJsonColumn(row.order_data, {})
    };
  }

  async completePaidCheckout(reference: string): Promise<ShipmentTracking> {
    await this.ensureSeeded();
    const client = await pool.getConnection();
    try {
      await client.beginTransaction();
      const [existingRows] = await client.query<RowDataPacket[]>('SELECT * FROM shipments WHERE payment_reference = ? FOR UPDATE', [reference]);
      if (existingRows[0]) {
        const row = existingRows[0];
        await client.commit();
        return {
          id: row.id,
          trackingNumber: row.tracking_number,
          orderId: row.order_id,
          status: row.status,
          destination: row.destination,
          paymentMethod: row.payment_method,
          paymentReference: row.payment_reference,
          paidAt: row.paid_at,
          items: parseJsonColumn(row.items, []),
          checkpoints: parseJsonColumn(row.checkpoints, [])
        } as ShipmentTracking;
      }

      const [pendingRows] = await client.query<RowDataPacket[]>(
        `SELECT amount, currency, order_data FROM rh_pending_checkout_orders
         WHERE payment_reference = ? FOR UPDATE`,
        [reference]
      );
      const pending = pendingRows[0];
      if (!pending) throw new Error('No pending checkout exists for this payment reference.');

      const data = parseJsonColumn<Record<string, any>>(pending.order_data, {});
      const destination = String(data.destination || '').trim();
      const items = Array.isArray(data.items) ? data.items : [];
      if (!destination || items.length === 0) throw new Error('Pending checkout is missing delivery or item details.');

      const paidAt = new Date().toISOString();
      const formattedDate = new Date(paidAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const shipment: ShipmentTracking = {
        id: randomUUID(),
        trackingNumber: `RH-TRK-${randomBytes(5).toString('hex').toUpperCase()}`,
        orderId: `RH-${randomBytes(4).toString('hex').toUpperCase()}`,
        status: 'Paid',
        carrier: 'Royal Hints Logistics',
        serviceType: 'Courier Delivery',
        origin: 'Royal Hints Dispatch',
        destination,
        orderDate: formattedDate,
        estimatedDelivery: 'Processing for dispatch',
        paymentMethod: 'PayChangu',
        paymentReference: reference,
        paidAt,
        scanToken: randomBytes(32).toString('hex'),
        deliveryConfirmedByCustomer: false,
        items,
        checkpoints: [{
          id: randomUUID(),
          title: 'Payment Verified',
          location: 'Royal Hints',
          timestamp: `${formattedDate} • Paid`,
          completed: true,
          isCurrent: true
        }]
      };

      await client.query(
        `INSERT INTO shipments (id, tracking_number, order_id, carrier, service_type, status, origin,
          destination, estimated_delivery, order_date, payment_method, payment_reference, scan_token,
          paid_at, delivery_confirmed_by_customer, items, checkpoints)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,FALSE,?,?)`,
        [shipment.id, shipment.trackingNumber, shipment.orderId, shipment.carrier, shipment.serviceType,
          shipment.status, shipment.origin, shipment.destination, shipment.estimatedDelivery,
          shipment.orderDate, shipment.paymentMethod, shipment.paymentReference, shipment.scanToken,
          shipment.paidAt, JSON.stringify(shipment.items), JSON.stringify(shipment.checkpoints)]
      );
      await client.query('DELETE FROM rh_pending_checkout_orders WHERE payment_reference = ?', [reference]);
      await client.commit();
      return shipment;
    } catch (error) {
      await client.rollback();
      throw error;
    } finally {
      client.release();
    }
  }

  async getPaidOrderReceipts(): Promise<ShipmentTracking[]> {
    await this.ensureSeeded();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, tracking_number, order_id, status, destination, order_date, payment_method,
              payment_reference, scan_token, paid_at, items, checkpoints
       FROM shipments WHERE scan_token IS NOT NULL ORDER BY created_at DESC`
    );
    return rows.map(row => ({
      id: row.id,
      trackingNumber: row.tracking_number,
      orderId: row.order_id,
      status: row.status,
      destination: row.destination,
      orderDate: row.order_date,
      paymentMethod: row.payment_method,
      paymentReference: row.payment_reference,
      scanToken: row.scan_token,
      paidAt: row.paid_at,
      items: parseJsonColumn(row.items, []),
      checkpoints: parseJsonColumn(row.checkpoints, [])
    } as ShipmentTracking));
  }

  async confirmDeliveryByScanToken(token: string): Promise<ShipmentTracking | null> {
    await this.ensureSeeded();
    const [shipmentRows] = await pool.query<RowDataPacket[]>('SELECT tracking_number FROM shipments WHERE scan_token = ?', [token]);
    const trackingNumber = shipmentRows[0]?.tracking_number as string | undefined;
    if (!trackingNumber) return null;
    const existing = await this.getShipmentByTrackingNumber(trackingNumber);
    if (!existing) return null;
    if (existing.status === 'Delivered') return existing;
    const formattedDate = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return this.updateShipment(trackingNumber, {
      status: 'Delivered',
      deliveryConfirmedByCustomer: true,
      deliveryConfirmedAt: new Date().toISOString(),
      estimatedDelivery: `Delivered & Confirmed on ${formattedDate}`,
      checkpoints: [...(existing.checkpoints || []), {
        id: randomUUID(),
        title: 'Delivery Confirmed by QR Scan',
        location: existing.destination,
        timestamp: `${formattedDate} • QR Scan`,
        completed: true,
        isCurrent: true
      }]
    });
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
      console.error('MariaDB updateShipment error:', error);
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
      console.error('MariaDB getQuotations error:', error);
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
      console.error('MariaDB createQuotation error:', error);
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
      console.error('MariaDB updateQuotation error:', error);
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
      console.error('MariaDB getBespokeRequests error:', error);
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
      console.error('MariaDB createBespokeRequest error:', error);
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
      console.error('MariaDB updateBespokeRequest error:', error);
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
    await db.insert(userCarts).values({ userId, items: serializedItems }).onDuplicateKeyUpdate({
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
    await db.insert(photoHistory).values(photo);
    const [created] = await db.select().from(photoHistory).where(eq(photoHistory.id, photo.id));
    return created;
  }

  async getNotificationReads(userId: string): Promise<string[]> {
    await this.ensureSeeded();
    const rows = await db.select().from(notificationReads).where(eq(notificationReads.userId, userId));
    return (rows[0]?.notificationIds as string[]) || [];
  }

  async saveNotificationReads(userId: string, notificationIds: string[]) {
    await this.ensureSeeded();
    await db.insert(notificationReads).values({ userId, notificationIds }).onDuplicateKeyUpdate({
      set: { notificationIds, updatedAt: new Date() }
    });
    return notificationIds;
  }

  async subscribeToNewItems(email: string) {
    await this.ensureSeeded();
    await db.insert(itemSubscribers).values({ email }).onDuplicateKeyUpdate({
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
      `INSERT INTO rh_login_history (id, user_id, email) VALUES (?, ?, ?)`,
      [randomUUID(), userId, email.toLowerCase()]
    );
    await pool.query(
      `INSERT INTO rh_user_sessions (token, user_id, email, expires_at) VALUES (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY))`,
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
    await pool.query(
      `INSERT INTO users (id, name, email, username, password_hash, role, is_admin)
       VALUES (?, ?, ?, ?, ?, 'NORMAL_USER', FALSE)`,
      [id, name.trim(), normalizedEmail, normalizedEmail.split('@')[0], passwordHash]
    );
    return { id, name: name.trim(), email: normalizedEmail, role: 'buyer', isAdmin: false };
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    await this.ensureSeeded();
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT password_hash FROM users WHERE email = ?`, [email.trim().toLowerCase()]);
    const stored = rows[0]?.password_hash as string | undefined;
    if (!stored || !stored.includes(':')) return false;
    const [salt, hash] = stored.split(':');
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  }

  async getSession(token: string): Promise<User | undefined> {
    await this.ensureSeeded();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.name, u.email, u.avatar, u.role, u.is_admin
       FROM rh_user_sessions s JOIN users u ON u.email = s.email
       WHERE s.token = ? AND s.expires_at > UTC_TIMESTAMP()`,
      [token]
    );
    const row = rows[0];
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
      console.error('MariaDB getUsers error:', error);
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
      console.error('MariaDB getUserByEmail error:', error);
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
    }).onDuplicateKeyUpdate({
      set: { email: createdUser.email }
    });
    return createdUser;
  }

  private normalizeId(id?: string) {
    return id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
      ? id
      : randomUUID();
  }
}

export const databaseStore = new MariaDbStore();
