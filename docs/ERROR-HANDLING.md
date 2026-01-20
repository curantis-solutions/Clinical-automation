# Error Handling in Playwright Tests

This document explains the error handling strategies implemented in the test automation framework.

## Overview

The framework provides multiple strategies to handle failures gracefully:

1. **Retry with Exponential Backoff**
2. **Screenshot on Error**
3. **Page State Capture**
4. **Continue on Error**
5. **Wait with Retry**

## Usage Examples

### 1. Execute Step with Retry and Error Handling

```typescript
import { executeStep } from '../utils/error-handler';

// Wrap any critical step
await executeStep(
  page,
  'Complete Benefits Form',
  async () => {
    await benefitsPage.completeBenefitsForm(benefitData);
  },
  3 // Number of retries (optional, default: 2)
);
```

**What it does:**
- ✅ Retries the operation up to N times with exponential backoff
- ✅ Captures screenshot on failure
- ✅ Logs page URL and title
- ✅ Provides detailed error messages

### 2. Retry with Backoff (Manual)

```typescript
import { retryWithBackoff } from '../utils/error-handler';

const result = await retryWithBackoff(
  async () => {
    return await someFlakeyOperation();
  },
  3,      // retries
  1000,   // initial delay in ms
  'Some Flakey Operation' // step name for logging
);
```

### 3. Continue on Error (Non-Critical Steps)

For steps that can fail without breaking the entire test:

```typescript
import { continueOnError } from '../utils/error-handler';

// This will not throw, returns null on error
const result = await continueOnError(
  async () => {
    return await optionalStep();
  },
  'Optional Step',
  page // Optional: for screenshots
);

if (result) {
  console.log('Optional step succeeded');
} else {
  console.log('Optional step failed, continuing...');
}
```

### 4. Wait for Element with Retry

```typescript
import { waitForElementWithRetry } from '../utils/error-handler';

await waitForElementWithRetry(
  page,
  '[data-cy="submit-button"]',
  10000 // timeout in ms
);
```

### 5. Capture Screenshot Manually

```typescript
import { captureErrorScreenshot } from '../utils/error-handler';

try {
  await somethingRisky();
} catch (error) {
  await captureErrorScreenshot(page, 'risky-operation');
  throw error;
}
```

## Error Handling in Page Objects

You can also add retry logic directly in page objects:

```typescript
// In benefits.page.ts
async selectDropdownOption(optionText: string, retries: number = 3): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await this.page.locator('.dropdown').click();
      await this.page.locator('.option').filter({ hasText: optionText }).click();
      return; // Success
    } catch (error) {
      if (attempt === retries) throw error;

      console.log(`Retry ${attempt}/${retries} for dropdown selection`);
      await this.page.waitForTimeout(1000 * attempt); // Increasing delay
    }
  }
}
```

## Configuration

### Retry Configuration

You can configure retry behavior globally in `playwright.config.ts`:

```typescript
export default defineConfig({
  // Global test timeout
  timeout: 600000, // 10 minutes

  // Retry failed tests
  retries: process.env.CI ? 2 : 0,

  use: {
    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Capture video on failure
    video: 'retain-on-failure',

    // Capture trace on first retry
    trace: 'on-first-retry',
  },
});
```

### Per-Test Configuration

```typescript
test('My flaky test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes for this specific test

  // Your test code
});
```

## Best Practices

### ✅ DO:

1. **Wrap critical steps** with `executeStep()` for automatic retry and error capture
2. **Use meaningful step names** for easier debugging
3. **Add wait times** after actions that trigger animations or API calls
4. **Log progress** to understand which step failed
5. **Use continue-on-error** for optional/non-critical steps

### ❌ DON'T:

1. **Don't retry without limits** - infinite loops are bad!
2. **Don't ignore all errors** - some failures need investigation
3. **Don't use `force: true` everywhere** - it hides real issues
4. **Don't skip error logging** - you need to know what failed

## Debugging Failed Tests

When a test fails:

1. **Check console logs** - Look for the step that failed
2. **Review screenshots** - Located in `test-results/error-screenshots/`
3. **Check Playwright report** - Run `npx playwright show-report`
4. **Review test artifacts** - Videos and traces if configured

