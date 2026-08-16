
import { Product, Collection, Review, BusinessPost } from './types';
import backPageImage from './assets/Backpage.jpg';
import frontPageImage from './assets/Frontpage.jpg';
import productImageOne from './assets/IMG-20260814-WA0022.jpg';
import productImageTwo from './assets/IMG-20260814-WA0023.jpg';
import productImageThree from './assets/IMG-20260814-WA0024.jpg';
import productImageFour from './assets/IMG-20260814-WA0025.jpg';
import productImageFive from './assets/IMG-20260814-WA0026.jpg';
import oilBundleImage from './assets/IMG-20260814-WA0030.jpg';
import productImageSix from './assets/IMG-20260814-WA0032.jpg';
import logoImage from './assets/BackgroundEraser_20260815_032447977.png';
import oilImage from './assets/Oil.jpg';
import satinBeigeImage from './assets/Russian_satin(Beige).jpg';
import satinCoffeeBrownImage from './assets/Russian_satin(coffie_brown).jpg';
import satinOliveGreenImage from './assets/Russian_satin(Olive_green).jpg';
import satinOrangeImage from './assets/Russian_satin(Orange).jpg';
import satinPinkImage from './assets/Russian_satin(Pink).jpg';

export const ASSET_IMAGES = {
  backPage: backPageImage,
  frontPage: frontPageImage,
  logo: logoImage,
  oil: oilImage,
  oilBundle: oilBundleImage,
  productOne: productImageOne,
  productTwo: productImageTwo,
  productThree: productImageThree,
  productFour: productImageFour,
  productFive: productImageFive,
  productSix: productImageSix,
  satinBeige: satinBeigeImage,
  satinCoffeeBrown: satinCoffeeBrownImage,
  satinOliveGreen: satinOliveGreenImage,
  satinOrange: satinOrangeImage,
  satinPink: satinPinkImage,
};

export const COLORS = {
  charcoal: '#1A1A1A',
  orange: '#FF6600',
  orangeDark: '#E65100',
  orangeLight: '#FFF4EB',
  white: '#FFFFFF',
  softGrey: '#F8F9FA',
};

export const formatKwacha = (value: number) => `MWK ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value))}`;

export const CATEGORIES = ['Books', 'Spare Parts', 'Fabric', 'Fashion'] as const;

export const COLLECTIONS: Collection[] = [
  {
    id: 'col-books',
    title: 'Books',
    tagline: 'The blurb',
    itemCount: 42,
    image: ASSET_IMAGES.frontPage,
    description: 'What does it take to stand up for a friend, tell the truth when it is hard, or lend a helping hand? Meet ordinary Malawian kids discovering that true strength comes from the inside.'
  },
  {
    id: 'col-spareparts',
    title: 'Spare Parts',
    tagline: 'TotalEnergies Quartz',
    itemCount: 86,
    image: ASSET_IMAGES.oilBundle,
    description: 'Brand: TotalEnergies\nProduct Line: Quartz 9000\nViscosity Grade: 5W-40\nVolume: 5 Liters per container\nSpecs & Approvals: ACEA A3 A3/B4, API SP/CF'
  },
  {
    id: 'col-fabric',
    title: 'Fabric',
    tagline: 'Artisanal Weaves & Premium Yardage',
    itemCount: 54,
    image: ASSET_IMAGES.satinOrange,
    description: 'Pure Mulberry silk, heavyweight Egyptian linen, Scottish wool tweed, and selvedge raw denim.'
  },
  {
    id: 'col-fashion',
    title: 'Fashion',
    tagline: 'Russian Satin',
    itemCount: 68,
    image: ASSET_IMAGES.satinPink,
    description: 'Bespoke cashmere overcoats, tailored structured blazers, calfskin derby shoes, and silk accents.'
  },
];

