import { Router, Request, Response } from 'express';
import { postgresStore } from '../db/store';
import { BespokeSourcingRequest } from '../types';

export const bespokeRouter = Router();

// GET all bespoke sourcing requests
bespokeRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.query;
    let requests = await postgresStore.getBespokeRequests();

    if (userId && typeof userId === 'string') {
      requests = requests.filter(r => r.userId === userId || r.userEmail.toLowerCase() === userId.toLowerCase());
    }

    if (status && typeof status === 'string') {
      requests = requests.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST a new bespoke sourcing request
bespokeRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.itemName || !body.category) {
      return res.status(400).json({
        success: false,
        message: 'Item name and category are required'
      });
    }

    const refNumber = `BSR-RH-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRequest: BespokeSourcingRequest = {
      id: body.id || `bsr-${Date.now()}`,
      referenceNumber: body.referenceNumber || refNumber,
      userId: body.userId || 'usr-guest',
      userName: body.userName || 'Distinguished Patron',
      userEmail: body.userEmail || 'client@royalhints.com',
      itemName: body.itemName,
      category: body.category,
      makerOrBrand: body.makerOrBrand,
      conditionPreference: body.conditionPreference || 'Archival / Vintage Verified',
      budgetEstimate: body.budgetEstimate || 'Bespoke Valuation',
      urgency: body.urgency || 'Within 7 Days',
      referenceLinkOrImageUrl: body.referenceLinkOrImageUrl,
      detailedRequirements: body.detailedRequirements || '',
      adminRecipient: 'Admin Sourcing Desk (admin@royalhints.com)',
      status: 'Received by Admin',
      submittedAt: body.submittedAt || Date.now()
    };

    const created = await postgresStore.createBespokeRequest(newRequest);
    res.status(201).json({
      success: true,
      message: 'Bespoke sourcing dossier registered in PostgreSQL',
      data: created
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT admin response to bespoke sourcing request
bespokeRouter.put('/:id/respond', async (req: Request, res: Response) => {
  try {
    const { assignedSpecialist, networkLocationFound, directOfferPrice, adminMessage, status } = req.body;
    const requests = await postgresStore.getBespokeRequests();
    const reqItem = requests.find(r => r.id === req.params.id || r.referenceNumber === req.params.id);

    if (!reqItem) {
      return res.status(404).json({ success: false, message: 'Bespoke sourcing request not found' });
    }

    const updated = await postgresStore.updateBespokeRequest(reqItem.id, {
      status: status || 'Located in Vault Network',
      adminResponse: {
        assignedSpecialist: assignedSpecialist || 'Royal Hints Principal Curator',
        networkLocationFound: networkLocationFound || 'Global Vault Network',
        directOfferPrice: directOfferPrice ? Number(directOfferPrice) : undefined,
        responseDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        adminMessage: adminMessage || 'Our sourcing team has verified inventory availability matching your specifications.'
      }
    });

    res.json({
      success: true,
      message: 'Admin sourcing response dispatched and saved in PostgreSQL',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
