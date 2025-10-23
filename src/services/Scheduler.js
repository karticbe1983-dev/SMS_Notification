import cron from 'node-cron';
import BirthdayCheckService from './BirthdayCheckService.js';

/**
 * Scheduler service for automated daily birthday checks
 * Uses node-cron to trigger birthday checks at configured time
 */
class Scheduler {
  /**
   * Create a Scheduler instance
   * @param {Object} options - Scheduler configuration options
   * @param {string} options.scheduledTime - Time to run daily check in HH:MM format (24-hour)
   * @param {Object} options.logger - Logger instance for logging operations
   */
  constructor(options = {}) {
    this.scheduledTime = options.scheduledTime || '09:00';
    this.logger = options.logger || null;
    this.birthdayCheckService = null;
    this.cronJob = null;
    this.isRunning = false;
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
   * Validate the scheduled time format
   * @param {string} time - Time string in HH:MM format
   * @returns {boolean} True if valid, false otherwise
   */
  validateTimeFormat(time) {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  }

  /**
   * Convert HH:MM time format to cron expression
   * @param {string} time - Time in HH:MM format
   * @returns {string} Cron expression for daily execution at specified time
   */
  timeToCronExpression(time) {
    const [hours, minutes] = time.split(':');
    // Cron format: minute hour day month weekday
    // Run daily at specified time: "MM HH * * *"
    return `${minutes} ${hours} * * *`;
  }

  /**
   * Initialize the scheduler
   * Creates Birthday Check Service instance and validates configuration
   * @returns {Promise<void>}
   * @throws {Error} If initialization fails
   */
  async initialize() {
    try {
      this.log('INFO', 'Initializing Scheduler...');

      // Validate scheduled time format
      if (!this.validateTimeFormat(this.scheduledTime)) {
        throw new Error(`Invalid scheduled time format: ${this.scheduledTime}. Expected HH:MM format (24-hour).`);
      }

      this.log('INFO', `Scheduled time validated: ${this.scheduledTime}`);

      // Create Birthday Check Service instance
      this.birthdayCheckService = new BirthdayCheckService(this.logger);
      
      // Initialize the service (loads and validates configuration)
      await this.birthdayCheckService.initialize();

      this.log('INFO', 'Scheduler initialized successfully');
    } catch (error) {
      this.log('ERROR', `Scheduler initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute the birthday check task
   * Wrapper method that handles errors during scheduled execution
   * @returns {Promise<void>}
   */
  async executeTask() {
    try {
      this.log('INFO', `Scheduled task triggered at ${new Date().toISOString()}`);
      
      // Perform the daily birthday check
      const result = await this.birthdayCheckService.performDailyCheck();
      
      // Log task completion
      if (result.errors.length > 0) {
        this.log('WARN', `Scheduled task completed with ${result.errors.length} error(s)`);
      } else {
        this.log('INFO', 'Scheduled task completed successfully');
      }
    } catch (error) {
      // Catch any unexpected errors during task execution
      this.log('ERROR', `Scheduled task execution failed: ${error.message}`);
      this.log('ERROR', `Stack trace: ${error.stack}`);
    }
  }

  /**
   * Start the scheduler
   * Begins the cron job for daily birthday checks
   * @returns {Promise<void>}
   * @throws {Error} If scheduler is not initialized or fails to start
   */
  async start() {
    try {
      // Ensure scheduler is initialized
      if (!this.birthdayCheckService) {
        await this.initialize();
      }

      // Check if already running
      if (this.isRunning) {
        this.log('WARN', 'Scheduler is already running');
        return;
      }

      // Convert time to cron expression
      const cronExpression = this.timeToCronExpression(this.scheduledTime);
      
      this.log('INFO', `Starting scheduler with cron expression: ${cronExpression}`);
      this.log('INFO', `Daily birthday checks will run at ${this.scheduledTime}`);

      // Create and start cron job
      this.cronJob = cron.schedule(cronExpression, async () => {
        await this.executeTask();
      }, {
        scheduled: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });

      this.isRunning = true;
      this.log('INFO', 'Scheduler started successfully');
      this.log('INFO', `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    } catch (error) {
      this.log('ERROR', `Failed to start scheduler: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop the scheduler
   * Stops the cron job and cleans up resources
   */
  stop() {
    try {
      if (!this.isRunning) {
        this.log('WARN', 'Scheduler is not running');
        return;
      }

      if (this.cronJob) {
        this.cronJob.stop();
        this.cronJob = null;
      }

      this.isRunning = false;
      this.log('INFO', 'Scheduler stopped successfully');
    } catch (error) {
      this.log('ERROR', `Failed to stop scheduler: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if scheduler is running
   * @returns {boolean} True if running, false otherwise
   */
  isSchedulerRunning() {
    return this.isRunning;
  }

  /**
   * Run the birthday check immediately (manual trigger)
   * Useful for testing or manual execution
   * @returns {Promise<Object>} Result of the birthday check
   */
  async runNow() {
    try {
      // Ensure scheduler is initialized
      if (!this.birthdayCheckService) {
        await this.initialize();
      }

      this.log('INFO', 'Manual birthday check triggered');
      const result = await this.birthdayCheckService.performDailyCheck();
      
      return result;
    } catch (error) {
      this.log('ERROR', `Manual birthday check failed: ${error.message}`);
      throw error;
    }
  }
}

export default Scheduler;
