import { Router, Request, Response } from 'express';
import { databaseStore } from '../db/store';
import { Product } from '../types';

export const productsRouter = Router();

let productCatalogCache: { products: Product[]; expiresAt: number } | null = null;
let productCatalogLoad: Promise<Product[]> | null = null;
let productCatalogVersion = 0;
const PRODUCT_CACHE_TTL_MS = 30_000;

// GET all products or filter by category / search
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const now = Date.now();
    let products: Product[];
    if (productCatalogCache && productCatalogCache.expiresAt > now) {
      products = productCatalogCache.products;
    } else {
      if (!productCatalogLoad) productCatalogLoad = databaseStore.getProducts();
      const currentLoad = productCatalogLoad;
      const currentVersion = productCatalogVersion;
      try {
        products = await currentLoad;
        if (currentVersion === productCatalogVersion) {
          productCatalogCache = {
            products,
            expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS
          };
        }
      } finally {
        if (productCatalogLoad === currentLoad) productCatalogLoad = null;
      }
    }

    if (category && typeof category === 'string' && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error: any) {
    console.error('Product catalog request failed:', error);
    res.status(503).json({ success: false, message: 'Product catalog is temporarily unavailable.' });
  }
});

export const invalidateProductCatalogCache = () => {
  productCatalogVersion += 1;
  productCatalogCache = null;
  productCatalogLoad = null;
};

// GET product by ID
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await databaseStore.getProductById(String(req.params.id));
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new product (Admin inventory)
productsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.name || !body.category || body.price === undefined || !body.image) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required product attributes (name, category, price, image)' 
      });
    }

    const newProduct: Product = {
      id: body.id || `prod-${Date.now()}`,
      name: body.name,
      price: Number(body.price),
      rating: body.rating || 5.0,
      category: body.category,
      image: body.image,
      isNew: body.isNew ?? true,
      sku: body.sku || `RH-${body.category.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      inStock: body.inStock ?? true,
      stockQuantity: body.stockQuantity ?? 10,
      stockStatus: body.stockStatus || 'In Stock',
      warehouseLocation: body.warehouseLocation || 'Main Inventory Suite',
      dispatchTime: body.dispatchTime || 'Dispatches in 24 hours',
      description: body.description || '',
      highlights: body.highlights || [],
      specifications: body.specifications || {},
      variants: body.variants || [],
      galleryImages: body.galleryImages || []
    };

    const created = await databaseStore.createProduct(newProduct);
    invalidateProductCatalogCache();
    res.status(201).json({ success: true, message: 'Product created successfully in MariaDB', data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update product
productsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await databaseStore.updateProduct(String(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found for update' });
    }
    invalidateProductCatalogCache();
    res.json({ success: true, message: 'Product updated successfully in MariaDB', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE product
productsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await databaseStore.deleteProduct(String(req.params.id));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found for deletion' });
    }
    invalidateProductCatalogCache();
    res.json({ success: true, message: 'Product removed successfully from MariaDB' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
