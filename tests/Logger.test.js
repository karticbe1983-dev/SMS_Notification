import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Logger from '../src/utils/Logger.js';
import fs from 'fs';
import path from 'path';

describe('Logger', () => {
  const testLogDir = './logs-test';
  let logger;

  beforeEach(() => {
    // Create logger with test directory
    logger = new Logger({
      logDir: testLogDir,
      maxFileSize: 1024, // 1KB for testing rotation
      maxFiles: 3,
      consoleOutput: false // Disable console output for tests
    });
  });

  afterEach(() => {
    // Clean up test log directory
    if (fs.existsSync(testLogDir)) {
      const files = fs.readdirSync(testLogDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testLogDir, file));
      });
      fs.rmdirSync(testLogDir);
    }
  });

  describe('Log Levels', () => {
    it('should support INFO log level', () => {
      logger.info('Test info message');
      
      const logFile = logger.getCurrentLogFilePath();
      expect(fs.existsSync(logFile)).toBe(true);
      
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('[INFO]');
      expect(content).toContain('Test info message');
    });

    it('should support WARN log level', () => {
      logger.warn('Test warning message');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('[WARN]');
      expect(content).toContain('Test warning message');
    });

    it('should support ERROR log level', () => {
      logger.error('Test error message');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('[ERROR]');
      expect(content).toContain('Test error message');
    });
  });

  describe('Sensitive Information Redaction', () => {
    it('should redact API keys from log messages', () => {
      logger.info('Connecting with api_key: sk_test_12345');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('[REDACTED]');
      expect(content).not.toContain('sk_test_12345');
    });

    it('should redact Bearer tokens from log messages', () => {
      logger.info('Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('[REDACTED]');
      expect(content).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should redact passwords from log messages', () => {
      logger.info('Login with password: mySecretPass123');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('[REDACTED]');
      expect(content).not.toContain('mySecretPass123');
    });

    it('should redact secrets from log messages', () => {
      logger.info('Config loaded with secret=abc123xyz');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('[REDACTED]');
      expect(content).not.toContain('abc123xyz');
    });
  });

  describe('Log File Writing', () => {
    it('should create log directory if it does not exist', () => {
      expect(fs.existsSync(testLogDir)).toBe(true);
    });

    it('should write log entries to file', () => {
      logger.info('First log entry');
      logger.warn('Second log entry');
      logger.error('Third log entry');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      
      expect(content).toContain('First log entry');
      expect(content).toContain('Second log entry');
      expect(content).toContain('Third log entry');
    });

    it('should include timestamp in log entries', () => {
      logger.info('Timestamped message');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      
      // Check for ISO timestamp format
      expect(content).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });
  });

  describe('Log File Rotation', () => {
    it('should rotate log file when it exceeds max size', () => {
      // Write enough data to exceed 1KB limit
      for (let i = 0; i < 50; i++) {
        logger.info(`Log entry number ${i} with some additional text to increase size`);
      }
      
      // Check that multiple log files exist
      const files = fs.readdirSync(testLogDir).filter(f => f.endsWith('.log'));
      expect(files.length).toBeGreaterThan(1);
    });

    it('should keep only maxFiles number of log files', () => {
      // Create more log files than maxFiles limit
      for (let i = 0; i < 200; i++) {
        logger.info(`Log entry ${i} with enough text to trigger rotation multiple times`);
      }
      
      const files = fs.readdirSync(testLogDir).filter(f => f.endsWith('.log'));
      // Allow for maxFiles + 1 to account for the current active log file
      expect(files.length).toBeLessThanOrEqual(4); // maxFiles is 3, plus current file
    });
  });

  describe('Birthday Check Logging Requirements', () => {
    it('should log total associates checked', () => {
      logger.info('Total associates checked: 150');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('Total associates checked: 150');
    });

    it('should log associates with birthdays found', () => {
      logger.info('Found 3 birthday(s) today:');
      logger.info('  - John Doe');
      logger.info('  - Jane Smith');
      logger.info('  - Bob Johnson');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('Found 3 birthday(s) today');
      expect(content).toContain('John Doe');
      expect(content).toContain('Jane Smith');
      expect(content).toContain('Bob Johnson');
    });

    it('should log SMS delivery success with timestamp', () => {
      const timestamp = new Date().toISOString();
      logger.info(`SMS notification sent successfully to +1***5678 at ${timestamp}`);
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('SMS notification sent successfully');
      expect(content).toContain(timestamp);
    });

    it('should log SMS delivery failures with error details', () => {
      logger.error('SMS notification failed: Network error: Unable to reach SMS API');
      logger.error('Failed after 3 attempt(s)');
      
      const logFile = logger.getCurrentLogFilePath();
      const content = fs.readFileSync(logFile, 'utf8');
      expect(content).toContain('[ERROR]');
      expect(content).toContain('SMS notification failed');
      expect(content).toContain('Network error');
      expect(content).toContain('Failed after 3 attempt(s)');
    });
  });
});
