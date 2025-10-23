import axios from 'axios';

/**
 * SMS Service class with API integration
 * Handles sending SMS notifications via external gateway
 */
class SMSService {
  /**
   * Create an SMS Service instance
   * @param {Object} config - Configuration object containing SMS API details
   * @param {string} config.smsApiUrl - The SMS API endpoint URL
   * @param {string} config.smsApiKey - The API key for authentication
   * @param {string} config.smsSenderId - The sender ID for SMS messages
   * @param {string} config.recipientMobileNumber - The recipient mobile number
   */
  constructor(config) {
    if (!config) {
      throw new Error('Configuration is required for SMSService');
    }

    this.apiUrl = config.smsApiUrl;
    this.apiKey = config.smsApiKey;
    this.senderId = config.smsSenderId;
    this.recipientNumber = config.recipientMobileNumber;
    
    // Validate required configuration
    this.validateConfiguration();
  }

  /**
   * Validate that all required configuration is present
   * @throws {Error} If any required configuration is missing
   */
  validateConfiguration() {
    const errors = [];

    if (!this.apiUrl) {
      errors.push('SMS API URL is required');
    }

    if (!this.apiKey) {
      errors.push('SMS API key is required');
    }

    if (!this.senderId) {
      errors.push('SMS sender ID is required');
    }

    if (!this.recipientNumber) {
      errors.push('Recipient mobile number is required');
    }

    if (errors.length > 0) {
      throw new Error('SMS Service configuration validation failed:\n' + 
        errors.map(err => `  - ${err}`).join('\n'));
    }
  }

  /**
   * Format birthday notification message with associate names
   * @param {Array<Associate>} associates - Array of associates with birthdays
   * @returns {string} Formatted SMS message
   */
  formatMessage(associates) {
    if (!associates || associates.length === 0) {
      return '';
    }

    let message = 'Birthday Alert! Today\'s birthdays:\n';
    
    associates.forEach(associate => {
      message += `- ${associate.name}\n`;
    });

    return message.trim();
  }

  /**
   * Send birthday notification SMS
   * @param {Array<Associate>} associates - Array of associates with birthdays
   * @returns {Promise<SMSResult>} Result of SMS delivery attempt
   */
  async sendBirthdayNotification(associates) {
    const timestamp = new Date();

    // Don't send if no associates
    if (!associates || associates.length === 0) {
      return {
        success: false,
        error: 'No associates provided for notification',
        timestamp
      };
    }

    // Format the message
    const message = this.formatMessage(associates);

    // Send with retry logic
    return await this.sendWithRetry(message, timestamp);
  }

  /**
   * Send SMS with retry logic and exponential backoff
   * @param {string} message - The message to send
   * @param {Date} timestamp - The timestamp of the initial attempt
   * @param {number} attempt - Current attempt number (1-based)
   * @returns {Promise<SMSResult>} Result of SMS delivery attempt
   */
  async sendWithRetry(message, timestamp, attempt = 1) {
    const maxAttempts = 3;

    try {
      const result = await this.sendSMS(message);
      
      return {
        success: true,
        messageId: result.messageId,
        timestamp,
        attempts: attempt
      };
    } catch (error) {
      // If we've exhausted all attempts, return failure
      if (attempt >= maxAttempts) {
        return {
          success: false,
          error: error.message,
          timestamp,
          attempts: attempt
        };
      }

      // Calculate exponential backoff delay: 2^attempt seconds
      const delayMs = Math.pow(2, attempt) * 1000;
      
      // Wait before retrying
      await this.delay(delayMs);

      // Retry with incremented attempt counter
      return await this.sendWithRetry(message, timestamp, attempt + 1);
    }
  }

  /**
   * Send SMS via API
   * @param {string} message - The message to send
   * @returns {Promise<Object>} API response with messageId
   * @throws {Error} If API call fails
   */
  async sendSMS(message) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          to: this.recipientNumber,
          from: this.senderId,
          message: message
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 10000 // 10 second timeout
        }
      );

      // Check if response indicates success
      if (response.status >= 200 && response.status < 300) {
        return {
          messageId: response.data.messageId || response.data.id || 'unknown',
          status: response.data.status || 'sent'
        };
      } else {
        throw new Error(`SMS API returned status ${response.status}`);
      }
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // API responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || 'Unknown error';
        
        if (status === 401 || status === 403) {
          throw new Error(`Authentication failed: ${message}`);
        } else if (status === 400) {
          throw new Error(`Invalid request: ${message}`);
        } else {
          throw new Error(`API error (${status}): ${message}`);
        }
      } else if (error.request) {
        // Request was made but no response received (network error)
        throw new Error('Network error: Unable to reach SMS API');
      } else {
        // Something else went wrong
        throw new Error(`SMS sending failed: ${error.message}`);
      }
    }
  }

  /**
   * Delay helper for retry logic
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default SMSService;
