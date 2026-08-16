
export type ProductCategory = 'Books' | 'Spare Parts' | 'Fabric' | 'Fashion';

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
  stockStatus: 'In Stock' | 'Low Stock' | 'Ready to Ship' | 'Limited Stock';
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
  role?: 'guest' | 'admin';
}

export interface BusinessPost {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  image: string;
  category: string;
  timestamp: number;
  stockCount?: number;
  reviews?: Review[];
}

