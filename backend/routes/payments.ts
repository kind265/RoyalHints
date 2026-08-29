import { Router, Request, Response } from 'express';
import crypto from 'crypto';

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
  const reference = payload?.reference || payload?.tx_ref || payload?.transaction_ref || payload?.id || `paychangu-${Date.now()}`;
  const normalized = {
    id: payload?.id || payload?.transactionId || payload?.reference || reference,
    provider: 'paychangu',
    currency: payload?.currency || process.env.PAYCHANGU_CURRENCY || 'MWK',
    amount: toNumber(payload?.amount ?? payload?.total_amount ?? payload?.totalAmount, 0),
    reference,
    status: normalizeStatus(payload?.status ?? payload?.payment_status ?? payload?.state),
    customer: payload?.customer || payload?.email || payload?.payer || null,
    metadata: payload?.metadata || {},
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
    const publicKey = process.env.PAYCHANGU_PUBLIC_KEY;
    const apiBaseUrl = (process.env.PAYCHANGU_API_BASE_URL || 'https://api.paychangu.com').replace(/\/$/, '');

    if (!secretKey || !publicKey) {
      return res.status(500).json({
        success: false,
        message: 'PayChangu credentials are missing. Configure PAYCHANGU_SECRET_KEY and PAYCHANGU_PUBLIC_KEY.'
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
      amount: Number(finalAmount.toFixed(2)),
      currency,
      email: email || 'customer@royalhints.com',
      phone: phone || '',
      firstName: firstName || 'Royal',
      lastName: lastName || 'Hints',
      reference: finalReference,
      callbackUrl: finalCallbackUrl,
      returnUrl: finalReturnUrl,
      metadata: {
        source: 'royalhints',
        platform: 'web',
        ...(metadata || {})
      }
    };

    const endpoints = [
      `${apiBaseUrl}/api/v1/payments/initiate`,
      `${apiBaseUrl}/api/v1/payment/initiate`,
      `${apiBaseUrl}/api/v1/transactions/initiate`,
      `${apiBaseUrl}/api/v1/transaction/initiate`
    ];

    let lastError: unknown = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secretKey}`,
            'X-Public-Key': publicKey
          },
          body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        const json = responseText ? JSON.parse(responseText) : {};

        if (response.ok) {
          const redirectUrl = resolvePayChanguPayload(json) || finalReturnUrl;
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
        }

        lastError = new Error(json?.message || `PayChangu request failed for ${endpoint}`);
      } catch (error) {
        lastError = error;
      }
    }

    return res.status(502).json({
      success: false,
      message: 'PayChangu initialization failed. Using the configured gateway details, the provider did not return a payout URL.',
      error: lastError instanceof Error ? lastError.message : String(lastError)
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Unexpected error while initiating PayChangu payment.',
      error: error?.message || 'Unknown error'
    });
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
    return res.json({
      success: true,
      message: 'PayChangu webhook verified and recorded.',
      data: {
        provider: 'paychangu',
        currency: transaction.currency,
        status: transaction.status,
        reference: transaction.reference,
        confirmed: transaction.status === 'success'
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
