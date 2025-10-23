import dotenv from 'dotenv';
import Logger from './utils/Logger.js';
import Scheduler from './services/Scheduler.js';

/**
 * Birthday Notification System - Main Entry Point
 * 
 * This application automatically checks for associate birthdays daily
 * and sends SMS notifications when birthdays are found.
 */

// Load environment variables from .env file
dotenv.config();

// Initialize logger
const logger = new Logger({
  logDir: process.env.LOG_FILE_PATH ? process.env.LOG_FILE_PATH.replace(/\/[^/]+$/, '') : './logs',
  consoleOutput: true
});

// Global scheduler instance
let scheduler = null;

/**
 * Initialize and start the application
 */
async function startApplication() {
  try {
    logger.info('========================================');
    logger.info('Birthday Notification System Starting...');
    logger.info('========================================');

    // Get scheduled time from environment
    const scheduledTime = process.env.SCHEDULED_TIME || '09:00';
    
    logger.info(`Configuration loaded from environment`);
    logger.info(`Scheduled time: ${scheduledTime}`);

    // Create scheduler instance
    scheduler = new Scheduler({
      scheduledTime: scheduledTime,
      logger: logger
    });

    // Initialize scheduler (this will validate configuration)
    logger.info('Initializing scheduler and validating configuration...');
    await scheduler.initialize();

    // Start the scheduler
    logger.info('Starting scheduler...');
    await scheduler.start();

    logger.info('========================================');
    logger.info('Birthday Notification System Started Successfully');
    logger.info(`Daily checks scheduled at ${scheduledTime}`);
    logger.info('Press Ctrl+C to stop the application');
    logger.info('========================================');

  } catch (error) {
    logger.error('========================================');
    logger.error('Failed to start Birthday Notification System');
    logger.error(`Error: ${error.message}`);
    logger.error('========================================');
    
    // Exit with error code
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 * Stops the scheduler and cleans up resources
 */
async function shutdown(signal) {
  logger.info('========================================');
  logger.info(`Received ${signal} signal`);
  logger.info('Shutting down Birthday Notification System...');
  logger.info('========================================');

  try {
    // Stop the scheduler if it's running
    if (scheduler && scheduler.isSchedulerRunning()) {
      logger.info('Stopping scheduler...');
      scheduler.stop();
      logger.info('Scheduler stopped successfully');
    }

    logger.info('========================================');
    logger.info('Birthday Notification System Shutdown Complete');
    logger.info('========================================');

    // Exit gracefully
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('========================================');
  logger.error('Uncaught Exception:');
  logger.error(error.message);
  logger.error(error.stack);
  logger.error('========================================');
  
  // Attempt graceful shutdown
  shutdown('UNCAUGHT_EXCEPTION');
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('========================================');
  logger.error('Unhandled Promise Rejection:');
  logger.error(reason);
  logger.error('========================================');
  
  // Attempt graceful shutdown
  shutdown('UNHANDLED_REJECTION');
});

/**
 * Handle termination signals for graceful shutdown
 */
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the application
startApplication();
