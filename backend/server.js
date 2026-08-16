require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { query } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

async function getOrCreateGuestCustomer(guestId = null) {
  console.log('getOrCreateGuestCustomer called with guestId:', guestId);
  if (!guestId) {
    console.log('No guestId provided, creating new guest customer');
    const result = await query(
      'INSERT INTO guest_customers DEFAULT VALUES RETURNING guest_id'
    );
    console.log('New guest created with ID:', result.rows[0]?.guest_id);
    return result.rows[0]?.guest_id;
  }

  console.log('Looking up existing guest:', guestId);
  const existing = await query(
    'SELECT guest_id FROM guest_customers WHERE guest_id = $1',
    [guestId]
  );

  if (existing.rowCount > 0) {
    console.log('Guest found:', guestId);
    return existing.rows[0].guest_id;
  }

  console.log('Guest not found, creating new guest with ID:', guestId);
  const created = await query(
    'INSERT INTO guest_customers (guest_id) VALUES ($1) RETURNING guest_id',
    [guestId]
  );

  console.log('Guest created with ID:', created.rows[0]?.guest_id);
  return created.rows[0]?.guest_id;
}

async function ensureGuestCart(guestId, items = []) {
  const safeItems = Array.isArray(items) ? items : [];

  await query(
    `INSERT INTO guest_carts (guest_id, items)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (guest_id)
     DO UPDATE SET items = EXCLUDED.items, updated_at = NOW()`,
    [guestId, JSON.stringify(safeItems)]
  );

  return safeItems;
}

