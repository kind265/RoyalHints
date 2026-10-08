import { pgTable, text, integer, doublePrecision, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: doublePrecision('price').notNull(),
  rating: doublePrecision('rating').default(5.0).notNull(),
  category: text('category').notNull(),
  image: text('image').notNull(),
  isNew: boolean('is_new').default(true),
  sku: text('sku').notNull(),
  inStock: boolean('in_stock').default(true).notNull(),
  stockQuantity: integer('stock_quantity').default(10).notNull(),
  stockStatus: text('stock_status').default('In Stock').notNull(),
  warehouseLocation: text('warehouse_location').default('Main Vault').notNull(),
  dispatchTime: text('dispatch_time').default('Dispatches in 24 hours').notNull(),
  description: text('description').default('').notNull(),
  highlights: jsonb('highlights').$type<string[]>().default([]),
  specifications: jsonb('specifications').$type<Record<string, string>>().default({}),
  variants: jsonb('variants').$type<any[]>().default([]),
  galleryImages: jsonb('gallery_images').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow()
});

export const businessPosts = pgTable('business_posts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  title: text('title').notNull(),
  description: text('description').default(''),
  image: text('image').notNull(),
  category: text('category').notNull(),
  timestamp: text('timestamp').notNull(),
  price: doublePrecision('price'),
  stockCount: integer('stock_count'),
  sku: text('sku'),
  condition: text('condition'),
  location: text('location'),
  dispatchTime: text('dispatch_time'),
  galleryImages: jsonb('gallery_images').$type<string[]>().default([]),
  reviews: jsonb('reviews').$type<any[]>().default([]),
  createdAt: timestamp('created_at').defaultNow()
});

export const shipments = pgTable('shipments', {
  id: text('id').primaryKey(),
  trackingNumber: text('tracking_number').notNull().unique(),
  orderId: text('order_id').notNull(),
  carrier: text('carrier').default('Royal Hints Express Courier'),
  serviceType: text('service_type').default('Armored Diplomatic Transit'),
  status: text('status').default('Order Placed').notNull(),
  origin: text('origin').default('Royal Hints Dispatch'),
  destination: text('destination').notNull(),
  estimatedDelivery: text('estimated_delivery'),
  dispatchedDate: text('dispatched_date'),
  orderDate: text('order_date'),
  paymentMethod: text('payment_method'),
  paymentReference: text('payment_reference').unique(),
  scanToken: text('scan_token').unique(),
  paidAt: text('paid_at'),
  deliveryConfirmedByCustomer: boolean('delivery_confirmed_by_customer').default(false),
  deliveryConfirmedAt: text('delivery_confirmed_at'),
  items: jsonb('items').$type<any[]>().default([]),
  checkpoints: jsonb('checkpoints').$type<any[]>().default([]),
  createdAt: timestamp('created_at').defaultNow()
});

export const quotations = pgTable('quotations', {
  id: text('id').primaryKey(),
  quoteNumber: text('quote_number').notNull().unique(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  estimatedQuantity: integer('estimated_quantity').default(1).notNull(),
  targetBudget: text('target_budget').notNull(),
  urgency: text('urgency').notNull(),
  specifications: text('specifications').default(''),
  deliveryLocation: text('delivery_location').notNull(),
  contactNumber: text('contact_number').notNull(),
  status: text('status').default('Under Review').notNull(),
  submittedAt: text('submitted_at').notNull(),
  adminQuote: jsonb('admin_quote').$type<any>(),
  createdAt: timestamp('created_at').defaultNow()
});

export const bespokeRequests = pgTable('bespoke_requests', {
  id: text('id').primaryKey(),
  referenceNumber: text('reference_number').notNull().unique(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userEmail: text('user_email').notNull(),
  itemName: text('item_name').notNull(),
  category: text('category').notNull(),
  makerOrBrand: text('maker_or_brand'),
  conditionPreference: text('condition_preference').notNull(),
  budgetEstimate: text('budget_estimate').notNull(),
  urgency: text('urgency').notNull(),
  referenceLinkOrImageUrl: text('reference_link_or_image_url'),
  detailedRequirements: text('detailed_requirements').default(''),
  adminRecipient: text('admin_recipient').notNull(),
  status: text('status').default('Received by Admin').notNull(),
  submittedAt: text('submitted_at').notNull(),
  adminResponse: jsonb('admin_response').$type<any>(),
  createdAt: timestamp('created_at').defaultNow()
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar'),
  role: text('role').default('buyer').notNull(),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export const userCarts = pgTable('rh_user_carts', {
  userId: text('user_id').primaryKey(),
  items: jsonb('items').$type<ProductCartItem[]>().default([]),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const photoHistory = pgTable('rh_photo_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const notificationReads = pgTable('rh_notification_reads', {
  userId: text('user_id').primaryKey(),
  notificationIds: jsonb('notification_ids').$type<string[]>().default([]),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const itemSubscribers = pgTable('rh_item_subscribers', {
  email: text('email').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

type ProductCartItem = {
  id: string;
  [key: string]: unknown;
};
