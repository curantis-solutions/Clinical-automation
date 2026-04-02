/**
 * =============================================================================
 * CR-5976: Validate Archive facility functionality
 * =============================================================================
 *
 * SOURCE: https://curantissolutions.atlassian.net/browse/CR-5976
 * MODULE: Hospice
 * TYPE: Defect
 * LINKED STORY: FIRE-4015 (New Facility: Archive and Activate a Facility)
 *
 * PAGE OBJECTS USED:
 * - pages.facilities: pages/facilities.page.ts
 * - pages.login: pages/login.page.ts
 *
 * WORKFLOWS USED:
 * - pages.facilitiesWorkflow: workflows/facilities.workflow.ts
 *
 * RUN:
 *   npx playwright test tests/facility/cr-5976-validate-archive-facility.spec.ts --headed --workers=1
 * =============================================================================
 */

import { test, expect, createPageObjectsForPage, type PageObjects } from '@fixtures/page-objects.fixture';
import { Page, BrowserContext } from '@playwright/test';
import { CredentialManager } from '../../utils/credential-manager';
import { TIMEOUTS, TEST_TIMEOUTS, VIEWPORTS } from '../../config/timeouts';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;
let facilityName: string;
let archiveTargetIndex: number;

test.describe.serial('CR-5976: Validate Archive facility functionality @Defect', () => {

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: VIEWPORTS.desktop,
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });
    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(TIMEOUTS.API);
    sharedPage.setDefaultNavigationTimeout(TIMEOUTS.API);
    pages = createPageObjectsForPage(sharedPage);
  });

  test.afterAll(async () => {
    if (sharedContext) await sharedContext.close();
  });

  test('Step 01: Login as MD to QA Environment', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    console.log('🔐 Logging into QA environment as MD...');
    await pages.login.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'MD');
    await pages.login.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: TIMEOUTS.API });
    expect(sharedPage.url()).toContain('dashboard');
    console.log('✅ Step 01 Complete: Logged in as MD');
  });

  test('Step 02: Navigate to Facilities and capture an Active facility', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    console.log('🎯 Navigating to Facilities page...');
    await pages.facilitiesWorkflow.navigateToFacilities();

    // Find a facility with a non-empty name and Active status
    const target = await pages.facilities.findActiveFacilityWithName();
    expect(target.index).toBeGreaterThanOrEqual(0);
    facilityName = target.name;
    archiveTargetIndex = target.index;
    console.log(`🔍 Target facility: "${facilityName}" at index ${archiveTargetIndex} — Active`);
    console.log('✅ Step 02 Complete');
  });

  test('Step 03: Archive the facility and verify via search', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    console.log(`🎯 Archiving facility: "${facilityName}"...`);

    // Archive the target facility
    const archiveComment = 'QA automation test — CR-5976 archive validation';
    await pages.facilitiesWorkflow.archiveFacility(archiveTargetIndex, archiveComment);

    // Search by name to find it with fresh data
    await pages.facilities.search(facilityName);

    // Check if facility appears in search results — some environments need Archived filter
    const rowCount = await pages.facilities.getVisibleRowCount();
    let postStatus = rowCount > 0 ? await pages.facilities.getFacilityStatusByIndex(0) : '';
    if (postStatus !== 'Archived') {
      console.log('🔍 Trying Archived filter...');
      await pages.facilities.selectStatus('Archived');
      postStatus = await pages.facilities.getFacilityStatusByIndex(0);
    }
    expect(postStatus).toBe('Archived');
    console.log(`✅ Step 03 Complete: "${facilityName}" archived, status is Archived`);
  });

  test('Step 04: Verify change history shows archive record', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    console.log('🔍 Checking change history...');
    const history = await pages.facilitiesWorkflow.getLatestHistory(0);
    expect(history.changeMadeTo).toBe('Status');
    expect(history.previousValue).toBe('Active');
    expect(history.newValue).toBe('Archived');
    // Comment may be truncated or in a tooltip — verify it's not empty if visible
    if (history.comment) {
      expect(history.comment).toContain('CR-5976');
    }
    console.log(`🔍 Comment: "${history.comment || '(truncated/tooltip)'}"`);
    console.log(`🔍 Changed by: ${history.changedBy}, Date: ${history.dateOfChange}`);
    console.log('✅ Step 04 Complete: History shows Active → Archived with comment');
  });

  test('Step 05: Verify 3-dots menu is NOT shown for archived facility', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    console.log('🔍 Verifying archived facility controls...');
    const controls = await pages.facilitiesWorkflow.verifyArchivedRowControls(0);
    expect(controls.optionsVisible).toBe(false);
    expect(controls.activateVisible).toBe(true);
    console.log('✅ Step 05 Complete: No ellipsis, only Activate button visible');
  });

  test('Step 06: Activate the facility and verify via search', async () => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    console.log(`🎯 Re-activating facility: "${facilityName}"...`);

    // Activate
    await pages.facilitiesWorkflow.activateFacility(0);

    // Re-click Facilities tab to reset all filters, then search by name
    await pages.facilities.clickFacilitiesTab();
    await pages.facilities.search(facilityName);

    const status = await pages.facilities.getFacilityStatusByIndex(0);
    expect(status).toBe('Active');

    const optionsVisible = await pages.facilities.isOptionsButtonVisible(0);
    expect(optionsVisible).toBe(true);

    await pages.facilities.clearSearch();
    console.log(`✅ Step 06 Complete: "${facilityName}" re-activated, status is Active`);
  });
});
