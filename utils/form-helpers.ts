import { Page } from '@playwright/test';

/**
 * Form Helper Utilities
 * Reusable functions for interacting with common form elements
 * including ng-select dropdowns and ngb-datepickers
 */

/**
 * Select option from ng-select dropdown by text
 * @param page - Playwright Page instance
 * @param selector - CSS selector for the ng-select element
 * @param optionText - Text of the option to select
 */
export async function selectNgOption(page: Page, selector: string, optionText: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.locator(selector).click({ force: true });
  await page.waitForTimeout(1000);

  try {
    await page.waitForSelector('ng-dropdown-panel', { state: 'visible', timeout: 5000 });
  } catch {
    console.log('Dropdown panel not visible, trying anyway...');
  }

  await page.locator('ng-dropdown-panel .ng-option-label')
    .filter({ hasText: optionText })
    .first()
    .click({ force: true });
  await page.waitForTimeout(500);
}

/**
 * Select option from ng-select dropdown by index
 * @param page - Playwright Page instance
 * @param selector - CSS selector for the ng-select element
 * @param index - Index of the option to select (0-based)
 */
export async function selectNgOptionByIndex(page: Page, selector: string, index: number): Promise<void> {
  await page.locator(selector).click({ force: true });
  await page.waitForTimeout(1000);
  await page.waitForSelector('ng-dropdown-panel', { state: 'visible', timeout: 5000 });
  await page.locator('ng-dropdown-panel .ng-option').nth(index).click({ force: true });
  await page.waitForTimeout(500);
}

/**
 * Select date from ngb-datepicker
 * Generic function that can be used for any calendar date picker
 * @param page - Playwright Page instance
 * @param dateString - Date in MM/DD/YYYY format
 */
export async function selectDateFromPicker(page: Page, dateString: string): Promise<void> {
  // Validate date string
  if (!dateString || typeof dateString !== 'string') {
    console.log(`Skipping: dateString is falsy or not string: "${dateString}"`);
    return;
  }

  const trimmedDate = dateString.trim();
  if (!trimmedDate.includes('/')) {
    console.log(`Skipping: dateString does not contain '/': "${trimmedDate}"`);
    return;
  }

  const [month, day, year] = trimmedDate.split('/');
  if (!month || !day || !year) {
    console.log(`Skipping: dateString split invalid: "${trimmedDate}"`);
    return;
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = monthNames[monthIndex];
  const dayWithoutZero = parseInt(day, 10).toString();

  console.log(`Selecting date: ${monthName} ${dayWithoutZero}, ${year}`);

  // Wait for datepicker to be visible first
  try {
    await page.locator('ngb-datepicker').waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    console.log('Datepicker not visible, attempting to proceed anyway...');
  }

  // Select year
  await page.locator('ngb-datepicker-navigation-select select').last().selectOption(year);
  await page.waitForTimeout(300);

  // Select month - try by label first, then by index
  const monthSelect = page.locator('ngb-datepicker-navigation-select select').first();
  try {
    await monthSelect.selectOption({ label: monthName });
  } catch {
    console.log(`Month label "${monthName}" not found, trying index ${monthIndex}...`);
    await monthSelect.selectOption({ index: monthIndex });
  }
  await page.waitForTimeout(300);

  // Select day - click the enabled date
  await page.locator('.ngb-dp-day .btn-light:not(.text-muted)')
    .filter({ hasText: new RegExp(`^${dayWithoutZero}$`) })
    .click({ force: true });
  await page.waitForTimeout(500);

  // Wait for datepicker to close
  try {
    await page.locator('ngb-datepicker').waitFor({ state: 'hidden', timeout: 3000 });
  } catch {
    console.log('Datepicker may still be visible, continuing...');
  }
}

/**
 * Click calendar button associated with a label
 * Uses multiple fallback strategies to find the button
 * @param page - Playwright Page instance
 * @param labelText - The label text to find (e.g., "Billing Effective Date")
 */
export async function clickCalendarButtonByLabel(page: Page, labelText: string): Promise<void> {
  console.log(`Looking for calendar button near label: ${labelText}`);

  // Strategy 1: Find the exact label text element and look for calendar button in parent
  // The label is a generic element with exact text, and the button is in the same container
  const exactLabel = page.getByText(labelText, { exact: true });

  if (await exactLabel.count() > 0) {
    // Go to parent container and find the "custom calendar" button
    const parentContainer = exactLabel.locator('xpath=ancestor::*[4]');
    const calendarBtn = parentContainer.getByRole('button', { name: 'custom calendar' }).first();

    if (await calendarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await calendarBtn.click();
      console.log(`Clicked calendar button for "${labelText}" using exact label match`);
      return;
    }
  }

  // Strategy 2: Use locator chain - find label then find sibling button
  const labelLocator = page.locator(`text="${labelText}"`).first();
  if (await labelLocator.isVisible({ timeout: 2000 }).catch(() => false)) {
    // Navigate to parent and find button
    const parent = labelLocator.locator('..');
    const grandParent = parent.locator('..');

    // Try parent first
    let calendarBtn = parent.getByRole('button', { name: 'custom calendar' });
    if (await calendarBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await calendarBtn.click();
      console.log(`Clicked calendar button for "${labelText}" via parent`);
      return;
    }

    // Try grandparent
    calendarBtn = grandParent.getByRole('button', { name: 'custom calendar' });
    if (await calendarBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await calendarBtn.click();
      console.log(`Clicked calendar button for "${labelText}" via grandparent`);
      return;
    }
  }

  // Strategy 3: XPath - find label and navigate to nearby button
  const xpathBtn = page.locator(
    `//text()[normalize-space()="${labelText}"]/ancestor::*[self::div or self::ion-col or self::ion-row][1]//button[@aria-label="custom calendar" or contains(., "calendar")]`
  ).first();

  if (await xpathBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await xpathBtn.click();
    console.log(`Clicked calendar button for "${labelText}" via XPath`);
    return;
  }

  throw new Error(`Could not find calendar button for label: ${labelText}`);
}
