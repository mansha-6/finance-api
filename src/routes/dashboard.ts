import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// VIEWER, ANALYST, ADMIN can view dashboard
router.use(authenticate);

router.get('/summary', async (req, res) => {
  try {
    const records = await prisma.record.findMany();

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals: Record<string, number> = {};

    records.forEach((record: any) => {
      if (record.type === 'INCOME') {
        totalIncome += record.amount;
      } else if (record.type === 'EXPENSE') {
        totalExpenses += record.amount;
      }

      if (!categoryTotals[record.category]) {
        categoryTotals[record.category] = 0;
      }
      categoryTotals[record.category] += record.amount;
    });

    const netBalance = totalIncome - totalExpenses;

    const recentActivity = await prisma.record.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      totalIncome,
      totalExpenses,
      netBalance,
      categoryTotals,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

export default router;
