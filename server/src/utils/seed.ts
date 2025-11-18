import prisma from '../config/database';
import logger from '../config/logger';
import icebreakerSeeds from '../seeds/icebreaker-seeds';

async function seedIcebreakers(organizationId: string) {
  logger.info('Seeding icebreakers...');

  try {
    for (const seed of icebreakerSeeds) {
      await prisma.icebreaker.create({
        data: {
          ...seed,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    logger.info(`✓ Seeded ${icebreakerSeeds.length} icebreakers`);
  } catch (error) {
    logger.error('Error seeding icebreakers:', error);
    throw error;
  }
}

async function main() {
  try {
    logger.info('Starting database seed...');

    // Check if organizations exist
    const orgs = await prisma.organization.findMany();

    if (orgs.length === 0) {
      logger.warn('No organizations found. Creating a default organization for seeding...');

      // Create a default organization for seeding
      const defaultOrg = await prisma.organization.create({
        data: {
          name: 'Default Organization',
          slug: 'default-org',
          timezone: 'America/New_York',
        },
      });

      logger.info(`✓ Created default organization: ${defaultOrg.name}`);

      // Seed icebreakers for the default organization
      await seedIcebreakers(defaultOrg.id);
    } else {
      // Seed icebreakers for the first organization
      logger.info(`Using existing organization: ${orgs[0].name}`);
      await seedIcebreakers(orgs[0].id);
    }

    logger.info('✓ Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main();
