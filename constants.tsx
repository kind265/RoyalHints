
import { Product, BusinessPost, ShipmentTracking, QuotationRequest, BespokeSourcingRequest } from './types';

export const COLORS = {
  charcoal: '#1A1A1A',
  royalBlue: '#2563EB',
  royalBlueDark: '#1D4ED8',
  royalBlueLight: '#EFF6FF',
  white: '#FFFFFF',
  softGrey: '#F8F9FA',
};

export const CATEGORIES = ['Books', 'Spare Parts', 'Fabric', 'Fashion'] as const;

export const PRODUCTS: Product[] = [];

export const TRENDING_PRODUCTS = PRODUCTS;

export const INITIAL_SHIPMENTS: ShipmentTracking[] = [];

export const INITIAL_QUOTATIONS: QuotationRequest[] = [];

export const INITIAL_BESPOKE_REQUESTS: BespokeSourcingRequest[] = [];

export const GALLERY_PHOTO_PRESETS = [
  {
    id: 'ph-bk-1',
    title: 'Archival Hardcover Monograph',
    category: 'Books',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-bk-2',
    title: 'Leatherbound Engineering Folio',
    category: 'Books',
    url: 'https://images.unsplash.com/photo-1532012164546-f432f2e37271?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-bk-3',
    title: 'Rare Architecture Book & Library',
    category: 'Books',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-sp-1',
    title: 'CNC Machined Titanium Calipers',
    category: 'Spare Parts',
    url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-sp-2',
    title: 'Billet Motorsport Hardware & Bearings',
    category: 'Spare Parts',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-sp-3',
    title: 'Precision Mechanical Drivetrain Hub',
    category: 'Spare Parts',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-fb-1',
    title: 'Grade 6A Mulberry Silk Yardage',
    category: 'Fabric',
    url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-fb-2',
    title: 'Artisanal Cashmere & Wool Tweed',
    category: 'Fabric',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-fb-3',
    title: 'Heavyweight Egyptian Linen Bolt',
    category: 'Fabric',
    url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-fs-1',
    title: 'Handcrafted Calfskin Oxford Derby',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-fs-2',
    title: 'Bespoke Tailored Cashmere Overcoat',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-fs-3',
    title: 'Sartorial Silk & Velvet Eveningwear',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ph-ind-1',
    title: 'Industrial Titanium & Carbon Tooling',
    category: 'Industrial & Bespoke',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800'
  }
];

export const INITIAL_MARKETPLACE_POSTS: BusinessPost[] = [];

