import { db } from '../../src/db';
import { products, businessPosts, shipments, quotations, bespokeRequests, users } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { 
  Product, 
  BusinessPost, 
  ShipmentTracking, 
  QuotationRequest, 
  BespokeSourcingRequest, 
  User 
} from '../types';

// Fallback initial seeds if DB empty
const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_POSTS: BusinessPost[] = [];

const INITIAL_SHIPMENTS: ShipmentTracking[] = [
  {
    id: 'ship-101',
    trackingNumber: 'RH-EXP-88921-GB',
    orderId: 'ORD-99042',
    carrier: 'Royal Hints Express Courier',
    serviceType: 'Armored Diplomatic Transit',
    status: 'In Transit',
    origin: 'London Central Vault (UK)',
    destination: 'Chikuse Residence, Lilongwe, Malawi',
    estimatedDelivery: 'Tomorrow, 14:00 CAT',
    dispatchedDate: 'August 19, 2026',
    orderDate: 'August 18, 2026',
    paymentMethod: 'Verified Bank Wire / Royal Escrow',
    deliveryConfirmedByCustomer: false,
    items: [
      {
        name: 'The Royal Architecture Compendium (Collector Edition)',
        category: 'Books',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        sku: 'RH-BK-1092',
        price: 145.00
      },
      {
        name: 'Titanium Monoblock Caliper 6-Piston Assembly',
        category: 'Spare Parts',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
        sku: 'RH-SP-9011',
        price: 1280.00
      }
    ],
    checkpoints: [
      { id: 'cp-1', title: 'Order Placed & Escrow Funded', location: 'Lilongwe Client Portal', timestamp: 'Aug 18, 2026 • 09:30 CAT', completed: true },
      { id: 'cp-2', title: 'Vault Inspection & Monogram Packaging', location: 'London Vault Facility', timestamp: 'Aug 18, 2026 • 15:45 GMT', completed: true },
      { id: 'cp-3', title: 'Cleared Diplomatic Customs & Air Cargo Transit', location: 'Heathrow VIP Air Logistics', timestamp: 'Aug 19, 2026 • 08:20 GMT', completed: true, isCurrent: true, notes: 'Flight RH-774 departed for Kamuzu International Airport' }
    ]
  }
];

const INITIAL_QUOTATIONS: QuotationRequest[] = [
  {
    id: 'qr-1001',
    quoteNumber: 'Q-RH-2026-081',
    userId: 'usr-buyer-01',
    userName: 'Lord Sterling',
    userEmail: 'sterling@royalreserves.org',
    title: 'Bespoke CNC Titanium Aerospace Fasteners (Bulk Batch 500)',
    category: 'Spare Parts',
    estimatedQuantity: 500,
    targetBudget: '$8,500 - $10,000 USD',
    urgency: 'Express (48 Hours)',
    specifications: 'Grade 5 Ti-6Al-4V machined bolts with roll-formed threads and custom anodized blue heads.',
    deliveryLocation: 'Geneva Private Hangar, Switzerland',
    contactNumber: '+41 22 991 4400',
    status: 'Quote Ready',
    submittedAt: Date.now() - 3600000 * 12,
    adminQuote: {
      unitPrice: 18.50,
      totalAmount: 9250.00,
      leadTimeDays: 7,
      validityDate: 'Valid for 14 Days',
      officialNotes: 'Manufactured under ISO 9001 certified precision protocol. Certificate of conformity included.',
      includesTaxShipping: true
    }
  }
];

const INITIAL_BESPOKE: BespokeSourcingRequest[] = [
  {
    id: 'bsr-2001',
    referenceNumber: 'BSR-RH-88912',
    userId: 'usr-buyer-02',
    userName: 'Elena Rostova',
    userEmail: 'elena@archivaltextiles.eu',
    itemName: '18th-Century Venetian Silk Brocade Archive Sample Roll',
    category: 'Fabric',
    makerOrBrand: 'Bevilacqua Venetian Atelier Historical Weave',
    conditionPreference: 'Archival / Vintage Verified',
    budgetEstimate: '$3,500 - $5,000 USD',
    urgency: 'Within 7 Days',
    referenceLinkOrImageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=800',
    detailedRequirements: 'Looking for at least 3 continuous metres of deep indigo/cobalt blue brocade with pure silver/gold weft thread.',
    adminRecipient: 'Admin Sourcing Desk (admin@royalhints.com)',
    status: 'Sourcing Specialist Assigned',
    submittedAt: Date.now() - 3600000 * 6,
    adminResponse: {
      assignedSpecialist: 'Lord Sterling (Curator of Heritage Textiles)',
      networkLocationFound: 'Located private estate collection in Florence, Italy',
      directOfferPrice: 4200,
      responseDate: 'Aug 20, 2026',
      adminMessage: 'Our Florentine partner has verified a 4.2-metre roll in pristine archival condition. Ready for escrow approval.'
    }
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Royal Hints Administrator',
    email: 'admin@royalhints.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    role: 'admin',
    isAdmin: true
  },
  {
    id: 'buyer-1',
    name: 'Chikuse Hopeson',
    email: 'chikusehopeson@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    role: 'admin',
    isAdmin: true
  }
];

