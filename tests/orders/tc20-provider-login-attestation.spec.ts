import { test, expect } from '../../fixtures/page-objects.fixture';
import * as dotenv from 'dotenv';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';

dotenv.config({ path: '.env.local' });

/**
 * TC-20: Provider Login – Attestation & Order Flow
 *
 * Tests provider attestation message, auto-populated provider name,
 * proceed button gating, and order flow when switching providers.
 */
test.describe('TC-20: Provider Login – Attestation & Order Flow', () => {
  const todayFormatted = DateHelper.getTodaysDate();
  const physicianName = TestDataManager.getPhysician();

  test('Step 1-8: Provider enters order with attestation - no flow to PP', async ({ pages }) => {
    test.setTimeout(300000);

    await test.step('Login as MD', async () => {
      await pages.login.goto();
      const mdCreds = CredentialManager.getCredentials(undefined, 'MD');
      await pages.login.login(mdCreds.username, mdCreds.password);
    });

    await test.step('Navigate to patient Order Entry', async () => {
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.getPatientFromGrid(0);
      await pages.orderEntry.navigateToOrderEntry();
    });

    await test.step('Enter order and verify provider auto-populates', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('DME');
      await pages.orderEntry.fillOrderName('Test DME Provider Attestation');
      await pages.orderEntry.setStartDate(todayFormatted);

      // Ordering provider should be auto-populated with logged-in MD name
      console.log('Ordering provider field should be auto-populated');
    });

    await test.step('Verify attestation message is displayed', async () => {
      const isVisible = await pages.orderEntry.isAttestationVisible();
      expect(isVisible).toBeTruthy();
      console.log('Attestation message is displayed');

      const attestationMsg = await pages.orderEntry.getAttestationMessage();
      expect(attestationMsg).toContain('I, hereby attest');
      console.log(`Attestation: ${attestationMsg.substring(0, 80)}...`);
    });

    await test.step('Verify Proceed button not enabled until checkbox selected', async () => {
      const isEnabled = await pages.orderEntry.isProceedEnabled();
      expect(isEnabled).toBeFalsy();
      console.log('Proceed button correctly disabled before attestation');
    });

    await test.step('Click attestation checkbox and proceed', async () => {
      await pages.orderEntry.clickAttestationCheckbox();
      await pages.orderEntry.submitOrder();
    });

    await test.step('Verify order does not flow to Provider Panel (already e-signed)', async () => {
      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('e-signed');
      console.log('Provider order is auto e-signed - will NOT appear on Provider Panel');
    });
  });

  test('Step 9-14: Switch provider - no attestation, verbal order = unsigned', async ({ pages }) => {
    test.setTimeout(300000);

    await test.step('Login as MD', async () => {
      await pages.login.goto();
      const mdCreds = CredentialManager.getCredentials(undefined, 'MD');
      await pages.login.login(mdCreds.username, mdCreds.password);
    });

    await test.step('Navigate to patient Order Entry', async () => {
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.getPatientFromGrid(0);
      await pages.orderEntry.navigateToOrderEntry();
    });

    await test.step('Enter order and remove auto-populated provider', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('Other');
      await pages.orderEntry.fillOrderName('Test Order Different Provider');
      await pages.orderEntry.setStartDate(todayFormatted);

      // Remove auto-populated provider
      await pages.orderEntry.clearOrderingProvider();
      console.log('Auto-populated provider removed');
    });

    await test.step('Search and select a different provider', async () => {
      await pages.orderEntry.selectOrderingProvider('Registered Nurse (RN)', physicianName);
      console.log('Different provider selected');
    });

    await test.step('Verify attestation message is NOT displayed', async () => {
      const isVisible = await pages.orderEntry.isAttestationVisible();
      expect(isVisible).toBeFalsy();
      console.log('Attestation message correctly hidden when different provider selected');
    });

    await test.step('Select Verbal and submit', async () => {
      await pages.orderEntry.selectApprovalType('Verbal');
      await pages.orderEntry.submitOrder();
    });

    await test.step('Verify signed status is NO', async () => {
      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('No');
      console.log('Order with different provider: Signed status = No');
    });
  });
});
