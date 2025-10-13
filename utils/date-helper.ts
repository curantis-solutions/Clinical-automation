import { Page } from '@playwright/test';

/**
 * Date Helper Utilities
 * Handles date selection in ngb-datepicker (Angular Bootstrap date picker)
 */

/**
 * Select date from ngb-datepicker
 * This matches the Cypress selectDateFormatted logic
 *
 * @param page - Playwright Page object
 * @param dateString - Date in MM/DD/YYYY format
 */
export async function selectDateFormatted(page: Page, dateString: string): Promise<void> {
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

  // Month names for selection
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthName = monthNames[parseInt(month, 10) - 1];
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

  console.log(`✅ Date selected successfully: ${dateString}`);
}

/**
 * Get today's date in MM/DD/YYYY format
 */
export function getTodaysDate(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Get date X days in the past in MM/DD/YYYY format
 * @param daysAgo - Number of days in the past
 */
export function getPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Get date X days in the future in MM/DD/YYYY format
 * @param daysAhead - Number of days in the future
 */
export function getFutureDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}
