import { test as base, chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { CredentialManager } from '../utils/credential-manager';

// Declare the types of your fixtures
type MyFixtures = {
  sharedContext: BrowserContext;
  sharedPage: Page;
};

// Extend base test with our fixtures
export const test = base.extend<MyFixtures>({
  // Create a shared browser context for all tests
  sharedContext: [async ({ }, use) => {
    // Launch browser once
    const browser = await chromium.launch({
      headless: CredentialManager.isHeadless(),
      slowMo: Number(process.env.SLOWMO) || 0
    });

    // Create context with viewport and other settings
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl()
    });

    // Use the same context for all tests
    await use(context);

    // Cleanup after all tests
    await context.close();
    await browser.close();
  }, { scope: 'worker' }], // 'worker' scope means reuse across tests in the same worker

  // Create a page from the shared context
  sharedPage: async ({ sharedContext }, use) => {
    const page = await sharedContext.newPage();
    await use(page);
    // Don't close the page here, let the context handle it
  }
});

export { expect } from '@playwright/test';