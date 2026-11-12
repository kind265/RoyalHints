export type ProductCategory = 'Books' | 'Spare Parts' | 'Fashion' | 'Homeware';

export interface ProductVariant {
  id: string;
  name: string;
  stock: number;
  sku: string;
  priceModifier?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: ProductCategory;
  image: string;
  isNew?: boolean;
  sku: string;
  inStock: boolean;
  stockQuantity: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Ready to Ship' | 'Limited Stock' | 'Out of Stock';
  warehouseLocation: string;
  dispatchTime: string;
  description: string;
  highlights: string[];
  specifications: Record<string, string>;
  variants: ProductVariant[];
  galleryImages?: string[];
}

export interface Collection {
  id: string;
  title: ProductCategory;
  tagline: string;
  itemCount: number;
  image: string;
  description: string;
}

export interface Review {
  id: string;
  user: string;
  content: string;
  rating: number;
  date?: string;
  verified?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'buyer';
  isAdmin?: boolean;
}

export interface BusinessPost {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description?: string;
  image: string;
  category: string;
  timestamp: number;
  price?: number;
  stockCount?: number;
  sku?: string;
  condition?: string;
  location?: string;
  dispatchTime?: string;
  galleryImages?: string[];
  reviews?: Review[];
}

export interface TrackingCheckpoint {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  isCurrent?: boolean;
  notes?: string;
}

export interface ShipmentTracking {
  id?: string;
  trackingNumber: string;
  orderId: string;
  carrier?: string;
  serviceType?: string;
  status: 'Order Placed' | 'Paid' | 'Warehouse Verified' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  origin?: string;
  destination: string;
  estimatedDelivery?: string;
  dispatchedDate?: string;
  orderDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  scanToken?: string;
  paidAt?: string;
  deliveryConfirmedByCustomer?: boolean;
  deliveryConfirmedAt?: string;
  items: {
    name: string;
    category?: string;
    quantity: number;
    image: string;
    sku?: string;
    price: number;
  }[];
  checkpoints?: TrackingCheckpoint[];
}

export interface QuotationRequest {
  id: string;
  quoteNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  category: ProductCategory | 'Industrial & Bespoke';
  estimatedQuantity: number;
  targetBudget: string;
  urgency: 'Standard (5-7 Days)' | 'Express (48 Hours)' | 'Rush Critical (24 Hours)';
  specifications: string;
  deliveryLocation: string;
  contactNumber: string;
  status: 'Under Review' | 'Quote Ready' | 'Approved & Locked' | 'Declined';
  submittedAt: number;
  adminQuote?: {
    unitPrice: number;
    totalAmount: number;
    leadTimeDays: number;
    validityDate: string;
    officialNotes: string;
    includesTaxShipping: boolean;
  };
}

export interface BespokeSourcingRequest {
  id: string;
  referenceNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  itemName: string;
  category: ProductCategory | 'Industrial & Bespoke' | 'Rare Collectible';
  makerOrBrand?: string;
  conditionPreference: 'Brand New (Mint)' | 'Archival / Vintage Verified' | 'OEM Precision Machined' | 'Custom Hand-Crafted';
  budgetEstimate: string;
  urgency: 'Flexible' | 'Within 7 Days' | 'Urgent Sourcing';
  referenceLinkOrImageUrl?: string;
  detailedRequirements: string;
  adminRecipient: string;
  status: 'Received by Admin' | 'Sourcing Specialist Assigned' | 'Located in Vault Network' | 'Quoted & Ready' | 'Fulfilled';
  submittedAt: number;
  adminResponse?: {
    assignedSpecialist: string;
    networkLocationFound?: string;
    directOfferPrice?: number;
    responseDate: string;
    adminMessage: string;
  };
}