class PostgresStore {
  private seeded = false;

  async ensureSeeded() {
    if (this.seeded) return;
    try {
      const existingProducts = await db.select().from(products).limit(1);
      if (existingProducts.length === 0) {
        for (const p of INITIAL_PRODUCTS) {
          await db.insert(products).values({
            id: p.id,
            name: p.name,
            price: p.price,
            rating: p.rating,
            category: p.category,
            image: p.image,
            isNew: p.isNew ?? true,
            sku: p.sku,
            inStock: p.inStock ?? true,
            stockQuantity: p.stockQuantity,
            stockStatus: p.stockStatus,
            warehouseLocation: p.warehouseLocation,
            dispatchTime: p.dispatchTime,
            description: p.description,
            highlights: p.highlights,
            specifications: p.specifications,
            variants: p.variants,
            galleryImages: p.galleryImages || []
          }).onConflictDoNothing();
        }

        for (const post of INITIAL_POSTS) {
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
            reviews: post.reviews || []
          }).onConflictDoNothing();
        }

        for (const s of INITIAL_SHIPMENTS) {
          await db.insert(shipments).values({
            id: s.id || `ship-${Date.now()}`,
            trackingNumber: s.trackingNumber,
            orderId: s.orderId,
            carrier: s.carrier,
            serviceType: s.serviceType,
            status: s.status,
            origin: s.origin,
            destination: s.destination,
            estimatedDelivery: s.estimatedDelivery,
            dispatchedDate: s.dispatchedDate,
            orderDate: s.orderDate,
            paymentMethod: s.paymentMethod,
            deliveryConfirmedByCustomer: s.deliveryConfirmedByCustomer,
            deliveryConfirmedAt: s.deliveryConfirmedAt,
            items: s.items,
            checkpoints: s.checkpoints || []
          }).onConflictDoNothing();
        }

        for (const q of INITIAL_QUOTATIONS) {
          await db.insert(quotations).values({
            id: q.id,
            quoteNumber: q.quoteNumber,
            userId: q.userId,
            userName: q.userName,
            userEmail: q.userEmail,
            title: q.title,
            category: q.category,
            estimatedQuantity: q.estimatedQuantity,
            targetBudget: q.targetBudget,
            urgency: q.urgency,
            specifications: q.specifications,
            deliveryLocation: q.deliveryLocation,
            contactNumber: q.contactNumber,
            status: q.status,
            submittedAt: String(q.submittedAt),
            adminQuote: q.adminQuote
          }).onConflictDoNothing();
        }

        for (const b of INITIAL_BESPOKE) {
          await db.insert(bespokeRequests).values({
            id: b.id,
            referenceNumber: b.referenceNumber,
            userId: b.userId,
            userName: b.userName,
            userEmail: b.userEmail,
            itemName: b.itemName,
            category: b.category,
            makerOrBrand: b.makerOrBrand,
            conditionPreference: b.conditionPreference,
            budgetEstimate: b.budgetEstimate,
            urgency: b.urgency,
            referenceLinkOrImageUrl: b.referenceLinkOrImageUrl,
            detailedRequirements: b.detailedRequirements,
            adminRecipient: b.adminRecipient,
            status: b.status,
            submittedAt: String(b.submittedAt),
            adminResponse: b.adminResponse
          }).onConflictDoNothing();
        }

        for (const u of INITIAL_USERS) {
          await db.insert(users).values({
            id: u.id,
            name: u.name,
            email: u.email,
            avatar: u.avatar,
            role: u.role || 'buyer',
            isAdmin: u.isAdmin || false
          }).onConflictDoNothing();
        }
      }
      this.seeded = true;
    } catch (err) {
      console.error('Failed to seed initial PostgreSQL records:', err);
    }
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
      return INITIAL_PRODUCTS;
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
      return INITIAL_PRODUCTS.find(p => p.id === id);
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
        reviews: (r.reviews as any[]) || []
      }));
    } catch (error) {
      console.error('PostgreSQL getPosts error:', error);
      return INITIAL_POSTS;
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
      return INITIAL_SHIPMENTS;
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
      return INITIAL_QUOTATIONS;
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
      return INITIAL_BESPOKE;
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
        role: r.role as any,
        isAdmin: r.isAdmin ?? false
      }));
    } catch (error) {
      console.error('PostgreSQL getUsers error:', error);
      return INITIAL_USERS;
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
        role: r.role as any,
        isAdmin: r.isAdmin ?? false
      };
    } catch (error) {
      console.error('PostgreSQL getUserByEmail error:', error);
      return INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
  }
}

export const postgresStore = new PostgresStore();