## Example: Complete Error Handling

**Using Fixtures (Recommended):**
```typescript
import { test } from '../fixtures/auth.fixture';
import { executeStep, continueOnError } from '../utils/error-handler';

test('Complete patient workflow with error handling', async ({ loginAsRN }) => {
  // Set timeout for long workflow
  test.setTimeout(600000);

  const patientPage = new PatientPage(loginAsRN);
  const benefitsPage = new BenefitsPage(loginAsRN);

  // Step 1: Create patient (critical - will retry)
  // Note: Login already handled by fixture
  await executeStep(loginAsRN, 'Create Patient', async () => {
    await patientPage.addPatient(patientData);
  }, 3);

  // Step 2: Optional notification check (non-critical)
  const hasNotification = await continueOnError(
    async () => {
      return await loginAsRN.locator('.notification').isVisible();
    },
    'Check Notification',
    loginAsRN
  );

  if (hasNotification) {
    console.log('Notification found');
  }

  // Step 3: Complete benefits (critical with more retries)
  await executeStep(loginAsRN, 'Complete Benefits', async () => {
    await benefitsPage.completeBenefitsForm(benefitData);
  }, 5); // More retries for flaky dropdowns
});
```

**Using Manual Login (For Workflow Tests):**
```typescript
import { test } from '@playwright/test';
import { executeStep, continueOnError } from '../utils/error-handler';

test('Complete patient workflow with error handling', async ({ page }) => {
  test.setTimeout(600000);

  const loginPage = new LoginPage(page);
  const patientPage = new PatientPage(page);

  // Step 1: Login (critical - will retry)
  await executeStep(page, 'Login', async () => {
    await loginPage.goto();
    await loginPage.login(username, password);
  });

  // Step 2: Create patient (critical - will retry)
  await executeStep(page, 'Create Patient', async () => {
    await patientPage.addPatient(patientData);
  }, 3);

  // Step 3: Optional notification check (non-critical)
  const hasNotification = await continueOnError(
    async () => {
      return await page.locator('.notification').isVisible();
    },
    'Check Notification',
    page
  );

  if (hasNotification) {
    console.log('Notification found');
  }

  // Step 4: Complete benefits (critical with more retries)
  await executeStep(page, 'Complete Benefits', async () => {
    await benefitsPage.completeBenefitsForm(benefitData);
  }, 5);
});
```

## Screenshots Location

All error screenshots are saved to:
```
test-results/error-screenshots/<step-name>-<timestamp>.png
```

Example:
```
test-results/error-screenshots/complete-benefits-form-2025-10-06T10-30-45-123Z.png
```

## Error Messages

The framework provides detailed error messages:

```
🚨 CRITICAL ERROR in step: Complete Benefits Form
Error message: Timeout 5000ms exceeded
Error stack: TimeoutError: page.waitForSelector...

📍 Page State:
  URL: https://example.com/benefits
  Title: Patient Benefits - Healthcare App

📸 Screenshot saved: test-results/error-screenshots/complete-benefits-form-2025-10-06T10-30-45.png

❌ Step "Complete Benefits Form" failed after 3 retries
```

## Common Patterns

### Pattern 1: Flaky Dropdown Selection

```typescript
await executeStep(page, 'Select Payer Level', async () => {
  await page.locator('[data-cy="payer-level"]').click();
  await page.waitForTimeout(1000); // Wait for animation
  await page.locator('.ng-option').filter({ hasText: 'Primary' }).click();
}, 3);
```

### Pattern 2: Navigation with Verification

```typescript
await executeStep(page, 'Navigate to Benefits', async () => {
  await page.goto('/benefits');
  await expect(page).toHaveURL(/.*benefits/);
  await expect(page.locator('h1')).toContainText('Benefits');
});
```

### Pattern 3: Form Submission with Confirmation

```typescript
await executeStep(page, 'Submit Form', async () => {
  await page.locator('[data-cy="submit"]').click();
  await page.waitForSelector('.success-message', { timeout: 10000 });
});
```

## Support

For issues or questions about error handling, contact the QA team or refer to the Playwright documentation:
- https://playwright.dev/docs/test-retries
- https://playwright.dev/docs/debug
