import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Error handling utilities for test automation
 */

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param retries - Number of retry attempts (default: 3)
 * @param delay - Initial delay in ms (default: 1000)
 * @param stepName - Name of the step for logging
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  stepName: string = 'Operation'
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempting ${stepName} (attempt ${attempt}/${retries})...`);
      const result = await fn();
      console.log(`✅ ${stepName} succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.error(`❌ ${stepName} failed on attempt ${attempt}:`, error.message);

      if (attempt === retries) {
        console.error(`🚫 ${stepName} failed after ${retries} attempts`);
        throw error;
      }

      const waitTime = delay * Math.pow(2, attempt - 1); // Exponential backoff
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error(`${stepName} failed after ${retries} retries`);
}

/**
 * Take screenshot on error
 * @param page - Playwright page
 * @param stepName - Name of the step for the screenshot filename
 */
export async function captureErrorScreenshot(page: Page, stepName: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotDir = path.join(process.cwd(), 'test-results', 'error-screenshots');

  // Create directory if it doesn't exist
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const screenshotPath = path.join(screenshotDir, `${stepName}-${timestamp}.png`);

  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.error('❌ Failed to capture screenshot:', error.message);
    return '';
  }
}

/**
 * Execute a step with error handling, retry, and screenshot
 * @param page - Playwright page
 * @param stepName - Name of the step
 * @param fn - Function to execute
 * @param retries - Number of retries (default: 2)
 */
export async function executeStep<T>(
  page: Page,
  stepName: string,
  fn: () => Promise<T>,
  retries: number = 2
): Promise<T> {
  try {
    return await retryWithBackoff(fn, retries, 2000, stepName);
  } catch (error) {
    console.error(`\n🚨 CRITICAL ERROR in step: ${stepName}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);

    // Capture screenshot
    await captureErrorScreenshot(page, stepName.replace(/\s+/g, '-').toLowerCase());

    // Capture page state
    try {
      const url = page.url();
      const title = await page.title();
      console.error(`\n📍 Page State:`);
      console.error(`  URL: ${url}`);
      console.error(`  Title: ${title}`);
    } catch (e) {
      console.error('Could not capture page state');
    }

    throw new Error(`Step "${stepName}" failed: ${error.message}`);
  }
}

/**
 * Wait for element with retry
 * @param page - Playwright page
 * @param selector - Element selector
 * @param timeout - Timeout in ms (default: 10000)
 */
export async function waitForElementWithRetry(
  page: Page,
  selector: string,
  timeout: number = 10000
): Promise<void> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
  } catch (error) {
    console.error(`❌ Element not found: ${selector}`);
    await captureErrorScreenshot(page, `element-not-found-${selector.replace(/[^a-z0-9]/gi, '-')}`);
    throw error;
  }
}

/**
 * Continue on error - execute function but don't fail test
 * @param fn - Function to execute
 * @param stepName - Name of the step
 * @param page - Playwright page (optional, for screenshots)
 */
export async function continueOnError<T>(
  fn: () => Promise<T>,
  stepName: string,
  page?: Page
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.warn(`⚠️ ${stepName} failed but continuing: ${error.message}`);
    if (page) {
      await captureErrorScreenshot(page, stepName.replace(/\s+/g, '-').toLowerCase());
    }
    return null;
  }
}

/**
 * Execute a step with automatic screenshot on failure
 * @param page - Playwright page
 * @param stepDescription - Description of what's being done
 * @param fn - Function to execute
 */
export async function executeWithScreenshot<T>(
  page: Page,
  stepDescription: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    console.log(`🔄 ${stepDescription}...`);
    const result = await fn();
    console.log(`✅ ${stepDescription} - Success`);
    return result;
  } catch (error) {
    console.error(`❌ ${stepDescription} - FAILED`);
    console.error(`   Error: ${error.message}`);

    // Get stack trace to find the exact line
    const stack = error.stack || '';
    const stackLines = stack.split('\n');
    if (stackLines.length > 1) {
      console.error(`   Location: ${stackLines[1].trim()}`);
    }

    // Take screenshot with descriptive name
    const screenshotName = `${stepDescription.replace(/\s+/g, '-').toLowerCase()}-line-${getLineNumber(error)}`;
    await captureErrorScreenshot(page, screenshotName);

    throw new Error(`Failed at: ${stepDescription}\nReason: ${error.message}`);
  }
}

/**
 * Extract line number from error stack
 */
function getLineNumber(error: Error): string {
  try {
    const stack = error.stack || '';
    const match = stack.match(/:(\d+):\d+\)?$/m);
    return match ? match[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}
