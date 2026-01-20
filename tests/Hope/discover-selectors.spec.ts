import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { PatientPage } from '../../pages/patient.page';
import { loadTestData } from '../../utils/api-helper';
import { CredentialManager } from '../../utils/credential-manager';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Automated Selector Discovery Test
 *
 * This test automatically discovers stable selectors for HOPE sections
 * by analyzing the page structure and finding the best selector strategy
 */

test.describe('Discover HOPE Selectors Automatically', () => {
  test('Analyze and discover selectors for all sections', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes

    const testData = loadTestData();
    const patientId = testData.patientId;

    if (!patientId) {
      throw new Error('Patient ID not found');
    }

    console.log('\n🌍 Environment Configuration:');
    console.log(`   Environment: ${CredentialManager.getEnvironmentName()}`);
    console.log(`   Base URL: ${CredentialManager.getBaseUrl()}`);
    console.log(`📂 Using Patient ID: ${patientId}`);

    // Initialize page objects
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const patientPage = new PatientPage(page);

    // ============================================
    // Step 1: Login
    // ============================================
    console.log('\n🔐 Step 1: Login');
    await loginPage.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'RN');
    await loginPage.login(credentials.username, credentials.password);

    // ============================================
    // Step 2: Navigate to Patient
    // ============================================
    console.log('\n🔍 Step 2: Navigate to Patient');
    await dashboardPage.goto();
    await dashboardPage.navigateToModule('Patient');
    await patientPage.searchPatient(String(patientId));
    await page.waitForTimeout(5000);
    await patientPage.getPatientFromGrid(0);
    await page.waitForTimeout(5000);

    // ============================================
    // Step 3: Open Visit
    // ============================================
    console.log('\n🏥 Step 3: Opening Visit');
    await page.locator('[data-cy="btn-nav-bar-item-care-plan"]').click();
    await page.waitForTimeout(5000);
    await page.locator('[data-cy="label-visit-id"]').first().click();
    await page.waitForTimeout(5000);

    // ============================================
    // Step 4: Discover Selectors
    // ============================================
    console.log('\n🔍 Step 4: Discovering Selectors');

    const sections = [
      { name: 'Vitals', icon: 'vitals icon' },
      { name: 'Preferences', icon: 'preferences icon' },
      { name: 'Neurological', icon: 'neurological icon' },
      { name: 'Pain', icon: 'pain icon' },
      { name: 'Respiratory', icon: 'respiratory icon' },
      { name: 'Gastrointestinal', icon: 'gastrointestinal icon' },
      { name: 'Skin', icon: 'skin icon' },
      { name: 'Hospice Aide', icon: 'hospiceAide icon' },
      { name: 'Summary', icon: 'symptomSummary icon' },
    ];

    const discoveredSelectors: any = {};

    for (const section of sections) {
      console.log(`\n📋 Analyzing ${section.name} section...`);

      try {
        // Click section icon
        await page.getByRole('button', { name: new RegExp(section.icon) }).click();
        await page.waitForTimeout(3000);

        // Discover elements in this section
        const sectionSelectors = await page.evaluate((sectionName) => {
          const results: any = {
            section: sectionName,
            radioButtons: [],
            checkboxes: [],
            textInputs: [],
            numberInputs: [],
            buttons: [],
            dateTimePickers: [],
            selects: [],
          };

          // Find all radio buttons
          const radios = document.querySelectorAll('ion-radio, input[type="radio"]');
          radios.forEach((radio: any) => {
            const label = radio.closest('ion-item')?.textContent?.trim() ||
                         radio.closest('ion-label')?.textContent?.trim() ||
                         radio.getAttribute('aria-label');

            const dataCy = radio.getAttribute('data-cy');
            const id = radio.getAttribute('id');
            const name = radio.getAttribute('name');
            const value = radio.getAttribute('value');

            results.radioButtons.push({
              label: label?.substring(0, 100), // Limit label length
              dataCy,
              id,
              name,
              value,
              recommendation: dataCy
                ? `page.locator('[data-cy="${dataCy}"]')`
                : label
                ? `page.getByRole('radio', { name: '${label.substring(0, 50)}' })`
                : id?.startsWith('rb-')
                ? `page.locator('#${id}') // Warning: Dynamic ID`
                : null
            });
          });

          // Find all checkboxes
          const checkboxes = document.querySelectorAll('ion-checkbox, input[type="checkbox"]');
          checkboxes.forEach((checkbox: any) => {
            const label = checkbox.closest('ion-item')?.textContent?.trim() ||
                         checkbox.closest('ion-label')?.textContent?.trim() ||
                         checkbox.getAttribute('aria-label');

            const dataCy = checkbox.getAttribute('data-cy');
            const id = checkbox.getAttribute('id');
            const name = checkbox.getAttribute('name');

            results.checkboxes.push({
              label: label?.substring(0, 100),
              dataCy,
              id,
              name,
              recommendation: dataCy
                ? `page.locator('[data-cy="${dataCy}"]')`
                : label
                ? `page.getByRole('checkbox', { name: '${label.substring(0, 50)}' })`
                : id?.startsWith('checkbox-')
                ? `page.locator('#${id}') // Warning: Dynamic ID`
                : null
            });
          });

          // Find all text inputs
          const textInputs = document.querySelectorAll('ion-input[type="text"], ion-textarea, input[type="text"], textarea');
          textInputs.forEach((input: any) => {
            const label = input.closest('ion-item')?.querySelector('ion-label')?.textContent?.trim() ||
                         input.getAttribute('placeholder') ||
                         input.getAttribute('aria-label');

            const dataCy = input.getAttribute('data-cy');
            const id = input.getAttribute('id');
            const name = input.getAttribute('name');
            const placeholder = input.getAttribute('placeholder');

            results.textInputs.push({
              label: label?.substring(0, 100),
              dataCy,
              id,
              name,
              placeholder,
              recommendation: dataCy
                ? `page.locator('[data-cy="${dataCy}"]')`
                : placeholder
                ? `page.getByRole('textbox', { name: '${placeholder.substring(0, 50)}' })`
                : id
                ? `page.locator('#${id}')`
                : null
            });
          });

          // Find all buttons
          const buttons = document.querySelectorAll('ion-button, button');
          buttons.forEach((button: any) => {
            const text = button.textContent?.trim();
            const dataCy = button.getAttribute('data-cy');
            const id = button.getAttribute('id');

            results.buttons.push({
              text: text?.substring(0, 100),
              dataCy,
              id,
              recommendation: dataCy
                ? `page.locator('[data-cy="${dataCy}"]')`
                : text
                ? `page.getByRole('button', { name: '${text.substring(0, 50)}' })`
                : id
                ? `page.locator('#${id}')`
                : null
            });
          });

          // Find all datetime pickers
          const datetimes = document.querySelectorAll('ion-datetime, input[type="datetime-local"], input[type="date"]');
          datetimes.forEach((datetime: any) => {
            const dataCy = datetime.getAttribute('data-cy');
            const id = datetime.getAttribute('id');
            const name = datetime.getAttribute('name');

            results.dateTimePickers.push({
              dataCy,
              id,
              name,
              recommendation: dataCy
                ? `page.locator('[data-cy="${dataCy}"]')`
                : id?.startsWith('datetime-')
                ? `page.locator('#${id}') // Warning: Dynamic ID`
                : null
            });
          });

          // Find all selects/dropdowns
          const selects = document.querySelectorAll('ion-select, select');
          selects.forEach((select: any) => {
            const label = select.closest('ion-item')?.querySelector('ion-label')?.textContent?.trim();
            const dataCy = select.getAttribute('data-cy');
            const id = select.getAttribute('id');
            const name = select.getAttribute('name');

            results.selects.push({
              label: label?.substring(0, 100),
              dataCy,
              id,
              name,
              recommendation: dataCy
                ? `page.locator('[data-cy="${dataCy}"]')`
                : label
                ? `page.getByRole('button', { name: '${label.substring(0, 50)}' })`
                : id
                ? `page.locator('#${id}')`
                : null
            });
          });

          return results;
        }, section.name);

        discoveredSelectors[section.name] = sectionSelectors;

        console.log(`✅ Found in ${section.name}:`);
        console.log(`   - ${sectionSelectors.radioButtons.length} radio buttons`);
        console.log(`   - ${sectionSelectors.checkboxes.length} checkboxes`);
        console.log(`   - ${sectionSelectors.textInputs.length} text inputs`);
        console.log(`   - ${sectionSelectors.buttons.length} buttons`);
        console.log(`   - ${sectionSelectors.dateTimePickers.length} datetime pickers`);
        console.log(`   - ${sectionSelectors.selects.length} selects`);

      } catch (error: any) {
        console.log(`⚠️ Could not analyze ${section.name}: ${error.message}`);
      }
    }

    // ============================================
    // Step 5: Save Discovered Selectors
    // ============================================
    console.log('\n💾 Step 5: Saving Discovered Selectors');

    const outputPath = path.join(process.cwd(), 'discovered-selectors.json');
    fs.writeFileSync(outputPath, JSON.stringify(discoveredSelectors, null, 2));

    console.log(`\n✅ Selectors saved to: ${outputPath}`);
    console.log('\n📊 Summary:');

    Object.entries(discoveredSelectors).forEach(([section, data]: [string, any]) => {
      console.log(`\n${section}:`);
      console.log(`  Radio Buttons: ${data.radioButtons.length}`);
      console.log(`  Checkboxes: ${data.checkboxes.length}`);
      console.log(`  Text Inputs: ${data.textInputs.length}`);
      console.log(`  Buttons: ${data.buttons.length}`);
    });

    console.log('\n🎉 Selector discovery complete!');
    console.log('📝 Review the discovered-selectors.json file for all findings.');
  });
});
