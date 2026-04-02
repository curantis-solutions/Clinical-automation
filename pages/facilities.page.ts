import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { TIMEOUTS } from '../config/timeouts';

/**
 * Facilities Page Object
 * Handles interactions with the Facilities tab under Company / Location
 * Navigation: Rubik's cube > Location > Facilities tab
 */
export class FacilitiesPage extends BasePage {
  private readonly selectors = {
    // Tabs
    tabs: {
      teams: 'text=Teams',
      activityLog: 'text=Activity Log',
      facilities: 'text=Facilities',
      payers: 'text=Payers',
    },

    // Filters
    filters: {
      facilityTypeListbox: 'ion-select-popover ion-item, ion-select option',
      statusListbox: 'ion-select-popover ion-item, ion-select option',
    },

    // Grid (uses data-cy attributes with indexed rows)
    grid: {
      facilityName: (index: number) => `[data-cy="label-facilityName-${index}"]`,
      facilityType: (index: number) => `[data-cy="label-facilityType-${index}"]`,
      status: (index: number) => `[data-cy="label-status-${index}"]`,
      facilityOptions: (index: number) => `#optionsButtonFacility${index}`,
      expandRow: (index: number) => `[id="${index}showDetailsBtn"]`,
      activateButton: (index: number) => `#optionsButtonActivate${index}`,
    },

    // Options menu items (shown after clicking 3-dots)
    optionsMenu: {
      archive: 'button:has-text("Archive")',
      edit: 'button:has-text("Edit")',
      delete: 'button:has-text("Delete")',
    },

    // Archive confirmation dialog
    archiveDialog: {
      commentInput: 'textarea[placeholder="Enter required comment here"], input[placeholder="Enter required comment here"]',
      proceedButton: 'button:has-text("Proceed")',
      cancelButton: 'button:has-text("Cancel")',
    },

    // History section (visible in expanded row)
    history: {
      sectionLabel: 'text=History',
    },
  };

  /** Required facility type options per FIRE-4075 / Zephyr CR-5977 */
  static readonly REQUIRED_FACILITY_TYPE_OPTIONS = [
    'Q5002 - Assisted Living Facility',
    'Q5003 - Long Term Care or Non-Skilled Nursing',
    'Q5004 - Skilled Nursing Facility',
    'Q5005 - Inpatient Hospital',
    'Q5006 - Inpatient Hospice Facility',
    'Q5007 - Long term care hospital',
    'Q5008 - Inpatient Psychiatric Facility',
    'Q5009 - Place not otherwise specified',
    'Q5010 - Hospice Residential Facility',
  ];

  /** Expected status options */
  static readonly STATUS_OPTIONS = ['Active', 'Archived'];

  constructor(page: Page) {
    super(page);
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  async clickFacilitiesTab(): Promise<void> {
    await this.page.getByTestId('tab-Facilities').click();
    await this.page.waitForLoadState('networkidle');
    // Wait for first grid row to render
    await this.page.locator(this.selectors.grid.facilityName(0)).waitFor({ state: 'attached', timeout: TIMEOUTS.API });
    console.log('🎯 Clicked Facilities tab');
  }

  // ---------------------------------------------------------------------------
  // Filter interactions
  // ---------------------------------------------------------------------------

  private getFacilityTypeCombobox() {
    return this.page.getByRole('listbox').filter({ hasText: 'Facility Type' }).getByRole('combobox');
  }

  private getStatusCombobox() {
    return this.page.getByRole('listbox').filter({ hasText: 'Status' }).getByRole('combobox');
  }

  private getSearchBox() {
    return this.page.getByRole('searchbox', { name: 'Search' });
  }

  async isFacilityTypeFilterVisible(): Promise<boolean> {
    return await this.getFacilityTypeCombobox().isVisible();
  }

  async isStatusFilterVisible(): Promise<boolean> {
    return await this.getStatusCombobox().isVisible();
  }

  async isSearchBoxVisible(): Promise<boolean> {
    return await this.getSearchBox().isVisible();
  }

  /**
   * Open the Facility Type dropdown and return all option labels
   * Scoped to the expanded combobox to avoid picking up options from other dropdowns
   */
  async getFacilityTypeOptions(): Promise<string[]> {
    const combobox = this.getFacilityTypeCombobox();
    await combobox.click();
    await this.page.waitForTimeout(500);

    // Scope options to the Facility Type listbox container only
    const listbox = this.page.getByRole('listbox').filter({ hasText: 'Facility Type' });
    const options = listbox.getByRole('option');
    const count = await options.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text) labels.push(text.trim());
    }

