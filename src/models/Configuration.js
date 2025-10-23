import fs from 'fs';
import path from 'path';

/**
 * Configuration model class with validation methods
 * Manages system configuration from environment variables and config files
 */
class Configuration {
  constructor() {
    this.excelFilePath = '';
    this.recipientMobileNumber = '';
    this.smsApiUrl = '';
    this.smsApiKey = '';
    this.smsSenderId = '';
    this.scheduledTime = '';
    this.logLevel = 'INFO';
    this.logFilePath = './logs/birthday-system.log';
  }

  /**
   * Load configuration from environment variables
   * @returns {Configuration} The configuration instance
   */
  loadFromEnvironment() {
    this.excelFilePath = process.env.EXCEL_FILE_PATH || '';
    this.recipientMobileNumber = process.env.RECIPIENT_MOBILE_NUMBER || '';
    this.smsApiUrl = process.env.SMS_API_URL || '';
    this.smsApiKey = process.env.SMS_API_KEY || '';
    this.smsSenderId = process.env.SMS_SENDER_ID || '';
    this.scheduledTime = process.env.SCHEDULED_TIME || '09:00';
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
    this.logFilePath = process.env.LOG_FILE_PATH || './logs/birthday-system.log';
    
    return this;
  }

  /**
   * Validate mobile number format
   * Supports international format with + prefix and 10-15 digits
   * @param {string} mobileNumber - The mobile number to validate
   * @returns {boolean} True if valid, false otherwise
   */
  validateMobileNumber(mobileNumber) {
    if (!mobileNumber || typeof mobileNumber !== 'string') {
      return false;
    }

    // Remove spaces and dashes for validation
    const cleaned = mobileNumber.replace(/[\s-]/g, '');
    
    // Check for international format: +[country code][number]
    // Should start with + and have 10-15 digits total
    const mobileRegex = /^\+\d{10,15}$/;
    
    return mobileRegex.test(cleaned);
  }

  /**
   * Validate that file path exists
   * @param {string} filePath - The file path to validate
   * @returns {boolean} True if file exists, false otherwise
   */
  validateFilePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    try {
      // Resolve relative paths
      const resolvedPath = path.resolve(filePath);
      return fs.existsSync(resolvedPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate scheduled time format (HH:MM)
   * @param {string} time - The time string to validate
   * @returns {boolean} True if valid, false otherwise
   */
  validateScheduledTime(time) {
    if (!time || typeof time !== 'string') {
      return false;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Validate all configuration values
   * @returns {ValidationResult} Object containing validation status and errors
   */
  validate() {
    const errors = [];

    // Validate required fields
    if (!this.excelFilePath) {
      errors.push('Excel file path is required (EXCEL_FILE_PATH)');
    } else if (!this.validateFilePath(this.excelFilePath)) {
      errors.push(`Excel file not found at path: ${this.excelFilePath}`);
    }

    if (!this.recipientMobileNumber) {
      errors.push('Recipient mobile number is required (RECIPIENT_MOBILE_NUMBER)');
    } else if (!this.validateMobileNumber(this.recipientMobileNumber)) {
      errors.push('Recipient mobile number format is invalid. Expected format: +[country code][number] (e.g., +1234567890)');
    }

    if (!this.smsApiUrl) {
      errors.push('SMS API URL is required (SMS_API_URL)');
    }

    if (!this.smsApiKey) {
      errors.push('SMS API key is required (SMS_API_KEY)');
    }

    if (!this.smsSenderId) {
      errors.push('SMS sender ID is required (SMS_SENDER_ID)');
    }

    if (!this.validateScheduledTime(this.scheduledTime)) {
      errors.push('Scheduled time format is invalid. Expected format: HH:MM (e.g., 09:00)');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get a sanitized version of configuration for logging
   * Masks sensitive information like API keys
   * @returns {Object} Sanitized configuration object
   */
  toSafeObject() {
    return {
      excelFilePath: this.excelFilePath,
      recipientMobileNumber: this.maskMobileNumber(this.recipientMobileNumber),
      smsApiUrl: this.smsApiUrl,
      smsApiKey: this.maskApiKey(this.smsApiKey),
      smsSenderId: this.smsSenderId,
      scheduledTime: this.scheduledTime,
      logLevel: this.logLevel,
      logFilePath: this.logFilePath
    };
  }

  /**
   * Mask mobile number for safe logging
   * @param {string} mobileNumber - The mobile number to mask
   * @returns {string} Masked mobile number
   */
  maskMobileNumber(mobileNumber) {
    if (!mobileNumber || mobileNumber.length < 4) {
      return '****';
    }
    return mobileNumber.substring(0, 3) + '****' + mobileNumber.substring(mobileNumber.length - 2);
  }

  /**
   * Mask API key for safe logging
   * @param {string} apiKey - The API key to mask
   * @returns {string} Masked API key
   */
  maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 4) {
      return '****';
    }
    return apiKey.substring(0, 4) + '****';
  }
}

export default Configuration;
