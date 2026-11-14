import { Router, Request, Response } from 'express';
import { databaseStore } from '../db/store';
import { BusinessPost } from '../types';

export const postsRouter = Router();

let postCatalogCache: { posts: BusinessPost[]; expiresAt: number } | null = null;
let postCatalogLoad: Promise<BusinessPost[]> | null = null;
let postCatalogVersion = 0;
const POST_CACHE_TTL_MS = 30_000;

// GET all business posts
postsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, userId } = req.query;
    const now = Date.now();
    let posts: BusinessPost[];
    if (postCatalogCache && postCatalogCache.expiresAt > now) {
      posts = postCatalogCache.posts;
    } else {
      if (!postCatalogLoad) postCatalogLoad = databaseStore.getPosts();
      const currentLoad = postCatalogLoad;
      const currentVersion = postCatalogVersion;
      try {
        posts = await currentLoad;
        if (currentVersion === postCatalogVersion) {
          postCatalogCache = {
            posts,
            expiresAt: Date.now() + POST_CACHE_TTL_MS
          };
        }
      } finally {
        if (postCatalogLoad === currentLoad) postCatalogLoad = null;
      }
    }

    if (category && typeof category === 'string') {
      posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (userId && typeof userId === 'string') {
      posts = posts.filter(p => p.userId === userId);
    }

    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error: any) {
    console.error('Marketplace catalog request failed:', error);
    res.status(503).json({ success: false, message: 'Marketplace catalog is temporarily unavailable.' });
  }
});

const invalidatePostCatalogCache = () => {
  postCatalogVersion += 1;
  postCatalogCache = null;
  postCatalogLoad = null;
};

// POST a new venture listing / post
postsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.title || !body.category || !body.image || body.price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Post requires title, category, image, and price'
      });
    }

    const newPost: BusinessPost = {
      id: body.id || `post-${Date.now()}`,
      userId: body.userId || 'user-admin',
      userName: body.userName || 'Royal Hints Official',
      title: body.title,
      description: body.description || '',
      image: body.image,
      category: body.category,
      timestamp: body.timestamp || Date.now(),
      price: body.price !== undefined && body.price !== '' ? Number(body.price) : 0,
      stockCount: body.stockCount !== undefined && body.stockCount !== '' ? Number(body.stockCount) : undefined,
      sku: body.sku,
      condition: body.condition,
      location: body.location,
      dispatchTime: body.dispatchTime,
      galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : [],
      reviews: body.reviews || []
    };

    const created = await databaseStore.createPost(newPost);
    invalidatePostCatalogCache();
    databaseStore.notifyItemSubscribers(created).catch(error => {
      console.error('New item subscriber notification error:', error);
    });
    res.status(201).json({ success: true, message: 'Post published to MariaDB', data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single post by ID
postsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const post = await databaseStore.getPostById(String(req.params.id));
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
    const updated = await databaseStore.updatePost(String(req.params.id), req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Post not found for update' });
    }
    invalidatePostCatalogCache();
    res.json({ success: true, message: 'Post updated in MariaDB', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE post
postsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await databaseStore.deletePost(String(req.params.id));
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Post not found for deletion' });
    }
    invalidatePostCatalogCache();
    res.json({ success: true, message: 'Post removed from MariaDB' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