    await this.page.keyboard.press('Escape');
    return labels;
  }

  /**
   * Open the Status dropdown and return all option labels
   * Scoped to the expanded combobox to avoid picking up options from other dropdowns
   */
  async getStatusOptions(): Promise<string[]> {
    const combobox = this.getStatusCombobox();
    await combobox.click();
    await this.page.waitForTimeout(500);

    // Scope options to the Status listbox container only
    const listbox = this.page.getByRole('listbox').filter({ hasText: 'Status' });
    const options = listbox.getByRole('option');
    const count = await options.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text) labels.push(text.trim());
    }

    await this.page.keyboard.press('Escape');
    return labels;
  }

  /**
   * Select a Facility Type filter option by its visible label
   */
  async selectFacilityType(optionLabel: string): Promise<void> {
    const combobox = this.getFacilityTypeCombobox();
    await combobox.click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('option', { name: optionLabel }).click();
    await this.page.waitForTimeout(2000);
    console.log(`📝 Selected Facility Type: ${optionLabel}`);
  }

  /**
   * Deselect the currently selected Facility Type option
   */
  async deselectFacilityType(optionLabel: string): Promise<void> {
    const combobox = this.getFacilityTypeCombobox();
    await combobox.click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('option', { name: optionLabel }).click();
    await this.page.waitForTimeout(2000);
    console.log(`🧹 Deselected Facility Type: ${optionLabel}`);
  }

  /**
   * Select a Status filter option
   */
  async selectStatus(optionLabel: string): Promise<void> {
    const combobox = this.getStatusCombobox();
    await combobox.click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('option', { name: optionLabel }).click();
    await this.page.waitForTimeout(2000);
    console.log(`📝 Selected Status: ${optionLabel}`);
  }

  /**
   * Deselect the currently selected Status option
   */
  async deselectStatus(optionLabel: string): Promise<void> {
    const combobox = this.getStatusCombobox();
    await combobox.click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('option', { name: optionLabel }).click();
    await this.page.waitForTimeout(2000);
    console.log(`🧹 Deselected Status: ${optionLabel}`);
  }

  /**
   * Type a search query into the search box and press Enter to initiate search
   */
  async search(query: string): Promise<void> {
    const searchBox = this.getSearchBox();
    await searchBox.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(2000);
    console.log(`🔍 Searched for: ${query}`);
  }

  /**
   * Clear the search box and press Enter to reset results
   */
  async clearSearch(): Promise<void> {
    const searchBox = this.getSearchBox();
    await searchBox.clear();
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(2000);
    console.log('🧹 Cleared search');
  }

  // ---------------------------------------------------------------------------
  // Grid data extraction (uses data-cy indexed selectors)
  // ---------------------------------------------------------------------------

  /**
   * Get the count of visible rows by checking how many data-cy indexed name labels exist
   */
  async getVisibleRowCount(): Promise<number> {
    await this.page.waitForTimeout(1000);
    let count = 0;
    while (await this.page.locator(this.selectors.grid.facilityName(count)).count() > 0) {
      count++;
    }
    return count;
  }

  /**
   * Get facility names visible in the current grid page
   */
  async getVisibleFacilityNames(): Promise<string[]> {
    await this.page.waitForTimeout(1000);
    const count = await this.getVisibleRowCount();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.page.locator(this.selectors.grid.facilityName(i)).textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  /**
   * Get facility types visible in the current grid page
   */
  async getVisibleFacilityTypes(): Promise<string[]> {
    await this.page.waitForTimeout(1000);
    const count = await this.getVisibleRowCount();
    const types: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.page.locator(this.selectors.grid.facilityType(i)).textContent();
      if (text) types.push(text.trim());
    }
    return types;
  }

  /**
   * Get statuses visible in the current grid page
   */
  async getVisibleStatuses(): Promise<string[]> {
    await this.page.waitForTimeout(1000);
    const count = await this.getVisibleRowCount();
    const statuses: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.page.locator(this.selectors.grid.status(i)).textContent();
      if (text) statuses.push(text.trim());
    }
    return statuses;
  }

  // ---------------------------------------------------------------------------
  // Archive / Activate interactions
  // ---------------------------------------------------------------------------

  /**
   * Click the 3-dots options button for a facility row
   */
  async clickFacilityOptions(index: number): Promise<void> {
    const optionsBtn = this.page.locator(this.selectors.grid.facilityOptions(index));
    await optionsBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT });
    await optionsBtn.click();
    // Wait for menu to appear
    const archiveOption = this.page.locator(this.selectors.optionsMenu.archive);
    await archiveOption.waitFor({ state: 'visible', timeout: TIMEOUTS.DROPDOWN });
  }

  /**
   * Click "Archive" from the options menu (must call clickFacilityOptions first)
   */
  async clickArchiveOption(): Promise<void> {
    const archiveBtn = this.page.locator(this.selectors.optionsMenu.archive);
    await archiveBtn.click();
    // Wait for archive dialog to appear
    const commentInput = this.page.getByRole('textbox', { name: 'Enter required comment here' });
    await commentInput.waitFor({ state: 'visible', timeout: TIMEOUTS.DIALOG });
  }

  /**
   * Fill the archive comment and click Proceed to confirm archive.
   * Waits for the API response, dialog close, and Angular re-render.
   */
  async confirmArchive(comment: string): Promise<void> {
    const commentInput = this.page.getByRole('textbox', { name: 'Enter required comment here' });
    await commentInput.fill(comment);

    // Set up response listener BEFORE clicking to capture the API call
    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('active-toggle') || resp.url().includes('facility'),
      { timeout: TIMEOUTS.API }
    );

    await this.page.getByRole('button', { name: 'Proceed' }).click();

    // Wait for the archive API to respond
    await responsePromise;
    // Wait for dialog to close and grid to settle
    await commentInput.waitFor({ state: 'hidden', timeout: TIMEOUTS.DIALOG });
    await this.page.waitForLoadState('networkidle');
    // Allow Angular to process the response and re-render the grid
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
  }

  /**
   * Cancel the archive dialog
   */
  async cancelArchive(): Promise<void> {
    const cancelBtn = this.page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();
    const commentInput = this.page.getByRole('textbox', { name: 'Enter required comment here' });
    await commentInput.waitFor({ state: 'hidden', timeout: TIMEOUTS.DIALOG });
  }

  /**
   * Click the Activate button for an archived facility row.
   * Note: Activate has NO confirmation popup — it activates immediately.
   */
  async clickActivate(index: number): Promise<void> {
    const activateBtn = this.page.locator(this.selectors.grid.activateButton(index));
    await activateBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT });

    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('active-toggle') || resp.url().includes('facility'),
      { timeout: TIMEOUTS.API }
    );

    await activateBtn.click();
    await responsePromise;
    await this.page.waitForLoadState('networkidle');
    // Allow Angular to process the response and re-render the grid
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
  }

  /**
   * Check if the 3-dots options button is visible for a given row.
   * Returns false for archived facilities (they show Activate instead).
   */
  async isOptionsButtonVisible(index: number): Promise<boolean> {
    const optionsBtn = this.page.locator(this.selectors.grid.facilityOptions(index));
    return await optionsBtn.isVisible();
  }

  /**
   * Check if the Activate button is visible for a given row.
   * Only visible for archived facilities.
   */
  async isActivateButtonVisible(index: number): Promise<boolean> {
    const activateBtn = this.page.locator(this.selectors.grid.activateButton(index));
    return await activateBtn.isVisible();
  }

  /**
   * Find the first facility in the grid that has a non-empty name and Active status.
   * Returns the index and name, or { index: -1, name: '' } if none found.
   * Useful for selecting a valid test target across tenants (some have empty names).
   */
  async findActiveFacilityWithName(): Promise<{ index: number; name: string }> {
    const rowCount = await this.getVisibleRowCount();
    for (let i = 0; i < rowCount; i++) {
      const nameLocator = this.page.locator(this.selectors.grid.facilityName(i));
      const statusLocator = this.page.locator(this.selectors.grid.status(i));
      const name = await nameLocator.textContent();
      const status = await statusLocator.textContent();
      if (name && name.trim().length > 0 && status?.trim() === 'Active') {
        return { index: i, name: name.trim() };
      }
    }
    return { index: -1, name: '' };
  }

  /**
   * Get the status text for a specific row by index
   */
  async getFacilityStatusByIndex(index: number): Promise<string> {
    const statusLocator = this.page.locator(this.selectors.grid.status(index));
    // Use API timeout since this is often called after filter changes that trigger API calls
    await statusLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.API });
    const text = await statusLocator.textContent();
    return text?.trim() ?? '';
  }

  // ---------------------------------------------------------------------------
  // Expand row / History
  // ---------------------------------------------------------------------------

  /**
   * Expand a facility row to show details and history.
   * Waits for the "History" label AND "Changes Made To" header to confirm full expansion.
   */
  async expandRow(index: number): Promise<void> {
    const expandBtn = this.page.locator(this.selectors.grid.expandRow(index));
    await expandBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.ELEMENT });
    await expandBtn.click();
    // Wait for the expanded section content to render — look for "Contact Name" which appears in details
    await this.page.getByText('Contact Name').first().waitFor({ state: 'visible', timeout: TIMEOUTS.API });
  }

  /**
   * Get the most recent history entry from the expanded facility row.
   * Extracts data by finding all text elements within the history table structure.
   */
  async getLatestHistoryEntry(): Promise<{
    changeMadeTo: string;
    previousValue: string;
    newValue: string;
    changedBy: string;
    dateOfChange: string;
    comment: string;
  }> {
    // Wait for history content to load — the word "Status" should appear in history data
    // if the facility was just archived/activated
    await this.page.getByText('Changes Made To').first().waitFor({ state: 'visible', timeout: TIMEOUTS.API });

    // Use evaluate to extract the history data row
    return await this.page.evaluate(() => {
      // Strategy: find all elements that contain exactly "Changes Made To" as their own text
      const allElements = Array.from(document.querySelectorAll('*'));
      let headerRow: Element | null = null;

      for (const el of allElements) {
        // Check direct text content (not children's text)
        const directText = Array.from(el.childNodes)
          .filter(n => n.nodeType === Node.TEXT_NODE)
          .map(n => n.textContent?.trim())
          .join('');
        if (directText === 'Changes Made To') {
          headerRow = el.parentElement;
          break;
        }
      }

      if (!headerRow) {
        // Fallback: try innerText match on leaf elements
        for (const el of allElements) {
          if (el.children.length === 0 && el.textContent?.trim() === 'Changes Made To') {
            headerRow = el.parentElement;
            break;
          }
        }
      }

      // Go up to the row container — "Changes Made To" is in a cell, cell is in the row
      // We need: cell (Changes Made To) → row (contains all header cells) → nextSibling (data row)
      if (headerRow && headerRow.nextElementSibling?.textContent?.trim()?.startsWith('Previous Value')) {
        // headerRow is actually the cell, not the row — go up one more level
        headerRow = headerRow.parentElement;
      }

      if (!headerRow) {
        return { changeMadeTo: '', previousValue: '', newValue: '', changedBy: '', dateOfChange: '', comment: '' };
      }

      // The first data row is the next sibling of the header row
      const dataRow = headerRow.nextElementSibling;
      if (!dataRow) {
        return { changeMadeTo: '', previousValue: '', newValue: '', changedBy: '', dateOfChange: '', comment: '' };
      }

      const cells = Array.from(dataRow.children).map(c => c.textContent?.trim() ?? '');

      return {
        changeMadeTo: cells[0] ?? '',
        previousValue: cells[1] ?? '',
        newValue: cells[2] ?? '',
        changedBy: cells[3] ?? '',
        dateOfChange: cells[4] ?? '',
        comment: cells[5] ?? '',
      };
    });
  }
}
