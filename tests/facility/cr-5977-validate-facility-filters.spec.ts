/**
 * =============================================================================
 * CR-5977: VALIDATE FILTERS ON THE NEW FACILITY PAGE
 * =============================================================================
 *
 * SOURCE: https://curantissolutions.atlassian.net/browse/CR-5977
 * MODULE: Hospice - Company / Location > Facilities
 * TYPE: Defect
 *
 * PAGE OBJECTS USED:
 * - pages.login:              pages/login.page.ts
 * - pages.facilities:         pages/facilities.page.ts
 * - pages.facilitiesWorkflow: workflows/facilities.workflow.ts
 *
 * WORKFLOWS USED:
 * - pages.facilitiesWorkflow: workflows/facilities.workflow.ts
 *
 * RUN:
 *   npx playwright test tests/facility/cr-5977-validate-facility-filters.spec.ts --headed --workers=1
 * =============================================================================
 */

import { test, expect, createPageObjectsForPage, type PageObjects } from '@fixtures/page-objects.fixture';
import { Page, BrowserContext } from '@playwright/test';
import { CredentialManager } from '../../utils/credential-manager';
import { TIMEOUTS, TEST_TIMEOUTS, VIEWPORTS } from '../../config/timeouts';
import { FacilitiesPage } from '../../pages/facilities.page';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

test.describe.serial('CR-5977: Validate filters on the new facility page @defect', () => {

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

  // ===========================================================================
  // STEP 01: LOGIN AS MD
  // ===========================================================================
  test('Step 01: Login to QA Environment as MD', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    console.log('🔐 Logging into QA environment as MD...');

    await pages.login.goto();
    const credentials = CredentialManager.getCredentials(undefined, 'MD');
    await pages.login.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: TIMEOUTS.API });

    expect(sharedPage.url()).toContain('dashboard');
    console.log('✅ Step 01 Complete: Logged in as MD');
  });

  // ===========================================================================
  // STEP 02: NAVIGATE TO FACILITIES & VERIFY FILTERS PRESENT
  // Zephyr Step 1: Navigate to new facility page, verify filters
  // ===========================================================================
  test('Step 02: Navigate to Facilities and verify filters are present', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    console.log('🎯 Navigating to Facilities page...');

    await pages.facilitiesWorkflow.navigateToFacilities();
    const filters = await pages.facilitiesWorkflow.verifyFiltersPresent();

    expect(filters.facilityType).toBeTruthy();
    expect(filters.status).toBeTruthy();
    expect(filters.search).toBeTruthy();

    console.log('✅ Step 02 Complete: Facilities page loaded with all filters');
  });

  // ===========================================================================
  // STEP 03: VERIFY FACILITY TYPE FILTER OPTIONS
  // Zephyr Step 2: Verify options of Facility Type filter (Q5002-Q5010)
  // ===========================================================================
  test('Step 03: Verify Facility Type filter options', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    console.log('🔍 Verifying Facility Type dropdown options...');

    const options = await pages.facilitiesWorkflow.verifyFacilityTypeOptions();

    expect(options).toEqual(FacilitiesPage.REQUIRED_FACILITY_TYPE_OPTIONS);
    expect(options).toHaveLength(9);

    console.log('✅ Step 03 Complete: All 9 Facility Type options verified');
  });

  // ===========================================================================
  // STEP 04: VERIFY STATUS FILTER OPTIONS
  // Zephyr Step 3: Verify options of Status filter (Active, Archived)
  // ===========================================================================
  test('Step 04: Verify Status filter options', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    console.log('🔍 Verifying Status dropdown options...');

    const options = await pages.facilitiesWorkflow.verifyStatusOptions();

    expect(options).toEqual(FacilitiesPage.STATUS_OPTIONS);
    expect(options).toHaveLength(2);

    console.log('✅ Step 04 Complete: Status options verified (Active, Archived)');
  });

  // ===========================================================================
  // STEP 05: VERIFY SEARCH BAR
  // Zephyr Step 4: Verify Search bar — user should be able to search any string,
  //                search is initiated after clicking Enter
  // ===========================================================================
  test('Step 05: Verify Search bar and search functionality', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    console.log('🔍 Verifying Search bar...');

    // Pick a real facility name from the grid so the test works on any tenant/env
    const searchTerm = await pages.facilitiesWorkflow.getSearchTermFromGrid();
    console.log(`  → Using search term from grid: "${searchTerm}"`);

    const countBefore = await pages.facilities.getVisibleRowCount();
    const results = await pages.facilitiesWorkflow.searchFacility(searchTerm);

    expect(results.length).toBeGreaterThan(0);
    const hasMatch = results.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
    expect(hasMatch).toBeTruthy();
    console.log(`  → Search results (${results.length}): ${results.join(', ')}`);

    // Clear and verify grid resets
    const countAfterClear = await pages.facilitiesWorkflow.clearSearchAndGetCount();
    expect(countAfterClear).toBeGreaterThanOrEqual(countBefore);

    console.log('✅ Step 05 Complete: Search bar works correctly');
  });

  // ===========================================================================
  // STEP 06: APPLY COMBINED FILTERS
  // Zephyr Step 5: Apply diff filter combination and verify the result
  // ===========================================================================
  test('Step 06: Apply combined filter and verify results', async () => {
    test.setTimeout(TEST_TIMEOUTS.STANDARD);
    console.log('📝 Applying combined filters...');

    // First apply a Facility Type filter and capture a name from the filtered results
    const filteredTypes = await pages.facilitiesWorkflow.filterByFacilityType('Q5004 - Skilled Nursing Facility');
    console.log(`  → After type filter: ${filteredTypes.length} rows, types: ${filteredTypes.join(', ')}`);

    // All visible rows should match the selected type
    for (const type of filteredTypes) {
      expect(type).toContain('Skilled Nursing');
    }

    // Now add a search on top — pick a name from filtered results
    if (filteredTypes.length > 0) {
      const names = await pages.facilities.getVisibleFacilityNames();
      const searchTerm = names.find(n => n.length > 0) || '';

      if (searchTerm) {
        await pages.facilities.search(searchTerm);
        const combinedNames = await pages.facilities.getVisibleFacilityNames();
        const combinedTypes = await pages.facilities.getVisibleFacilityTypes();

        console.log(`  → After combined filter: ${combinedNames.length} rows`);
        expect(combinedNames.length).toBeGreaterThan(0);

        for (const type of combinedTypes) {
          expect(type).toContain('Skilled Nursing');
        }
      }
    }

    console.log('✅ Step 06 Complete: Combined filters working correctly');
  });
});
