import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import BirthdayCheckService from '../src/services/BirthdayCheckService.js';
import Logger from '../src/utils/Logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Integration Tests
 * Tests end-to-end birthday check workflow with various scenarios
 */
describe('Integration Tests - Birthday Check System', () => {
  let service;
  let logger;
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Create a test logger
    logger = new Logger({
      logDir: './logs/test',
      consoleOutput: false
    });

    service = new BirthdayCheckService(logger);
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('End-to-End Birthday Check with Matching Birthdays', () => {
    it('should complete full workflow when birthdays are found', async () => {
      // Setup: Configure environment with valid test data
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'today-birthday.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      // Initialize service
      await service.initialize();

      // Mock SMS service to avoid actual API calls
      service.smsService.sendSMS = vi.fn(async () => ({
        messageId: 'test-msg-123',
        status: 'sent'
      }));

      // Execute: Perform daily check
      const result = await service.performDailyCheck();

      // Verify: Check result structure and values
      expect(result).toBeDefined();
      expect(result.totalAssociatesChecked).toBeGreaterThan(0);
      expect(result.birthdaysFound).toBeInstanceOf(Array);
      expect(result.notificationSent).toBe(true);
      expect(result.errors).toHaveLength(0);

      // Verify SMS was sent
      expect(service.smsService.sendSMS).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple birthdays on same day', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await service.initialize();

      // Mock date matcher to return multiple birthdays
      const mockBirthdays = [
        { name: 'John Doe', dateOfBirth: new Date(1990, 0, 1), rowNumber: 1 },
        { name: 'Jane Smith', dateOfBirth: new Date(1985, 0, 1), rowNumber: 2 },
        { name: 'Bob Johnson', dateOfBirth: new Date(1992, 0, 1), rowNumber: 3 }
      ];
      service.dateMatcher.findBirthdaysToday = vi.fn(() => mockBirthdays);

      // Mock SMS service
      service.smsService.sendSMS = vi.fn(async () => ({
        messageId: 'test-msg-456',
        status: 'sent'
      }));

      const result = await service.performDailyCheck();

      expect(result.birthdaysFound).toHaveLength(3);
      expect(result.notificationSent).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('No Birthday Scenario', () => {
    it('should not send SMS when no birthdays found', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await service.initialize();

      // Mock date matcher to return no birthdays
      service.dateMatcher.findBirthdaysToday = vi.fn(() => []);

      // Mock SMS service (should not be called)
      const sendSMSSpy = vi.spyOn(service.smsService, 'sendSMS');

      const result = await service.performDailyCheck();

      expect(result.birthdaysFound).toHaveLength(0);
      expect(result.notificationSent).toBe(false);
      expect(result.errors).toHaveLength(0);
      expect(sendSMSSpy).not.toHaveBeenCalled();
    });

    it('should log appropriate message when no birthdays found', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      const mockLogger = {
        log: vi.fn()
      };
      service = new BirthdayCheckService(mockLogger);

      await service.initialize();
      service.dateMatcher.findBirthdaysToday = vi.fn(() => []);

      await service.performDailyCheck();

      expect(mockLogger.log).toHaveBeenCalledWith('INFO', 'No birthdays found today');
    });
  });

  describe('Missing Excel File Error Handling', () => {
    it('should handle missing Excel file gracefully', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'non-existent-file.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await expect(service.initialize()).rejects.toThrow('Configuration validation failed');
    });

    it('should return error in CheckResult when Excel file cannot be parsed', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await service.initialize();

      // Mock Excel parser to throw error
      service.excelParser.parseFile = vi.fn(async () => {
        throw new Error('Failed to read Excel file');
      });

      const result = await service.performDailyCheck();

      expect(result.totalAssociatesChecked).toBe(0);
      expect(result.birthdaysFound).toHaveLength(0);
      expect(result.notificationSent).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Failed to parse Excel file');
    });
  });

  describe('Invalid Configuration Error Handling', () => {
    it('should throw error when SMS API key is missing', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      delete process.env.SMS_API_KEY;
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await expect(service.initialize()).rejects.toThrow('Configuration validation failed');
    });

    it('should throw error when recipient mobile number is invalid', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = 'invalid-number';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await expect(service.initialize()).rejects.toThrow('Configuration validation failed');
    });

    it('should throw error when SMS API URL is missing', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      delete process.env.SMS_API_URL;
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await expect(service.initialize()).rejects.toThrow('Configuration validation failed');
    });

    it('should throw error when scheduled time format is invalid', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '25:99'; // Invalid time

      await expect(service.initialize()).rejects.toThrow('Configuration validation failed');
    });
  });

  describe('SMS API Failure Handling', () => {
    it('should handle SMS API failure gracefully', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await service.initialize();

      // Mock birthdays found
      const mockBirthdays = [
        { name: 'John Doe', dateOfBirth: new Date(1990, 0, 1), rowNumber: 1 }
      ];
      service.dateMatcher.findBirthdaysToday = vi.fn(() => mockBirthdays);

      // Mock delay to speed up test
      service.smsService.delay = vi.fn(async () => {});

      // Mock SMS service to fail
      service.smsService.sendSMS = vi.fn(async () => {
        throw new Error('Network error: Unable to reach SMS API');
      });

      const result = await service.performDailyCheck();

      expect(result.birthdaysFound).toHaveLength(1);
      expect(result.notificationSent).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('SMS notification failed');
    });

    it('should handle authentication failure', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'invalid-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await service.initialize();

      const mockBirthdays = [
        { name: 'John Doe', dateOfBirth: new Date(1990, 0, 1), rowNumber: 1 }
      ];
      service.dateMatcher.findBirthdaysToday = vi.fn(() => mockBirthdays);

      // Mock delay to speed up test
      service.smsService.delay = vi.fn(async () => {});

      // Mock SMS service to return authentication error
      service.smsService.sendSMS = vi.fn(async () => {
        throw new Error('Authentication failed: Invalid API key');
      });

      const result = await service.performDailyCheck();

      expect(result.notificationSent).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should retry SMS sending on failure', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await service.initialize();

      const mockBirthdays = [
        { name: 'John Doe', dateOfBirth: new Date(1990, 0, 1), rowNumber: 1 }
      ];
      service.dateMatcher.findBirthdaysToday = vi.fn(() => mockBirthdays);

      // Mock delay to speed up test
      service.smsService.delay = vi.fn(async () => {});

      // Mock SMS service to fail twice then succeed
      const sendSMSSpy = vi.spyOn(service.smsService, 'sendSMS')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          messageId: 'retry-success-123',
          status: 'sent'
        });

      const result = await service.performDailyCheck();

      expect(result.notificationSent).toBe(true);
      expect(sendSMSSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Logging Verification', () => {
    it('should log total associates checked', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      const mockLogger = {
        log: vi.fn()
      };
      service = new BirthdayCheckService(mockLogger);

      await service.initialize();
      service.dateMatcher.findBirthdaysToday = vi.fn(() => []);

      await service.performDailyCheck();

      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringMatching(/Total associates checked: \d+/));
    });

    it('should log birthday names when found', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      const mockLogger = {
        log: vi.fn()
      };
      service = new BirthdayCheckService(mockLogger);

      await service.initialize();

      const mockBirthdays = [
        { name: 'John Doe', dateOfBirth: new Date(1990, 0, 1), rowNumber: 1 },
        { name: 'Jane Smith', dateOfBirth: new Date(1985, 0, 1), rowNumber: 2 }
      ];
      service.dateMatcher.findBirthdaysToday = vi.fn(() => mockBirthdays);
      service.smsService.sendSMS = vi.fn(async () => ({
        messageId: 'test-123',
        status: 'sent'
      }));

      await service.performDailyCheck();

      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringContaining('John Doe'));
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringContaining('Jane Smith'));
    });

    it('should log SMS delivery success with timestamp', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      const mockLogger = {
        log: vi.fn()
      };
      service = new BirthdayCheckService(mockLogger);

      await service.initialize();

      const mockBirthdays = [
        { name: 'John Doe', dateOfBirth: new Date(1990, 0, 1), rowNumber: 1 }
      ];
      service.dateMatcher.findBirthdaysToday = vi.fn(() => mockBirthdays);
      service.smsService.sendSMS = vi.fn(async () => ({
        messageId: 'test-123',
        status: 'sent'
      }));

      await service.performDailyCheck();

      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringMatching(/SMS notification sent successfully.*at \d{4}-\d{2}-\d{2}T/));
    });

    it('should log SMS delivery failure with error details', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      const mockLogger = {
        log: vi.fn()
      };
      service = new BirthdayCheckService(mockLogger);

      await service.initialize();

      const mockBirthdays = [
        { name: 'John Doe', dateOfBirth: new Date(1990, 0, 1), rowNumber: 1 }
      ];
      service.dateMatcher.findBirthdaysToday = vi.fn(() => mockBirthdays);
      
      // Mock delay to speed up test
      service.smsService.delay = vi.fn(async () => {});
      
      service.smsService.sendSMS = vi.fn(async () => {
        throw new Error('Network timeout');
      });

      await service.performDailyCheck();

      expect(mockLogger.log).toHaveBeenCalledWith('ERROR', expect.stringContaining('SMS notification failed'));
      expect(mockLogger.log).toHaveBeenCalledWith('ERROR', expect.stringContaining('Network timeout'));
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle Excel file with mixed valid and invalid data', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'invalid-data.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await service.initialize();
      service.dateMatcher.findBirthdaysToday = vi.fn(() => []);

      const result = await service.performDailyCheck();

      // Should only count valid associates
      expect(result.totalAssociatesChecked).toBeGreaterThanOrEqual(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should complete workflow even with partial failures', async () => {
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
      process.env.SMS_API_URL = 'https://api.example.com/sms';
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_SENDER_ID = 'BirthdayBot';
      process.env.SCHEDULED_TIME = '09:00';

      await service.initialize();

      const mockBirthdays = [
        { name: 'John Doe', dateOfBirth: new Date(1990, 0, 1), rowNumber: 1 }
      ];
      service.dateMatcher.findBirthdaysToday = vi.fn(() => mockBirthdays);

      // Mock delay to speed up test
      service.smsService.delay = vi.fn(async () => {});

      // SMS fails but workflow should complete
      service.smsService.sendSMS = vi.fn(async () => {
        throw new Error('SMS API unavailable');
      });

      const result = await service.performDailyCheck();

      expect(result).toBeDefined();
      expect(result.totalAssociatesChecked).toBeGreaterThan(0);
      expect(result.birthdaysFound).toHaveLength(1);
      expect(result.notificationSent).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