export const PRODUCTS: Product[] = [
  // BOOKS
  {
    id: 'bk-1',
    name: 'The Royal Architecture Compendium (Collector Edition)',
    price: 145000,
    rating: 5.0,
    category: 'Books',
    image: ASSET_IMAGES.frontPage,
    isNew: true,
    sku: 'RH-BK-1092',
    inStock: true,
    stockQuantity: 18,
    stockStatus: 'In Stock',
    warehouseLocation: 'Main Library Vault - Shelf B12',
    dispatchTime: 'Dispatches in 24 hours',
    description: 'A masterpiece monograph detailing centuries of royal palaces, neoclassical architecture, and modern monolithic structures. Printed on 170gsm heavyweight matte paper with foil-embossed linen binding.',
    highlights: [
      'Gilded edge gold leaf finish with silk bookmark ribbons',
      'Over 450 archival photographs and architectural blueprints',
      'Individually hand-numbered collector slipcase'
    ],
    specifications: {
      'Author': 'Sir Reginald Sterling & Studio Monolith',
      'Publisher': 'Royal Hints Heritage Editions',
      'Format': 'Hardcover Deluxe with Slipcase',
      'ISBN': '978-0-998412-88-2',
      'Pages': '520 Full-Color Pages',
      'Dimensions': '31.5 x 24.5 x 5.2 cm',
      'Language': 'English (Archival Edition)'
    },
    variants: [
      { id: 'v-bk-1', name: 'Deluxe Linen Slipcase Edition', stock: 12, sku: 'RH-BK-1092-DLX' },
      { id: 'v-bk-2', name: 'Artisan Leatherbound Reserve', stock: 6, sku: 'RH-BK-1092-LTR', priceModifier: 55000 },
    ],
    galleryImages: [
      ASSET_IMAGES.frontPage,
      ASSET_IMAGES.backPage,
      ASSET_IMAGES.logo
    ]
  },
  {
    id: 'bk-2',
    name: 'Precision Engineering & Mechanics Master Handbook',
    price: 98000,
    rating: 4.9,
    category: 'Books',
    image: ASSET_IMAGES.backPage,
    sku: 'RH-BK-2044',
    inStock: true,
    stockQuantity: 24,
    stockStatus: 'In Stock',
    warehouseLocation: 'Technical Depot 3 - Bay 04',
    dispatchTime: 'Same-day dispatch (orders before 2 PM)',
    description: 'The definitive technical reference guide for mechanical engineers, automotive builders, and precision fabricators. Includes comprehensive tolerance tables, metallurgy indexes, and CAD modeling guidelines.',
    highlights: [
      'Industrial spill-resistant synthetic leather cover',
      'Fold-out schematic diagrams and torque calibration charts',
      'Complete international ISO and DIN metric standard tables'
    ],
    specifications: {
      'Author': 'Dr. Marcus Vance, PE & Institute of Mechanics',
      'Publisher': 'Apex Technical Press',
      'Format': 'Flexibound Engineering Guild Spec',
      'ISBN': '978-1-4493-0199-4',
      'Pages': '680 Pages with Tabbed Indexes',
      'Dimensions': '24.0 x 17.5 x 4.0 cm',
      'Language': 'English'
    },
    variants: [
      { id: 'v-bk-3', name: 'Flexibound Field Edition', stock: 18, sku: 'RH-BK-2044-FLD' },
      { id: 'v-bk-4', name: 'Desk Reference Hardcover', stock: 6, sku: 'RH-BK-2044-DSK', priceModifier: 20000 },
    ]
  },

  // SPARE PARTS
  {
    id: 'sp-1',
    name: 'Billet Titanium 6-Piston Performance Brake Caliper',
    price: 389000,
    rating: 5.0,
    category: 'Spare Parts',
    image: ASSET_IMAGES.oilBundle,
    isNew: true,
    sku: 'RH-SP-9011',
    inStock: true,
    stockQuantity: 7,
    stockStatus: 'Low Stock',
    warehouseLocation: 'Motorsport & Hardware Hub - Aisle 19',
    dispatchTime: 'Dispatches in 24 hours with padded crate',
    description: 'Aviation-grade Grade 5 titanium forged monoblock brake caliper designed for maximum thermal dissipation and zero brake fade under extreme stress. CNC milled with micron-level tolerances.',
    highlights: [
      'High-grade titanium alloy body reducing unsprung weight by 38%',
      'Ceramic-coated stainless steel pistons for thermal isolation',
      'Dual bleed screws for quick paddock maintenance'
    ],
    specifications: {
      'OEM Compatibility': 'Universal Track / GT3 Spec / 380mm-410mm Rotors',
      'Part Number': 'RH-TC6-GT-401',
      'Piston Count': '6-Piston Staggered (32mm / 36mm / 38mm)',
      'Material': 'Forged Ti-6Al-4V Titanium',
      'Finish': 'Hard Anodized Amber Orange & Burnt Bronze',
      'Weight': '2.14 kg per caliper'
    },
    variants: [
      { id: 'v-sp-1', name: 'Front Left Caliper (Single)', stock: 3, sku: 'RH-SP-9011-FL' },
      { id: 'v-sp-2', name: 'Front Right Caliper (Single)', stock: 4, sku: 'RH-SP-9011-FR' },
      { id: 'v-sp-3', name: 'Complete Front Axle Pair Kit', stock: 2, sku: 'RH-SP-9011-PAIR', priceModifier: 370000 }
    ]
  },
  {
    id: 'sp-2',
    name: 'High-Precision Ceramic Hybrid Ball Bearing Unit',
    price: 84000,
    rating: 4.8,
    category: 'Spare Parts',
    image: ASSET_IMAGES.oil,
    sku: 'RH-SP-4412',
    inStock: true,
    stockQuantity: 32,
    stockStatus: 'In Stock',
    warehouseLocation: 'Motorsport Hub - Bin D-88',
    dispatchTime: 'Same-day dispatch',
    description: 'Silicon Nitride (Si3N4) ceramic balls seated in vacuum-degassed chrome steel races. Delivers 40% less friction and up to 10x service life in high-RPM transmissions and industrial drivetrains.',
    highlights: [
      'ABEC-9 super precision rating for ultra-low vibration',
      'Zero maintenance non-contact PTFE low-drag seals',
      'Extreme heat tolerance up to 350°C continuous'
    ],
    specifications: {
      'Part Number': 'RH-CRB-6008-RS',
      'Bore Diameter': '40 mm',
      'Outer Diameter': '68 mm',
      'Width': '15 mm',
      'Max RPM': '32,000 RPM (Grease Lubed)',
      'Dynamic Load': '17.8 kN'
    },
    variants: [
      { id: 'v-sp-4', name: 'Standard 40mm Bore Unit', stock: 20, sku: 'RH-SP-4412-STD' },
      { id: 'v-sp-5', name: 'Pre-lubricated High-RPM Spec', stock: 12, sku: 'RH-SP-4412-RPM', priceModifier: 15000 }
    ]
  },

  // FABRIC
  {
    id: 'fb-1',
    name: 'Pure Mulberry Royal Silk Charmeuse (19 Momme)',
    price: 68000,
    rating: 5.0,
    category: 'Fabric',
    image: ASSET_IMAGES.satinOrange,
    isNew: true,
    sku: 'RH-FB-5520',
    inStock: true,
    stockQuantity: 45,
    stockStatus: 'In Stock',
    warehouseLocation: 'Textile Atelier - Roll Rack 07',
    dispatchTime: 'Dispatches in 24 hours on core tube',
    description: 'Grade 6A 100% natural Mulberry silk with a liquid luster drape and luminous sheen. Ideal for couture gowns, bespoke lining, luxury pillowcases, and evening wear tailoring.',
    highlights: [
      '100% pure Grade 6A long-staple Mulberry silk fibers',
      'Natural hypoallergenic protein structure with smooth pearlescent surface',
      'OEKO-TEX Standard 100 certified non-toxic dyes'
    ],
    specifications: {
      'Composition': '100% Pure Mulberry Silk',
      'Weight / Density': '19 Momme (~82 GSM)',
      'Usable Width': '140 cm (55 inches)',
      'Weave Type': 'Charmeuse Satin Weave',
      'Care': 'Dry clean or gentle cold hand wash with silk detergent',
      'Origin': 'Hangzhou Royal Silk Valley'
    },
    variants: [
      { id: 'v-fb-1', name: '1 Yard Cut (55" Width)', stock: 25, sku: 'RH-FB-5520-1YD' },
      { id: 'v-fb-2', name: '3 Yards Tailor Cut', stock: 14, sku: 'RH-FB-5520-3YD', priceModifier: 120000 },
      { id: 'v-fb-3', name: '10 Yards Wholesale Bolt Roll', stock: 6, sku: 'RH-FB-5520-10YD', priceModifier: 540000 }
    ]
  },
  {
    id: 'fb-2',
    name: 'Organic Heavyweight Belgian Linen Yardage (380 GSM)',
    price: 46000,
    rating: 4.9,
    category: 'Fabric',
    image: ASSET_IMAGES.satinBeige,
    sku: 'RH-FB-8811',
    inStock: true,
    stockQuantity: 38,
    stockStatus: 'In Stock',
    warehouseLocation: 'Textile Atelier - Roll Rack 12',
    dispatchTime: 'Same-day dispatch',
    description: 'Sustainably cultivated European flax linen with a rich tactile slub texture. Pre-washed for incredible softness while preserving structure for outerwear, trousers, and architectural drapery.',
    highlights: [
      'GOTS certified 100% European natural flax fiber',
      'Pre-shrunk and enzyme stone-washed for immediate sewability',
      'Extremely durable with exceptional thermal breathability'
    ],
    specifications: {
      'Composition': '100% Organic European Flax',
      'Weight': '380 GSM (Heavyweight Canvas Spec)',
      'Usable Width': '152 cm (60 inches)',
      'Weave': 'Rustic Plain Weave with Natural Slubs',
      'Shrinkage': '< 1.5% Pre-washed',
      'Origin': 'Flanders, Belgium'
    },
    variants: [
      { id: 'v-fb-4', name: '1 Yard Cut - Natural Oatmeal', stock: 20, sku: 'RH-FB-8811-1YD' },
      { id: 'v-fb-5', name: '3 Yards Tailor Pack - Amber Rust', stock: 12, sku: 'RH-FB-8811-3YD', priceModifier: 85000 },
      { id: 'v-fb-6', name: '5 Yards Bolt - Charcoal Black', stock: 6, sku: 'RH-FB-8811-5YD', priceModifier: 170000 }
    ]
  },

  // FASHION
  {
    id: 'fs-1',
    name: 'Structured Obsidian Double-Breasted Wool Blazer',
    price: 265000,
    rating: 5.0,
    category: 'Fashion',
    image: ASSET_IMAGES.satinCoffeeBrown,
    isNew: true,
    sku: 'RH-FS-3012',
    inStock: true,
    stockQuantity: 14,
    stockStatus: 'In Stock',
    warehouseLocation: 'London Sartorial Showroom - Suite A',
    dispatchTime: 'Dispatches in 24 hours with garment bag',
    description: 'Hand-tailored from Super 130s Merino virgin wool with full canvas construction. Features sharp peak lapels, genuine horn buttons with Royal Hints orange thread detail, and dual rear vents.',
    highlights: [
      'Full floating horsehair canvas chest piece that molds to your body',
      'Super 130s Italian Merino wool with natural crease resistance',
      'Signature cupro orange inner lining with interior passport pocket'
    ],
    specifications: {
      'Material': '100% Super 130s Virgin Merino Wool',
      'Lining': '100% Bemberg Cupro Silk Finish',
      'Fit': 'Modern Tailored Drop-7 Silhouette',
      'Lapel': '10.5 cm Broad Peak Lapel with Milanese Buttonhole',
      'Buttons': 'Natural Dark Horn with Accent Stitching',
      'Care': 'Specialist Dry Clean Only'
    },
    variants: [
      { id: 'v-fs-1', name: 'Size 38R (Small)', stock: 3, sku: 'RH-FS-3012-38R' },
      { id: 'v-fs-2', name: 'Size 40R (Medium)', stock: 6, sku: 'RH-FS-3012-40R' },
      { id: 'v-fs-3', name: 'Size 42R (Large)', stock: 4, sku: 'RH-FS-3012-42R' },
      { id: 'v-fs-4', name: 'Size 44R (X-Large)', stock: 1, sku: 'RH-FS-3012-44R' }
    ]
  },
  {
    id: 'fs-2',
    name: 'Artisanal Handcrafted Tuscan Calfskin Derby Shoes',
    price: 210000,
    rating: 4.9,
    category: 'Fashion',
    image: ASSET_IMAGES.satinOliveGreen,
    sku: 'RH-FS-6622',
    inStock: true,
    stockQuantity: 11,
    stockStatus: 'Low Stock',
    warehouseLocation: 'Sartorial Vault - Rack 05',
    dispatchTime: 'Dispatches in 24 hours with cedar shoe trees',
    description: 'Goodyear welted derby shoes crafted in Florence from full-grain vegetable-tanned French calfskin. Hand-burnished edges and double leather soles designed for decades of resoleable wear.',
    highlights: [
      'Traditional Goodyear 360° storm welt construction',
      'Full-grain French calf leather aged naturally in oak bark pits',
      'Includes pair of aromatic cedar wood shoe trees and travel dust bags'
    ],
    specifications: {
      'Upper': 'Full-Grain French Calfskin (Vegetable Tanned)',
      'Sole': 'Stacked Tuscan Leather Sole with Vibram Heel Tap',
      'Last': 'RH Imperial Round Toe Last',
      'Construction': 'Goodyear Welted (Fully Resoleable)',
      'Origin': 'Handmade in Florence, Italy'
    },
    variants: [
      { id: 'v-fs-5', name: 'EU 41 / US 8', stock: 2, sku: 'RH-FS-6622-41' },
      { id: 'v-fs-6', name: 'EU 42 / US 9', stock: 4, sku: 'RH-FS-6622-42' },
      { id: 'v-fs-7', name: 'EU 43 / US 10', stock: 3, sku: 'RH-FS-6622-43' },
      { id: 'v-fs-8', name: 'EU 44 / US 11', stock: 2, sku: 'RH-FS-6622-44' }
    ]
  }
];

