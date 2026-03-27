import { test, expect } from '../../fixtures/page-objects.fixture';
import * as dotenv from 'dotenv';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';
import { DateHelper } from '../../utils/date-helper';

dotenv.config({ path: '.env.local' });

/**
 * TC-11: Signed Status – Verbal, Written & Provider Orders
 *
 * Tests that verbal orders show NO, written orders show YES,
 * provider-entered orders show e-signed, and rejected orders display correctly.
 *  * will tune this later
 */
test.describe('TC-11: Signed Status – Verbal, Written & Provider Orders', () => {
  const todayFormatted = DateHelper.getTodaysDate();
  const physicianName = TestDataManager.getPhysician();

  test('Step 1-3: RN verbal order = NO, written order = YES', async ({ pages }) => {
    test.setTimeout(300000);

    await test.step('Login as RN', async () => {
      await pages.login.goto();
      const rnCreds = CredentialManager.getCredentials(undefined, 'RN');
      await pages.login.login(rnCreds.username, rnCreds.password);

      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.getPatientFromGrid(0);
      await pages.orderEntry.navigateToOrderEntry();
    });

    await test.step('Enter verbal order - signed status should be NO', async () => {
      await pages.orderEntry.addNonMedicationOrder({
        orderType: 'DME',
        name: 'Test DME Verbal Status',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Verbal',
      });

      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('No');
      console.log('Verbal order signed status: No');
    });

    await test.step('Enter written order - signed status should be YES', async () => {
      await pages.orderEntry.addNonMedicationOrder({
        orderType: 'Other',
        name: 'Test Other Written Status',
        startDate: todayFormatted,
        orderingProvider: physicianName,
        role: 'Registered Nurse (RN)',
        approvalType: 'Written',
      });

      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('Yes');
      console.log('Written order signed status: Yes');
    });
  });

  test('Step 4-6: Provider order = e-signed', async ({ pages }) => {
    test.setTimeout(300000);

    await test.step('Login as MD', async () => {
      await pages.login.goto();
      const mdCreds = CredentialManager.getCredentials(undefined, 'MD');
      await pages.login.login(mdCreds.username, mdCreds.password);

      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.getPatientFromGrid(0);
      await pages.orderEntry.navigateToOrderEntry();
    });

    await test.step('Enter order as MD - signed status should be e-signed', async () => {
      await pages.orderEntry.clickAddOrder();
      await pages.orderEntry.selectOrderType('DME');
      await pages.orderEntry.fillOrderName('Test DME Provider Order');
      await pages.orderEntry.setStartDate(todayFormatted);

      // MD - attestation checkbox
      await pages.orderEntry.clickAttestationCheckbox();
      await pages.orderEntry.submitOrder();

      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('e-signed');
      console.log('Provider order signed status: e-signed');
    });

    await test.step('Verify history shows electronically signed', async () => {
      await pages.orderEntry.clickCaretOnRow(0);
      const historyText = await pages.orderEntry.getHistoryText(0);
      expect(historyText).toContain('Electronically Signed');
      console.log('History confirms: order electronically signed');
    });
  });

  test('Step 7: Rejected order status', async ({ pages }) => {
    test.setTimeout(300000);

    await test.step('Login as MD and navigate to Provider Panel', async () => {
      await pages.login.goto();
      const mdCreds = CredentialManager.getCredentials(undefined, 'MD');
      await pages.login.login(mdCreds.username, mdCreds.password);

      await pages.providerPanel.navigateToProviderPanel();
    });

    await test.step('Reject an order', async () => {
      await pages.providerPanel.rejectOrder(0, 'Not appropriate');
    });

    await test.step('Verify rejected status on OE page', async () => {
      await pages.providerPanel.navigateToPatientOrderEntry(0);

      const signedStatus = await pages.orderEntry.getSignedStatus(0);
      expect(signedStatus).toContain('Rejected');
      console.log('Rejected order signed status: Rejected');
    });
  });
});
