
import { Product, Collection, Review, BusinessPost, ShipmentTracking, QuotationRequest, BespokeSourcingRequest } from './types';

export const COLORS = {
  charcoal: '#1A1A1A',
  royalBlue: '#2563EB',
  royalBlueDark: '#1D4ED8',
  royalBlueLight: '#EFF6FF',
  white: '#FFFFFF',
  softGrey: '#F8F9FA',
};

export const CATEGORIES = ['Books', 'Spare Parts', 'Fabric', 'Fashion'] as const;

export const COLLECTIONS: Collection[] = [
  {
    id: 'col-books',
    title: 'Books',
    tagline: 'Timeless Knowledge & Monograph Rarities',
    itemCount: 42,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    description: 'Leatherbound volumes, architectural monographs, engineering handbooks, and rare literary works.'
  },
  {
    id: 'col-spareparts',
    title: 'Spare Parts',
    tagline: 'High-Precision Engineering & OEM Hardware',
    itemCount: 86,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=600',
    description: 'CNC-machined performance components, titanium calipers, bearings, and heavy-duty mechanics.'
  },
  {
    id: 'col-fabric',
    title: 'Fabric',
    tagline: 'Artisanal Weaves & Premium Yardage',
    itemCount: 54,
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=600',
    description: 'Pure Mulberry silk, heavyweight Egyptian linen, Scottish wool tweed, and selvedge raw denim.'
  },
  {
    id: 'col-fashion',
    title: 'Fashion',
    tagline: 'Sartorial Elegance & Tailored Luxury',
    itemCount: 68,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
    description: 'Bespoke cashmere overcoats, tailored structured blazers, calfskin derby shoes, and silk accents.'
  },
];

export const PRODUCTS: Product[] = [];

export const TRENDING_PRODUCTS = PRODUCTS;

export const REVIEWS: Review[] = [
  { id: 'r1', user: 'Julian Thorne', content: "The Royal Architecture Compendium exceeded all expectations. The paper stock and binding are museum grade.", rating: 5, date: '2 days ago', verified: true },
  { id: 'r2', user: 'Claire Sterling', content: "The Mulberry silk drape is unbelievable. The Royal Hints packaging arrived pristine with verified warehouse certificate.", rating: 5, date: '4 days ago', verified: true },
  { id: 'r3', user: 'Eng. Marcus Weber', content: "Tested the titanium caliper tolerances on my CNC rig. Exact micron precision. True aerospace engineering.", rating: 5, date: '1 week ago', verified: true },
  { id: 'r4', user: 'Lady Vivienne M.', content: "The bespoke double-breasted blazer fits like it was made on Savile Row. Outstanding craft and in-stock delivery speed.", rating: 5, date: '1 week ago', verified: true },
];

export const INSTAGRAM_IMAGES = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1532012164546-f432f2e37271?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400',
];

export const INITIAL_SHIPMENTS: ShipmentTracking[] = [
  {
    trackingNumber: 'RH-TRK-884920',
    orderId: 'ORD-98231',
    carrier: 'Royal Express Courier',
    serviceType: 'Direct Courier Delivery',
    status: 'In Transit',
    origin: 'Geneva Central Dispatch',
    destination: '740 Park Avenue, Penthouse B, New York NY',
    estimatedDelivery: 'Expected in 1-2 Days',
    dispatchedDate: 'August 18, 2026',
    orderDate: 'August 17, 2026',
    paymentMethod: 'Verified Card / Bank Transfer',
    deliveryConfirmedByCustomer: false,
    items: [
      {
        name: 'The Royal Edition: Renaissance Architecture Vol. I',
        category: 'Books',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
        price: 340
      },
      {
        name: 'Bespoke Double-Faced Cashmere Overcoat',
        category: 'Fashion',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
        price: 1850
      }
    ]
  },
  {
    trackingNumber: 'RH-TRK-771042',
    orderId: 'ORD-97812',
    carrier: 'Direct Dispatch Freight',
    serviceType: 'Priority Express Drop',
    status: 'Delivered',
    origin: 'Munich Precision Center',
    destination: 'St. James Square, London UK',
    estimatedDelivery: 'Delivered & Confirmed',
    dispatchedDate: 'August 14, 2026',
    orderDate: 'August 13, 2026',
    paymentMethod: 'Instant Wire Transfer',
    deliveryConfirmedByCustomer: true,
    deliveryConfirmedAt: 'August 16, 2026',
    items: [
      {
        name: 'Aerospace Billet Titanium Brake Calipers',
        category: 'Spare Parts',
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800',
        price: 890
      }
    ]
  }
];

