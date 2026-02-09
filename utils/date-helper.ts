import { Page } from '@playwright/test';

/**
 * Date Helper Utilities
 * Handles date selection in ngb-datepicker (Angular Bootstrap date picker)
 */
export class DateHelper {
  /**
   * Month names for date picker selection
   */
  private static readonly monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  /**
   * Select date from ngb-datepicker
   * This matches the Cypress selectDateFormatted logic
   *
   * @param page - Playwright Page object
   * @param dateString - Date in MM/DD/YYYY format
   */
  static async selectDateFormatted(page: Page, dateString: string): Promise<void> {
    console.log(`📅 Selecting date: ${dateString}`);

    // Validation
    if (!dateString || typeof dateString !== 'string') {
      console.log(`⚠️ Skipping: dateString is invalid: "${dateString}"`);
      return;
    }

    const trimmedDate = dateString.trim();

    if (!trimmedDate.includes('/')) {
      console.log(`⚠️ Skipping: dateString does not contain '/': "${trimmedDate}"`);
      return;
    }

    const [month, day, year] = trimmedDate.split('/');

    if (!month || !day || !year) {
      console.log(`⚠️ Skipping: dateString split invalid: "${trimmedDate}"`);
      return;
    }

    const monthName = this.monthNames[parseInt(month, 10) - 1];
    const dayWithoutZero = parseInt(day, 10).toString();
    const yearNum = parseInt(year, 10);

    console.log(`📅 Parsed date: ${monthName} ${dayWithoutZero}, ${year}`);

    // Handle year selection for dates before 2015
    // This handles the year dropdown stepping for old dates
    if (yearNum <= 2015) {
      await page.locator('ngb-datepicker-navigation-select select').last().selectOption('2015');
      await page.waitForTimeout(300);
    }
    if (yearNum <= 2005) {
      await page.locator('ngb-datepicker-navigation-select select').last().selectOption('2005');
      await page.waitForTimeout(300);
    }
    if (yearNum <= 1995) {
      await page.locator('ngb-datepicker-navigation-select select').last().selectOption('1995');
      await page.waitForTimeout(300);
    }

    // Select the target year
    await page.locator('ngb-datepicker-navigation-select select').last().selectOption(year);
    await page.waitForTimeout(300);
    console.log(`✅ Selected year: ${year}`);

    // Select the month
    await page.locator('ngb-datepicker-navigation-select select').first().selectOption(monthName);
    await page.waitForTimeout(300);
    console.log(`✅ Selected month: ${monthName}`);

    // Select the day (only enabled dates, not muted)
    await page.locator('.ngb-dp-day .btn-light:not(.text-muted)')
      .filter({ hasText: new RegExp(`^${dayWithoutZero}$`) })
      .click({ force: true });
    await page.waitForTimeout(500);
    console.log(`✅ Selected day: ${dayWithoutZero}`);

    // Wait for datepicker modal to close before continuing
    try {
      await page.locator('ngb-datepicker').waitFor({ state: 'hidden', timeout: 3000 });
      await page.waitForTimeout(500); // Additional wait for any animations
      console.log(`✅ Datepicker closed`);
    } catch (error) {
      console.log(`⚠️ Datepicker may still be visible, continuing...`);
    }

    console.log(`✅ Date selected successfully: ${dateString}`);
  }

  /**
   * Get today's date in MM/DD/YYYY format
   */
  static getTodaysDate(): string {
    return this.formatDateToMMDDYYYY(new Date());
  }

