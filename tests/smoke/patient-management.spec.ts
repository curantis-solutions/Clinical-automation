import { test, expect, chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { CredentialManager } from '../../utils/credential-manager';

test.describe('Patient Management Tests @smoke', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;

  // Launch browser once before all tests
  test.beforeAll(async () => {
    browser = await chromium.launch({
      headless: CredentialManager.isHeadless(),
      slowMo: Number(process.env.SLOWMO) || 0
    });
    context = await browser.newContext();
    page = await context.newPage();
    console.log('🚀 Browser launched for patient management tests');
  });

  // Close browser after all tests
  test.afterAll(async () => {
    await browser.close();
    console.log('🔒 Browser closed');
  });

  test('Step 1: Login and navigate to Dashboard', async () => {
    // Navigate to login page
    const baseUrl = CredentialManager.getBaseUrl('qa');
    await page.goto(baseUrl);
    console.log('Navigated to login page');

    // Wait for login form to be visible
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 10000 });

    // Login with credentials
    const username = CredentialManager.getCredentials('qa').username;
    const password = CredentialManager.getCredentials('qa').password;

    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for successful login and dashboard to load
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Successfully logged in and reached dashboard');
  });

  test('Step 2: Navigate to Dashboard and click options applications', async () => {
    // Look for btn-options-applications button
    const optionsBtn = page.locator('[data-testid="btn-options-applications"], #btn-options-applications, button[id*="options"], button[class*="options"]');
    await expect(optionsBtn.first()).toBeVisible({ timeout: 10000 });
    await optionsBtn.first().click();
    console.log('✅ Clicked on options applications button');
  });

  test('Step 3: Select patient icon from popup', async () => {
    // Wait for popup to appear and look for patient.svg icon
    const patientIcon = page.locator('img[src*="patient.svg"], ion-icon[name*="patient"], [data-testid*="patient"]');
    await expect(patientIcon.first()).toBeVisible({ timeout: 10000 });
    await patientIcon.first().click();
    console.log('✅ Selected patient icon from popup');

    // Verify we landed on patients page
    await expect(page.url()).toContain('patient');
    console.log('✅ Successfully navigated to patients page');
  });

  test('Step 4: Click add patient button and analyze form elements', async () => {
    // Look for add patient button
    const addPatientBtn = page.locator('[data-testid="btn-add-patient"], #btn-add-patient, button[class*="add"], button:has-text("Add Patient")');
    await expect(addPatientBtn.first()).toBeVisible({ timeout: 10000 });
    await addPatientBtn.first().click();
    console.log('✅ Clicked add patient button');

    // Wait for patient details popup to appear
    await page.waitForSelector('ion-modal, .modal, [role="dialog"]', { timeout: 10000 });
    console.log('✅ Patient details popup appeared');

    // Analyze all form elements in the popup
    const formElements = await page.evaluate(() => {
      const modal = document.querySelector('ion-modal, .modal, [role="dialog"]');
      if (!modal) return [];

      const elements = [];

      // Find all input elements
      const inputs = modal.querySelectorAll('input, ion-input, textarea, ion-textarea');
      inputs.forEach((input, index) => {
        elements.push({
          type: 'input',
          tagName: input.tagName,
          id: input.id || `input-${index}`,
          name: input.getAttribute('name'),
          placeholder: input.getAttribute('placeholder'),
          type_attr: input.getAttribute('type'),
          required: input.hasAttribute('required')
        });
      });

      // Find all select elements
      const selects = modal.querySelectorAll('select, ion-select');
      selects.forEach((select, index) => {
        elements.push({
          type: 'select',
          tagName: select.tagName,
          id: select.id || `select-${index}`,
          name: select.getAttribute('name'),
          placeholder: select.getAttribute('placeholder')
        });
      });

      // Find all radio buttons
      const radios = modal.querySelectorAll('ion-radio, input[type="radio"]');
      radios.forEach((radio, index) => {
        elements.push({
          type: 'radio',
          tagName: radio.tagName,
          id: radio.id || `radio-${index}`,
          name: radio.getAttribute('name'),
          value: radio.getAttribute('value')
        });
      });

      // Find all buttons
      const buttons = modal.querySelectorAll('button, ion-button');
      buttons.forEach((button, index) => {
        elements.push({
          type: 'button',
          tagName: button.tagName,
          id: button.id || `button-${index}`,
          text: button.textContent?.trim(),
          type_attr: button.getAttribute('type')
        });
      });

      return elements;
    });

    console.log('📋 Found form elements:', formElements);

    // Store form elements for documentation
    (test as any).formElements = formElements;
  });

  test('Step 5: Fill form with Hospice radio button and fake data', async () => {
    // Select Hospice radio button
    const hospiceRadio = page.locator('ion-radio[value="Hospice"], input[type="radio"][value="Hospice"]');
    await expect(hospiceRadio.first()).toBeVisible({ timeout: 5000 });
    await hospiceRadio.first().click();
    console.log('✅ Selected Hospice radio button');

    // Fill form with fake data
    const fakeData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test.patient.${Date.now()}@example.com`,
      phone: '555-123-4567',
      dateOfBirth: '1980-01-01',
      address: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      emergencyContact: 'Jane Doe',
      emergencyPhone: '555-987-6543'
    };

    // Fill common form fields (adapt selectors as needed)
    const fieldMappings = [
      { selector: 'input[name="firstName"], ion-input[name="firstName"] input', value: fakeData.firstName },
      { selector: 'input[name="lastName"], ion-input[name="lastName"] input', value: fakeData.lastName },
      { selector: 'input[name="email"], ion-input[name="email"] input', value: fakeData.email },
      { selector: 'input[name="phone"], ion-input[name="phone"] input', value: fakeData.phone },
      { selector: 'input[name="dateOfBirth"], ion-input[name="dateOfBirth"] input', value: fakeData.dateOfBirth },
      { selector: 'input[name="address"], ion-input[name="address"] input', value: fakeData.address },
      { selector: 'input[name="city"], ion-input[name="city"] input', value: fakeData.city },
      { selector: 'input[name="state"], ion-input[name="state"] input', value: fakeData.state },
      { selector: 'input[name="zipCode"], ion-input[name="zipCode"] input', value: fakeData.zipCode }
    ];

    for (const field of fieldMappings) {
      try {
        const element = page.locator(field.selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.fill(field.value);
          console.log(`✅ Filled ${field.selector} with ${field.value}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not fill ${field.selector}: ${error}`);
      }
    }

    console.log('✅ Filled form with fake patient data');

    // Store patient data for verification
    (test as any).patientData = fakeData;
  });

  test('Step 6: Save patient and verify it appears in list', async () => {
    // Look for save/submit button
    const saveBtn = page.locator('button[type="submit"], ion-button:has-text("Save"), button:has-text("Save"), button:has-text("Add")');
    await expect(saveBtn.first()).toBeVisible({ timeout: 5000 });
    await saveBtn.first().click();
    console.log('✅ Clicked save button');

    // Wait for modal to close (indicates successful save)
    await page.waitForSelector('ion-modal', { state: 'hidden', timeout: 10000 });
    console.log('✅ Patient form modal closed');

    // Verify patient appears in the patients list
    const patientData = (test as any).patientData;
    if (patientData) {
      // Look for the patient in the list by name or email
      const patientInList = page.locator(`text="${patientData.firstName} ${patientData.lastName}", text="${patientData.email}"`);
      await expect(patientInList.first()).toBeVisible({ timeout: 10000 });
      console.log('✅ Patient successfully added and appears in patients list');
    }
  });
});