export const INITIAL_QUOTATIONS: QuotationRequest[] = [
  {
    id: 'quot-101',
    quoteNumber: 'RH-QUO-2026-089',
    userId: 'u1',
    userName: 'Lord Alistair Sterling',
    userEmail: 'chikusehopeson@gmail.com',
    title: 'Custom 22-Momme Italian Mulberry Silk Bolts (Bulk 200m)',
    category: 'Fabric',
    estimatedQuantity: 200,
    targetBudget: '$8,000 - $10,000',
    urgency: 'Standard (5-7 Days)',
    specifications: 'Grade 6A Mulberry Silk, 22-Momme weight, custom Royal Navy & Champagne colorway with OEKO-TEX standard 100 certification.',
    deliveryLocation: 'Mayfair Design Studio, London',
    contactNumber: '+44 20 7946 0912',
    status: 'Quote Ready',
    submittedAt: Date.now() - (36 * 60 * 60 * 1000),
    adminQuote: {
      unitPrice: 42.50,
      totalAmount: 8500.00,
      leadTimeDays: 5,
      validityDate: 'Valid until Sept 1, 2026',
      officialNotes: 'Direct supply negotiated with Como Silk Mills. Includes insured air freight and batch color certificate.',
      includesTaxShipping: true
    }
  },
  {
    id: 'quot-102',
    quoteNumber: 'RH-QUO-2026-094',
    userId: 'u1',
    userName: 'Lord Alistair Sterling',
    userEmail: 'chikusehopeson@gmail.com',
    title: 'CNC Machined Forged Titanium Wheel Spindles (Batch of 8)',
    category: 'Spare Parts',
    estimatedQuantity: 8,
    targetBudget: '$3,500',
    urgency: 'Express (48 Hours)',
    specifications: 'Ti-6Al-4V Grade 5 Titanium alloy, tolerances within +/- 0.005mm, anodized cobalt finish with laser-etched serials.',
    deliveryLocation: 'Silverstone Engineering Facility, Northants',
    contactNumber: '+44 20 7946 0912',
    status: 'Under Review',
    submittedAt: Date.now() - (6 * 60 * 60 * 1000)
  }
];

export const INITIAL_BESPOKE_REQUESTS: BespokeSourcingRequest[] = [
  {
    id: 'bsr-1',
    referenceNumber: 'RH-REQ-7782',
    userId: 'u1',
    userName: 'Lord Alistair Sterling',
    userEmail: 'chikusehopeson@gmail.com',
    itemName: '1928 First Edition Monograph: Le Corbusier Une Ville Contemporaine',
    category: 'Books',
    makerOrBrand: 'Editions Crès Paris',
    conditionPreference: 'Archival / Vintage Verified',
    budgetEstimate: '$4,200',
    urgency: 'Flexible',
    referenceLinkOrImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    detailedRequirements: 'Looking for an intact original folding plates copy with original glassine wrapper or period morocco binding. No foxing on key plates.',
    adminRecipient: 'admin@royalhints.com (Royal Concierge Desk)',
    status: 'Located in Vault Network',
    submittedAt: Date.now() - (24 * 60 * 60 * 1000),
    adminResponse: {
      assignedSpecialist: 'Julian Vane (Chief Antiquarian Curator)',
      networkLocationFound: 'Private Collector Vault, Geneva, Switzerland',
      directOfferPrice: 3800,
      responseDate: 'Aug 18, 2026',
      adminMessage: 'We have located a pristine 1928 Paris edition with authenticated binder bookplate in the Geneva vault. High-resolution provenance documentation is ready for approval.'
    }
  },
  {
    id: 'bsr-2',
    referenceNumber: 'RH-REQ-8831',
    userId: 'u1',
    userName: 'Lord Alistair Sterling',
    userEmail: 'chikusehopeson@gmail.com',
    itemName: 'Bespoke Hand-Spun Vicuña Wool Travel Blanket',
    category: 'Fabric',
    makerOrBrand: 'Loro Piana Heritage Guild or Royal Peruvian Weaver',
    conditionPreference: 'Custom Hand-Crafted',
    budgetEstimate: '$6,000 - $7,500',
    urgency: 'Within 7 Days',
    detailedRequirements: '100% pure wild Peruvian vicuña fiber, un-dyed natural cinnamon hue, hand-rolled fringe, customized embroidered family monogram in Royal Navy thread.',
    adminRecipient: 'admin@royalhints.com (Royal Concierge Desk)',
    status: 'Received by Admin',
    submittedAt: Date.now() - (2 * 60 * 60 * 1000),
    adminResponse: {
      assignedSpecialist: 'Elena Rostova (Luxury Textiles Lead)',
      responseDate: 'Aug 18, 2026',
      adminMessage: 'Request received and logged in Admin Central. Currently contacting certified Peruvian fiber master weavers for availability.'
    }
  }
];

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

