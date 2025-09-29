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
   */
  async waitForElement(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: timeout || 10000
    });
  }

  /**
   * Check if an element is visible
   * @param selector - The selector for the element
   * @returns true if element is visible, false otherwise
   */
  async isElementVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: 3000
      });
      return true;
    } catch {
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
   */
  async fill(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
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
}