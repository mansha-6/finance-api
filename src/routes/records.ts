import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireRoles, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Only ADMIN and ANALYST can view records
router.use(authenticate);

router.get('/', requireRoles(['ADMIN', 'ANALYST']), async (req, res) => {
  try {
    const { type, category, startDate, endDate, search, skip = 0, take = 50 } = req.query;
    
    let whereClause: any = { deletedAt: null }; // Filter out soft-deleted records
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;
    if (search) {
      whereClause.notes = { contains: search as string };
    }
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate as string);
      if (endDate) whereClause.date.lte = new Date(endDate as string);
    }

    const records = await prisma.record.findMany({
      where: whereClause,
      skip: Number(skip),
      take: Number(take),
      orderBy: { date: 'desc' }
    });
    
    // Pagination metadata
    const total = await prisma.record.count({ where: whereClause });

    res.json({ data: records, meta: { total, skip: Number(skip), take: Number(take) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

router.get('/:id', requireRoles(['ADMIN', 'ANALYST']), async (req, res) => {
  try {
    const record = await prisma.record.findUnique({ 
      where: { id: req.params.id as string }
    });
    if (!record || record.deletedAt) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

const recordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
  date: z.string().datetime(),
  notes: z.string().optional()
});

// Create, Update, Delete requires ADMIN role
router.post('/', requireRoles(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const data = recordSchema.parse(req.body);
    const record = await prisma.record.create({
      data: {
        ...data,
        createdById: req.user.id
      }
    });
    res.status(201).json(record);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: (error as any).errors });
    res.status(500).json({ error: 'Failed to create record' });
  }
});

const updateRecordSchema = recordSchema.partial();

router.patch('/:id', requireRoles(['ADMIN']), async (req, res) => {
  try {
    const data = updateRecordSchema.parse(req.body);
    const record = await prisma.record.update({
      where: { id: req.params.id as string },
      data
    });
    res.json(record);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: (error as any).errors });
    res.status(400).json({ error: 'Failed to update record' });
  }
});

router.delete('/:id', requireRoles(['ADMIN']), async (req, res) => {
  try {
    // Implementing Soft Delete
    await prisma.record.update({ 
      where: { id: req.params.id as string },
      data: { deletedAt: new Date() }
    });
    res.json({ message: 'Record deleted successfully (soft delete)' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete record' });
  }
});

export default router;
