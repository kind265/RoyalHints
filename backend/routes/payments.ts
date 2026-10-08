import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { postgresStore } from '../db/store';

export const paymentsRouter = Router();

const confirmedTransactions = new Map<string, any>();

const getPublicBaseUrl = () => {
  return process.env.PUBLIC_BASE_URL || process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || 'http://localhost:3000';
};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
};

const normalizeStatus = (value: unknown) => {
  const normalized = String(value ?? '').toLowerCase();
  if (['paid', 'success', 'completed', 'succeeded', 'approved'].includes(normalized)) return 'success';
  if (['failed', 'declined', 'cancelled', 'canceled', 'rejected'].includes(normalized)) return 'cancelled';
  if (['pending', 'processing', 'in_progress', 'in-progress'].includes(normalized)) return 'pending';
  return normalized || 'pending';
};

const resolvePayChanguPayload = (data: any) => {
  if (!data || typeof data !== 'object') return null;

  return (
    data.checkout_url ||
    data.redirect_url ||
    data.payment_url ||
    data.url ||
    data.link ||
    data.paymentLink ||
    data.checkoutUrl ||
    data.redirectUrl ||
    data.data?.checkout_url ||
    data.data?.redirect_url ||
    data.data?.payment_url ||
    data.data?.url ||
    data.data?.link ||
    data.data?.paymentLink ||
    data.data?.checkoutUrl ||
    data.data?.redirectUrl ||
    null
  );
};

const getProviderMessage = (payload: any) => {
  if (!payload || typeof payload !== 'object') return '';
  return payload.message || payload.error || payload.data?.message || '';
};

const verifyPaidCheckout = async (reference: string) => {
  const pending = await postgresStore.getPendingCheckout(reference);
  if (!pending) throw new Error('No pending order found for this payment reference.');
  const secretKey = process.env.PAYCHANGU_SECRET_KEY;
  const apiBaseUrl = (process.env.PAYCHANGU_API_BASE_URL || 'https://api.paychangu.com').replace(/\/$/, '');
  const response = await fetch(`${apiBaseUrl}/verify-payment/${encodeURIComponent(reference)}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${secretKey}` }
  });
  const result = await response.json() as any;
  const payment = result?.data;
  if (!response.ok || String(payment?.status || '').toLowerCase() !== 'success') {
    throw new Error(getProviderMessage(result) || 'PayChangu has not confirmed this payment as successful.');
  }
  if (String(payment.tx_ref || '') !== reference) throw new Error('PayChangu payment reference did not match the order.');
  if (String(payment.currency || '').toUpperCase() !== pending.currency.toUpperCase()) throw new Error('PayChangu payment currency did not match the order currency.');
  if (toNumber(payment.amount) < pending.amount) throw new Error('The verified payment amount is lower than the order total.');
  return postgresStore.completePaidCheckout(reference);
};

const verifyPayChanguSignature = (req: Request, body: any) => {
  const secret = process.env.PAYCHANGU_WEBHOOK_SECRET;
  const signatureHeader = req.headers['x-paychangu-signature'] || req.headers['x-signature'] || req.headers['signature'];

  if (!secret || !signatureHeader) {
    return true;
  }

  const rawBody = typeof body === 'string' ? body : JSON.stringify(body ?? {});
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = Array.isArray(signatureHeader) ? signatureHeader[0] : String(signatureHeader).trim();
  return provided.toLowerCase() === expected.toLowerCase();
};

const recordTransaction = (payload: any) => {
  const details = payload?.data && typeof payload.data === 'object' ? payload.data : payload;
  const reference = details?.tx_ref || payload?.tx_ref || details?.transaction_ref || payload?.transaction_ref || details?.reference || payload?.reference || details?.id || payload?.id || `paychangu-${Date.now()}`;
  const normalized = {
    id: details?.id || payload?.id || details?.transaction_id || payload?.transaction_id || reference,
    provider: 'paychangu',
    currency: details?.currency || payload?.currency || process.env.PAYCHANGU_CURRENCY || 'MWK',
    amount: toNumber(details?.amount ?? payload?.amount ?? payload?.total_amount ?? payload?.totalAmount, 0),
    reference,
    status: normalizeStatus(details?.status ?? payload?.status ?? payload?.payment_status ?? payload?.state),
    customer: details?.customer || payload?.customer || payload?.email || payload?.payer || null,
    metadata: details?.meta || payload?.meta || payload?.metadata || {},
    confirmedAt: new Date().toISOString(),
    raw: payload
  };

  confirmedTransactions.set(reference, normalized);
  return normalized;
};

