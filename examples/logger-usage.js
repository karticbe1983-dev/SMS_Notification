/**
 * Example: Using the Logger with Birthday Check Service
 * 
 * This example demonstrates how to integrate the Logger utility
 * with the Birthday Check Service for comprehensive logging.
 */

import Logger from '../src/utils/Logger.js';
import BirthdayCheckService from '../src/services/BirthdayCheckService.js';

// Create a logger instance with custom configuration
const logger = new Logger({
  logDir: './logs',           // Directory for log files
  maxFileSize: 10 * 1024 * 1024, // 10MB per file
  maxFiles: 5,                // Keep 5 most recent log files
  consoleOutput: true         // Also output to console
});

// Create Birthday Check Service with logger
const birthdayService = new BirthdayCheckService(logger);

// Example: Perform daily check with logging
async function runDailyCheck() {
  try {
    logger.info('=== Starting Birthday Check Application ===');
    
    // Initialize the service
    await birthdayService.initialize();
    
    // Perform the daily check
    const result = await birthdayService.performDailyCheck();
    
    // Log summary
    logger.info('=== Birthday Check Complete ===');
    logger.info(`Total Associates: ${result.totalAssociatesChecked}`);
    logger.info(`Birthdays Found: ${result.birthdaysFound.length}`);
    logger.info(`Notification Sent: ${result.notificationSent ? 'Yes' : 'No'}`);
    
    if (result.errors.length > 0) {
      logger.error(`Errors encountered: ${result.errors.length}`);
      result.errors.forEach(error => logger.error(`  - ${error}`));
    }
    
  } catch (error) {
    logger.error(`Application error: ${error.message}`);
    logger.error(error.stack);
  }
}

// Run the check
runDailyCheck();

/**
 * Logger Features Demonstrated:
 * 
 * 1. Log Levels: INFO, WARN, ERROR
 *    - logger.info('message')
 *    - logger.warn('message')
 *    - logger.error('message')
 * 
 * 2. Automatic Credential Redaction:
 *    - API keys, tokens, passwords are automatically redacted
 *    - Example: "api_key: sk_test_123" becomes "api_key: [REDACTED]"
 * 
 * 3. File Rotation:
 *    - Automatically rotates when file exceeds maxFileSize
 *    - Keeps only maxFiles most recent log files
 * 
 * 4. Timestamp:
 *    - Every log entry includes ISO timestamp
 *    - Format: [2024-01-15T10:30:45.123Z] [INFO] message
 * 
 * 5. Console Output:
 *    - Can be enabled/disabled via consoleOutput option
 *    - Useful for development vs production
 */