async function initializeDatabase() {
  try {
    await query('SELECT 1');
    console.log('Database connection verified');

    // Create guest_customers table
    await query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto"
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS guest_customers (
        guest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('guest_customers table ensured');

    // Create guest_carts table
    await query(`
      CREATE TABLE IF NOT EXISTS guest_carts (
        guest_id UUID PRIMARY KEY REFERENCES guest_customers(guest_id) ON DELETE CASCADE,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('guest_carts table ensured');

    // Create guest_orders table
    await query(`
      CREATE TABLE IF NOT EXISTS guest_orders (
        order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        guest_id UUID NOT NULL REFERENCES guest_customers(guest_id) ON DELETE CASCADE,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('guest_orders table ensured');

    // Create admin_posts table
    await query(`
      CREATE TABLE IF NOT EXISTS admin_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('admin_posts table ensured');

    // Add payment columns to guest_orders if they don't exist
    await query(`
      ALTER TABLE guest_orders
        ADD COLUMN IF NOT EXISTS tx_ref VARCHAR(255),
        ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
        ADD COLUMN IF NOT EXISTS payment_url TEXT,
        ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'
    `);
    console.log('guest_orders payment columns ensured');

    // Create index on guest_orders
    await query(`
      CREATE INDEX IF NOT EXISTS idx_guest_orders_guest_id ON guest_orders (guest_id)
    `);
    console.log('Indexes ensured');

    console.log('Connected to PostgreSQL successfully.');
  } catch (error) {
    console.error('PostgreSQL connection failed.');
    console.error('Make sure PostgreSQL is running and DATABASE_URL is configured.');
    console.error(error.message);
  }
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ message: 'Admin credentials are not configured' });
  }

  const expected = Buffer.from(`${adminEmail}:${adminPassword}`).toString('base64');
  const isValid = authHeader === `Basic ${expected}` || authHeader === `Bearer ${expected}`;

  if (!isValid) {
    return res.status(401).json({ message: 'Admin access required' });
  }

  next();
}

function getPayChanguConfig() {
  return {
    secretKey: (process.env.PAYCHANGU_SECRET_KEY || '').trim(),
    baseUrl: (process.env.PAYCHANGU_API_BASE_URL || 'https://api.paychangu.com').replace(/\/$/, ''),
    callbackUrl: (process.env.PAYCHANGU_CALLBACK_URL || 'http://localhost:5000/api/payments/callback').trim(),
    returnUrl: (process.env.PAYCHANGU_RETURN_URL || 'http://localhost:5173/checkout?status=return').trim(),
    currency: (process.env.PAYCHANGU_CURRENCY || 'MWK').trim().toUpperCase(),
    webhookSecret: (process.env.PAYCHANGU_WEBHOOK_SECRET || '').trim(),
  };
}

async function verifyPayChanguTransaction(txRef) {
  const config = getPayChanguConfig();

  if (!config.secretKey) {
    throw new Error('PayChangu secret key is not configured');
  }

  const response = await fetch(`${config.baseUrl}/verify-payment/${encodeURIComponent(txRef)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${config.secretKey}`,
    },
  });

  const rawText = await response.text();
  let payload = {};

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch (error) {
      payload = { message: rawText };
    }
  }

  if (!response.ok) {
    throw new Error(payload.message || 'Could not verify payment with PayChangu');
  }

  return payload;
}

app.get('/', (req, res) => {
  res.send('Royal Hints backend is running');
});

app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      message: 'Royal Hints API is running',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Database unavailable',
      database: 'disconnected',
      detail: error.message,
    });
  }
});

app.post('/api/guest', async (req, res) => {
  try {
    console.log('POST /api/guest called with body:', req.body);
    const { guestId } = req.body || {};
    console.log('guestId from body:', guestId);
    const finalGuestId = await getOrCreateGuestCustomer(guestId || null);
    console.log('finalGuestId created/retrieved:', finalGuestId);

    await ensureGuestCart(finalGuestId, []);
    console.log('Cart ensured for guest:', finalGuestId);

    res.status(201).json({
      guestId: finalGuestId,
      created: !guestId,
      message: 'Guest identity created successfully',
    });
  } catch (error) {
    console.error('Error creating guest customer:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      message: 'Could not create guest customer',
      error: error.message,
    });
  }
});

app.get('/api/guest/:guestId/cart', async (req, res) => {
  try {
    const { guestId } = req.params;
    const guest = await getOrCreateGuestCustomer(guestId);

    const result = await query(
      'SELECT items FROM guest_carts WHERE guest_id = $1',
      [guest]
    );

    res.status(200).json({
      guestId: guest,
      items: result.rowCount > 0 ? result.rows[0].items : [],
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not fetch guest cart',
      error: error.message,
    });
  }
});

app.post('/api/guest/:guestId/cart', async (req, res) => {
  try {
    const { guestId } = req.params;
    const { items } = req.body || {};

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: 'Cart items must be sent as an array',
      });
    }

    const finalGuestId = await getOrCreateGuestCustomer(guestId);
    const savedItems = await ensureGuestCart(finalGuestId, items);

    res.status(200).json({
      guestId: finalGuestId,
      items: savedItems,
      message: 'Cart updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not update guest cart',
      error: error.message,
    });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      guestId,
      items = [],
      totalAmount = 0,
      status = 'pending',
    } = req.body || {};

    const finalGuestId = await getOrCreateGuestCustomer(guestId || null);

    const order = await query(
      `INSERT INTO guest_orders (guest_id, total_amount, status, items)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING order_id, guest_id, total_amount, status, created_at`,
      [finalGuestId, Number(totalAmount), status, JSON.stringify(items)]
    );

    await ensureGuestCart(finalGuestId, []);

    res.status(201).json({
      order: order.rows[0],
      guestId: finalGuestId,
      message: 'Order placed successfully for guest customer',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not place guest order',
      error: error.message,
    });
  }
});

app.post('/api/payments/initiate', async (req, res) => {
  try {
    const {
      guestId,
      items = [],
      amount,
      email,
      firstName,
      lastName,
    } = req.body || {};

    const config = getPayChanguConfig();
    const guestCustomerId = await getOrCreateGuestCustomer(guestId || null);

    if (!config.secretKey) {
      return res.status(500).json({
        message: 'PayChangu secret key is not configured in the backend environment',
      });
    }

    const totalAmount = Number(amount ?? items.reduce((sum, item) => sum + Number(item.price || 0), 0));

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: 'A valid payment amount is required' });
    }

    const orderResult = await query(
      `INSERT INTO guest_orders (guest_id, items, total_amount, status)
       VALUES ($1, $2::jsonb, $3, 'pending')
       RETURNING order_id, guest_id, total_amount, status`,
      [guestCustomerId, JSON.stringify(items), Number(totalAmount)]
    );

    const order = orderResult.rows[0];
    const txRef = `royalhints_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const paymentResponse = await fetch(`${config.baseUrl}/payment`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(Number(totalAmount).toFixed(2)),
        currency: config.currency,
        email: email || 'guest@royalhints.com',
        first_name: firstName || 'Guest',
        last_name: lastName || 'Customer',
        callback_url: config.callbackUrl,
        return_url: config.returnUrl,
        tx_ref: txRef,
        customization: {
          title: 'Royal Hints Purchase',
          description: 'Royal Hints guest checkout payment',
        },
        meta: {
          guest_id: guestCustomerId,
          order_id: order.order_id,
        },
      }),
    });

    const paymentText = await paymentResponse.text();
    let paymentData = {};

    if (paymentText) {
      try {
        paymentData = JSON.parse(paymentText);
      } catch (error) {
        paymentData = { message: paymentText };
      }
    }

    if (!paymentResponse.ok) {
      await query('DELETE FROM guest_orders WHERE order_id = $1', [order.order_id]);
      return res.status(502).json({
        message: paymentData.message || 'PayChangu payment initiation failed',
        error: paymentData,
      });
    }

    const checkoutUrl = paymentData?.data?.checkout_url || paymentData?.checkout_url || paymentData?.data?.data?.checkout_url;

    if (!checkoutUrl) {
      await query('DELETE FROM guest_orders WHERE order_id = $1', [order.order_id]);
      return res.status(502).json({
        message: 'PayChangu did not return a checkout URL',
        error: paymentData,
      });
    }

    await query(
      `UPDATE guest_orders
       SET tx_ref = $1,
           payment_reference = $2,
           payment_url = $3,
           payment_status = 'pending',
           updated_at = NOW()
       WHERE order_id = $4`,
      [txRef, paymentData?.data?.data?.tx_ref || txRef, checkoutUrl, order.order_id]
    );

    await ensureGuestCart(guestCustomerId, []);

    res.status(200).json({
      message: 'PayChangu checkout started successfully',
      orderId: order.order_id,
      txRef,
      checkoutUrl,
      paymentStatus: 'pending',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not start PayChangu payment',
      error: error.message,
    });
  }
});

app.get('/api/payments/verify/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const verification = await verifyPayChanguTransaction(tx_ref);

    const statusValue = (verification?.data?.status || verification?.status || 'pending').toLowerCase();
    const normalizedStatus = statusValue === 'success' ? 'paid' : statusValue === 'failed' ? 'failed' : 'pending';

    await query(
      `UPDATE guest_orders
       SET payment_status = $1,
           status = $2,
           updated_at = NOW()
       WHERE tx_ref = $3`,
      [statusValue, normalizedStatus, tx_ref]
    );

    res.status(200).json({
      message: 'Payment verification completed',
      txRef: tx_ref,
      status: normalizedStatus,
      data: verification,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not verify PayChangu payment',
      error: error.message,
    });
  }
});

