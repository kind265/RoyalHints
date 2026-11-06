import { Router, Request, Response } from 'express';
import { databaseStore } from '../db/store';

export const analyticsRouter = Router();

analyticsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const products = await databaseStore.getProducts();
    const shipments = await databaseStore.getShipments();
    const quotations = await databaseStore.getQuotations();
    const bespokeRequests = await databaseStore.getBespokeRequests();
    const posts = await databaseStore.getPosts();

    // Compute category breakdown
    const categoryCount: Record<string, number> = {};
    products.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });

    // Total Inventory Value
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * (p.stockQuantity || 1)), 0);

    // Active Quotes Value
    const totalQuotedValue = quotations.reduce((acc, q) => acc + (q.adminQuote?.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: products.length,
          totalInventoryValue,
          activeShipments: shipments.length,
          deliveredShipments: shipments.filter(s => s.status === 'Delivered').length,
          totalQuotations: quotations.length,
          pendingQuotations: quotations.filter(q => q.status === 'Under Review').length,
          totalBespokeRequests: bespokeRequests.length,
          activeBespokeSourcing: bespokeRequests.filter(b => b.status !== 'Fulfilled').length,
          totalVenturePosts: posts.length,
          totalQuotedValue
        },
        categoryBreakdown: categoryCount,
        recentActivity: [
          ...bespokeRequests.slice(0, 3).map(b => ({
            type: 'Bespoke Request',
            title: b.itemName,
            user: b.userName,
            timestamp: b.submittedAt,
            status: b.status
          })),
          ...quotations.slice(0, 3).map(q => ({
            type: 'Quotation Request',
            title: q.title,
            user: q.userName,
            timestamp: q.submittedAt,
            status: q.status
          }))
        ].sort((a, b) => b.timestamp - a.timestamp)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
