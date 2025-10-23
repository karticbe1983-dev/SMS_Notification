import { describe, it, expect, beforeEach, vi } from 'vitest';
import Scheduler from '../src/services/Scheduler.js';
import BirthdayCheckService from '../src/services/BirthdayCheckService.js';

// Mock node-cron
vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn((expression, callback, options) => ({
      stop: vi.fn()
    }))
  }
}));

// Mock BirthdayCheckService
vi.mock('../src/services/BirthdayCheckService.js', () => {
  return {
    default: vi.fn()
  };
});

describe('Scheduler', () => {
  let scheduler;
  let mockLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockLogger = {
      log: vi.fn()
    };
    
    // Reset the mock implementation
    BirthdayCheckService.mockClear();
  });

  describe('Time Format Validation', () => {
    it('should validate correct time format HH:MM', () => {
      scheduler = new Scheduler({ scheduledTime: '09:00', logger: mockLogger });
      expect(scheduler.validateTimeFormat('09:00')).toBe(true);
      expect(scheduler.validateTimeFormat('23:59')).toBe(true);
      expect(scheduler.validateTimeFormat('00:00')).toBe(true);
    });

    it('should reject invalid time formats', () => {
      scheduler = new Scheduler({ scheduledTime: '09:00', logger: mockLogger });
      expect(scheduler.validateTimeFormat('25:00')).toBe(false);
      expect(scheduler.validateTimeFormat('12:60')).toBe(false);
      expect(scheduler.validateTimeFormat('9:00')).toBe(false); // Missing leading zero
      expect(scheduler.validateTimeFormat('invalid')).toBe(false);
    });
  });

  describe('Cron Expression Conversion', () => {
    it('should convert time to correct cron expression', () => {
      scheduler = new Scheduler({ scheduledTime: '09:00', logger: mockLogger });
      expect(scheduler.timeToCronExpression('09:00')).toBe('00 09 * * *');
      expect(scheduler.timeToCronExpression('14:30')).toBe('30 14 * * *');
      expect(scheduler.timeToCronExpression('00:00')).toBe('00 00 * * *');
    });
  });

  describe('Initialization', () => {
    it('should initialize with valid configuration', async () => {
      scheduler = new Scheduler({ scheduledTime: '09:00', logger: mockLogger });
      
      // Mock BirthdayCheckService initialization
      const mockInitialize = vi.fn().mockResolvedValue(undefined);
      BirthdayCheckService.mockImplementation(function() {
        this.initialize = mockInitialize;
      });

      await scheduler.initialize();

      expect(scheduler.birthdayCheckService).toBeDefined();
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', 'Initializing Scheduler...');
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', 'Scheduled time validated: 09:00');
    });

    it('should throw error for invalid time format', async () => {
      scheduler = new Scheduler({ scheduledTime: '25:00', logger: mockLogger });

      await expect(scheduler.initialize()).rejects.toThrow('Invalid scheduled time format');
    });
  });

  describe('Start and Stop', () => {
    it('should start scheduler successfully', async () => {
      scheduler = new Scheduler({ scheduledTime: '09:00', logger: mockLogger });
      
      const mockInitialize = vi.fn().mockResolvedValue(undefined);
      const mockPerformDailyCheck = vi.fn().mockResolvedValue({
        totalAssociatesChecked: 0,
        birthdaysFound: [],
        notificationSent: false,
        errors: []
      });
      
      BirthdayCheckService.mockImplementation(function() {
        this.initialize = mockInitialize;
        this.performDailyCheck = mockPerformDailyCheck;
      });

      await scheduler.start();

      expect(scheduler.isRunning).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', 'Scheduler started successfully');
    });

    it('should stop scheduler successfully', async () => {
      scheduler = new Scheduler({ scheduledTime: '09:00', logger: mockLogger });
      
      const mockInitialize = vi.fn().mockResolvedValue(undefined);
      BirthdayCheckService.mockImplementation(function() {
        this.initialize = mockInitialize;
      });

      await scheduler.start();
      scheduler.stop();

      expect(scheduler.isRunning).toBe(false);
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', 'Scheduler stopped successfully');
    });
  });

  describe('Manual Execution', () => {
    it('should run birthday check manually', async () => {
      scheduler = new Scheduler({ scheduledTime: '09:00', logger: mockLogger });
      
      const mockResult = {
        totalAssociatesChecked: 5,
        birthdaysFound: [],
        notificationSent: false,
        errors: []
      };

      const mockInitialize = vi.fn().mockResolvedValue(undefined);
      const mockPerformDailyCheck = vi.fn().mockResolvedValue(mockResult);
      
      BirthdayCheckService.mockImplementation(function() {
        this.initialize = mockInitialize;
        this.performDailyCheck = mockPerformDailyCheck;
      });

      const result = await scheduler.runNow();

      expect(result).toEqual(mockResult);
      expect(mockLogger.log).toHaveBeenCalledWith('INFO', 'Manual birthday check triggered');
    });
  });
});