app.get('/api/payments/callback', async (req, res) => {
  try {
    const { tx_ref, status } = req.query;

    if (!tx_ref) {
      return res.status(400).json({ message: 'Missing transaction reference' });
    }

    if (status === 'success') {
      const verification = await verifyPayChanguTransaction(String(tx_ref));
      const txStatus = (verification?.data?.status || verification?.status || 'pending').toLowerCase();
      await query(
        `UPDATE guest_orders
         SET payment_status = $1,
             status = CASE WHEN $1 = 'success' THEN 'paid' ELSE 'pending' END,
             updated_at = NOW()
         WHERE tx_ref = $2`,
        [txStatus, String(tx_ref)]
      );

      return res.status(200).json({
        message: 'Payment callback processed',
        txRef: String(tx_ref),
        status: txStatus,
      });
    }

    res.status(200).json({
      message: 'Payment callback received',
      txRef: String(tx_ref),
      status: String(status || 'pending'),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Could not process PayChangu callback',
      error: error.message,
    });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ message: 'Admin credentials are not configured' });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const token = Buffer.from(`${adminEmail}:${adminPassword}`).toString('base64');

  res.status(200).json({
    token,
    role: 'admin',
    message: 'Admin login successful',
  });
});

app.get('/api/posts', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, description, category, image, created_at FROM admin_posts ORDER BY created_at DESC'
    );

    res.status(200).json({ posts: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch marketplace posts', error: error.message });
  }
});

app.get('/api/admin/posts', requireAdmin, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, description, category, image, created_at FROM admin_posts ORDER BY created_at DESC'
    );

    res.status(200).json({ posts: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch admin posts', error: error.message });
  }
});

app.post('/api/admin/posts', requireAdmin, async (req, res) => {
  try {
    const { title, description, category, image } = req.body || {};

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    const result = await query(
      `INSERT INTO admin_posts (title, description, category, image)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, category, image, created_at`,
      [title.trim(), description.trim(), category.trim(), image || null]
    );

    res.status(201).json({
      message: 'Admin post created successfully',
      post: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not create admin post', error: error.message });
  }
});

app.delete('/api/admin/posts/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('DELETE request received for post ID:', id);

    if (!id) {
      console.log('No post ID provided');
      return res.status(400).json({ message: 'Post ID is required' });
    }

    const result = await query(
      'DELETE FROM admin_posts WHERE id = $1 RETURNING id',
      [id]
    );

    console.log('Delete query result:', result.rowCount, 'rows affected');

    if (result.rows.length === 0) {
      console.log('Post not found for ID:', id);
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log('Post deleted successfully:', id);
    res.status(200).json({
      message: 'Admin post deleted successfully',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(500).json({ message: 'Could not delete admin post', error: error.message });
  }
});

initializeDatabase();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
