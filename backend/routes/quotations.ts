import { Router, Request, Response } from 'express';
import { databaseStore } from '../db/store';
import { QuotationRequest } from '../types';

export const quotationsRouter = Router();

// GET all quotation requests
quotationsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.query;
    let quotations = await databaseStore.getQuotations();

    if (userId && typeof userId === 'string') {
      quotations = quotations.filter(q => q.userId === userId || q.userEmail.toLowerCase() === userId.toLowerCase());
    }

    if (status && typeof status === 'string') {
      quotations = quotations.filter(q => q.status.toLowerCase() === status.toLowerCase());
    }

    res.json({
      success: true,
      count: quotations.length,
      data: quotations
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST a new quotation request
quotationsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.title || !body.category || !body.userId || !body.userName || !body.userEmail || !body.targetBudget || !body.deliveryLocation || !body.contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Quotation requires client, item, budget, delivery, and contact details'
      });
    }

    const quoteNumber = `Q-RH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newQuotation: QuotationRequest = {
      id: body.id || `qr-${Date.now()}`,
      quoteNumber: body.quoteNumber || quoteNumber,
      userId: body.userId,
      userName: body.userName,
      userEmail: body.userEmail,
      title: body.title,
      category: body.category,
      estimatedQuantity: Number(body.estimatedQuantity) || 1,
      targetBudget: body.targetBudget,
      urgency: body.urgency || 'Standard (5-7 Days)',
      specifications: body.specifications || '',
      deliveryLocation: body.deliveryLocation,
      contactNumber: body.contactNumber,
      status: 'Under Review',
      submittedAt: body.submittedAt || Date.now()
    };

    const created = await databaseStore.createQuotation(newQuotation);
    res.status(201).json({
      success: true,
      message: 'Quotation request received and queued in MariaDB',
      data: created
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT admin response to quotation
quotationsRouter.put('/:id/respond', async (req: Request, res: Response) => {
  try {
    const { unitPrice, leadTimeDays, officialNotes, includesTaxShipping } = req.body;
    const quotations = await databaseStore.getQuotations();
    const quote = quotations.find(q => q.id === req.params.id || q.quoteNumber === req.params.id);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation request not found' });
    }

    const numericUnitPrice = Number(unitPrice) || 0;
    const totalAmount = numericUnitPrice * (quote.estimatedQuantity || 1);

    const updated = await databaseStore.updateQuotation(quote.id, {
      status: 'Quote Ready',
      adminQuote: {
        unitPrice: numericUnitPrice,
        totalAmount,
        leadTimeDays: Number(leadTimeDays) || 5,
        validityDate: 'Valid for 14 Days from issuance',
        officialNotes: officialNotes || 'Curated with certified vendor guarantee.',
        includesTaxShipping: includesTaxShipping ?? true
      }
    });

    res.json({
      success: true,
      message: 'Official quote updated in MariaDB and dispatched to client',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
