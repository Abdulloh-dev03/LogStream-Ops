import { config } from 'dotenv';
import { beforeAll, afterEach, afterAll } from 'vitest'; 
import { prisma } from '#src/lib/prisma';

// 1. Force the application into a test execution context
process.env.NODE_ENV = 'test';

// 2. Load environment variables from a separate test environment file if it exists
config({ path: '.env.test' });

// 3. Global Database Lifecycle Hooks
beforeAll(async () => {
  // Verify database connection is alive before launching the test loops
  await prisma.$connect();
});

afterEach(async () => {
  // Clean up database tables after every individual test 
  await prisma.aiAnalysis.deleteMany({});
  await prisma.log.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  // Disconnect the Prisma client securely once the entire suite completes
  await prisma.$disconnect();
});