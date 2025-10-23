import { describe, it, expect, beforeEach, vi } from 'vitest';
import BirthdayCheckService from '../src/services/BirthdayCheckService.js';
import Associate from '../src/models/Associate.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('BirthdayCheckService', () => {
  let service;
  let mockLogger;

  beforeEach(() => {
    // Create a mock logger
    mockLogger = {
      log: vi.fn()
    };

    service = new BirthdayCheckService(mockLogger);

    // Set up environment variables for testing
    process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
    process.env.RECIPIENT_MOBILE_NUMBER = '+1234567890';
    process.env.SMS_API_URL = 'https://api.example.com/sms';
    process.env.SMS_API_KEY = 'test-api-key';
    process.env.SMS_SENDER_ID = 'BirthdayBot';
    process.env.SCHEDULED_TIME = '09:00';
  });

  describe('initialize', () => {
    it('should load and validate configuration successfully', async () => {
      await service.initialize();

      expect(service.config).toBeDefined();
      expect(service.excelParser).toBeDefined();
      expect(service.dateMatcher).toBeDefined();
      expect(service.smsService).toBeDefined();
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringContaining('initialized successfully'));
    });

    it('should throw error when configuration is invalid', async () => {
      // Remove required environment variable
      delete process.env.SMS_API_KEY;

      await expect(service.initialize()).rejects.toThrow('Configuration validation failed');
      expect(mockLogger.log).toHaveBeenCalledWith('ERROR', expect.stringContaining('SMS API key is required'));
    });

    it('should throw error when Excel file does not exist', async () => {
      process.env.EXCEL_FILE_PATH = '/nonexistent/file.xlsx';

      await expect(service.initialize()).rejects.toThrow('Configuration validation failed');
      expect(mockLogger.log).toHaveBeenCalledWith('ERROR', expect.stringContaining('Excel file not found'));
    });
  });

  describe('performDailyCheck', () => {
    it('should return CheckResult with correct structure', async () => {
      const result = await service.performDailyCheck();

      expect(result).toHaveProperty('totalAssociatesChecked');
      expect(result).toHaveProperty('birthdaysFound');
      expect(result).toHaveProperty('notificationSent');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.birthdaysFound)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should log total associates checked', async () => {
      await service.performDailyCheck();

      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringMatching(/Total associates checked: \d+/));
    });

    it('should handle Excel parsing errors gracefully', async () => {
      // Use invalid-data.xlsx which exists but has invalid data
      process.env.EXCEL_FILE_PATH = path.join(__dirname, 'fixtures', 'invalid-data.xlsx');

      const result = await service.performDailyCheck();

      expect(result.totalAssociatesChecked).toBeGreaterThanOrEqual(0);
      expect(result.birthdaysFound).toHaveLength(0);
      expect(result.notificationSent).toBe(false);
      // The test should complete without crashing
      expect(result).toHaveProperty('errors');
    });

    it('should not send SMS when no birthdays found', async () => {
      // Mock the date matcher to return no birthdays
      await service.initialize();
      const originalFindBirthdaysToday = service.dateMatcher.findBirthdaysToday;
      service.dateMatcher.findBirthdaysToday = vi.fn(() => []);

      const result = await service.performDailyCheck();

      expect(result.notificationSent).toBe(false);
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', 'No birthdays found today');

      // Restore original method
      service.dateMatcher.findBirthdaysToday = originalFindBirthdaysToday;
    });

    it('should log birthday names when birthdays are found', async () => {
      await service.initialize();
      
      // Mock the date matcher to return some birthdays
      const mockBirthdays = [
        new Associate('John Doe', new Date(1990, 0, 1), 1),
        new Associate('Jane Smith', new Date(1985, 0, 1), 2)
      ];
      service.dateMatcher.findBirthdaysToday = vi.fn(() => mockBirthdays);

      // Mock SMS service to avoid actual HTTP calls
      service.smsService.sendBirthdayNotification = vi.fn(async () => ({
        success: true,
        messageId: 'test-123',
        timestamp: new Date(),
        attempts: 1
      }));

      await service.performDailyCheck();

      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringContaining('Found 2 birthday(s) today'));
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringContaining('John Doe'));
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringContaining('Jane Smith'));
    });

    it('should handle SMS sending errors gracefully', async () => {
      await service.initialize();

      // Mock birthdays found
      const mockBirthdays = [new Associate('John Doe', new Date(1990, 0, 1), 1)];
      service.dateMatcher.findBirthdaysToday = vi.fn(() => mockBirthdays);

      // Mock SMS service to fail
      service.smsService.sendBirthdayNotification = vi.fn(async () => ({
        success: false,
        error: 'Network error',
        timestamp: new Date(),
        attempts: 3
      }));

      const result = await service.performDailyCheck();

      expect(result.birthdaysFound).toHaveLength(1);
      expect(result.notificationSent).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(mockLogger.log).toHaveBeenCalledWith('ERROR', expect.stringContaining('SMS notification failed'));
    });

    it('should return statistics in CheckResult', async () => {
      const result = await service.performDailyCheck();

      expect(typeof result.totalAssociatesChecked).toBe('number');
      expect(result.totalAssociatesChecked).toBeGreaterThanOrEqual(0);
    });
  });

  describe('logging', () => {
    it('should log workflow steps', async () => {
      await service.performDailyCheck();

      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringContaining('Starting Daily Birthday Check'));
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringContaining('Loading associate data'));
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringContaining('Checking for birthdays'));
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', expect.stringContaining('Daily Birthday Check Complete'));
    });

    it('should not log when logger is not provided', async () => {
      const serviceWithoutLogger = new BirthdayCheckService();
      
      // Should not throw error
      await expect(serviceWithoutLogger.performDailyCheck()).resolves.toBeDefined();
    });
  });
});
