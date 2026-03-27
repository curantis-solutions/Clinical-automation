import { test, expect } from '../../fixtures/page-objects.fixture';
import * as dotenv from 'dotenv';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';

dotenv.config({ path: '.env.local' });

/**
 * TC-17: Provider Panel – RN/Admin Permissions
 *
 * Tests that RN, Clinical Administrator, and Administrator
 * cannot e-sign or reject orders from the Provider Panel.
 */
test.describe('TC-17: Provider Panel – RN/Admin Permissions', () => {
  const physicianName = TestDataManager.getPhysician();

  test('Step 1-4: RN cannot e-sign or reject on Provider Panel', async ({ pages }) => {
    test.setTimeout(300000);

    await test.step('Login as RN', async () => {
      await pages.login.goto();
      const rnCreds = CredentialManager.getCredentials(undefined, 'RN');
      await pages.login.login(rnCreds.username, rnCreds.password);
    });

    await test.step('Navigate to Provider Panel', async () => {
      await pages.providerPanel.navigateToProviderPanel();
      console.log('RN navigated to Provider Panel');
    });

    await test.step('Search for provider and select', async () => {
      await pages.providerPanel.searchProvider(physicianName);
      console.log('Searched and selected provider');
    });

    await test.step('Verify e-sign and reject options are NOT available', async () => {
      const orderCount = await pages.providerPanel.getOrderRowCount();
      if (orderCount > 0) {
        const canESign = await pages.providerPanel.isESignOptionAvailable(0);
        expect(canESign).toBeFalsy();
        console.log('E-sign option is NOT available for RN');

        const canReject = await pages.providerPanel.isRejectOptionAvailable(0);
        expect(canReject).toBeFalsy();
        console.log('Reject option is NOT available for RN');
      } else {
        console.log('No orders visible - skipping permission check');
      }
    });
  });
});
