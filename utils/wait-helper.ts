/**
 * Wait Helper Utility
 * Provides intelligent wait methods to replace hardcoded waitForTimeout calls
 *
 * Usage:
 *   import { WaitHelper } from '@utils/wait-helper';
 *
 *   const wait = new WaitHelper(page);
 *   await wait.forNetworkIdle();
 *   await wait.forElement('[data-cy="patient-grid"]');
 *   await wait.forText('Patient saved successfully');
 */
import { Page, Locator, expect } from '@playwright/test';
import { TIMEOUTS } from '../config/timeouts';

export class WaitHelper {
  constructor(private page: Page) {}

  /**
   * Wait for network to be idle (no pending requests)
   */
  async forNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for DOM content to be loaded
   */
  async forDomContentLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for page load to complete
   */
  async forPageLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
  }

  /**
   * Wait for an element to be visible
   * @param selector - CSS selector or data-cy attribute
   * @param timeout - Optional timeout in ms (default: TIMEOUTS.ELEMENT)
   */
  async forElement(selector: string, timeout: number = TIMEOUTS.ELEMENT): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for an element to be hidden/removed
   * @param selector - CSS selector
   * @param timeout - Optional timeout in ms
   */
  async forElementGone(selector: string, timeout: number = TIMEOUTS.ELEMENT): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  /**
   * Wait for an element to be attached to DOM (may not be visible)
   * @param selector - CSS selector
   * @param timeout - Optional timeout in ms
   */
  async forElementAttached(selector: string, timeout: number = TIMEOUTS.ELEMENT): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'attached', timeout });
  }

  /**
   * Wait for text to appear on page
   * @param text - Text to wait for
   * @param timeout - Optional timeout in ms
   */
  async forText(text: string, timeout: number = TIMEOUTS.ELEMENT): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible({ timeout });
  }

  /**
   * Wait for text to disappear from page
   * @param text - Text to wait for disappearance
   * @param timeout - Optional timeout in ms
   */
  async forTextGone(text: string, timeout: number = TIMEOUTS.ELEMENT): Promise<void> {
    await expect(this.page.getByText(text)).not.toBeVisible({ timeout });
  }

  /**
   * Wait for URL to match pattern
   * @param urlPattern - String or RegExp to match URL
   * @param timeout - Optional timeout in ms
   */
  async forUrl(urlPattern: string | RegExp, timeout: number = TIMEOUTS.NAVIGATION): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Wait for loading indicator to disappear
   * Common loading selectors are checked automatically
   */
  async forLoadingComplete(timeout: number = TIMEOUTS.LONG): Promise<void> {
    const loadingSelectors = [
      '.loading-spinner',
      '.loading-overlay',
      '[data-cy="loading"]',
      'ion-loading',
      '.spinner',
      '[role="progressbar"]',
      'text=Loading...',
    ];

    for (const selector of loadingSelectors) {
      const locator = this.page.locator(selector);
      if (await locator.isVisible().catch(() => false)) {
        await locator.waitFor({ state: 'hidden', timeout }).catch(() => {
          // Ignore if selector doesn't exist
        });
      }
    }
  }

  /**
   * Wait for modal/dialog to appear
   * @param timeout - Optional timeout in ms
   */
  async forModal(timeout: number = TIMEOUTS.DIALOG): Promise<void> {
    const modalSelectors = [
      '[role="dialog"]',
      '.modal',
      'ion-modal',
      '.modal-container',
    ];

    for (const selector of modalSelectors) {
      try {
        await this.page.locator(selector).waitFor({ state: 'visible', timeout: 1000 });
        return;
      } catch {
        // Try next selector
      }
    }
    throw new Error('Modal not found within timeout');
  }

  /**
   * Wait for modal/dialog to close
   * @param timeout - Optional timeout in ms
   */
  async forModalClosed(timeout: number = TIMEOUTS.DIALOG): Promise<void> {
    const modalSelectors = [
      '[role="dialog"]',
      '.modal',
      'ion-modal',
      '.modal-container',
    ];

    for (const selector of modalSelectors) {
      const locator = this.page.locator(selector);
      if (await locator.isVisible().catch(() => false)) {
        await locator.waitFor({ state: 'hidden', timeout });
      }
    }
  }

  /**
   * Wait for a specific API response
   * @param urlPattern - URL pattern to match (string or RegExp)
   * @param timeout - Optional timeout in ms
   */
  async forApiResponse(urlPattern: string | RegExp, timeout: number = TIMEOUTS.API): Promise<void> {
    await this.page.waitForResponse(
      (response) => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }

  /**
   * Wait for table/grid to have rows
   * @param gridSelector - Selector for the grid/table
   * @param minRows - Minimum number of rows expected (default: 1)
   * @param timeout - Optional timeout in ms
   */
  async forGridRows(
    gridSelector: string,
    minRows: number = 1,
    timeout: number = TIMEOUTS.SEARCH
  ): Promise<void> {
    const rowSelector = `${gridSelector} tr, ${gridSelector} [data-cy="grid-row"], ${gridSelector} ion-item`;
    await expect(this.page.locator(rowSelector)).toHaveCount(minRows, { timeout });
  }

  /**
   * Wait for dropdown options to load
   * @param timeout - Optional timeout in ms
   */
  async forDropdownOptions(timeout: number = TIMEOUTS.DROPDOWN): Promise<void> {
    const optionSelectors = [
      'ion-list ion-item',
      '[role="option"]',
      '.dropdown-item',
      'option',
    ];

    for (const selector of optionSelectors) {
      try {
        await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: 1000 });
        return;
      } catch {
        // Try next selector
      }
    }
  }

  /**
   * Wait with retry - attempts an action multiple times
   * @param action - Async function to execute
   * @param retries - Number of retries (default: 3)
   * @param delay - Delay between retries in ms (default: 1000)
   */
  async withRetry<T>(
    action: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) {
          await this.page.waitForTimeout(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Wait for element to be clickable (visible and enabled)
   * @param selector - CSS selector
   * @param timeout - Optional timeout in ms
   */
  async forClickable(selector: string, timeout: number = TIMEOUTS.ELEMENT): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout });
    await expect(locator).toBeEnabled({ timeout });
    return locator;
  }

  /**
   * Wait for input to be editable
   * @param selector - CSS selector
   * @param timeout - Optional timeout in ms
   */
  async forEditable(selector: string, timeout: number = TIMEOUTS.ELEMENT): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout });
    await expect(locator).toBeEditable({ timeout });
    return locator;
  }

  /**
   * Wait for a specific number of elements
   * @param selector - CSS selector
   * @param count - Expected count
   * @param timeout - Optional timeout in ms
   */
  async forElementCount(
    selector: string,
    count: number,
    timeout: number = TIMEOUTS.ELEMENT
  ): Promise<void> {
    await expect(this.page.locator(selector)).toHaveCount(count, { timeout });
  }

  /**
   * Short delay - use sparingly for UI animations
   * Prefer specific waits over this method
   */
  async brief(ms: number = TIMEOUTS.SHORT): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
}

/**
 * Create a WaitHelper instance for a page
 * Convenience function for one-off usage
 */
export function createWaitHelper(page: Page): WaitHelper {
  return new WaitHelper(page);
}
