import { Router, Request, Response } from 'express';
import { postgresStore } from '../db/store';
import { BusinessPost } from '../types';

export const postsRouter = Router();

// GET all business posts
postsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, userId } = req.query;
    let posts = await postgresStore.getPosts();

    if (category && typeof category === 'string') {
      posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (userId && typeof userId === 'string') {
      posts = posts.filter(p => p.userId === userId);
    }

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST a new venture listing / post
postsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.title || !body.category) {
      return res.status(400).json({
        success: false,
        message: 'Post requires title and category'
      });
    }

    const newPost: BusinessPost = {
      id: body.id || `post-${Date.now()}`,
      userId: body.userId || 'user-admin',
      userName: body.userName || 'Royal Hints Official',
      title: body.title,
      description: body.description || '',
      image: body.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      category: body.category,
      timestamp: body.timestamp || Date.now(),
      price: body.price !== undefined && body.price !== '' ? Number(body.price) : 150,
      stockCount: body.stockCount !== undefined && body.stockCount !== '' ? Number(body.stockCount) : undefined,
      sku: body.sku,
      condition: body.condition || 'Mint Condition',
      location: body.location || 'London Vaults',
      dispatchTime: body.dispatchTime || '24h Inspected Dispatch',
      reviews: body.reviews || []
    };

    const created = await postgresStore.createPost(newPost);
    res.status(201).json({ success: true, message: 'Post published to PostgreSQL', data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single post by ID
postsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const post = await postgresStore.getPostById(String(req.params.id));
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, data: post });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update post
postsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await postgresStore.updatePost(String(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Post not found for update' });
    }
    res.json({ success: true, message: 'Post updated in PostgreSQL', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE post
postsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await postgresStore.deletePost(String(req.params.id));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Post not found for deletion' });
    }
    res.json({ success: true, message: 'Post removed from PostgreSQL' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
