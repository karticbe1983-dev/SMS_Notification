/**
 * Associate model class
 * Represents an associate with name and date of birth information
 */
class Associate {
  /**
   * Create an Associate instance
   * @param {string} name - The associate's name
   * @param {Date} dateOfBirth - The associate's date of birth
   * @param {number} rowNumber - The row number in the Excel file
   */
  constructor(name, dateOfBirth, rowNumber) {
    this.name = name;
    this.dateOfBirth = dateOfBirth;
    this.rowNumber = rowNumber;
  }

  /**
   * Check if the associate's birthday is today
   * Compares month and day only, ignoring the year
   * @returns {boolean} True if birthday is today, false otherwise
   */
  isBirthdayToday() {
    const today = new Date();
    return this.dateOfBirth.getMonth() === today.getMonth() &&
           this.dateOfBirth.getDate() === today.getDate();
  }

  /**
   * Check if the associate's birthday matches a specific date
   * Compares month and day only, ignoring the year
   * @param {Date} date - The date to compare against
   * @returns {boolean} True if birthday matches the date, false otherwise
   */
  isBirthdayOnDate(date) {
    return this.dateOfBirth.getMonth() === date.getMonth() &&
           this.dateOfBirth.getDate() === date.getDate();
  }

  /**
   * Get a string representation of the associate
   * @returns {string} String representation
   */
  toString() {
    return `${this.name} (DOB: ${this.dateOfBirth.toLocaleDateString()})`;
  }
}

export default Associate;
