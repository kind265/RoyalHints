import { Router, Request, Response } from 'express';
import { postgresStore } from '../db/store';
import { Product } from '../types';

export const productsRouter = Router();

// GET all products or filter by category / search
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    let products = await postgresStore.getProducts();

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

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET product by ID
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await postgresStore.getProductById(String(req.params.id));
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
    if (!body.name || !body.category || body.price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required product attributes (name, category, price)' 
      });
    }

    const newProduct: Product = {
      id: body.id || `prod-${Date.now()}`,
      name: body.name,
      price: Number(body.price),
      rating: body.rating || 5.0,
      category: body.category,
      image: body.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
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

    const created = await postgresStore.createProduct(newProduct);
    res.status(201).json({ success: true, message: 'Product created successfully in PostgreSQL', data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update product
productsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await postgresStore.updateProduct(String(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found for update' });
    }
    res.json({ success: true, message: 'Product updated successfully in PostgreSQL', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE product
productsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await postgresStore.deleteProduct(String(req.params.id));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found for deletion' });
    }
    res.json({ success: true, message: 'Product removed successfully from PostgreSQL' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
