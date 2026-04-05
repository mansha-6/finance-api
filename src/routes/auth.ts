import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'VIEWER'
      }
    });

    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: (err as any).errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive user' });
    }

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: (err as any).errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
