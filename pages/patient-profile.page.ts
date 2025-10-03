import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Patient Profile Page Object
 * Handles patient profile sections: Patient Details, Care Team, Benefits, etc.
 */
export class PatientProfilePage extends BasePage {
  // Selectors organized by section
  private readonly selectors = {
    // Navigation
    profileTab: '[data-cy="btn-nav-bar-item-profile"]',

    // Patient Details Section
    patientDetailsHeader: '[id="tab-t0-0"]',

    // Caller Form
    addCallerBtn: '[data-cy="btn-add-caller"]',
    callerReferralType: '[data-cy="select-referral-type"] > #undefined > .button-inner',
    callerRelation: '[data-cy="select-relation"]',
    radioButtonOption: (index: number) => `[id*='rb-']`,
    callerPhysicianSearch: 'input[data-cy="input-search-physician"]',
    physicianSearchResult: '[class*="searchOptionName"]',
    saveCallerBtn: '[data-cy="btn-save"]',

    // Referrer Form
    addReferrerBtn: '[data-cy="btn-add-referrer"]',
    sameAsCallerCheckbox: '[data-cy="checkbox-same-as-caller"]',
    saveReferrerBtn: '[data-cy="btn-save"]',

    // Referring Physician Form
    addReferringPhysicianBtn: '[data-cy="btn-add-referring-physician"]',
    sameAsReferrerCheckbox: '[data-cy="checkbox-same-as-referrer"]',
    saveReferringPhysicianBtn: '[data-cy="btn-save"]',

    // Ordering Physician Form
    addOrderingPhysicianBtn: '[data-cy="btn-add-ordering-physician"]',
    sameAsReferringCheckbox: '[data-cy="checkbox-same-as-referrer"]',
    saveOrderingPhysicianBtn: '[data-cy="btn-save"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Profile tab
   */
  async navigateToProfileTab(): Promise<void> {
    await this.page.waitForTimeout(2000); // Wait for page to stabilize after patient selection
    await this.waitForElement(this.selectors.profileTab);
    await this.page.locator(this.selectors.profileTab).click();
    await this.page.waitForTimeout(3000); // Wait for profile to load
    console.log('✅ Navigated to Profile tab');
  }

  /**
   * Search and select a physician from dropdown
   * @param physicianName - Full name of the physician to search
   */
  private async searchAndSelectPhysician(physicianName: string): Promise<void> {
    const searchInput = this.page.locator(this.selectors.callerPhysicianSearch);
    await searchInput.click({ clickCount: 3 }); // Select all existing text
    await searchInput.fill(physicianName);
    await this.page.waitForTimeout(1000); // Wait for search results

    // Click on the search result containing the physician name
    const result = this.page.locator(this.selectors.physicianSearchResult).filter({ hasText: physicianName });
    await result.click();
    await this.page.waitForTimeout(1000);
    console.log(`✅ Selected physician: ${physicianName}`);
  }

  /**
   * Select a radio button option by index
   * @param index - Index of the radio button (0-based)
   */
  private async selectRadioOption(index: number): Promise<void> {
    const radioButtons = this.page.locator(this.selectors.radioButtonOption(index));
    await radioButtons.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Add Caller information
   * @param physicianName - Name of the physician to search and select
   * @param referralTypeIndex - Index of referral type (default: 0 for first option)
   * @param relationIndex - Index of relation (default: 16)
   */
  async addCaller(
    physicianName: string,
    referralTypeIndex: number = 0,
    relationIndex: number = 16
  ): Promise<void> {
    console.log('📋 Adding Caller...');

    // Click Add Caller button
    await this.page.locator(this.selectors.addCallerBtn).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.addCallerBtn).click({ force: true });
    await this.page.waitForTimeout(6000); // Wait for form to load

    // Select Referral Type
    await this.page.locator(this.selectors.callerReferralType).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.callerReferralType).click({ force: true });
    await this.page.waitForTimeout(3000);
    await this.selectRadioOption(referralTypeIndex);

    // Select Relation
    const relationSelect = this.page.locator(this.selectors.callerRelation);
    await relationSelect.scrollIntoViewIfNeeded();
    await relationSelect.click();
    await this.page.waitForTimeout(1000);
    await this.selectRadioOption(relationIndex);

    // Search and select physician
    await this.searchAndSelectPhysician(physicianName);

    // Save caller
    await this.page.locator(this.selectors.saveCallerBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Caller added successfully');
  }

  /**
   * Add Referrer information
   * @param sameAsCaller - If true, uses "Same as Caller" checkbox
   */
  async addReferrer(sameAsCaller: boolean = true): Promise<void> {
    console.log('📋 Adding Referrer...');

    await this.page.waitForTimeout(2000);
    const addBtn = this.page.locator(this.selectors.addReferrerBtn);
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();
    await this.page.waitForTimeout(1000);

    if (sameAsCaller) {
      await this.page.locator(this.selectors.sameAsCallerCheckbox).click();
    }

    await this.page.locator(this.selectors.saveReferrerBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Referrer added successfully');
  }

  /**
   * Add Referring Physician information
   * @param sameAsReferrer - If true, uses "Same as Referrer" checkbox
   */
  async addReferringPhysician(sameAsReferrer: boolean = true): Promise<void> {
    console.log('📋 Adding Referring Physician...');

    const addBtn = this.page.locator(this.selectors.addReferringPhysicianBtn);
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();
    await this.page.waitForTimeout(1000);

    if (sameAsReferrer) {
      await this.page.locator(this.selectors.sameAsReferrerCheckbox).click();
      await this.page.waitForTimeout(1000);
    }

    await this.page.locator(this.selectors.saveReferringPhysicianBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Referring Physician added successfully');
  }

  /**
   * Add Ordering Physician information
   * @param sameAsReferring - If true, uses "Same as Referring Physician" checkbox
   */
  async addOrderingPhysician(sameAsReferring: boolean = true): Promise<void> {
    console.log('📋 Adding Ordering Physician...');

    const addBtn = this.page.locator(this.selectors.addOrderingPhysicianBtn);
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();
    await this.page.waitForTimeout(1000);

    if (sameAsReferring) {
      await this.page.locator(this.selectors.sameAsReferringCheckbox).click();
      await this.page.waitForTimeout(1000);
    }

    await this.page.locator(this.selectors.saveOrderingPhysicianBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Ordering Physician added successfully');
  }

  /**
   * Complete all Patient Details sections
   * @param physicianName - Name of the physician for Caller section
   */
  async completePatientDetails(physicianName: string): Promise<void> {
    console.log('\n🏥 Completing Patient Details section...');

    await this.navigateToProfileTab();
    await this.addCaller(physicianName);
    await this.addReferrer(true);
    await this.addReferringPhysician(true);
    await this.addOrderingPhysician(true);

    console.log('✅ Patient Details completed successfully\n');
  }
}
