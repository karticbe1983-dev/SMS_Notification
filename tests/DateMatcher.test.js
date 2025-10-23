import { describe, it, expect, beforeEach } from 'vitest';
import DateMatcher from '../src/services/DateMatcher.js';
import Associate from '../src/models/Associate.js';

describe('DateMatcher', () => {
  let dateMatcher;

  beforeEach(() => {
    dateMatcher = new DateMatcher();
  });

  describe('findBirthdaysToday - Birthday match detection', () => {
    it('should find associates with birthdays today', () => {
      const today = new Date();
      const associates = [
        new Associate('John Doe', new Date(1990, today.getMonth(), today.getDate()), 1),
        new Associate('Jane Smith', new Date(1985, today.getMonth(), today.getDate()), 2),
        new Associate('Bob Johnson', new Date(1995, 5, 15), 3)
      ];

      const birthdays = dateMatcher.findBirthdaysToday(associates);

      expect(birthdays).toHaveLength(2);
      expect(birthdays[0].name).toBe('John Doe');
      expect(birthdays[1].name).toBe('Jane Smith');
    });

    it('should return empty array when no birthdays match today', () => {
      const today = new Date();
      const differentMonth = (today.getMonth() + 1) % 12;
      const associates = [
        new Associate('John Doe', new Date(1990, differentMonth, 15), 1),
        new Associate('Jane Smith', new Date(1985, differentMonth, 20), 2)
      ];

      const birthdays = dateMatcher.findBirthdaysToday(associates);

      expect(birthdays).toHaveLength(0);
    });

    it('should handle empty associates array', () => {
      const birthdays = dateMatcher.findBirthdaysToday([]);

      expect(birthdays).toHaveLength(0);
    });

    it('should handle null or undefined associates', () => {
      expect(dateMatcher.findBirthdaysToday(null)).toHaveLength(0);
      expect(dateMatcher.findBirthdaysToday(undefined)).toHaveLength(0);
    });
  });

  describe('findBirthdaysOnDate - Non-birthday filtering', () => {
    it('should filter out associates without matching birthdays', () => {
      const targetDate = new Date(2024, 5, 15); // June 15, 2024
      const associates = [
        new Associate('Birthday Match', new Date(1990, 5, 15), 1),
        new Associate('Different Day', new Date(1985, 5, 16), 2),
        new Associate('Different Month', new Date(1995, 6, 15), 3),
        new Associate('Another Match', new Date(2000, 5, 15), 4)
      ];

      const birthdays = dateMatcher.findBirthdaysOnDate(associates, targetDate);

      expect(birthdays).toHaveLength(2);
      expect(birthdays[0].name).toBe('Birthday Match');
      expect(birthdays[1].name).toBe('Another Match');
    });

    it('should ignore year when comparing dates', () => {
      const targetDate = new Date(2024, 11, 25); // December 25, 2024
      const associates = [
        new Associate('Born 1990', new Date(1990, 11, 25), 1),
        new Associate('Born 2000', new Date(2000, 11, 25), 2),
        new Associate('Born 1975', new Date(1975, 11, 25), 3)
      ];

      const birthdays = dateMatcher.findBirthdaysOnDate(associates, targetDate);

      expect(birthdays).toHaveLength(3);
    });

    it('should handle invalid date parameter', () => {
      const associates = [
        new Associate('John Doe', new Date(1990, 5, 15), 1)
      ];

      expect(dateMatcher.findBirthdaysOnDate(associates, null)).toHaveLength(0);
      expect(dateMatcher.findBirthdaysOnDate(associates, undefined)).toHaveLength(0);
      expect(dateMatcher.findBirthdaysOnDate(associates, new Date('invalid'))).toHaveLength(0);
    });

    it('should handle associates with invalid date of birth', () => {
      const targetDate = new Date(2024, 5, 15);
      const associates = [
        new Associate('Valid DOB', new Date(1990, 5, 15), 1),
        { name: 'Invalid DOB', dateOfBirth: null, rowNumber: 2 },
        { name: 'No DOB', rowNumber: 3 }
      ];

      const birthdays = dateMatcher.findBirthdaysOnDate(associates, targetDate);

      expect(birthdays).toHaveLength(1);
      expect(birthdays[0].name).toBe('Valid DOB');
    });
  });

  describe('findBirthdaysOnDate - Leap year birthday handling', () => {
    it('should match leap year birthdays on February 29', () => {
      const leapYearDate = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      const associates = [
        new Associate('Leap Year Baby', new Date(2000, 1, 29), 1),
        new Associate('Regular Feb Birthday', new Date(1990, 1, 28), 2)
      ];

      const birthdays = dateMatcher.findBirthdaysOnDate(associates, leapYearDate);

      expect(birthdays).toHaveLength(1);
      expect(birthdays[0].name).toBe('Leap Year Baby');
    });

    it('should not match Feb 29 birthdays on Feb 28 in non-leap years', () => {
      const nonLeapYearDate = new Date(2023, 1, 28); // February 28, 2023 (non-leap year)
      const associates = [
        new Associate('Leap Year Baby', new Date(2000, 1, 29), 1),
        new Associate('Feb 28 Birthday', new Date(1990, 1, 28), 2)
      ];

      const birthdays = dateMatcher.findBirthdaysOnDate(associates, nonLeapYearDate);

      expect(birthdays).toHaveLength(1);
      expect(birthdays[0].name).toBe('Feb 28 Birthday');
    });

    it('should handle leap year birthdays across different years', () => {
      const leapYearDate = new Date(2024, 1, 29);
      const associates = [
        new Associate('Born 1992', new Date(1992, 1, 29), 1),
        new Associate('Born 1996', new Date(1996, 1, 29), 2),
        new Associate('Born 2000', new Date(2000, 1, 29), 3),
        new Associate('Born 2004', new Date(2004, 1, 29), 4)
      ];

      const birthdays = dateMatcher.findBirthdaysOnDate(associates, leapYearDate);

      expect(birthdays).toHaveLength(4);
    });
  });

  describe('Edge cases', () => {
    it('should handle associates born on January 1', () => {
      const newYearDate = new Date(2024, 0, 1);
      const associates = [
        new Associate('New Year Baby', new Date(1990, 0, 1), 1)
      ];

      const birthdays = dateMatcher.findBirthdaysOnDate(associates, newYearDate);

      expect(birthdays).toHaveLength(1);
    });

    it('should handle associates born on December 31', () => {
      const newYearEveDate = new Date(2024, 11, 31);
      const associates = [
        new Associate('New Year Eve Baby', new Date(1990, 11, 31), 1)
      ];

      const birthdays = dateMatcher.findBirthdaysOnDate(associates, newYearEveDate);

      expect(birthdays).toHaveLength(1);
    });

    it('should handle large arrays of associates', () => {
      const targetDate = new Date(2024, 5, 15);
      const associates = [];
      
      // Create 1000 associates with various birthdays
      for (let i = 0; i < 1000; i++) {
        const month = i % 12;
        const day = (i % 28) + 1;
        associates.push(new Associate(`Associate ${i}`, new Date(1990, month, day), i));
      }
      
      // Add some associates with June 15 birthdays
      associates.push(new Associate('June 15 Baby 1', new Date(1990, 5, 15), 1001));
      associates.push(new Associate('June 15 Baby 2', new Date(1995, 5, 15), 1002));
      associates.push(new Associate('June 15 Baby 3', new Date(2000, 5, 15), 1003));

      const birthdays = dateMatcher.findBirthdaysOnDate(associates, targetDate);

      expect(birthdays.length).toBe(3);
      birthdays.forEach(birthday => {
        expect(birthday.dateOfBirth.getMonth()).toBe(5);
        expect(birthday.dateOfBirth.getDate()).toBe(15);
      });
    });
  });
});
