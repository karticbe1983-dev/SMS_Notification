import dotenv from 'dotenv';
import Scheduler from '../src/services/Scheduler.js';
import Logger from '../src/utils/Logger.js';

// Load environment variables
dotenv.config();

/**
 * Example usage of the Scheduler service
 * This demonstrates how to set up and run the automated birthday check scheduler
 */

async function main() {
  // Create logger instance
  const logger = new Logger({
    logDir: './logs',
    consoleOutput: true
  });

  logger.info('=== Birthday Notification Scheduler Example ===');

  try {
    // Create scheduler instance with configuration
    const scheduler = new Scheduler({
      scheduledTime: process.env.SCHEDULED_TIME || '09:00',
      logger: logger
    });

    // Initialize the scheduler
    logger.info('Initializing scheduler...');
    await scheduler.initialize();

    // Option 1: Run birthday check immediately (for testing)
    logger.info('\n--- Running immediate birthday check ---');
    const result = await scheduler.runNow();
    
    logger.info(`\nCheck Results:`);
    logger.info(`  Total Associates: ${result.totalAssociatesChecked}`);
    logger.info(`  Birthdays Found: ${result.birthdaysFound.length}`);
    logger.info(`  Notification Sent: ${result.notificationSent}`);
    
    if (result.birthdaysFound.length > 0) {
      logger.info(`  Birthday Associates:`);
      result.birthdaysFound.forEach(associate => {
        logger.info(`    - ${associate.name}`);
      });
    }

    if (result.errors.length > 0) {
      logger.warn(`  Errors: ${result.errors.length}`);
      result.errors.forEach(error => {
        logger.error(`    - ${error}`);
      });
    }

    // Option 2: Start the scheduler for automated daily checks
    logger.info('\n--- Starting automated scheduler ---');
    await scheduler.start();
    
    logger.info('Scheduler is now running. Press Ctrl+C to stop.');
    logger.info(`Daily checks will run at ${process.env.SCHEDULED_TIME || '09:00'}`);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('\nReceived SIGINT signal. Stopping scheduler...');
      scheduler.stop();
      logger.info('Scheduler stopped. Exiting...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('\nReceived SIGTERM signal. Stopping scheduler...');
      scheduler.stop();
      logger.info('Scheduler stopped. Exiting...');
      process.exit(0);
    });

  } catch (error) {
    logger.error(`Failed to start scheduler: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
}

// Run the example
main();
