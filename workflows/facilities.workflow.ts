import { Page } from '@playwright/test';
import { FacilitiesPage } from '../pages/facilities.page';
import { DashboardPage } from '../pages/dashboard.page';
import { TIMEOUTS } from '../config/timeouts';

/**
 * Facilities Workflow
 * Orchestrates multi-step flows on the Facilities page
 * Composes FacilitiesPage and DashboardPage for navigation + filter operations
 */
export class FacilitiesWorkflow {
  private readonly facilitiesPage: FacilitiesPage;
  private readonly dashboardPage: DashboardPage;

  constructor(private page: Page) {
    this.facilitiesPage = new FacilitiesPage(page);
    this.dashboardPage = new DashboardPage(page);
  }

  /**
   * Navigate from dashboard to the Facilities tab
   */
  async navigateToFacilities(): Promise<void> {
    await this.dashboardPage.navigateToModule('Location');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    await this.facilitiesPage.clickFacilitiesTab();
    console.log('✅ Navigated to Facilities page');
  }

  /**
   * Verify both filter dropdowns and search box are present
   * @returns Object with visibility flags for each filter
   */
  async verifyFiltersPresent(): Promise<{ facilityType: boolean; status: boolean; search: boolean }> {
    const facilityType = await this.facilitiesPage.isFacilityTypeFilterVisible();
    const status = await this.facilitiesPage.isStatusFilterVisible();
    const search = await this.facilitiesPage.isSearchBoxVisible();
    console.log(`🔍 Filters present — Facility Type: ${facilityType}, Status: ${status}, Search: ${search}`);
    return { facilityType, status, search };
  }

  /**
   * Verify Facility Type dropdown contains all expected options
   * @returns The actual options found in the dropdown
   */
  async verifyFacilityTypeOptions(): Promise<string[]> {
    const options = await this.facilitiesPage.getFacilityTypeOptions();
    console.log(`🔍 Facility Type options (${options.length}): ${options.join(', ')}`);
    return options;
  }

  /**
   * Verify Status dropdown contains all expected options
   * @returns The actual options found in the dropdown
   */
  async verifyStatusOptions(): Promise<string[]> {
    const options = await this.facilitiesPage.getStatusOptions();
    console.log(`🔍 Status options (${options.length}): ${options.join(', ')}`);
    return options;
  }

  /**
   * Apply Facility Type filter and return the filtered facility types
   */
  async filterByFacilityType(optionLabel: string): Promise<string[]> {
    await this.facilitiesPage.selectFacilityType(optionLabel);
    return await this.facilitiesPage.getVisibleFacilityTypes();
  }

  /**
   * Clear Facility Type filter by deselecting the option
   */
  async clearFacilityTypeFilter(optionLabel: string): Promise<void> {
    await this.facilitiesPage.deselectFacilityType(optionLabel);
  }

  /**
   * Apply Status filter and return the filtered statuses
   */
  async filterByStatus(optionLabel: string): Promise<string[]> {
    await this.facilitiesPage.selectStatus(optionLabel);
    return await this.facilitiesPage.getVisibleStatuses();
  }

  /**
   * Clear Status filter by deselecting the option
   */
  async clearStatusFilter(optionLabel: string): Promise<void> {
    await this.facilitiesPage.deselectStatus(optionLabel);
  }

  /**
   * Search for a facility and return visible names
   */
  async searchFacility(query: string): Promise<string[]> {
    await this.facilitiesPage.search(query);
    return await this.facilitiesPage.getVisibleFacilityNames();
  }

  /**
   * Get a search term from the first visible facility name in the grid.
   * This ensures the search test works across any tenant/environment.
   */
  async getSearchTermFromGrid(): Promise<string> {
    const names = await this.facilitiesPage.getVisibleFacilityNames();
    const validName = names.find(n => n.length > 0);
    if (!validName) throw new Error('No facility names found in grid to use as search term');
    return validName;
  }

  /**
   * Clear search and return visible row count
   */
  async clearSearchAndGetCount(): Promise<number> {
    await this.facilitiesPage.clearSearch();
    return await this.facilitiesPage.getVisibleRowCount();
  }

  /**
   * Apply combined Facility Type filter + search, return matching names
   */
  async filterByTypeAndSearch(typeOption: string, searchQuery: string): Promise<{ names: string[]; types: string[] }> {
    await this.facilitiesPage.selectFacilityType(typeOption);
    await this.facilitiesPage.search(searchQuery);
    const names = await this.facilitiesPage.getVisibleFacilityNames();
    const types = await this.facilitiesPage.getVisibleFacilityTypes();
    return { names, types };
  }

  // ---------------------------------------------------------------------------
  // Archive / Activate flows
  // ---------------------------------------------------------------------------

  /**
   * Archive a facility by row index: click 3-dots → Archive → enter comment → Proceed.
   * Returns the facility name that was archived (for later re-activation lookup).
   */
  async archiveFacility(index: number, comment: string): Promise<string> {
    const names = await this.facilitiesPage.getVisibleFacilityNames();
    const facilityName = names[index] ?? `Facility at index ${index}`;
    console.log(`🎯 Archiving facility: ${facilityName}`);

    await this.facilitiesPage.clickFacilityOptions(index);
    await this.facilitiesPage.clickArchiveOption();
    await this.facilitiesPage.confirmArchive(comment);

    console.log(`✅ Archive completed for: ${facilityName}`);
    return facilityName;
  }

  /**
   * Activate an archived facility by row index.
   * Note: Activate has NO confirmation popup — it activates immediately.
   */
  async activateFacility(index: number): Promise<void> {
    console.log(`🎯 Activating facility at index ${index}...`);
    await this.facilitiesPage.clickActivate(index);
    console.log('✅ Facility activated');
  }

  /**
   * Verify a facility's status in the grid by row index.
   */
  async verifyFacilityStatus(index: number, expectedStatus: string): Promise<string> {
    const actualStatus = await this.facilitiesPage.getFacilityStatusByIndex(index);
    console.log(`🔍 Facility status at index ${index}: "${actualStatus}" (expected: "${expectedStatus}")`);
    return actualStatus;
  }

  /**
   * Verify that the 3-dots menu is NOT visible for an archived facility,
   * and that the Activate button IS visible.
   */
  async verifyArchivedRowControls(index: number): Promise<{ optionsVisible: boolean; activateVisible: boolean }> {
    const optionsVisible = await this.facilitiesPage.isOptionsButtonVisible(index);
    const activateVisible = await this.facilitiesPage.isActivateButtonVisible(index);
    console.log(`🔍 Row ${index} controls — 3-dots: ${optionsVisible}, Activate: ${activateVisible}`);
    return { optionsVisible, activateVisible };
  }

  /**
   * Expand a facility row and read the latest history entry.
   */
  async getLatestHistory(index: number): Promise<{
    changeMadeTo: string;
    previousValue: string;
    newValue: string;
    changedBy: string;
    dateOfChange: string;
    comment: string;
  }> {
    console.log(`🔍 Expanding row ${index} to check history...`);
    await this.facilitiesPage.expandRow(index);
    const entry = await this.facilitiesPage.getLatestHistoryEntry();
    console.log(`🔍 History: ${entry.changeMadeTo} changed from "${entry.previousValue}" to "${entry.newValue}" by ${entry.changedBy}`);
    return entry;
  }
}
