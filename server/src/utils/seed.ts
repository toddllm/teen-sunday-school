import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';
import { seedKeyVerses } from '../services/interlinear.service';

const prisma = new PrismaClient();

/**
 * Database Seed Script
 * Seeds initial data for the Teen Sunday School application
 */
async function main() {
  logger.info('🌱 Starting database seed...');

  try {
    // Seed interlinear verses
    logger.info('Seeding interlinear key verses...');
    await seedKeyVerses();

    // Add other seed data here as needed
    // Example: Default organizations, sample lessons, etc.

    logger.info('✅ Database seed completed successfully!');
  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    logger.error('Fatal error during seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
