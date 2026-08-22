import { Router, Request, Response } from 'express';
import { postgresStore } from '../db/store';

export const authRouter = Router();

// POST login / switch user session
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required for session authentication' });
    }

    const user = await postgresStore.getUserByEmail(email);
    if (user) {
      return res.json({
        success: true,
        message: `Welcome back, ${user.name}`,
        data: user
      });
    }

    const normalizedEmail = email.toLowerCase();
    const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const isSpecialAdmin = configuredAdminEmail ? normalizedEmail === configuredAdminEmail : normalizedEmail.includes('admin');
    const newUser = {
      id: `usr-${Date.now()}`,
      name: isSpecialAdmin ? 'Royal Hints Administrator' : email.split('@')[0],
      email: normalizedEmail,
      role: isSpecialAdmin ? ('admin' as const) : ('buyer' as const),
      isAdmin: isSpecialAdmin
    };

    await postgresStore.createUser(newUser);

    res.json({
      success: true,
      message: 'Session initialized',
      data: newUser
    });
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
