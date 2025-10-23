import { describe, it, expect, beforeAll } from 'vitest';
import ExcelParser from '../src/services/ExcelParser.js';
import Associate from '../src/models/Associate.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ExcelParser', () => {
  let parser;

  beforeAll(() => {
    parser = new ExcelParser();
  });

  describe('parseFile - Valid Excel file parsing', () => {
    it('should parse a valid .xlsx file and return associates', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      const associates = await parser.parseFile(filePath);

      expect(associates).toBeDefined();
      expect(associates.length).toBeGreaterThan(0);
      expect(associates[0]).toBeInstanceOf(Associate);
      expect(associates[0].name).toBeDefined();
      expect(associates[0].dateOfBirth).toBeInstanceOf(Date);
      expect(associates[0].rowNumber).toBeGreaterThan(0);
    });

    it('should parse a valid .xls file and return associates', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'valid-associates.xls');
      const associates = await parser.parseFile(filePath);

      expect(associates).toBeDefined();
      expect(associates.length).toBeGreaterThan(0);
      expect(associates[0]).toBeInstanceOf(Associate);
    });

    it('should extract correct data from valid Excel file', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'valid-associates.xlsx');
      const associates = await parser.parseFile(filePath);

      // Check first associate (John Doe)
      const john = associates.find(a => a.name === 'John Doe');
      expect(john).toBeDefined();
      expect(john.dateOfBirth.getMonth()).toBe(0); // January (0-indexed)
      expect(john.dateOfBirth.getDate()).toBe(15);
      expect(john.dateOfBirth.getFullYear()).toBe(1990);
    });

    it('should handle empty Excel file', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'empty.xlsx');
      const associates = await parser.parseFile(filePath);

      expect(associates).toBeDefined();
      expect(associates.length).toBe(0);
    });
  });

  describe('parseFile - Invalid file format handling', () => {
    it('should throw error for non-existent file', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'non-existent.xlsx');
      
      await expect(parser.parseFile(filePath)).rejects.toThrow('Excel file not found');
    });

    it('should throw error for invalid file extension', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'create-test-files.js');
      
      await expect(parser.parseFile(filePath)).rejects.toThrow('Invalid file format');
    });
  });

  describe('parseFile - Missing date of birth handling', () => {
    it('should skip rows with missing or invalid date of birth', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'invalid-data.xlsx');
      const associates = await parser.parseFile(filePath);

      // Should only have 2 valid associates (Valid Person and Another Valid)
      expect(associates.length).toBe(2);
      
      const names = associates.map(a => a.name);
      expect(names).toContain('Valid Person');
      expect(names).toContain('Another Valid');
      expect(names).not.toContain('No DOB Person');
      expect(names).not.toContain('Invalid Date');
    });

    it('should skip rows with missing names', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'invalid-data.xlsx');
      const associates = await parser.parseFile(filePath);

      // Should not include the row with empty name
      const emptyName = associates.find(a => !a.name || a.name.trim() === '');
      expect(emptyName).toBeUndefined();
    });
  });

  describe('parseFile - Different date formats', () => {
    it('should parse MM/DD/YYYY format', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'different-formats.xlsx');
      const associates = await parser.parseFile(filePath);

      const usFormat = associates.find(a => a.name === 'US Format');
      expect(usFormat).toBeDefined();
      expect(usFormat.dateOfBirth.getMonth()).toBe(0); // January
      expect(usFormat.dateOfBirth.getDate()).toBe(15);
      expect(usFormat.dateOfBirth.getFullYear()).toBe(1990);
    });

    it('should parse YYYY-MM-DD format', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'different-formats.xlsx');
      const associates = await parser.parseFile(filePath);

      const isoFormat = associates.find(a => a.name === 'ISO Format');
      expect(isoFormat).toBeDefined();
      expect(isoFormat.dateOfBirth.getMonth()).toBe(2); // March
      expect(isoFormat.dateOfBirth.getDate()).toBe(22);
      expect(isoFormat.dateOfBirth.getFullYear()).toBe(1985);
    });

    it('should parse Excel serial number format', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'different-formats.xlsx');
      const associates = await parser.parseFile(filePath);

      const serialFormat = associates.find(a => a.name === 'Excel Serial');
      expect(serialFormat).toBeDefined();
      expect(serialFormat.dateOfBirth).toBeInstanceOf(Date);
      // Excel serial 33658 converts to January 1, 1992 (when read from file)
      expect(serialFormat.dateOfBirth.getMonth()).toBe(0); // January
      expect(serialFormat.dateOfBirth.getDate()).toBe(1);
    });

    it('should parse MM-DD-YYYY format with dashes', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'different-formats.xlsx');
      const associates = await parser.parseFile(filePath);

      const dashFormat = associates.find(a => a.name === 'Dash Format');
      expect(dashFormat).toBeDefined();
      expect(dashFormat.dateOfBirth.getMonth()).toBe(11); // December
      expect(dashFormat.dateOfBirth.getDate()).toBe(5);
      expect(dashFormat.dateOfBirth.getFullYear()).toBe(1988);
    });
  });

  describe('parseDate - Date parsing utility', () => {
    it('should return null for null or undefined values', () => {
      expect(parser.parseDate(null)).toBeNull();
      expect(parser.parseDate(undefined)).toBeNull();
      expect(parser.parseDate('')).toBeNull();
    });

    it('should parse Date objects', () => {
      const date = new Date(1990, 0, 15);
      const result = parser.parseDate(date);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(date.getTime());
    });

    it('should parse Excel serial numbers', () => {
      const serial = 33658; // Excel serial number
      const result = parser.parseDate(serial);
      
      expect(result).toBeInstanceOf(Date);
      // Excel serial 33658 converts to January 24, 1992
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(24);
    });

    it('should parse string dates in various formats', () => {
      const formats = [
        { input: '01/15/1990', month: 0, day: 15, year: 1990 },
        { input: '1990-01-15', month: 0, day: 15, year: 1990 },
        { input: '12-25-2000', month: 11, day: 25, year: 2000 }
      ];

      formats.forEach(({ input, month, day, year }) => {
        const result = parser.parseDate(input);
        expect(result).toBeInstanceOf(Date);
        expect(result.getMonth()).toBe(month);
        expect(result.getDate()).toBe(day);
        expect(result.getFullYear()).toBe(year);
      });
    });

    it('should return null for invalid date strings', () => {
      expect(parser.parseDate('not-a-date')).toBeNull();
      expect(parser.parseDate('invalid')).toBeNull();
      // Note: JavaScript Date constructor is lenient and may parse some invalid dates
      // Testing with clearly invalid format
      expect(parser.parseDate('abc/def/ghij')).toBeNull();
    });
  });
});