paymentsRouter.post('/paychangu/initiate', async (req: Request, res: Response) => {
  try {
    const { amount, email, phone, firstName, lastName, reference, callbackUrl, returnUrl, metadata } = req.body ?? {};
    const secretKey = process.env.PAYCHANGU_SECRET_KEY;
    const apiBaseUrl = (process.env.PAYCHANGU_API_BASE_URL || 'https://api.paychangu.com').replace(/\/$/, '');

    if (!secretKey) {
      return res.status(500).json({
        success: false,
        message: 'PayChangu credentials are missing. Configure PAYCHANGU_SECRET_KEY.'
      });
    }

    const normalizedAmount = toNumber(amount, 0);
    const finalAmount = normalizedAmount > 0 ? normalizedAmount : 1;
    const finalReference = reference || `RH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fallbackBaseUrl = getPublicBaseUrl();
    const finalReturnUrl = returnUrl || process.env.PAYCHANGU_RETURN_URL || `${fallbackBaseUrl}/checkout?status=success`;
    const finalCallbackUrl = callbackUrl || process.env.PAYCHANGU_CALLBACK_URL || finalReturnUrl;
    const currency = process.env.PAYCHANGU_CURRENCY || 'MWK';

    const payload = {
      amount: finalAmount.toFixed(2),
      currency,
      email: email || 'customer@royalhints.com',
      first_name: firstName || 'Royal',
      last_name: lastName || 'Hints',
      callback_url: finalCallbackUrl,
      return_url: finalReturnUrl,
      tx_ref: finalReference,
      customization: {
        title: 'Royal Hints order',
        description: 'Payment for Royal Hints products'
      },
      meta: {
        source: 'royalhints',
        platform: 'web',
        phone: phone || '',
        ...(metadata || {})
      }
    };

    const endpoint = `${apiBaseUrl}/payment`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secretKey}`
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let json: any = {};
    try {
      json = responseText ? JSON.parse(responseText) : {};
    } catch {
      json = { message: responseText };
    }

    const redirectUrl = resolvePayChanguPayload(json);
    if (!response.ok || String(json.status || '').toLowerCase() === 'failed' || !redirectUrl) {
      return res.status(response.ok ? 502 : response.status).json({
        success: false,
        message: getProviderMessage(json) || 'PayChangu could not create a hosted checkout session.',
        providerStatus: json.status || null,
        providerResponse: json.data || null
      });
    }

    const checkoutOrder = metadata?.checkoutOrder;
    if (!checkoutOrder || !checkoutOrder.destination || !Array.isArray(checkoutOrder.items) || checkoutOrder.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order delivery and item details are required before payment.' });
    }
    await postgresStore.savePendingCheckout(finalReference, finalAmount, currency, checkoutOrder);

    return res.json({
      success: true,
      data: {
        provider: 'paychangu',
        currency,
        amount: finalAmount,
        reference: finalReference,
        redirectUrl,
        callbackUrl: finalCallbackUrl,
        raw: json
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Unexpected error while initiating PayChangu payment.',
      error: error?.message || 'Unknown error'
    });
  }
});

paymentsRouter.post('/paychangu/complete/:reference', async (req: Request, res: Response) => {
  try {
    const reference = String(req.params.reference || '').trim();
    if (!reference) return res.status(400).json({ success: false, message: 'Payment reference is required.' });
    const shipment = await verifyPaidCheckout(reference);
    return res.json({ success: true, message: 'Payment verified and order receipt created.', data: shipment });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error?.message || 'Payment verification failed.' });
  }
});

paymentsRouter.post('/paychangu/verify', async (req: Request, res: Response) => {
  try {
    const payload = req.body ?? {};
    const isSignatureValid = verifyPayChanguSignature(req, payload);

    if (!isSignatureValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid PayChangu signature.'
      });
    }

    const transaction = recordTransaction(payload);
    let receipt: any = null;
    if (transaction.status === 'success') {
      try {
        receipt = await verifyPaidCheckout(String(transaction.reference));
      } catch (error) {
        console.warn('PayChangu callback received before order finalization:', error);
      }
    }
    return res.json({
      success: true,
      message: 'PayChangu callback verified and recorded.',
      data: {
        provider: 'paychangu',
        currency: transaction.currency,
        status: transaction.status,
        reference: transaction.reference,
        confirmed: transaction.status === 'success',
        orderId: receipt?.orderId || null,
        trackingNumber: receipt?.trackingNumber || null
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'PayChangu verification failed.',
      error: error?.message || 'Unknown verification error'
    });
  }
});

const handlePayChanguBrowserCallback = async (req: Request, res: Response) => {
  const callbackData = { ...(req.body || {}), ...(req.query || {}) };
  const transaction = recordTransaction(callbackData);
  const baseUrl = getPublicBaseUrl().replace(/\/$/, '');
  if (!transaction.reference || transaction.status === 'cancelled') {
    return res.redirect(`${baseUrl}/checkout?payment=failed`);
  }
  try {
    await verifyPaidCheckout(String(transaction.reference));
    return res.redirect(`${baseUrl}/checkout?payment=return&tx_ref=${encodeURIComponent(String(transaction.reference))}`);
  } catch (error) {
    console.warn('PayChangu browser callback could not confirm payment:', error);
    return res.redirect(`${baseUrl}/checkout?payment=return&tx_ref=${encodeURIComponent(String(transaction.reference))}`);
  }
};

paymentsRouter.get('/paychangu/callback', handlePayChanguBrowserCallback);
paymentsRouter.post('/paychangu/callback', handlePayChanguBrowserCallback);

paymentsRouter.get('/paychangu/transactions/:reference', (req: Request, res: Response) => {
  const reference = String(req.params.reference || '');
  const transaction = confirmedTransactions.get(reference);

  if (!transaction) {
    return res.status(404).json({ success: false, message: 'No recorded PayChangu transaction found for this reference.' });
  }

  return res.json({
    success: true,
    data: transaction
  });
});
