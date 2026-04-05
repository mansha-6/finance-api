import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@example.com' },
    update: {},
    create: {
      email: 'analyst@example.com',
      name: 'Analyst User',
      password: hashedPassword,
      role: 'ANALYST',
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      name: 'Viewer User',
      password: hashedPassword,
      role: 'VIEWER',
    },
  });

  console.log('Users created.');

  // Create Records
  const records = [
    { amount: 5000, type: 'INCOME', category: 'Salary', date: new Date('2024-03-01'), notes: 'Monthly salary' },
    { amount: 1500, type: 'EXPENSE', category: 'Rent', date: new Date('2024-03-02'), notes: 'Office rent' },
    { amount: 200, type: 'EXPENSE', category: 'Utilities', date: new Date('2024-03-05'), notes: 'Electricity' },
    { amount: 1000, type: 'INCOME', category: 'Freelance', date: new Date('2024-03-10'), notes: 'Web project' },
    { amount: 50, type: 'EXPENSE', category: 'Food', date: new Date('2024-03-12'), notes: 'Lunch' },
  ];

  for (const record of records) {
    await prisma.record.create({
      data: {
        ...record,
        createdById: admin.id,
      },
    });
  }

  console.log('Sample records created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
