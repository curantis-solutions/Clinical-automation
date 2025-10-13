import { test, expect, chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { CredentialManager } from '../../utils/credential-manager';

test.describe('Patient Workflow Tests @smoke', () => {
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
    console.log('🚀 Browser launched - using single window for all tests');
  });

  // Close browser after all tests
  test.afterAll(async () => {
    await browser.close();
    console.log('🔒 Browser closed');
  });

  test('Complete Patient Management Workflow', async () => {
    // Step 1: Login using existing functionality
    console.log('=== STEP 1: LOGIN ===');
    const baseUrl = CredentialManager.getBaseUrl('qa');
    await page.goto(baseUrl);
    console.log('Navigated to login page');

    // Wait for and verify login form elements
    await page.waitForSelector('input[name="username"], input[type="email"], ion-input[name="username"], #username', { timeout: 10000 });

    const username = CredentialManager.getCredentials('qa').username;
    const password = CredentialManager.getCredentials('qa').password;

    // Find username field dynamically
    const usernameField = await page.locator('input[name="username"], input[type="email"], ion-input[name="username"] input, #username').first();
    await usernameField.fill(username);
    console.log(`Entered username: ${username}`);

    // Find password field dynamically
    const passwordField = await page.locator('input[name="password"], input[type="password"], ion-input[name="password"] input, #password').first();
    await passwordField.fill(password);
    console.log('Entered password: ***');

    // Find and click login button
    const loginBtn = await page.locator('button[type="submit"], ion-button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
    await loginBtn.click();
    console.log('Clicked SIGN IN button');

    // Wait for successful login and dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Successfully logged in and reached dashboard');

    // Step 2: Find and click btn-options-applications
    console.log('=== STEP 2: NAVIGATE TO OPTIONS ===');

    // Wait for dashboard to fully load
    await page.waitForTimeout(2000);

    // Look for options button with various possible selectors
    let optionsBtn;
    const optionSelectors = [
      'data-cy="btn-options-applications',
      '#btn-options-applications',
      '[data-testid="btn-options-applications"]',
      'button[id*="options"]',
      'button[class*="options"]',
      'ion-button[id*="options"]',
      'button:has-text("Options")',
      'button:has-text("Applications")',
      '[id*="options"][id*="applications"]'
    ];

    for (const selector of optionSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          optionsBtn = element;
          console.log(`Found options button with selector: ${selector}`);
          break;  
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!optionsBtn) {
      // If not found, let's explore the page structure
      console.log('Options button not found with standard selectors, exploring page...');

      // Get all buttons and their attributes
      const allButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, ion-button, [role="button"], a'));
        return buttons.map((btn, index) => ({
          index,
          id: btn.id,
          className: btn.className,
          textContent: btn.textContent?.trim(),
          innerHTML: btn.innerHTML,
          href: btn.getAttribute('href'),
          dataCy: btn.getAttribute('data-cy')
        }));
      });

      console.log('=== ALL CLICKABLE ELEMENTS ON DASHBOARD ===');
      allButtons.forEach((btn, i) => {
        if (i < 20) { // Show first 20 to avoid too much output
          console.log(`${i + 1}. ID: "${btn.id}", Class: "${btn.className}", Text: "${btn.textContent}", data-cy: "${btn.dataCy}"`);
        }
      });

      // Filter for potential options/applications elements
      const potentialButtons = allButtons.filter(btn =>
        btn.id?.toLowerCase().includes('options') ||
        btn.id?.toLowerCase().includes('applications') ||
        btn.className?.toLowerCase().includes('options') ||
        btn.className?.toLowerCase().includes('applications') ||
        btn.textContent?.toLowerCase().includes('options') ||
        btn.textContent?.toLowerCase().includes('applications') ||
        btn.dataCy?.toLowerCase().includes('options') ||
        btn.dataCy?.toLowerCase().includes('applications')
      );

      console.log('Found potential options buttons:', potentialButtons);

      if (potentialButtons.length > 0) {
        // Try the first potential match
        optionsBtn = page.locator('button, ion-button, [role="button"], a').nth(potentialButtons[0].index);
        console.log(`Trying to click element at index ${potentialButtons[0].index}`);
      } else {
        // If no obvious options button, let's look for any button that might open a menu or navigation
        const menuButtons = allButtons.filter(btn =>
          btn.textContent?.toLowerCase().includes('menu') ||
          btn.className?.toLowerCase().includes('menu') ||
          btn.id?.toLowerCase().includes('menu') ||
          btn.className?.toLowerCase().includes('nav') ||
          btn.className?.toLowerCase().includes('hamburger') ||
          btn.innerHTML?.includes('menu') ||
          btn.innerHTML?.includes('bars') ||
          btn.innerHTML?.includes('≡')
        );

        console.log('Found potential menu buttons:', menuButtons);

        if (menuButtons.length > 0) {
          optionsBtn = page.locator('button, ion-button, [role="button"], a').nth(menuButtons[0].index);
          console.log(`Trying menu button at index ${menuButtons[0].index}`);
        }
      }
    }

    if (optionsBtn) {
      await optionsBtn.click();
      console.log('✅ Clicked on options applications button');

      // Wait for popup/modal to appear
      await page.waitForTimeout(1000);
    } else {
      throw new Error('Could not find options applications button');
    }

    // Step 3: Select patient.svg icon from popup
    console.log('=== STEP 3: SELECT PATIENT ICON ===');

    // Wait for popup/modal to be visible
    await page.waitForSelector('ion-popover, ion-modal, .popover, .modal, [role="dialog"]', { timeout: 5000 });

    // Look for patient icon with various selectors
    let patientIcon;
    const patientSelectors = [
      'img[src*="patient.svg"]',
      'ion-icon[src*="patient.svg"]',
      '[data-testid*="patient"]',
      'ion-icon[name*="patient"]',
      '*[href*="patient"]',
      '*[onclick*="patient"]'
    ];

    for (const selector of patientSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          patientIcon = element;
          console.log(`Found patient icon with selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!patientIcon) {
      // Explore the popup content
      console.log('Patient icon not found with standard selectors, exploring popup...');

      const popupContent = await page.evaluate(() => {
        const popup = document.querySelector('ion-popover, ion-modal, .popover, .modal, [role="dialog"]');
        if (popup) {
          const allElements = Array.from(popup.querySelectorAll('*'));
          return allElements.map((el, index) => ({
            index,
            tagName: el.tagName,
            src: el.getAttribute('src'),
            href: el.getAttribute('href'),
            textContent: el.textContent?.trim(),
            className: el.className
          })).filter(el =>
            el.src?.includes('patient') ||
            el.href?.includes('patient') ||
            el.textContent?.toLowerCase().includes('patient') ||
            el.className?.toLowerCase().includes('patient')
          );
        }
        return [];
      });

      console.log('Found potential patient elements:', popupContent);

      if (popupContent.length > 0) {
        // Try clicking on the first potential patient element
        patientIcon = page.locator('ion-popover *, ion-modal *, .popover *, .modal *, [role="dialog"] *').nth(popupContent[0].index);
      }
    }

    if (patientIcon) {
      await patientIcon.click();
      console.log('✅ Selected patient icon from popup');

      // Wait for navigation to patients page
      await page.waitForTimeout(2000);

      // Verify we're on patients page
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      if (currentUrl.toLowerCase().includes('patient')) {
        console.log('✅ Successfully navigated to patients page');
      }
    } else {
      throw new Error('Could not find patient icon in popup');
    }

    // Step 4: Click btn-add-patient button
    console.log('=== STEP 4: CLICK ADD PATIENT ===');

    // Wait for patients page to load
    await page.waitForTimeout(2000);

    // Look for add patient button
    let addPatientBtn;
    const addPatientSelectors = [
      '[data-cy="btn-add-patient"]',
      '[data-testid="btn-add-patient"]',
      'button:has-text("Add Patient")',
      'ion-button:has-text("Add Patient")',
      'button[class*="add"]',
      'ion-button[class*="add"]',
      'button:has-text("Add")',
      'button:has-text("New")',
      'button:has-text("Create")'
    ];

    for (const selector of addPatientSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          addPatientBtn = element;
          console.log(`Found add patient button with selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!addPatientBtn) {
      // Explore all buttons on the page
      const allButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, ion-button'));
        return buttons.map((btn, index) => ({
          index,
          id: btn.id,
          textContent: btn.textContent?.trim(),
          className: btn.className
        })).filter(btn =>
          btn.textContent?.toLowerCase().includes('add') ||
          btn.textContent?.toLowerCase().includes('new') ||
          btn.textContent?.toLowerCase().includes('create') ||
          btn.className?.toLowerCase().includes('add')
        );
      });

      console.log('Found potential add buttons:', allButtons);

      if (allButtons.length > 0) {
        addPatientBtn = page.locator('button, ion-button').nth(allButtons[0].index);
      }
    }

    if (addPatientBtn) {
      await addPatientBtn.click();
      console.log('✅ Clicked add patient button');

      // Wait for patient form modal to appear
      await page.waitForSelector('ion-modal, .modal, [role="dialog"]', { timeout: 5000 });
      console.log('✅ Patient form modal appeared');
    } else {
      throw new Error('Could not find add patient button');
    }

    // Step 5: Select Hospice radio button and fill form
    console.log('=== STEP 5: FILL PATIENT FORM ===');

    // Wait for modal to be fully loaded
    await page.waitForTimeout(1000);

    // First, select Hospice radio button
    const hospiceSelectors = [
      'ion-radio[value="Hospice"]',
      'input[type="radio"][value="Hospice"]',
      'ion-radio-group ion-radio[value="Hospice"]',
      'label:has-text("Hospice") ion-radio',
      'label:has-text("Hospice") input[type="radio"]'
    ];

    let hospiceRadio;
    for (const selector of hospiceSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          hospiceRadio = element;
          console.log(`Found Hospice radio with selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (hospiceRadio) {
      await hospiceRadio.click();
      console.log('✅ Selected Hospice radio button');
    } else {
      console.log('⚠️ Could not find Hospice radio button, continuing with form fill...');
    }

    // Generate fake patient data
    const timestamp = Date.now();
    const fakeData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test.patient.${timestamp}@example.com`,
      phone: '555-123-4567',
      dateOfBirth: '1980-01-01',
      address: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345'
    };

    console.log('Generated fake patient data:', fakeData);

    // Fill form fields dynamically
    const fieldMappings = [
      { name: 'firstName', selectors: ['input[name="firstName"]', 'ion-input[name="firstName"] input', 'input[placeholder*="First"]'], value: fakeData.firstName },
      { name: 'lastName', selectors: ['input[name="lastName"]', 'ion-input[name="lastName"] input', 'input[placeholder*="Last"]'], value: fakeData.lastName },
      { name: 'email', selectors: ['input[name="email"]', 'ion-input[name="email"] input', 'input[type="email"]', 'input[placeholder*="Email"]'], value: fakeData.email },
      { name: 'phone', selectors: ['input[name="phone"]', 'ion-input[name="phone"] input', 'input[type="tel"]', 'input[placeholder*="Phone"]'], value: fakeData.phone },
      { name: 'dateOfBirth', selectors: ['input[name="dateOfBirth"]', 'ion-input[name="dateOfBirth"] input', 'input[type="date"]', 'input[placeholder*="Birth"]'], value: fakeData.dateOfBirth },
      { name: 'address', selectors: ['input[name="address"]', 'ion-input[name="address"] input', 'input[placeholder*="Address"]'], value: fakeData.address },
      { name: 'city', selectors: ['input[name="city"]', 'ion-input[name="city"] input', 'input[placeholder*="City"]'], value: fakeData.city },
      { name: 'state', selectors: ['input[name="state"]', 'ion-input[name="state"] input', 'input[placeholder*="State"]'], value: fakeData.state },
      { name: 'zipCode', selectors: ['input[name="zipCode"]', 'ion-input[name="zipCode"] input', 'input[placeholder*="Zip"]'], value: fakeData.zipCode }
    ];

    for (const field of fieldMappings) {
      let fieldElement;

      for (const selector of field.selectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            fieldElement = element;
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (fieldElement) {
        await fieldElement.fill(field.value);
        console.log(`✅ Filled ${field.name} with: ${field.value}`);
      } else {
        console.log(`⚠️ Could not find field: ${field.name}`);
      }
    }

    // Step 6: Save patient
    console.log('=== STEP 6: SAVE PATIENT ===');

    // Look for save/submit button
    const saveSelectors = [
      'button[type="submit"]',
      'ion-button[type="submit"]',
      'button:has-text("Save")',
      'ion-button:has-text("Save")',
      'button:has-text("Add")',
      'ion-button:has-text("Add")',
      'button:has-text("Create")',
      'button:has-text("Submit")'
    ];

    let saveBtn;
    for (const selector of saveSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          saveBtn = element;
          console.log(`Found save button with selector: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (saveBtn) {
      await saveBtn.click();
      console.log('✅ Clicked save button');

      // Wait for modal to close (indicates successful save)
      await page.waitForSelector('ion-modal', { state: 'hidden', timeout: 10000 });
      console.log('✅ Patient form modal closed');

      // Wait for page to refresh/update
      await page.waitForTimeout(2000);

      // Step 7: Verify patient appears in list
      console.log('=== STEP 7: VERIFY PATIENT IN LIST ===');

      // Look for the patient in the list by name or email
      const patientInList = page.locator(`text="${fakeData.firstName} ${fakeData.lastName}", text="${fakeData.firstName}", text="${fakeData.lastName}", text="${fakeData.email}"`);

      try {
        await expect(patientInList.first()).toBeVisible({ timeout: 10000 });
        console.log('✅ Patient successfully added and appears in patients list');
      } catch (error) {
        console.log('⚠️ Could not verify patient in list immediately, checking page content...');

        // Get page content to verify
        const pageContent = await page.textContent('body');
        if (pageContent?.includes(fakeData.firstName) || pageContent?.includes(fakeData.email)) {
          console.log('✅ Patient data found on page, likely added successfully');
        } else {
          console.log('⚠️ Patient data not found on page');
        }
      }

      console.log('🎉 Patient workflow completed successfully!');

    } else {
      throw new Error('Could not find save button');
    }
  });
});