const { PrismaClient } = require('@prisma/client');

const run = async () => {
  const prisma = new PrismaClient({
    datasourceUrl: 'postgresql://postgres:F4r174l%40si.@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
  });

  try {
    const res = await prisma.$queryRaw`SELECT 1`;
    console.log("Connected successfully!", res);
  } catch (err) {
    console.error("Connection error", err);
  } finally {
    await prisma.$disconnect();
  }
};

run();
