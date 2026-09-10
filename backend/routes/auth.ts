import { Router, Request, Response } from 'express';
import { postgresStore } from '../db/store';

export const authRouter = Router();

// POST login / switch user session
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required for session authentication' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'chikusehopeson@gmail.com').trim().toLowerCase();
    const configuredAdminPassword = process.env.ADMIN_PASSWORD || 'hopeson@gmail.com@415';

    if (normalizedEmail === configuredAdminEmail) {
      if (password !== configuredAdminPassword) {
        return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
      }
    }

    const user = await postgresStore.getUserByEmail(normalizedEmail);
    if (user) {
      if (normalizedEmail === configuredAdminEmail && !user.isAdmin) {
        return res.status(403).json({ success: false, message: 'Administrator account is not enabled' });
      }
      if (normalizedEmail !== configuredAdminEmail && !(await postgresStore.verifyPassword(normalizedEmail, password || ''))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      const token = await postgresStore.recordLogin(user.id, user.email);
      res.setHeader('Set-Cookie', `royal_hints_session=${token}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`);
      return res.json({
        success: true,
        message: `Welcome back, ${user.name}`,
        data: user
      });
    }

    if (password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isSpecialAdmin = normalizedEmail === configuredAdminEmail;
    const newUser = {
      id: `usr-${Date.now()}`,
      name: isSpecialAdmin ? 'Royal Hints Administrator' : email.split('@')[0],
      email: normalizedEmail,
      role: isSpecialAdmin ? ('admin' as const) : ('buyer' as const),
      isAdmin: isSpecialAdmin
    };

    const createdUser = await postgresStore.createUser(newUser);
    const token = await postgresStore.recordLogin(createdUser.id, createdUser.email);
    res.setHeader('Set-Cookie', `royal_hints_session=${token}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`);

    res.json({
      success: true,
      message: 'Session initialized',
      data: createdUser
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'chikusehopeson@gmail.com').trim().toLowerCase();
    if (normalizedEmail === configuredAdminEmail) {
      return res.status(409).json({ success: false, message: 'This email is reserved for the administrator' });
    }
    if (await postgresStore.getUserByEmail(normalizedEmail)) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    const user = await postgresStore.registerBuyer(name, normalizedEmail, password);
    const token = await postgresStore.recordLogin(user.id, user.email);
    res.setHeader('Set-Cookie', `royal_hints_session=${token}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`);
    return res.status(201).json({ success: true, message: `Welcome to Royal Hints, ${user.name}`, data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

authRouter.get('/session', async (req: Request, res: Response) => {
  try {
    const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith('royal_hints_session='));
    const token = cookie?.slice('royal_hints_session='.length);
    const user = token ? await postgresStore.getSession(token) : undefined;
    res.json({ success: Boolean(user), data: user || null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET active users list
authRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await postgresStore.getUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
