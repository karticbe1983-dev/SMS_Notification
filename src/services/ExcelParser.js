import xlsx from 'xlsx';
import Associate from '../models/Associate.js';
import path from 'path';
import fs from 'fs';

/**
 * Excel Parser Service
 * Reads and extracts associate data from Excel files
 */
class ExcelParser {
  constructor(logger = null) {
    this.logger = logger;
  }

  /**
   * Log a message if logger is available
   * @param {string} level - Log level (INFO, WARN, ERROR)
   * @param {string} message - Message to log
   */
  log(level, message) {
    if (this.logger) {
      this.logger.log(level, message);
    }
  }

  /**
   * Parse an Excel file and extract associate data
   * @param {string} filePath - Path to the Excel file
   * @returns {Promise<Associate[]>} Array of Associate objects
   * @throws {Error} If file is invalid or unreadable
   */
  async parseFile(filePath) {
    try {
      // Validate file path
      const resolvedPath = path.resolve(filePath);
      
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Excel file not found at path: ${filePath}`);
      }

      // Check file extension
      const ext = path.extname(resolvedPath).toLowerCase();
      if (ext !== '.xlsx' && ext !== '.xls') {
        throw new Error(`Invalid file format: ${ext}. Expected .xlsx or .xls`);
      }

      this.log('INFO', `Reading Excel file: ${filePath}`);

      // Read the Excel file
      const workbook = xlsx.readFile(resolvedPath);
      
      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('Excel file contains no worksheets');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      this.log('INFO', `Processing worksheet: ${firstSheetName}`);

      // Convert worksheet to JSON
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });
      
      const associates = [];
      let validRows = 0;
      let skippedRows = 0;

      // Parse each row (skip header row if present)
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 1; // Excel rows are 1-indexed

        // Skip empty rows
        if (!row || row.length === 0 || (row.length === 1 && !row[0])) {
          continue;
        }

        // Extract name and date of birth
        const name = row[0];
        const dobValue = row[1];

        // Validate name
        if (!name || typeof name !== 'string' || name.trim() === '') {
          this.log('WARN', `Row ${rowNumber}: Missing or invalid name, skipping row`);
          skippedRows++;
          continue;
        }

        // Validate and parse date of birth
        const dateOfBirth = this.parseDate(dobValue);
        if (!dateOfBirth) {
          this.log('WARN', `Row ${rowNumber}: Invalid or missing date of birth for "${name}", skipping row`);
          skippedRows++;
          continue;
        }

        // Create Associate object
        const associate = new Associate(name.trim(), dateOfBirth, rowNumber);
        associates.push(associate);
        validRows++;
      }

      this.log('INFO', `Parsing complete: ${validRows} valid associates, ${skippedRows} rows skipped`);

      return associates;

    } catch (error) {
      // Re-throw with more context if it's not already our error
      if (error.message.includes('Excel file not found') || 
          error.message.includes('Invalid file format') ||
          error.message.includes('no worksheets')) {
        throw error;
      }
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Parse a date value from various formats
   * Supports: Date objects, Excel serial numbers, and common date strings
   * @param {*} value - The value to parse as a date
   * @returns {Date|null} Parsed Date object or null if invalid
   */
  parseDate(value) {
    if (!value) {
      return null;
    }

    // If already a Date object
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
      const date = this.excelSerialToDate(value);
      return isNaN(date.getTime()) ? null : date;
    }

    // If it's a string, try to parse it
    if (typeof value === 'string') {
      const trimmed = value.trim();
      
      // Try standard date parsing
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }

      // Try common date formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
      const datePatterns = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,  // MM/DD/YYYY or DD/MM/YYYY
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/,    // YYYY-MM-DD
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/     // MM-DD-YYYY or DD-MM-YYYY
      ];

      for (const pattern of datePatterns) {
        const match = trimmed.match(pattern);
        if (match) {
          const date = this.parseMatchedDate(match, pattern);
          if (date && !isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }

    return null;
  }

  /**
   * Parse a date from regex match groups
   * @param {Array} match - Regex match array
   * @param {RegExp} pattern - The pattern that was matched
   * @returns {Date|null} Parsed date or null
   */
  parseMatchedDate(match, pattern) {
    try {
      const patternStr = pattern.toString();
      
      if (patternStr.includes('YYYY') && patternStr.startsWith('/^(\\d{4})')) {
        // YYYY-MM-DD format
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // JS months are 0-indexed
        const day = parseInt(match[3]);
        return new Date(year, month, day);
      } else {
        // MM/DD/YYYY or DD/MM/YYYY format
        // Try MM/DD/YYYY first (US format)
        const first = parseInt(match[1]);
        const second = parseInt(match[2]);
        const year = parseInt(match[3]);
        
        // If first number is > 12, it must be DD/MM/YYYY
        if (first > 12) {
          return new Date(year, second - 1, first);
        }
        // If second number is > 12, it must be MM/DD/YYYY
        if (second > 12) {
          return new Date(year, first - 1, second);
        }
        // Ambiguous - default to MM/DD/YYYY (US format)
        return new Date(year, first - 1, second);
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Convert Excel serial date number to JavaScript Date
   * Excel stores dates as number of days since 1900-01-01
   * @param {number} serial - Excel serial date number
   * @returns {Date} JavaScript Date object
   */
  excelSerialToDate(serial) {
    // Excel's epoch is 1900-01-01, but it incorrectly treats 1900 as a leap year
    // So we need to account for that
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const msPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch.getTime() + serial * msPerDay);
    return date;
  }
}

export default ExcelParser;
