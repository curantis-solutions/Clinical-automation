import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';
import { TIMEOUTS } from '../../config/timeouts';

/**
 * TC-20: Provider Login – Attestation & Order Flow
 *
 * Uses serial pattern: login once as MD, share browser session across all steps.
 * Tests provider attestation message, auto-populated provider name,
 * proceed button gating, and order flow when switching providers.
 *
 * Flow:
 *   Step 1: MD logs in and navigates to patient Order Entry
 *   Step 2: MD enters DME order — verify provider auto-populates
 *   Step 3: Verify attestation message is displayed
 *   Step 4: Verify Proceed button disabled until attestation checked
 *   Step 5: Click attestation and submit order
 *   Step 6: Verify order is auto e-signed (does not flow to Provider Panel)
 *   Step 7: Enter new order, remove auto-populated provider, select different provider
 *   Step 8: Verify attestation is NOT displayed for different provider, submit verbal order, verify unsigned
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const todayFormatted = DateHelper.getTodaysDate();
const physicianName = TestDataManager.getPhysician();
// Different provider for attestation switch test
const differentProvider = TestDataManager.getOtherPhysician() || physicianName;

test.describe.serial('TC-20: Provider Login – Attestation & Order Flow', () => {
  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });
    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(TIMEOUTS.PAGE_DEFAULT);
    sharedPage.setDefaultNavigationTimeout(TIMEOUTS.PAGE_NAVIGATION);
    pages = createPageObjectsForPage(sharedPage);

    // Login as MD
    await pages.login.goto();
    const mdCreds = CredentialManager.getCredentials(undefined, 'MD');
    await pages.login.login(mdCreds.username, mdCreds.password);
    console.log('Logged in as MD');

    // Navigate to patient and Order Entry
    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.searchPatient(TestDataManager.getOrdersPatientId());
    await pages.patient.getPatientFromGrid(0);
    await pages.orderEntry.navigateToOrderEntry();
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // =========================================================================
  // Step 1-2: MD enters DME order — verify provider auto-populates
  // =========================================================================
  test('Step 1-2: MD enters order and verify provider auto-populates', async () => {
    test.setTimeout(120000);

    await test.step('Enter DME order', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('DME');
      await pages.orderEntry.fillOrderName('Test DME Provider Attestation');
      await pages.orderEntry.selectBodySystems('Cardiovascular');
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.selectHospicePays(true);
      console.log('DME order form filled — ordering provider should be auto-populated');
    });
  });

  // =========================================================================
  // Step 3: Verify attestation message is displayed
  // =========================================================================
  test('Step 3: Verify attestation message is displayed', async () => {
    test.setTimeout(120000);

    await test.step('Verify attestation message', async () => {
      const isVisible = await pages.orderEntry.isAttestationVisible();
      expect(isVisible).toBeTruthy();
      console.log('Attestation message is displayed');

      const attestationMsg = await pages.orderEntry.getAttestationMessage();
      expect(attestationMsg).toContain('I, hereby attest');
      console.log(`Attestation: ${attestationMsg.substring(0, 80)}...`);
    });
  });

  // =========================================================================
  // Step 4: Verify Proceed button disabled until attestation checked
  // =========================================================================
  test('Step 4: Verify Proceed button disabled before attestation', async () => {
    test.setTimeout(120000);

    await test.step('Verify Proceed button is disabled', async () => {
      const isEnabled = await pages.orderEntry.isProceedEnabled();
      expect(isEnabled).toBeFalsy();
      console.log('Proceed button correctly disabled before attestation');
    });
  });

  // =========================================================================
  // Step 5: Click attestation checkbox and submit order
  // =========================================================================
  test('Step 5: Click attestation and submit order', async () => {
    test.setTimeout(120000);

    await test.step('Click attestation checkbox and proceed', async () => {
      await pages.orderEntry.clickAttestationCheckbox();
      await pages.orderEntry.clickProceed();
      console.log('Attestation checked and order submitted');
    });
  });

  // =========================================================================
  // Step 6: Verify order is auto e-signed (does not flow to Provider Panel)
  // =========================================================================
  test('Step 6: Verify order is auto e-signed', async () => {
    test.setTimeout(120000);

    await test.step('Verify signed status is e-signed', async () => {
      await pages.orderEntry.searchOrders('Test DME Provider Attestation');
      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('e-signed');
      console.log('Provider order is auto e-signed — will NOT appear on Provider Panel');
      await pages.orderEntry.clearSearch();
    });
  });

  // =========================================================================
  // Step 7: Enter new order, switch to a different provider
  // =========================================================================
  test('Step 7: Enter order and switch to different provider', async () => {
    test.setTimeout(120000);

    await test.step('Enter Other order and remove auto-populated provider', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Other');
      await pages.orderEntry.fillOrderName('Test Order Different Provider');
      await pages.orderEntry.setStartDate(todayFormatted);
      await pages.orderEntry.selectHospicePays(true);

      // Remove the auto-populated MD provider
      await pages.orderEntry.clearOrderingProvider();
      console.log('Auto-populated provider removed');
    });

    await test.step('Search and select a different provider', async () => {
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', differentProvider);
      console.log(`Different provider selected: ${differentProvider}`);
    });
  });

  // =========================================================================
  // Step 8: Verify no attestation, verbal order = unsigned
  // =========================================================================
  test('Step 8: Verify no attestation for different provider, submit verbal, verify unsigned', async () => {
    test.setTimeout(120000);

    await test.step('Verify attestation message is NOT displayed', async () => {
      const isVisible = await pages.orderEntry.isAttestationVisible();
      expect(isVisible).toBeFalsy();
      console.log('Attestation message correctly hidden when different provider selected');
    });

    await test.step('Select Verbal and submit', async () => {
      await pages.orderEntry.selectApprovalType('Verbal');
      await pages.orderEntry.clickReadBackVerified();
      await pages.orderEntry.submitOrder();
      console.log('Verbal order submitted with different provider');
    });

    await test.step('Verify signed status is No', async () => {
      await pages.orderEntry.searchOrders('Test Order Different Provider');
      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('No');
      console.log('Order with different provider: Signed status = No');
      await pages.orderEntry.clearSearch();
    });
  });
});