  /**
   * Get date X days in the past in MM/DD/YYYY format
   * @param daysAgo - Number of days in the past
   */
  static getPastDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return this.formatDateToMMDDYYYY(date);
  }

  /**
   * Get date X days in the future in MM/DD/YYYY format
   * @param daysAhead - Number of days in the future
   */
  static getFutureDate(daysAhead: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return this.formatDateToMMDDYYYY(date);
  }

  /**
   * Parse date string in MM/DD/YYYY format to Date object
   * @param dateString - Date string in MM/DD/YYYY format
   * @returns Date object
   */
  static parseDate(dateString: string): Date {
    const [month, day, year] = dateString.split('/').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  }

  /**
   * Format Date object to MM/DD/YYYY string
   * @param date - Date object
   * @returns Date string in MM/DD/YYYY format
   */
  static formatDateToMMDDYYYY(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  /**
   * Get the first day of the month for a given date
   * @param date - Date object or date string in MM/DD/YYYY format
   * @returns Date string in MM/DD/YYYY format
   */
  static getFirstDayOfMonth(date: Date | string): string {
    const dateObj = typeof date === 'string' ? this.parseDate(date) : date;
    const firstDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    return this.formatDateToMMDDYYYY(firstDay);
  }

  /**
   * Get the last day of the month for a given date
   * @param date - Date object or date string in MM/DD/YYYY format
   * @returns Date string in MM/DD/YYYY format
   */
  static getLastDayOfMonth(date: Date | string): string {
    const dateObj = typeof date === 'string' ? this.parseDate(date) : date;
    const lastDay = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
    return this.formatDateToMMDDYYYY(lastDay);
  }

  /**
   * Check if a date is in the previous month compared to today
   * @param date - Date object or date string in MM/DD/YYYY format
   * @returns true if date is in previous month
   */
  static isDateInPreviousMonth(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? this.parseDate(date) : date;
    const today = new Date();

    // Check if date is in a month before current month
    if (dateObj.getFullYear() < today.getFullYear()) {
      return true;
    }

    if (dateObj.getFullYear() === today.getFullYear() && dateObj.getMonth() < today.getMonth()) {
      return true;
    }

    return false;
  }

  /**
   * Get array of month/year pairs between two dates
   * @param startDate - Start date string in MM/DD/YYYY format
   * @param endDate - End date string in MM/DD/YYYY format (defaults to today)
   * @returns Array of objects with month and year
   */
  static getMonthsBetween(startDate: string, endDate?: string): Array<{month: number, year: number}> {
    const start = this.parseDate(startDate);
    const end = endDate ? this.parseDate(endDate) : new Date();

    const months: Array<{month: number, year: number}> = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= endMonth) {
      months.push({
        month: current.getMonth() + 1,
        year: current.getFullYear()
      });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  /**
   * Check if two dates are in the same month
   * @param date1 - First date string in MM/DD/YYYY format
   * @param date2 - Second date string in MM/DD/YYYY format
   * @returns true if dates are in the same month and year
   */
  static isSameMonth(date1: string, date2: string): boolean {
    const d1 = this.parseDate(date1);
    const d2 = this.parseDate(date2);
    return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  }

  // ============================================
  // HOPE Visit Date Calculations
  // ============================================

  /**
   * Calculate INV (Initial Nursing Visit) due date
   * INV is due 5 days after admission
   * @param admissionDate - Admission date string in MM/DD/YYYY format
   * @returns INV due date in MM/DD/YYYY format
   */
  static calculateINVDate(admissionDate: string): string {
    const date = this.parseDate(admissionDate);
    date.setDate(date.getDate() + 5);
    return this.formatDateToMMDDYYYY(date);
  }

  /**
   * Calculate HUV1 (HOPE Update Visit 1) due date
   * HUV1 is due 15 days after admission
   * @param admissionDate - Admission date string in MM/DD/YYYY format
   * @returns HUV1 due date in MM/DD/YYYY format
   */
  static calculateHUV1Date(admissionDate: string): string {
    const date = this.parseDate(admissionDate);
    date.setDate(date.getDate() + 15);
    return this.formatDateToMMDDYYYY(date);
  }

  /**
   * Calculate date by adding days to a base date
   * @param baseDate - Base date string in MM/DD/YYYY format
   * @param daysToAdd - Number of days to add (can be negative)
   * @returns Calculated date in MM/DD/YYYY format
   */
  static addDaysToDate(baseDate: string, daysToAdd: number): string {
    const date = this.parseDate(baseDate);
    date.setDate(date.getDate() + daysToAdd);
    return this.formatDateToMMDDYYYY(date);
  }

  // ============================================
  // Date Formatting Utilities
  // ============================================

  /**
   * Format date in different formats
   * @param date - Date object or date string in MM/DD/YYYY format
   * @param format - Format string ('MM/DD/YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY')
   * @returns Formatted date string
   */
  static formatDateCustom(date: Date | string, format: string): string {
    const dateObj = typeof date === 'string' ? this.parseDate(date) : date;
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      default:
        return `${month}/${day}/${year}`;
    }
  }

  /**
   * Get the difference in days between two dates
   * @param date1 - First date string in MM/DD/YYYY format
   * @param date2 - Second date string in MM/DD/YYYY format
   * @returns Number of days between dates (positive if date2 > date1)
   */
  static getDaysBetween(date1: string, date2: string): number {
    const d1 = this.parseDate(date1);
    const d2 = this.parseDate(date2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if a date is in the past
   * @param dateString - Date string in MM/DD/YYYY format
   * @returns true if date is before today
   */
  static isDateInPast(dateString: string): boolean {
    const date = this.parseDate(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  /**
   * Check if a date is in the future
   * @param dateString - Date string in MM/DD/YYYY format
   * @returns true if date is after today
   */
  static isDateInFuture(dateString: string): boolean {
    const date = this.parseDate(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  }

  /**
   * Check if a date is today
   * @param dateString - Date string in MM/DD/YYYY format
   * @returns true if date is today
   */
  static isToday(dateString: string): boolean {
    const date = this.parseDate(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
}
