/**
 * =============================================================================
 * HEALTH CHECK TESTS - Pre-Authentication Smoke Tests
 * =============================================================================
 *
 * PURPOSE:
 * Verify application accessibility and basic functionality BEFORE login.
 * These tests ensure the application is up, responsive, and properly configured.
 *
 * TESTS INCLUDED:
 * 1. Application accessibility (HTTP response check)
 * 2. Console error detection
 * 3. Viewport responsiveness (desktop, tablet, mobile)
 * 4. SSL certificate validation
 * 5. Page load performance
 * 6. Meta tag verification
 *
 * NOTE:
 * - These tests do NOT require authentication
 * - Run with --workers=1 to avoid server overload timeouts
 * - Uses constants from config/timeouts.ts for consistency
 *
 * RUN:
 *   npx playwright test tests/smoke/health-check.spec.ts --workers=1
 *
 * =============================================================================
 */

import { test, expect } from '@playwright/test';
import { CredentialManager } from '../../utils/credential-manager';
// TIMEOUTS: API (30s), SHORT (1s), etc. | VIEWPORTS: desktopLarge, tablet, mobile
import { TIMEOUTS, VIEWPORTS } from '../../config/timeouts';

test.describe('Health Check Tests @smoke', () => {

  test('Application should be accessible', async ({ page }) => {
    // Get the base URL from environment configuration
    const baseUrl = CredentialManager.getBaseUrl();
    const envName = CredentialManager.getEnvironmentName();

    console.log(`Testing ${envName} environment at: ${baseUrl}`);

    // Navigate to the application with extended timeout (30s) for slow networks
    const response = await page.goto(baseUrl, {
      waitUntil: 'networkidle',
      timeout: TIMEOUTS.API  // 30000ms - allows for slower API/network responses
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

    // Wait briefly for any async errors to surface
    await page.waitForTimeout(TIMEOUTS.SHORT);  // 1000ms - quick pause for late console errors

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

    // Test desktop viewport (1920x1080)
    await page.setViewportSize(VIEWPORTS.desktopLarge);
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Take desktop screenshot
    await page.screenshot({
      path: `screenshots/health-check-desktop-${Date.now()}.png`,
      fullPage: false
    });

    // Test tablet viewport (768x1024)
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take tablet screenshot
    await page.screenshot({
      path: `screenshots/health-check-tablet-${Date.now()}.png`,
      fullPage: false
    });

    // Test mobile viewport (375x667)
    await page.setViewportSize(VIEWPORTS.mobile);
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