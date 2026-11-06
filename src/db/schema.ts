import {
  boolean,
  double,
  int,
  json,
  longtext,
  mysqlTable,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/mysql-core';

export const products = mysqlTable('products', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 512 }).notNull(),
  price: double('price').notNull(),
  rating: double('rating').default(5).notNull(),
  category: varchar('category', { length: 128 }).notNull(),
  image: longtext('image').notNull(),
  isNew: boolean('is_new').default(true),
  sku: varchar('sku', { length: 255 }).notNull(),
  inStock: boolean('in_stock').default(true).notNull(),
  stockQuantity: int('stock_quantity').default(10).notNull(),
  stockStatus: varchar('stock_status', { length: 64 }).default('In Stock').notNull(),
  warehouseLocation: varchar('warehouse_location', { length: 512 }).default('Main Vault').notNull(),
  dispatchTime: varchar('dispatch_time', { length: 512 }).default('Dispatches in 24 hours').notNull(),
  description: longtext('description').notNull(),
  highlights: json('highlights').$type<string[]>().default([]),
  specifications: json('specifications').$type<Record<string, string>>().default({}),
  variants: json('variants').$type<any[]>().default([]),
  galleryImages: json('gallery_images').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow()
});

export const businessPosts = mysqlTable('business_posts', {
  id: varchar('id', { length: 191 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  userName: varchar('user_name', { length: 512 }).notNull(),
  title: varchar('title', { length: 512 }).notNull(),
  description: longtext('description'),
  image: longtext('image').notNull(),
  category: varchar('category', { length: 128 }).notNull(),
  timestamp: varchar('timestamp', { length: 64 }).notNull(),
  price: double('price'),
  stockCount: int('stock_count'),
  sku: varchar('sku', { length: 255 }),
  condition: varchar('condition', { length: 255 }),
  location: varchar('location', { length: 512 }),
  dispatchTime: varchar('dispatch_time', { length: 512 }),
  galleryImages: json('gallery_images').$type<string[]>().default([]),
  reviews: json('reviews').$type<any[]>().default([]),
  createdAt: timestamp('created_at').defaultNow()
});

export const shipments = mysqlTable('shipments', {
  id: varchar('id', { length: 191 }).primaryKey(),
  trackingNumber: varchar('tracking_number', { length: 191 }).notNull().unique(),
  orderId: varchar('order_id', { length: 191 }).notNull(),
  carrier: varchar('carrier', { length: 255 }).default('Royal Hints Courier'),
  serviceType: varchar('service_type', { length: 255 }).default('Courier Delivery'),
  status: varchar('status', { length: 128 }).default('Order Placed').notNull(),
  origin: varchar('origin', { length: 512 }).default('Royal Hints Dispatch'),
  destination: longtext('destination').notNull(),
  estimatedDelivery: longtext('estimated_delivery'),
  dispatchedDate: varchar('dispatched_date', { length: 255 }),
  orderDate: varchar('order_date', { length: 255 }),
  paymentMethod: varchar('payment_method', { length: 255 }),
  paymentReference: varchar('payment_reference', { length: 191 }).unique(),
  scanToken: varchar('scan_token', { length: 191 }).unique(),
  paidAt: varchar('paid_at', { length: 64 }),
  deliveryConfirmedByCustomer: boolean('delivery_confirmed_by_customer').default(false),
  deliveryConfirmedAt: varchar('delivery_confirmed_at', { length: 64 }),
  items: json('items').$type<any[]>().default([]),
  checkpoints: json('checkpoints').$type<any[]>().default([]),
  createdAt: timestamp('created_at').defaultNow()
});

export const quotations = mysqlTable('quotations', {
  id: varchar('id', { length: 191 }).primaryKey(),
  quoteNumber: varchar('quote_number', { length: 191 }).notNull().unique(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  userName: varchar('user_name', { length: 512 }).notNull(),
  userEmail: varchar('user_email', { length: 320 }).notNull(),
  title: varchar('title', { length: 512 }).notNull(),
  category: varchar('category', { length: 128 }).notNull(),
  estimatedQuantity: int('estimated_quantity').default(1).notNull(),
  targetBudget: varchar('target_budget', { length: 255 }).notNull(),
  urgency: varchar('urgency', { length: 128 }).notNull(),
  specifications: longtext('specifications'),
  deliveryLocation: longtext('delivery_location').notNull(),
  contactNumber: varchar('contact_number', { length: 128 }).notNull(),
  status: varchar('status', { length: 128 }).default('Under Review').notNull(),
  submittedAt: varchar('submitted_at', { length: 64 }).notNull(),
  adminQuote: json('admin_quote').$type<any>(),
  createdAt: timestamp('created_at').defaultNow()
});

export const bespokeRequests = mysqlTable('bespoke_requests', {
  id: varchar('id', { length: 191 }).primaryKey(),
  referenceNumber: varchar('reference_number', { length: 191 }).notNull().unique(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  userName: varchar('user_name', { length: 512 }).notNull(),
  userEmail: varchar('user_email', { length: 320 }).notNull(),
  itemName: varchar('item_name', { length: 512 }).notNull(),
  category: varchar('category', { length: 128 }).notNull(),
  makerOrBrand: varchar('maker_or_brand', { length: 512 }),
  conditionPreference: varchar('condition_preference', { length: 255 }).notNull(),
  budgetEstimate: varchar('budget_estimate', { length: 255 }).notNull(),
  urgency: varchar('urgency', { length: 128 }).notNull(),
  referenceLinkOrImageUrl: longtext('reference_link_or_image_url'),
  detailedRequirements: longtext('detailed_requirements'),
  adminRecipient: varchar('admin_recipient', { length: 320 }).notNull(),
  status: varchar('status', { length: 128 }).default('Received by Admin').notNull(),
  submittedAt: varchar('submitted_at', { length: 64 }).notNull(),
  adminResponse: json('admin_response').$type<any>(),
  createdAt: timestamp('created_at').defaultNow()
});

export const users = mysqlTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 512 }).notNull(),
  email: varchar('email', { length: 191 }).notNull().unique(),
  username: varchar('username', { length: 191 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  avatar: longtext('avatar'),
  role: varchar('role', { length: 64 }).default('buyer').notNull(),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export const userCarts = mysqlTable('rh_user_carts', {
  userId: varchar('user_id', { length: 191 }).primaryKey(),
  items: json('items').$type<ProductCartItem[]>().default([]).notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const photoHistory = mysqlTable('rh_photo_history', {
  id: varchar('id', { length: 191 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  title: varchar('title', { length: 512 }).notNull(),
  category: varchar('category', { length: 128 }).notNull(),
  url: longtext('url').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const notificationReads = mysqlTable('rh_notification_reads', {
  userId: varchar('user_id', { length: 191 }).primaryKey(),
  notificationIds: json('notification_ids').$type<string[]>().default([]).notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const itemSubscribers = mysqlTable('rh_item_subscribers', {
  email: varchar('email', { length: 191 }).primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

type ProductCartItem = {
  id: string;
  [key: string]: unknown;
};
