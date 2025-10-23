/**
 * DateMatcher service class
 * Identifies associates with birthdays matching a specific date
 */
class DateMatcher {
  /**
   * Find all associates whose birthday is today
   * Compares month and day only, ignoring the year
   * Uses system local time for current date
   * @param {Associate[]} associates - Array of associates to check
   * @returns {Associate[]} Array of associates with birthdays today
   */
  findBirthdaysToday(associates) {
    if (!associates || !Array.isArray(associates)) {
      return [];
    }

    const today = new Date();
    return this.findBirthdaysOnDate(associates, today);
  }

  /**
   * Find all associates whose birthday matches a specific date
   * Compares month and day only, ignoring the year
   * @param {Associate[]} associates - Array of associates to check
   * @param {Date} date - The date to compare against
   * @returns {Associate[]} Array of associates with birthdays on the specified date
   */
  findBirthdaysOnDate(associates, date) {
    if (!associates || !Array.isArray(associates)) {
      return [];
    }

    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return [];
    }

    const targetMonth = date.getMonth();
    const targetDay = date.getDate();

    return associates.filter(associate => {
      if (!associate || !associate.dateOfBirth || !(associate.dateOfBirth instanceof Date)) {
        return false;
      }

      return associate.dateOfBirth.getMonth() === targetMonth &&
             associate.dateOfBirth.getDate() === targetDay;
    });
  }
}

export default DateMatcher;
