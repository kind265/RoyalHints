import { Router, Request, Response } from 'express';
import { databaseStore } from '../db/store';
import { ShipmentTracking } from '../types';

export const trackingRouter = Router();
const getSessionUser = async (req: Request) => {
  const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith('royal_hints_session='));
  const token = cookie?.slice('royal_hints_session='.length);
  return token ? databaseStore.getSession(token) : undefined;
};

// GET all shipments
trackingRouter.get('/', async (req: Request, res: Response) => {
  try {
    const shipments = await databaseStore.getShipments();
    res.json({
      success: true,
      count: shipments.length,
      data: shipments
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

trackingRouter.get('/admin/receipts', async (req: Request, res: Response) => {
  try {
    const user = await getSessionUser(req);
    if (!user || !(user.isAdmin || user.role === 'admin')) {
      return res.status(403).json({ success: false, message: 'Administrator access is required.' });
    }
    const receipts = await databaseStore.getPaidOrderReceipts();
    return res.json({ success: true, count: receipts.length, data: receipts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

trackingRouter.post('/scan/:token', async (req: Request, res: Response) => {
  try {
    const token = String(req.params.token || '');
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery QR code.' });
    }
    const shipment = await databaseStore.confirmDeliveryByScanToken(token);
    if (!shipment) return res.status(404).json({ success: false, message: 'No paid order matches this delivery QR code.' });
    return res.json({
      success: true,
      message: 'Delivery confirmed. This order is now marked as delivered.',
      data: {
        orderId: shipment.orderId,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        deliveryConfirmedAt: shipment.deliveryConfirmedAt
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET shipment by trackingNumber or orderId
trackingRouter.get('/:query', async (req: Request, res: Response) => {
  try {
    const query = String(req.params.query);
    const shipment = await databaseStore.getShipmentByTrackingNumber(query);
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: `No active shipment found matching tracking ID: ${query}`
      });
    }
    res.json({ success: true, data: shipment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create shipment
trackingRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body.trackingNumber || !body.orderId || !body.destination) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number, Order ID, and destination are required'
      });
    }

    const newShipment: ShipmentTracking = {
      id: body.id || `ship-${Date.now()}`,
      trackingNumber: body.trackingNumber,
      orderId: body.orderId,
      carrier: body.carrier || 'Royal Hints Logistics',
      serviceType: body.serviceType || 'Courier Delivery',
      status: body.status || 'Order Placed',
      origin: body.origin || 'Royal Hints Dispatch',
      destination: body.destination,
      estimatedDelivery: body.estimatedDelivery,
      dispatchedDate: body.dispatchedDate,
      orderDate: body.orderDate || new Date().toLocaleDateString(),
      paymentMethod: body.paymentMethod,
      deliveryConfirmedByCustomer: false,
      items: body.items || [],
      checkpoints: body.checkpoints || [
        {
          id: `cp-${Date.now()}`,
          title: 'Order Placed & Escrow Funded',
          location: 'Client Checkout Desk',
          timestamp: `${new Date().toLocaleDateString()} • Just Now`,
          completed: true,
          isCurrent: true
        }
      ]
    };

    const created = await databaseStore.createShipment(newShipment);
    res.status(201).json({ success: true, message: 'Shipment tracking initialized in MariaDB', data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update shipment status or checkpoints
trackingRouter.put('/:idOrTracking', async (req: Request, res: Response) => {
  try {
    const updated = await databaseStore.updateShipment(String(req.params.idOrTracking), req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Shipment record not found' });
    }
    res.json({ success: true, message: 'Shipment updated successfully in MariaDB', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST confirm delivery by customer
trackingRouter.post('/:idOrTracking/confirm-delivery', async (req: Request, res: Response) => {
  try {
    const shipment = await databaseStore.getShipmentByTrackingNumber(String(req.params.idOrTracking));
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const updated = await databaseStore.updateShipment(shipment.trackingNumber, {
      status: 'Delivered',
      deliveryConfirmedByCustomer: true,
      deliveryConfirmedAt: new Date().toISOString(),
      checkpoints: [
        ...(shipment.checkpoints || []),
        {
          id: `cp-${Date.now()}`,
          title: 'Delivered & Client Verified',
          location: shipment.destination,
          timestamp: `${new Date().toLocaleDateString()} • Confirmed`,
          completed: true,
          isCurrent: true
        }
      ]
    });

    res.json({
      success: true,
      message: 'Delivery confirmed and receipt verified by client',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
