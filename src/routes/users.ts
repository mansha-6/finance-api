import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireRoles } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Only ADMIN can manage users
router.use(authenticate);
router.use(requireRoles(['ADMIN']));

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

const updateUserSchema = z.object({
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
  isActive: z.boolean().optional()
});

router.patch('/:id', async (req, res) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });
    res.json(user);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: (error as any).errors });
    res.status(400).json({ error: 'Failed to update user' });
  }
});

export default router;
