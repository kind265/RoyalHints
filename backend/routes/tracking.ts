import { Router, Request, Response } from 'express';
import { postgresStore } from '../db/store';
import { ShipmentTracking } from '../types';

export const trackingRouter = Router();

// GET all shipments
trackingRouter.get('/', async (req: Request, res: Response) => {
  try {
    const shipments = await postgresStore.getShipments();
    res.json({
      success: true,
      count: shipments.length,
      data: shipments
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET shipment by trackingNumber or orderId
trackingRouter.get('/:query', async (req: Request, res: Response) => {
  try {
    const query = String(req.params.query);
    const shipment = await postgresStore.getShipmentByTrackingNumber(query);
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

    const created = await postgresStore.createShipment(newShipment);
    res.status(201).json({ success: true, message: 'Shipment tracking initialized in PostgreSQL', data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update shipment status or checkpoints
trackingRouter.put('/:idOrTracking', async (req: Request, res: Response) => {
  try {
    const updated = await postgresStore.updateShipment(String(req.params.idOrTracking), req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Shipment record not found' });
    }
    res.json({ success: true, message: 'Shipment updated successfully in PostgreSQL', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST confirm delivery by customer
trackingRouter.post('/:idOrTracking/confirm-delivery', async (req: Request, res: Response) => {
  try {
    const shipment = await postgresStore.getShipmentByTrackingNumber(String(req.params.idOrTracking));
    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const updated = await postgresStore.updateShipment(shipment.trackingNumber, {
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