export const TRENDING_PRODUCTS = PRODUCTS;

export const REVIEWS: Review[] = [
  { id: 'r1', user: 'Julian Mwanza', content: "The Russian Satin exceeded all expectations I had.", rating: 5, date: '2 days ago', verified: true },
  { id: 'r2', user: 'Clement Matapa', content: "The book is wonderfull can't wait for another one.", rating: 5, date: '4 days ago', verified: true },
  { id: 'r3', user: 'Martha Phiri', content: "They have pure TotalEnergies oil.", rating: 5, date: '1 week ago', verified: true },
  { id: 'r4', user: 'John Morgan Banda', content: "Ankara cotton I bought is just exactly what i wanted.", rating: 5, date: '1 week ago', verified: true },
];

export const INSTAGRAM_IMAGES = [
  ASSET_IMAGES.frontPage,
  ASSET_IMAGES.oilBundle,
  ASSET_IMAGES.satinOrange,
  ASSET_IMAGES.satinPink,
  ASSET_IMAGES.backPage,
  ASSET_IMAGES.oil,
];

export const INITIAL_MARKETPLACE_POSTS: BusinessPost[] = [
  {
    id: 'mp1',
    userId: 'u1',
    userName: 'Lord Alistair Sterling',
    title: 'Rare Antiquarian Books & Guild Bindery',
    description: 'Specializing in rare first edition monographs, architectural folios, and custom full-grain leather rebinding for distinguished libraries.',
    image: ASSET_IMAGES.frontPage,
    category: 'Books',
    stockCount: 14,
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'mp2',
    userId: 'u2',
    userName: 'Klausen Motorsport Fabrication',
    title: 'Titanium & Billet CNC Machine Components',
    description: 'Direct supplier of precision engineered spare parts, titanium calipers, and ceramic drivetrain bearings for high-performance builds.',
    image: ASSET_IMAGES.oilBundle,
    category: 'Spare Parts',
    stockCount: 28,
    timestamp: Date.now() - 172800000,
  },
  {
    id: 'mp3',
    userId: 'u3',
    userName: 'Geneva Silk & Wool Mills',
    title: 'Heritage Mulberry Silk & Organic Linen Bolt Mill',
    description: 'Small-batch artisanal weavers providing certified organic linen yardage and 19-Momme Grade 6A mulberry silk to world couture houses.',
    image: ASSET_IMAGES.satinBeige,
    category: 'Fabric',
    stockCount: 45,
    timestamp: Date.now() - 250000000,
  },
  {
    id: 'mp4',
    userId: 'u4',
    userName: 'Sartoria Royal Atelier',
    title: 'Bespoke Suiting & Calfskin Footwear House',
    description: 'Full-canvas tailoring, handcrafted derby shoes, and limited-edition luxury outerwear crafted by master artisans.',
    image: ASSET_IMAGES.satinCoffeeBrown,
    category: 'Fashion',
    stockCount: 19,
    timestamp: Date.now() - 320000000,
  }
];
