import { describe, it, expect, beforeEach, vi } from 'vitest';
import SMSService from '../src/services/SMSService.js';
import Associate from '../src/models/Associate.js';

describe('SMSService', () => {
  let config;
  let service;

  beforeEach(() => {
    config = {
      smsApiUrl: 'https://api.sms-provider.com/send',
      smsApiKey: 'test-api-key-12345',
      smsSenderId: 'BirthdayApp',
      recipientMobileNumber: '+1234567890'
    };
  });

  describe('Constructor and Configuration', () => {
    it('should create instance with valid configuration', () => {
      service = new SMSService(config);
      
      expect(service.apiUrl).toBe(config.smsApiUrl);
      expect(service.apiKey).toBe(config.smsApiKey);
      expect(service.senderId).toBe(config.smsSenderId);
      expect(service.recipientNumber).toBe(config.recipientMobileNumber);
    });

    it('should throw error when configuration is missing', () => {
      expect(() => new SMSService()).toThrow('Configuration is required for SMSService');
    });

    it('should throw error when API URL is missing', () => {
      const invalidConfig = { ...config, smsApiUrl: '' };
      expect(() => new SMSService(invalidConfig)).toThrow('SMS API URL is required');
    });

    it('should throw error when API key is missing', () => {
      const invalidConfig = { ...config, smsApiKey: '' };
      expect(() => new SMSService(invalidConfig)).toThrow('SMS API key is required');
    });

    it('should throw error when sender ID is missing', () => {
      const invalidConfig = { ...config, smsSenderId: '' };
      expect(() => new SMSService(invalidConfig)).toThrow('SMS sender ID is required');
    });

    it('should throw error when recipient number is missing', () => {
      const invalidConfig = { ...config, recipientMobileNumber: '' };
      expect(() => new SMSService(invalidConfig)).toThrow('Recipient mobile number is required');
    });
  });

  describe('Message Formatting', () => {
    beforeEach(() => {
      service = new SMSService(config);
    });

    it('should format message with single associate', () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      const message = service.formatMessage(associates);

      expect(message).toBe('Birthday Alert! Today\'s birthdays:\n- John Doe');
    });

    it('should format message with multiple associates', () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2),
        new Associate('Jane Smith', new Date('1985-05-15'), 3),
        new Associate('Bob Johnson', new Date('1992-05-15'), 4)
      ];

      const message = service.formatMessage(associates);

      expect(message).toBe(
        'Birthday Alert! Today\'s birthdays:\n' +
        '- John Doe\n' +
        '- Jane Smith\n' +
        '- Bob Johnson'
      );
    });

    it('should return empty string when no associates provided', () => {
      const message = service.formatMessage([]);
      expect(message).toBe('');
    });

    it('should return empty string when associates is null', () => {
      const message = service.formatMessage(null);
      expect(message).toBe('');
    });
  });

  describe('SMS Sending with Valid Credentials', () => {
    beforeEach(() => {
      service = new SMSService(config);
    });

    it('should send SMS successfully with valid credentials', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      vi.spyOn(service, 'sendSMS').mockResolvedValue({
        messageId: 'msg-12345',
        status: 'sent'
      });

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-12345');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.attempts).toBe(1);
    });

    it('should send SMS with multiple associates', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2),
        new Associate('Jane Smith', new Date('1985-05-15'), 3)
      ];

      vi.spyOn(service, 'sendSMS').mockResolvedValue({
        messageId: 'msg-67890',
        status: 'sent'
      });

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(true);
      expect(service.sendSMS).toHaveBeenCalledTimes(1);
    });
  });

  describe('SMS Sending with Invalid Credentials', () => {
    beforeEach(() => {
      service = new SMSService(config);
      vi.spyOn(service, 'delay').mockResolvedValue();
    });

    it('should handle 401 authentication error', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      vi.spyOn(service, 'sendSMS').mockRejectedValue(
        new Error('Authentication failed: Invalid API key')
      );

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication failed');
      expect(result.error).toContain('Invalid API key');
      expect(result.attempts).toBe(3);
    });

    it('should handle 403 forbidden error', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      vi.spyOn(service, 'sendSMS').mockRejectedValue(
        new Error('Authentication failed: Access denied')
      );

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication failed');
      expect(result.error).toContain('Access denied');
    });

    it('should handle 400 bad request error', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      vi.spyOn(service, 'sendSMS').mockRejectedValue(
        new Error('Invalid request: Invalid phone number format')
      );

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid request');
      expect(result.error).toContain('Invalid phone number format');
    });
  });

  describe('Network Error Handling', () => {
    beforeEach(() => {
      service = new SMSService(config);
      vi.spyOn(service, 'delay').mockResolvedValue();
    });

    it('should handle network timeout error', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      vi.spyOn(service, 'sendSMS').mockRejectedValue(
        new Error('Network error: Unable to reach SMS API')
      );

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error: Unable to reach SMS API');
      expect(result.attempts).toBe(3);
    });

    it('should handle connection refused error', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      vi.spyOn(service, 'sendSMS').mockRejectedValue(
        new Error('Network error: Unable to reach SMS API')
      );

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error: Unable to reach SMS API');
    });

    it('should handle generic error', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      vi.spyOn(service, 'sendSMS').mockRejectedValue(
        new Error('Something went wrong')
      );

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Something went wrong');
    });
  });

  describe('Retry Logic', () => {
    beforeEach(() => {
      service = new SMSService(config);
      vi.spyOn(service, 'delay').mockResolvedValue();
    });

    it('should retry up to 3 times on failure', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      const sendSMSSpy = vi.spyOn(service, 'sendSMS').mockRejectedValue(
        new Error('Network error')
      );

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3);
      expect(sendSMSSpy).toHaveBeenCalledTimes(3);
    });

    it('should succeed on second attempt', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      const sendSMSSpy = vi.spyOn(service, 'sendSMS')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          messageId: 'msg-retry-success',
          status: 'sent'
        });

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-retry-success');
      expect(result.attempts).toBe(2);
      expect(sendSMSSpy).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff for retries', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      vi.spyOn(service, 'sendSMS').mockRejectedValue(
        new Error('Network error')
      );

      await service.sendBirthdayNotification(associates);

      expect(service.delay).toHaveBeenCalledTimes(2);
      expect(service.delay).toHaveBeenNthCalledWith(1, 2000);
      expect(service.delay).toHaveBeenNthCalledWith(2, 4000);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      service = new SMSService(config);
    });

    it('should return error when no associates provided', async () => {
      const sendSMSSpy = vi.spyOn(service, 'sendSMS');
      
      const result = await service.sendBirthdayNotification([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No associates provided for notification');
      expect(sendSMSSpy).not.toHaveBeenCalled();
    });

    it('should return error when associates is null', async () => {
      const sendSMSSpy = vi.spyOn(service, 'sendSMS');
      
      const result = await service.sendBirthdayNotification(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No associates provided for notification');
      expect(sendSMSSpy).not.toHaveBeenCalled();
    });

    it('should handle API response without messageId', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      vi.spyOn(service, 'sendSMS').mockResolvedValue({
        messageId: 'unknown',
        status: 'sent'
      });

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('unknown');
    });

    it('should handle API response with id instead of messageId', async () => {
      const associates = [
        new Associate('John Doe', new Date('1990-05-15'), 2)
      ];

      vi.spyOn(service, 'sendSMS').mockResolvedValue({
        messageId: 'alt-msg-id',
        status: 'sent'
      });

      const result = await service.sendBirthdayNotification(associates);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('alt-msg-id');
    });
  });
});
