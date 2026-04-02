import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   * @param path - The path to navigate to (relative to base URL)
   */
  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for an element to be visible
   * @param selector - The selector for the element
   * @param timeout - Optional timeout in milliseconds
   * @param throwOnError - If true, throws detailed error when element not found (default: true)
   */
  async waitForElement(selector: string, timeout?: number, throwOnError: boolean = true): Promise<void> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: timeout || 10000
      });
    } catch (error) {
      if (throwOnError) {
        throw new Error(`❌ Failed to find element: ${selector}\nTimeout: ${timeout || 10000}ms\nError: ${error}`);
      }
      throw error;
    }
  }

  /**
   * Wait for element and click (with error handling)
   * @param selector - The selector for the element
   * @param options - Optional click options
   */
  async clickElement(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void> {
    try {
      await this.waitForElement(selector, options?.timeout);
      await this.page.locator(selector).click({ force: options?.force });
    } catch (error) {
      throw new Error(`❌ Failed to click element: ${selector}\nError: ${error}`);
    }
  }

  /**
   * Check if an element is visible
   * @param selector - The selector for the element
   * @param throwOnError - If true, throws error when element not found (default: false)
   * @returns true if element is visible, false otherwise
   */
  async isElementVisible(selector: string, throwOnError: boolean = false): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: 3000
      });
      return true;
    } catch (error) {
      if (throwOnError) {
        throw new Error(`Element not found: ${selector}\n${error}`);
      }
      return false;
    }
  }

  /**
   * Take a screenshot
   * @param name - The name for the screenshot file
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  /**
   * Get the page title
   * @returns The page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current URL
   * @returns The current URL
   */
  async getUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Click on an element
   * @param selector - The selector for the element
   */
  async click(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  /**
   * Fill a form field
   * @param selector - The selector for the input field
   * @param value - The value to fill
   * @param throwOnError - If true, throws detailed error when element not found (default: true)
   */
  async fill(selector: string, value: string, throwOnError: boolean = true): Promise<void> {
    try {
      await this.waitForElement(selector, 10000, throwOnError);
      await this.page.fill(selector, value);
    } catch (error) {
      if (throwOnError) {
        throw new Error(`❌ Failed to fill element: ${selector}\nValue: ${value}\nError: ${error}`);
      }
      throw error;
    }
  }

  /**
   * Get text content of an element
   * @param selector - The selector for the element
   * @returns The text content
   */
  async getText(selector: string): Promise<string | null> {
    return await this.page.textContent(selector);
  }

  /**
   * Press a keyboard key
   * @param key - The key to press (e.g., 'Enter', 'Tab')
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Wait for navigation to complete
   * @param options - Navigation options
   */
  async waitForNavigation(options?: any): Promise<void> {
    await this.page.waitForNavigation(options);
  }

  /**
   * Get a locator for an element
   * @param selector - The selector for the element
   * @returns A Playwright Locator object
   */
  protected getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Clear an input field
   * @param selector - The selector for the input field
   */
  async clearField(selector: string): Promise<void> {
    await this.page.fill(selector, '');
  }

  /**
   * Select an option from a dropdown
   * @param selector - The selector for the select element
   * @param value - The value to select
   */
  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  /**
   * Dismiss the "File downloaded successfully" dialog if present.
   * The app shows this after batch/claim downloads — it blocks further interaction.
   */
  protected async dismissDownloadDialog(): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'File downloaded successfully' });
    if (await dialog.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Try clicking any button in the dialog, or press Escape to dismiss
      const btn = dialog.getByRole('button');
      if (await btn.count() > 0) {
        await btn.first().click();
      } else {
        await this.page.keyboard.press('Escape');
      }
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Wait for a grid to stabilize by polling row count until it stops changing.
   * Shared across all billing page objects (Claims, Batch, AR).
   * @param rowCountSelector - CSS selector that matches one element per row
   * @param maxAttempts - Maximum polling attempts (default 5)
   */
  protected async waitForGridStable(rowCountSelector: string, maxAttempts = 5): Promise<number> {
    let prevCount = -1;
    let currCount = 0;
    let attempts = 0;
    while (prevCount !== currCount && attempts < maxAttempts) {
      prevCount = currCount;
      await this.page.waitForTimeout(300);
      currCount = await this.page.locator(rowCountSelector).count();
      attempts++;
    }
    return currCount;
  }
}