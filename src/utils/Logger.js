import fs from 'fs';
import path from 'path';

/**
 * Logger utility with different log levels and file rotation
 * Ensures API credentials are never logged
 */
class Logger {
  /**
   * Log levels
   */
  static LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
  };

  /**
   * Create a Logger instance
   * @param {Object} options - Logger configuration options
   * @param {string} options.logDir - Directory to store log files (default: './logs')
   * @param {number} options.maxFileSize - Maximum log file size in bytes before rotation (default: 10MB)
   * @param {number} options.maxFiles - Maximum number of log files to keep (default: 5)
   * @param {boolean} options.consoleOutput - Whether to output to console (default: true)
   */
  constructor(options = {}) {
    this.logDir = options.logDir || './logs';
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.maxFiles = options.maxFiles || 5;
    this.consoleOutput = options.consoleOutput !== false;
    
    // Sensitive patterns to redact from logs
    this.sensitivePatterns = [
      /api[_-]?key[:\s=]+[^\s,}]+/gi,
      /bearer\s+[^\s,}]+/gi,
      /authorization[:\s=]+[^\s,}]+/gi,
      /password[:\s=]+[^\s,}]+/gi,
      /token[:\s=]+[^\s,}]+/gi,
      /secret[:\s=]+[^\s,}]+/gi
    ];

    // Ensure log directory exists
    this.ensureLogDirectory();
  }

  /**
   * Ensure the log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get the current log file path
   * @returns {string} Path to current log file
   */
  getCurrentLogFilePath() {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.logDir, `birthday-system-${dateStr}.log`);
  }

  /**
   * Sanitize message to remove sensitive information
   * @param {string} message - Message to sanitize
   * @returns {string} Sanitized message
   */
  sanitizeMessage(message) {
    let sanitized = message;
    
    // Replace sensitive patterns with [REDACTED]
    this.sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, (match) => {
        const parts = match.split(/[:=\s]+/);
        return parts[0] + ': [REDACTED]';
      });
    });

    return sanitized;
  }

  /**
   * Format log entry
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @returns {string} Formatted log entry
   */
  formatLogEntry(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  /**
   * Write log entry to file
   * @param {string} logEntry - Formatted log entry
   */
  writeToFile(logEntry) {
    try {
      const logFilePath = this.getCurrentLogFilePath();
      
      // Check if rotation is needed
      this.rotateIfNeeded(logFilePath);
      
      // Append to log file
      fs.appendFileSync(logFilePath, logEntry + '\n', 'utf8');
    } catch (error) {
      // If file writing fails, at least output to console
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Rotate log file if it exceeds max size
   * @param {string} logFilePath - Path to current log file
   */
  rotateIfNeeded(logFilePath) {
    try {
      // Check if file exists and get its size
      if (fs.existsSync(logFilePath)) {
        const stats = fs.statSync(logFilePath);
        
        if (stats.size >= this.maxFileSize) {
          // Rotate the file
          this.rotateLogFile(logFilePath);
        }
      }
    } catch (error) {
      console.error('Error checking log file size:', error.message);
    }
  }

  /**
   * Rotate log file by renaming with timestamp
   * @param {string} logFilePath - Path to log file to rotate
   */
  rotateLogFile(logFilePath) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ext = path.extname(logFilePath);
      const basename = path.basename(logFilePath, ext);
      const dirname = path.dirname(logFilePath);
      
      // Create rotated filename
      const rotatedPath = path.join(dirname, `${basename}-${timestamp}${ext}`);
      
      // Rename current log file
      fs.renameSync(logFilePath, rotatedPath);
      
      // Clean up old log files
      this.cleanupOldLogs();
    } catch (error) {
      console.error('Error rotating log file:', error.message);
    }
  }

  /**
   * Clean up old log files, keeping only the most recent ones
   */
  cleanupOldLogs() {
    try {
      // Get all log files in directory
      const files = fs.readdirSync(this.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          time: fs.statSync(path.join(this.logDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // Sort by modification time, newest first
      
      // Keep maxFiles, accounting for the current active log file
      // We want to keep maxFiles total, including the current one
      if (files.length > this.maxFiles) {
        const filesToDelete = files.slice(this.maxFiles);
        filesToDelete.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error(`Error deleting old log file ${file.name}:`, error.message);
          }
        });
      }
    } catch (error) {
      console.error('Error cleaning up old logs:', error.message);
    }
  }

  /**
   * Log a message with specified level
   * @param {string} level - Log level (INFO, WARN, ERROR)
   * @param {string} message - Message to log
   */
  log(level, message) {
    // Validate level
    if (!Object.values(Logger.LEVELS).includes(level)) {
      level = Logger.LEVELS.INFO;
    }

    // Sanitize message to remove sensitive information
    const sanitizedMessage = this.sanitizeMessage(message);
    
    // Format log entry
    const logEntry = this.formatLogEntry(level, sanitizedMessage);
    
    // Output to console if enabled
    if (this.consoleOutput) {
      switch (level) {
        case Logger.LEVELS.ERROR:
          console.error(logEntry);
          break;
        case Logger.LEVELS.WARN:
          console.warn(logEntry);
          break;
        default:
          console.log(logEntry);
      }
    }
    
    // Write to file
    this.writeToFile(logEntry);
  }

  /**
   * Log an INFO level message
   * @param {string} message - Message to log
   */
  info(message) {
    this.log(Logger.LEVELS.INFO, message);
  }

  /**
   * Log a WARN level message
   * @param {string} message - Message to log
   */
  warn(message) {
    this.log(Logger.LEVELS.WARN, message);
  }

  /**
   * Log an ERROR level message
   * @param {string} message - Message to log
   */
  error(message) {
    this.log(Logger.LEVELS.ERROR, message);
  }
}

export default Logger;
