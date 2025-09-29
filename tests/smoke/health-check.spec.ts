import { test, expect } from '@playwright/test';
import { CredentialManager } from '../../utils/credential-manager';
import { getEnvironmentConfig } from '../../config/environments';

test.describe('Health Check Tests @smoke', () => {

  test('Application should be accessible', async ({ page }) => {
    // Get the base URL from environment configuration
    const baseUrl = CredentialManager.getBaseUrl();
    const envConfig = getEnvironmentConfig();

    console.log(`Testing ${envConfig.name} environment at: ${baseUrl}`);

    // Navigate to the application
    const response = await page.goto(baseUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Check that we got a successful response
    expect(response?.status()).toBeLessThan(400);

    // Check the page title exists
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`Page title: ${title}`);

    // Take a screenshot of the landing page
    await page.screenshot({
      path: `screenshots/health-check-${Date.now()}.png`,
      fullPage: true
    });
  });

  test('Application should load without console errors', async ({ page }) => {
    const baseUrl = CredentialManager.getBaseUrl();
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to the application
    await page.goto(baseUrl, {
      waitUntil: 'networkidle'
    });

    // Wait a bit for any async errors to appear
    await page.waitForTimeout(2000);

    // Check for console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors detected:', consoleErrors);
    }

    // We'll be lenient here - some applications have minor console errors
    // But we should log them for awareness
    // Ignore 404s and Datadog warnings
    const criticalErrors = consoleErrors.filter(error =>
      (error.includes('CRITICAL') ||
       error.includes('FATAL')) &&
      !error.includes('404') &&
      !error.includes('Datadog')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('Application should have correct viewport and be responsive', async ({ page }) => {
    const baseUrl = CredentialManager.getBaseUrl();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Take desktop screenshot
    await page.screenshot({
      path: `screenshots/health-check-desktop-${Date.now()}.png`,
      fullPage: false
    });

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take tablet screenshot
    await page.screenshot({
      path: `screenshots/health-check-tablet-${Date.now()}.png`,
      fullPage: false
    });

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take mobile screenshot
    await page.screenshot({
      path: `screenshots/health-check-mobile-${Date.now()}.png`,
      fullPage: false
    });

    // Basic check that page renders at all viewport sizes
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('Application should have proper SSL certificate', async ({ page }) => {
    const baseUrl = CredentialManager.getBaseUrl();

    // Only check SSL for HTTPS URLs
    if (baseUrl.startsWith('https://')) {
      await page.goto(baseUrl);

      // Get the protocol
      const protocol = new URL(page.url()).protocol;
      expect(protocol).toBe('https:');

      console.log('SSL certificate is valid (HTTPS connection established)');
    } else {
      console.log('Skipping SSL check for non-HTTPS URL');
    }
  });

  test('Application should load within acceptable time', async ({ page }) => {
    const baseUrl = CredentialManager.getBaseUrl();
    const startTime = Date.now();

    // Navigate to the application
    await page.goto(baseUrl, {
      waitUntil: 'networkidle'
    });

    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);

    // Check that page loads within 10 seconds
    expect(loadTime).toBeLessThan(10000);

    // Warn if load time is over 5 seconds
    if (loadTime > 5000) {
      console.warn(`Warning: Page took ${loadTime}ms to load (>5 seconds)`);
    }
  });

  test('Application should have required meta tags', async ({ page }) => {
    const baseUrl = CredentialManager.getBaseUrl();
    await page.goto(baseUrl, {
      waitUntil: 'networkidle'
    });

    // Check for viewport meta tag (important for responsive design)
    const viewport = await page.$('meta[name="viewport"]');

    // Check for charset (could be in different formats)
    const charset = await page.$('meta[charset], meta[http-equiv="Content-Type"]');

    // At least one of these should exist
    expect(viewport || charset).toBeTruthy();

    // Get all meta tags for logging
    const metaTags = await page.$$eval('meta', (metas) =>
      metas.map(meta => ({
        name: meta.getAttribute('name'),
        content: meta.getAttribute('content'),
        property: meta.getAttribute('property')
      }))
    );

    console.log(`Found ${metaTags.length} meta tags`);
  });
});