const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});