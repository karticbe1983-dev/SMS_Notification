import Configuration from '../models/Configuration.js';
import ExcelParser from './ExcelParser.js';
import DateMatcher from './DateMatcher.js';
import SMSService from './SMSService.js';

/**
 * Birthday Check Service orchestrator
 * Coordinates the daily birthday check workflow
 */
class BirthdayCheckService {
  /**
   * Create a Birthday Check Service instance
   * @param {Object} logger - Optional logger instance for logging operations
   */
  constructor(logger = null) {
    this.logger = logger;
    this.config = null;
    this.excelParser = null;
    this.dateMatcher = null;
    this.smsService = null;
  }

  /**
   * Log a message if logger is available
   * @param {string} level - Log level (INFO, WARN, ERROR)
   * @param {string} message - Message to log
   */
  log(level, message) {
    if (this.logger) {
      this.logger.log(level, message);
    }
  }

  /**
   * Initialize the service by loading and validating configuration
   * @returns {Promise<void>}
   * @throws {Error} If configuration is invalid
   */
  async initialize() {
    try {
      this.log('INFO', 'Initializing Birthday Check Service...');

      // Load configuration from environment
      this.config = new Configuration();
      this.config.loadFromEnvironment();

      // Validate configuration
      const validation = this.config.validate();
      if (!validation.isValid) {
        const errorMessage = 'Configuration validation failed:\n' + 
          validation.errors.map(err => `  - ${err}`).join('\n');
        this.log('ERROR', errorMessage);
        throw new Error(errorMessage);
      }

      this.log('INFO', 'Configuration loaded and validated successfully');

      // Initialize components
      this.excelParser = new ExcelParser(this.logger);
      this.dateMatcher = new DateMatcher();
      this.smsService = new SMSService({
        smsApiUrl: this.config.smsApiUrl,
        smsApiKey: this.config.smsApiKey,
        smsSenderId: this.config.smsSenderId,
        recipientMobileNumber: this.config.recipientMobileNumber
      });

      this.log('INFO', 'All components initialized successfully');
    } catch (error) {
      this.log('ERROR', `Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Perform the daily birthday check
   * Orchestrates all components to check for birthdays and send notifications
   * @returns {Promise<CheckResult>} Result of the birthday check operation
   */
  async performDailyCheck() {
    const errors = [];
    let associates = [];
    let birthdaysFound = [];
    let notificationSent = false;

    try {
      this.log('INFO', '=== Starting Daily Birthday Check ===');

      // Step 1: Ensure service is initialized
      if (!this.config) {
        await this.initialize();
      }

      // Step 2: Parse Excel file to load associate data
      this.log('INFO', `Loading associate data from: ${this.config.excelFilePath}`);
      try {
        associates = await this.excelParser.parseFile(this.config.excelFilePath);
        this.log('INFO', `Successfully loaded ${associates.length} associates`);
      } catch (error) {
        const errorMsg = `Failed to parse Excel file: ${error.message}`;
        this.log('ERROR', errorMsg);
        errors.push(errorMsg);
        
        return {
          totalAssociatesChecked: 0,
          birthdaysFound: [],
          notificationSent: false,
          errors: errors
        };
      }

      // Step 3: Find associates with birthdays today
      this.log('INFO', 'Checking for birthdays today...');
      try {
        birthdaysFound = this.dateMatcher.findBirthdaysToday(associates);
        
        if (birthdaysFound.length > 0) {
          this.log('INFO', `Found ${birthdaysFound.length} birthday(s) today:`);
          birthdaysFound.forEach(associate => {
            this.log('INFO', `  - ${associate.name}`);
          });
        } else {
          this.log('INFO', 'No birthdays found today');
        }
      } catch (error) {
        const errorMsg = `Failed to match birthdays: ${error.message}`;
        this.log('ERROR', errorMsg);
        errors.push(errorMsg);
        
        return {
          totalAssociatesChecked: associates.length,
          birthdaysFound: [],
          notificationSent: false,
          errors: errors
        };
      }

      // Step 4: Send SMS notification if birthdays found
      if (birthdaysFound.length > 0) {
        this.log('INFO', 'Sending birthday notification SMS...');
        try {
          const smsResult = await this.smsService.sendBirthdayNotification(birthdaysFound);
          
          if (smsResult.success) {
            notificationSent = true;
            const maskedNumber = this.config.maskMobileNumber(this.config.recipientMobileNumber);
            this.log('INFO', `SMS notification sent successfully to ${maskedNumber} at ${smsResult.timestamp.toISOString()}`);
            if (smsResult.messageId) {
              this.log('INFO', `Message ID: ${smsResult.messageId}`);
            }
            if (smsResult.attempts && smsResult.attempts > 1) {
              this.log('INFO', `Delivery succeeded after ${smsResult.attempts} attempt(s)`);
            }
          } else {
            const errorMsg = `SMS notification failed: ${smsResult.error}`;
            this.log('ERROR', errorMsg);
            errors.push(errorMsg);
            if (smsResult.attempts) {
              this.log('ERROR', `Failed after ${smsResult.attempts} attempt(s)`);
            }
          }
        } catch (error) {
          const errorMsg = `Failed to send SMS notification: ${error.message}`;
          this.log('ERROR', errorMsg);
          errors.push(errorMsg);
        }
      }

      // Step 5: Log summary
      this.log('INFO', '=== Daily Birthday Check Complete ===');
      this.log('INFO', `Total associates checked: ${associates.length}`);
      this.log('INFO', `Birthdays found: ${birthdaysFound.length}`);
      this.log('INFO', `Notification sent: ${notificationSent ? 'Yes' : 'No'}`);
      if (errors.length > 0) {
        this.log('WARN', `Errors encountered: ${errors.length}`);
      }

      return {
        totalAssociatesChecked: associates.length,
        birthdaysFound: birthdaysFound,
        notificationSent: notificationSent,
        errors: errors
      };

    } catch (error) {
      // Catch any unexpected errors
      const errorMsg = `Unexpected error during birthday check: ${error.message}`;
      this.log('ERROR', errorMsg);
      errors.push(errorMsg);

      return {
        totalAssociatesChecked: associates.length,
        birthdaysFound: birthdaysFound,
        notificationSent: notificationSent,
        errors: errors
      };
    }
  }
}

export default BirthdayCheckService;
