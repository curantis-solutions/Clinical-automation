import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { BillRate, PatientLiability } from '../types/benefit.types';
import { selectNgOption, selectNgOptionByIndex, selectDateFromPicker, clickCalendarButtonByLabel } from '../utils/form-helpers';

/**
 * Benefits Add Page Object
 * Handles the Add Payer form for patient benefits management
 * Supports Primary, Secondary, and Room And Board benefit typesfirst can you check if its co
 */
export class BenefitsAddPage extends BasePage {
  private readonly selectors = {
    // === Navigation ===
    benefitsNavBarItem: '[data-cy="btn-nav-bar-item-benefits"]',
    addPayerButton: '[data-cy="btn-add-payer"]',

    // === Toast/Notifications ===
    toastMessage: '.toast-message',
    successToast: '.toast-success',
    errorToast: '.toast-error',

    // === Payer Selection ===
    payerLevel: '[data-cy="select-payer-level-list"]',
    payerType: '[data-cy="select-payer-type-list"]',
    payerName: '[data-cy="select-payer-name"]',
    payerNameSearchInput: '[data-cy="input-search-input"]',
    payerNameOption: (index: number) => `[data-cy="input-filtered-options-${index}"]`,
    vbidCheckbox: '[data-cy="checkbox-vbid"]',

    // === Payer Effective Date ===
    payerEffectiveDate: '[data-cy="date-payer-effective-date"]',

    // === HIS/HOPE Use Only Section ===
    medicareNumber: '[data-cy="input-medicare-number"]',
    medicaidNumber: '[data-cy="input-medicaid-number"]',
    medicaidPendingCheckbox: '[data-cy="checkbox-medicaid-pending"]',

    // === Plan Details ===
    planName: '#planName',
    patientEligibilityVerified: '[data-cy="checkbox-patient-eligivility"]',

    // === Subscriber Details ===
    relationshipToPatient: '[data-cy="select-relationships"]',
    groupNumber: '[data-cy="input-group-number"]',
    dateOfBirth: '[data-cy="date-birth"]',
    firstName: '[data-cy="input-first-name"]',
    lastName: '[data-cy="input-last-name"]',
    middleInitial: '[data-cy="input-middle-initial"]',
    address: '[data-cy="input-address"]',
    city: '[data-cy="input-city"]',
    state: '[data-cy="select-state"]',
    zipCode: '[data-cy="input-zipcode"]',
    zipExtension: '[data-cy="input-zipcode-extension"]',
    phone: '[data-cy="input-phone"]',
    email: '[data-cy="input-email"]',
    additionalInfo: '[data-cy="textarea-additional-info"]',

    // === Subscriber ID Section (indexed - supports multiple) ===
    policyNumber: (index: number) => `[data-cy="input-policy-number-${index}"]`,
    subscriberEffectiveDate: (index: number) => `[data-cy="date-subscriber-effective-date-${index}"]`,
    subscriberExpiredDate: (index: number) => `[data-cy="date-subscriber-expired-date-${index}"]`,
    addNewSubscriberId: '[data-cy="btn-add-new-subscriber-id"]',

    // === Hospice Eligibility Details ===
    benefitElectionDate: '[data-cy="date-benefit-election-date"]',
    admitBenefitPeriod: '[data-cy="input-admit-benefit-period"]',
    benefitPeriodStartDate: '[data-cy="date-admit-benefit-period-start-date"]',
    highDaysUsed: '[data-cy="input-routine-home-care-high-days-used"]',
    previousHospiceStartDate: '[data-cy="date-previous-hospice-start-date"]',
    previousHospiceDischargeDate: '[data-cy="date-previous-hospice-discharge-date"]',
    dateOfFinalBill: '[data-cy="date-off-final-bill"]',

    // === Room And Board Specific Fields ===
    billingEffectiveDate: (index: number) => `[data-cy="date-billing-effective-date-${index}"]`,
    billingExpiredDate: (index: number) => `[data-cy="date-billing-expired-date-${index}"]`,
    billRate: (index: number) => `#billing-rate-${index}`,
    careLevel: (index: number) => `#care-level-${index}`,
    addBillingEffectiveDate: '[data-cy="btn-add-billing-effective-date"]',

    // === Room And Board Eligibility Details ===
    patientLiability: '[data-cy="select-patient-liability"]',
    liabilityAmount: '[data-cy="input-liability-amount"]',
    liabilityFromDate: '[data-cy="date-liability-from"]',
    liabilityToDate: '[data-cy="date-liability-to"]',
    addPatientLiability: '[data-cy="btn-add-patient-liability"]',

    // === Authorizations ===
    addNewAuthorization: '[data-cy="btn-add-new-authorization"]',

    // === Form Actions ===
    saveButton: '[data-cy="btn-save"]',
    cancelButton: '[data-cy="btn-cancel"]',

    // === Benefits List/Grid (for edit functionality) ===
    benefitRow: (index: number) => `[data-cy="benefit-row-${index}"]`,
    benefitsList: '.benefits-list, [class*="benefit"], ion-list',
    benefitRowByLevel: (level: string) => `ion-row:has-text("${level}")`,
    moreButton: '[aria-label="Patient Details"] button:has(img[alt="more"])',
    moreButtonInGrid: 'button:has(img[alt="more"])',
    moreButtonInRow: (level: string) => `ion-row:has-text("${level}") button:has(img[alt="more"])`,
    // Action menu buttons (after clicking more)
    editButton: 'button:has-text("create Edit"), button:has-text("Edit")',
    copyToEditButton: 'button:has-text("copy Copy to Edit"), button:has-text("Copy to Edit")',
    holdBenefitButton: 'button:has-text("lock Hold Benefit"), button:has-text("Hold Benefit")',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Get selector for a specific element
   */
  getSelector(key: keyof typeof this.selectors): string {
    const selector = this.selectors[key];
    if (typeof selector === 'function') {
      throw new Error(`Selector ${key} requires an index parameter`);
    }
    return selector;
  }

  // ============================================
  // Navigation Methods
  // ============================================

  /**
   * Navigate to Benefits section from patient profile
   */
  async navigateToBenefits(): Promise<void> {
    await this.page.locator(this.selectors.benefitsNavBarItem).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click Add Payer button to open the add benefit form
   */
  async clickAddPayer(): Promise<void> {
    await this.page.locator(this.selectors.addPayerButton).click();
    await this.page.waitForTimeout(1000);
  }

  // ============================================
  // Toast/Notification Methods
  // ============================================

  /**
   * Wait for success toast notification
   * @param timeout - Timeout in milliseconds (default: 5000)
   */
  async waitForSuccessToast(timeout: number = 5000): Promise<void> {
    await this.page.locator(this.selectors.successToast).waitFor({ state: 'visible', timeout });
  }

  /**
   * Check for error toast notification
   * @returns true if error toast is visible
   */
  async hasErrorToast(): Promise<boolean> {
    return await this.page.locator(this.selectors.errorToast).isVisible();
  }

  /**
   * Get toast message text
   * @returns Toast message text or null if not visible
   */
  async getToastMessage(): Promise<string | null> {
    const toast = this.page.locator(this.selectors.toastMessage);
    if (await toast.isVisible()) {
      return await toast.textContent();
    }
    return null;
  }

  // ============================================
  // Payer Selection Methods
  // ============================================

  /**
   * Select payer level from dropdown
   */
  async selectPayerLevel(level: string): Promise<void> {
    await selectNgOption(this.page, this.selectors.payerLevel, level);
  }

  /**
   * Select payer type from dropdown
   */
  async selectPayerType(type: string): Promise<void> {
    await selectNgOption(this.page, this.selectors.payerType, type);
  }

  /**
   * Search and select payer name
   */
  async selectPayerName(searchText: string, optionIndex: number = 0): Promise<void> {
    await this.page.locator(this.selectors.payerName).click();
    await this.page.waitForTimeout(500);
    await this.page.locator(this.selectors.payerNameSearchInput).fill(searchText);
    await this.page.waitForTimeout(1000);
    await this.page.locator(this.selectors.payerNameOption(optionIndex)).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Toggle VBID checkbox
   */
  async toggleVbid(): Promise<void> {
    await this.page.locator(this.selectors.vbidCheckbox).click();
  }

  // ============================================
  // HIS/HOPE Use Only Methods
  // ============================================

  /**
   * Fill Medicare number
   */
  async fillMedicareNumber(number: string): Promise<void> {
    await this.fill(`input${this.selectors.medicareNumber}`, number);
  }

  /**
   * Fill Medicaid number
   */
  async fillMedicaidNumber(number: string): Promise<void> {
    await this.fill(`input${this.selectors.medicaidNumber}`, number);
  }

  /**
   * Toggle Medicaid Pending checkbox
   */
  async toggleMedicaidPending(): Promise<void> {
    await this.page.locator(this.selectors.medicaidPendingCheckbox).click();
  }

  // ============================================
  // Plan Details Methods
  // ============================================

  /**
   * Select plan name from dropdown
   */
  async selectPlanName(planName: string): Promise<void> {
    await selectNgOption(this.page, this.selectors.planName, planName);
  }

  /**
   * Select plan name by index
   */
  async selectPlanNameByIndex(index: number): Promise<void> {
    console.log(`Selecting Plan Name by index: ${index}`);

    // Wait for form to be ready
    await this.page.waitForTimeout(1000);

    // Try #planName selector first
    try {
      await this.page.waitForSelector(this.selectors.planName, { state: 'visible', timeout: 3000 });
      console.log('Found Plan Name selector, using selectNgOptionByIndex...');
      await selectNgOptionByIndex(this.page, this.selectors.planName, index);
      return;
    } catch {
      // Selector not found, try fallback
      // Fallback: Find by label text "Plan Name/Address"
      console.log('ID selector not found, using label-based approach for Plan Name...');
      const planNameLabel = this.page.getByText('Plan Name/Address', { exact: true });

      if (await planNameLabel.count() > 0) {
        // Navigate up to parent container where listbox is a sibling
        const labelParent = planNameLabel.locator('xpath=ancestor::*[1]');
        const dropdown = labelParent.getByRole('listbox').first();

        if (await dropdown.count() > 0) {
          // Click the combobox inside the listbox to open dropdown
          const combobox = dropdown.getByRole('combobox');
          if (await combobox.count() > 0) {
            await combobox.click({ force: true });
          } else {
            await dropdown.click({ force: true });
          }
          await this.page.waitForTimeout(500);

          // Wait for dropdown options and select by index
          try {
            await this.page.waitForSelector('[role="option"]', { state: 'visible', timeout: 5000 });
            const options = this.page.locator('[role="option"]');
            if (await options.count() > index) {
              await options.nth(index).click({ force: true });
              await this.page.waitForTimeout(500);
              console.log(`Selected Plan Name option at index ${index}`);
            } else {
              console.log(`Plan Name has only ${await options.count()} options, requested index ${index}`);
            }
          } catch (err) {
            console.log('Could not find dropdown options for Plan Name');
          }
        } else {
          console.log('Could not find Plan Name dropdown listbox');
        }
      } else {
        console.log('Could not find Plan Name/Address label');
      }
    }
  }

  /**
   * Toggle patient eligibility verified checkbox
   */
  async togglePatientEligibilityVerified(): Promise<void> {
    console.log('Toggling Patient Eligibility Verified checkbox');

    // Try data-cy selector first
    if (await this.page.locator(this.selectors.patientEligibilityVerified).count() > 0) {
      await this.page.locator(this.selectors.patientEligibilityVerified).click();
    } else {
      // Fallback: Find by label text "Patient's Eligibility Verified"
      console.log('ID selector not found, using label-based approach for Patient Eligibility...');
      const eligibilityLabel = this.page.getByText("Patient's Eligibility Verified", { exact: true });

      if (await eligibilityLabel.count() > 0) {
        // The checkbox is a sibling element - go to parent and find checkbox
        const parentContainer = eligibilityLabel.locator('xpath=ancestor::*[1]');
        const checkbox = parentContainer.locator('ion-checkbox').first();
        if (await checkbox.count() > 0) {
          await checkbox.click({ force: true });
          console.log('Clicked Patient Eligibility Verified checkbox via ion-checkbox');
        } else {
          // Try clicking the checkbox role directly
          const checkboxRole = parentContainer.getByRole('checkbox');
          if (await checkboxRole.count() > 0) {
            await checkboxRole.click({ force: true });
            console.log('Clicked Patient Eligibility Verified checkbox via role');
          } else {
            // Last resort: click the label's parent container
            await eligibilityLabel.click({ force: true });
            console.log('Clicked Patient Eligibility Verified via label');
          }
        }
      }
    }
    await this.page.waitForTimeout(500);
  }

  // ============================================
  // Subscriber Details Methods
  // ============================================

  /**
   * Select relationship to patient
   */
  async selectRelationshipToPatient(relationship: string): Promise<void> {
    await selectNgOption(this.page, this.selectors.relationshipToPatient, relationship);
  }

  /**
   * Fill group number
   */
  async fillGroupNumber(groupNumber: string): Promise<void> {
    const input = this.page.locator(this.selectors.groupNumber).locator('input');
    await input.scrollIntoViewIfNeeded();
    await input.click();
    await input.clear();
    await input.pressSequentially(groupNumber, { delay: 50 });
    await this.page.waitForTimeout(500);
  }

  /**
   * Fill subscriber first name
   */
  async fillFirstName(firstName: string): Promise<void> {
    await this.fill(`input${this.selectors.firstName}`, firstName);
  }

  /**
   * Fill subscriber last name
   */
  async fillLastName(lastName: string): Promise<void> {
    await this.fill(`input${this.selectors.lastName}`, lastName);
  }

  /**
   * Fill subscriber middle initial
   */
  async fillMiddleInitial(middleInitial: string): Promise<void> {
    await this.fill(`input${this.selectors.middleInitial}`, middleInitial);
  }

  /**
   * Fill subscriber address
   */
  async fillAddress(address: string): Promise<void> {
    await this.fill(`input${this.selectors.address}`, address);
  }

  /**
   * Fill subscriber city
   */
  async fillCity(city: string): Promise<void> {
    await this.fill(`input${this.selectors.city}`, city);
  }

  /**
   * Select subscriber state from searchable dropdown
   * Note: This dropdown uses a click-cover div with data-cy="input-state"
   */
  async selectSubscriberState(state: string): Promise<void> {
    console.log(`Selecting subscriber state: ${state}`);

    // Wait for any click-block overlay to disappear
    await this.page.waitForSelector('.click-block-active', { state: 'hidden', timeout: 5000 }).catch(() => {});

    // The State dropdown has a click-cover with data-cy="input-state"
    const stateClickCover = this.page.locator('[data-cy="input-state"]');
    await stateClickCover.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);

    // Click the state dropdown to open it
    await stateClickCover.click({ force: true });
    await this.page.waitForTimeout(1000);

    // Type the state to filter and focus the dropdown
    await this.page.keyboard.type(state);
    await this.page.waitForTimeout(500);

    // Press Enter to select the filtered/highlighted option
    await this.page.keyboard.press('Enter');
    console.log(`Pressed Enter to select state: ${state}`);
    await this.page.waitForTimeout(500);

    // Dismiss any remaining popover by pressing Escape
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  /**
   * Fill subscriber zip code
   */
  async fillZipCode(zipCode: string): Promise<void> {
    await this.fill(`input${this.selectors.zipCode}`, zipCode);
  }

  /**
   * Fill subscriber zip extension
   */
  async fillZipExtension(zipExtension: string): Promise<void> {
    await this.fill(`input${this.selectors.zipExtension}`, zipExtension);
  }

  /**
   * Fill subscriber phone
   */
  async fillPhone(phone: string): Promise<void> {
    await this.fill(`input${this.selectors.phone}`, phone);
  }

  /**
   * Fill subscriber email
   */
  async fillEmail(email: string): Promise<void> {
    await this.fill(`input${this.selectors.email}`, email);
  }

  /**
   * Fill additional info
   */
  async fillAdditionalInfo(info: string): Promise<void> {
    await this.page.locator(`textarea${this.selectors.additionalInfo}`).fill(info);
  }

  // ============================================
  // Subscriber ID Methods
  // ============================================

  /**
   * Fill policy number for a specific subscriber ID row
   * Note: In add mode uses data-cy="input-policy-number-X", in edit mode uses data-cy="input-susbscriber-id-X" (typo in app)
   */
  async fillPolicyNumber(policyNumber: string, index: number = 0): Promise<void> {
    // Wait for any Ionic click-block overlay to disappear
    await this.page.waitForSelector('.click-block-active', { state: 'hidden', timeout: 10000 }).catch(() => {});

    // Wait for form to fully load
    await this.page.waitForTimeout(2000);

    // Try both selectors - add mode uses "policy-number", edit mode uses "susbscriber-id" (typo in app)
    const addModeSelector = `[data-cy="input-policy-number-${index}"]`;
    const editModeSelector = `[data-cy="input-susbscriber-id-${index}"]`;

    // Wait for either selector to appear
    try {
      await Promise.race([
        this.page.waitForSelector(`ion-input${addModeSelector}`, { timeout: 5000 }),
        this.page.waitForSelector(`ion-input${editModeSelector}`, { timeout: 5000 })
      ]);
    } catch (e) {
      console.log('Neither subscriber ID selector found immediately, continuing...');
    }

    // Check which selector exists
    const addModeCount = await this.page.locator(`ion-input${addModeSelector}`).count();
    const editModeCount = await this.page.locator(`ion-input${editModeSelector}`).count();

    const selector = editModeCount > 0 ? editModeSelector : addModeSelector;
    console.log(`Using subscriber ID selector: ${selector} (addMode: ${addModeCount}, editMode: ${editModeCount})`);

    // Scroll into view using JavaScript
    await this.page.evaluate((sel) => {
      const ionInput = document.querySelector(`ion-input${sel}`);
      if (ionInput) {
        ionInput.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }, selector);
    await this.page.waitForTimeout(500);

    // Now use Playwright's fill on the nested input
    const input = this.page.locator(`input${selector}`);
    await input.click({ force: true });
    await input.fill(policyNumber);
  }

  /**
   * Click add new subscriber ID button
   */
  async clickAddNewSubscriberId(): Promise<void> {
    await this.page.locator(this.selectors.addNewSubscriberId).click();
  }

  // ============================================
  // Hospice Eligibility Methods
  // ============================================

  /**
   * Fill admit benefit period
   */
  async fillAdmitBenefitPeriod(period: string): Promise<void> {
    console.log(`Filling Admit Benefit Period: ${period}`);
    const selector = this.selectors.admitBenefitPeriod;
    await this.page.waitForTimeout(500);

    // Try to fill the input - use input element specifically to avoid ion-input wrapper
    const input = this.page.locator(`input${selector}`);
    if (await input.count() > 0) {
      await input.clear();
      await input.fill(period);
      console.log(`Filled Admit Benefit Period with: ${period}`);
    } else {
      // Fallback to first matching element if input-specific selector doesn't work
      const fallbackInput = this.page.locator(selector).first();
      if (await fallbackInput.count() > 0) {
        await fallbackInput.clear();
        await fallbackInput.fill(period);
        console.log(`Filled Admit Benefit Period with fallback: ${period}`);
      } else {
        console.log(`Admit Benefit Period selector not found: ${selector}`);
      }
    }
  }

  /**
   * Fill high days used
   */
  async fillHighDaysUsed(days: string): Promise<void> {
    await this.fill(`input${this.selectors.highDaysUsed}`, days);
  }

  // ============================================
  // Room And Board Specific Methods
  // ============================================

  /**
   * Fill billing effective date for Room And Board
   * @param date - Date in MM/DD/YYYY format
   * @param index - Index for multiple billing dates (default: 0)
   */
  async fillBillingEffectiveDate(date: string, index: number = 0): Promise<void> {
    console.log(`Filling Billing Effective Date: ${date}`);

    // Wait for form to be fully loaded
    await this.page.waitForTimeout(1000);

    // Strategy: Find the "Billing Effective Date" label and click the calendar button in its container
    // The form structure has labels and their associated inputs/buttons in the same container
    await clickCalendarButtonByLabel(this.page, 'Billing Effective Date');

    await this.page.waitForTimeout(500);
    await selectDateFromPicker(this.page, date);
  }

  /**
   * Fill Benefit Period Start Date using label-based approach
   * Note: Calendar button is at ancestor level 1 (ION-COL), not level 4
   */
  async fillBenefitPeriodStartDate(date: string): Promise<void> {
    console.log(`Filling Benefit Period Start Date: ${date}`);
    await this.page.waitForTimeout(1000);

    // Find the exact label and go to parent ION-COL which contains the calendar button
    const label = this.page.getByText('Benefit Period Start Date', { exact: true });
    if (await label.count() > 0) {
      // Go up to ION-COL (level 1) where the calendar button is
      const parentCol = label.locator('xpath=ancestor::ion-col[1]');
      const calendarBtn = parentCol.getByRole('button', { name: 'custom calendar' });

      if (await calendarBtn.count() > 0) {
        await calendarBtn.click();
        console.log('Clicked Benefit Period Start Date calendar button');
        await this.page.waitForTimeout(500);
        await selectDateFromPicker(this.page, date);
      } else {
        console.log('Could not find calendar button for Benefit Period Start Date');
      }
    } else {
      console.log('Could not find Benefit Period Start Date label');
    }
  }

  /**
   * Fill billing expired date for Room And Board
   * @param date - Date in MM/DD/YYYY format
   * @param index - Index for multiple billing dates (default: 0)
   */
  async fillBillingExpiredDate(date: string, index: number = 0): Promise<void> {
    const selector = this.selectors.billingExpiredDate(index);
    await this.page.locator(selector).click();
    await this.page.waitForTimeout(500);
    await selectDateFromPicker(this.page, date);
  }

  /**
   * Select bill rate for Room And Board
   * @param rate - Bill rate option
   * @param index - Index for multiple billing rates (default: 0)
   */
  async selectBillRate(rate: BillRate, index: number = 0): Promise<void> {
    console.log(`Selecting Bill Rate: ${rate}`);

    // Try ID-based selector first
    const idSelector = this.selectors.billRate(index);
    if (await this.page.locator(idSelector).count() > 0) {
      await selectNgOption(this.page, idSelector, rate);
      console.log('Selected Bill Rate using ID selector');
      return;
    }

    // Fallback: Find by label text "Bill Rate" and click the associated dropdown
    console.log('ID selector not found, using label-based approach...');
    const billRateLabel = this.page.getByText('Bill Rate', { exact: true });

    if (await billRateLabel.count() > 0) {
      // Find the parent container and locate the dropdown
      const labelParent = billRateLabel.locator('xpath=ancestor::*[3]');
      const dropdown = labelParent.locator('ng-select, [class*="select"], input').first();

      if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dropdown.click({ force: true });
        await this.page.waitForTimeout(1000);

        // Wait for dropdown panel and click option
        try {
          await this.page.waitForSelector('ng-dropdown-panel', { state: 'visible', timeout: 5000 });
          await this.page.locator('ng-dropdown-panel .ng-option-label')
            .filter({ hasText: rate })
            .first()
            .click({ force: true });
          console.log(`Selected Bill Rate: ${rate} using label-based approach`);
        } catch {
          // Try clicking the combobox directly
          const combobox = labelParent.getByRole('combobox');
          await combobox.click();
          await this.page.waitForTimeout(500);
          await this.page.getByText(rate, { exact: false }).first().click();
          console.log(`Selected Bill Rate: ${rate} using combobox approach`);
        }
      }
    }
  }

  /**
   * Select care level for Room And Board (only when Bill Rate = "Bill at Facility Rate")
   * @param level - Care level option
   * @param index - Index for multiple care levels (default: 0)
   */
  async selectCareLevel(level: string, index: number = 0): Promise<void> {
    console.log(`Selecting Care Level: ${level}`);

    // Try ID-based selector first
    const idSelector = this.selectors.careLevel(index);
    if (await this.page.locator(idSelector).count() > 0) {
      await selectNgOption(this.page, idSelector, level);
      console.log('Selected Care Level using ID selector');
      return;
    }

    // Fallback: Find by label text "Care Level" and click the associated dropdown
    console.log('ID selector not found, using label-based approach...');
    const careLevelLabel = this.page.getByText('Care Level', { exact: true });

    if (await careLevelLabel.count() > 0) {
      // Find the parent container and locate the dropdown
      const labelParent = careLevelLabel.locator('xpath=ancestor::*[3]');
      const dropdown = labelParent.locator('ng-select, [class*="select"], input').first();

      if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dropdown.click({ force: true });
        await this.page.waitForTimeout(1000);

        // Wait for dropdown panel and click option
        try {
          await this.page.waitForSelector('ng-dropdown-panel', { state: 'visible', timeout: 5000 });
          await this.page.locator('ng-dropdown-panel .ng-option-label')
            .filter({ hasText: level })
            .first()
            .click({ force: true });
          console.log(`Selected Care Level: ${level} using label-based approach`);
        } catch {
          // Try clicking the combobox directly
          const combobox = labelParent.getByRole('combobox');
          await combobox.click();
          await this.page.waitForTimeout(500);
          await this.page.getByText(level, { exact: false }).first().click();
          console.log(`Selected Care Level: ${level} using combobox approach`);
        }
      }
    }
  }

  /**
   * Click add billing effective date button
   */
  async clickAddBillingEffectiveDate(): Promise<void> {
    await this.page.locator(this.selectors.addBillingEffectiveDate).click();
  }

  // ============================================
  // Room And Board Eligibility Methods
  // ============================================

  /**
   * Select patient liability
   * @param value - Yes or No
   */
  async selectPatientLiability(value: PatientLiability): Promise<void> {
    await selectNgOption(this.page, this.selectors.patientLiability, value);
  }

  /**
   * Fill liability amount
   * @param amount - Liability amount
   */
  async fillLiabilityAmount(amount: number): Promise<void> {
    const selector = `input${this.selectors.liabilityAmount}`;
    await this.page.locator(selector).fill(amount.toString());
  }

  /**
   * Fill liability dates
   * @param fromDate - From date in MM/DD/YYYY format
   * @param toDate - To date in MM/DD/YYYY format
   */
  async fillLiabilityDates(fromDate: string, toDate: string): Promise<void> {
    console.log(`Filling Liability Dates: From ${fromDate} To ${toDate}`);

    // Find "From" label and click its calendar button
    const fromLabel = this.page.getByText('From', { exact: true });
    const fromParent = fromLabel.locator('..');
    const fromCalendarBtn = fromParent.getByRole('button', { name: 'custom calendar' });

    console.log('Clicking From calendar button...');
    await fromCalendarBtn.click();
    await this.page.waitForTimeout(1000); // Wait for datepicker to fully open

    // Wait for datepicker and select date
    await this.page.locator('ngb-datepicker').waitFor({ state: 'visible', timeout: 5000 });
    console.log('From datepicker visible, selecting date...');
    await selectDateFromPicker(this.page, fromDate);

    // Wait for From datepicker to close
    await this.page.waitForTimeout(1000);

    // Find "To" label and click its calendar button
    const toLabel = this.page.getByText('To', { exact: true });
    const toParent = toLabel.locator('..');
    const toCalendarBtn = toParent.getByRole('button', { name: 'custom calendar' });

    console.log('Clicking To calendar button...');
    await toCalendarBtn.click();
    await this.page.waitForTimeout(1000); // Wait for datepicker to fully open

    // Wait for datepicker and select date
    await this.page.locator('ngb-datepicker').waitFor({ state: 'visible', timeout: 5000 });
    console.log('To datepicker visible, selecting date...');
    await selectDateFromPicker(this.page, toDate);

    console.log('Liability dates filled successfully');
  }

  /**
   * Click add patient liability button
   */
  async clickAddPatientLiability(): Promise<void> {
    await this.page.locator(this.selectors.addPatientLiability).click();
  }

  // ============================================
  // Authorization Methods
  // ============================================

  /**
   * Click add new authorization button
   */
  async clickAddNewAuthorization(): Promise<void> {
    await this.page.locator(this.selectors.addNewAuthorization).click();
  }

  // ============================================
  // Form Action Methods
  // ============================================

  /**
   * Click save button
   */
  async clickSave(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click();
  }

  /**
   * Click cancel button
   */
  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelButton).click();
  }

  /**
   * Check if save button is enabled
   */
  async isSaveButtonEnabled(): Promise<boolean> {
    return await this.page.locator(this.selectors.saveButton).isEnabled();
  }

  // ============================================
  // Edit Functionality Methods
  // ============================================

  /**
   * Click more button for a specific benefit row by index
   * @param index - Row index (0-based)
   */
  async clickMoreButton(index: number): Promise<void> {
    // Use the Patient Details tabpanel context (label may include "radio button-off" prefix)
    const moreButtons = this.page.getByLabel(/Patient Details/).getByRole('button', { name: 'more' });

    try {
      await moreButtons.first().waitFor({ state: 'visible', timeout: 5000 });
      const count = await moreButtons.count();
      if (count > index) {
        await moreButtons.nth(index).click();
      } else {
        await moreButtons.first().click();
      }
    } catch {
      // Fallback to CSS selector
      console.log('Role-based selector failed, trying CSS fallback...');
      await this.page.locator(this.selectors.moreButtonInGrid).nth(index).click();
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Click more button for a benefit by payer level
   * @param payerLevel - 'Primary' | 'Secondary' | 'Room And Board'
   */
  async clickMoreButtonByPayerLevel(payerLevel: string): Promise<void> {
    console.log(`Looking for More button for payer level: ${payerLevel}`);

    // Wait for Benefits section to load
    await this.page.waitForTimeout(1000);

    // The benefits grid has rows where each row contains payer level text and a "more" button
    // We need to find the row with matching payer level and click its more button

    // Strategy 1: Use role-based selector - find all "more" buttons on the page
    // Search the whole page since getByLabel might not scope correctly
    const allMoreButtons = this.page.getByRole('button', { name: 'more' });
    const count = await allMoreButtons.count();
    console.log(`Found ${count} More buttons on page`);

    let found = false;
    for (let i = 0; i < count; i++) {
      const moreBtn = allMoreButtons.nth(i);

      // Get the parent container (generic/div) that holds the row data
      // Navigate up to find the row containing payer level info
      const parentRow = moreBtn.locator('xpath=ancestor::*[contains(@class, "row") or self::ion-row or contains(text(), "Primary") or contains(text(), "Secondary") or contains(text(), "Room And Board")][1]');

      let rowText = '';
      try {
        rowText = await parentRow.textContent({ timeout: 1000 }) || '';
      } catch {
        // If xpath fails, try getting parent's parent text
        const grandParent = moreBtn.locator('..');
        rowText = await grandParent.textContent({ timeout: 1000 }) || '';
      }

      console.log(`Row ${i} text preview: ${rowText.substring(0, 80).replace(/\s+/g, ' ')}...`);

      if (rowText.includes(payerLevel)) {
        await moreBtn.click();
        console.log(`Clicked More button at index ${i} for ${payerLevel}`);
        found = true;
        break;
      }
    }

    if (!found) {
      // Strategy 2: Fallback - try CSS selector approach
      console.log('Role-based search failed, trying CSS fallback...');
      const cssSelector = `[class*="row"]:has-text("${payerLevel}") button:has-text("more"), ion-row:has-text("${payerLevel}") button:has-text("more")`;
      const fallbackBtn = this.page.locator(cssSelector).first();

      if (await fallbackBtn.isVisible({ timeout: 3000 })) {
        await fallbackBtn.click();
        console.log(`Clicked More button for ${payerLevel} using CSS fallback`);
        found = true;
      }
    }

    if (!found) {
      throw new Error(`Could not find More button for payer level: ${payerLevel}`);
    }

    await this.page.waitForTimeout(500);
  }

  /**
   * Click edit button (after clicking more button)
   */
  async clickEditButton(): Promise<void> {
    // Try role-based selector first (accessible name includes icon: "create Edit")
    const editBtn = this.page.getByRole('button', { name: 'create Edit' });

    try {
      await editBtn.waitFor({ state: 'visible', timeout: 3000 });
      await editBtn.click();
    } catch {
      // Fallback to text-based selector
      console.log('Role-based selector failed, trying text fallback...');
      await this.page.locator('button:has-text("Edit")').first().click();
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click copy to edit button (after clicking more button)
   */
  async clickCopyToEditButton(): Promise<void> {
    // Try role-based selector first (accessible name includes icon: "copy Copy to Edit")
    const copyBtn = this.page.getByRole('button', { name: 'copy Copy to Edit' });

    try {
      await copyBtn.waitFor({ state: 'visible', timeout: 3000 });
      await copyBtn.click();
    } catch {
      // Fallback to text-based selector
      console.log('Role-based selector failed, trying text fallback...');
      await this.page.locator('button:has-text("Copy to Edit")').first().click();
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click hold benefit button (after clicking more button)
   */
  async clickHoldBenefitButton(): Promise<void> {
    // Try role-based selector first (accessible name includes icon: "lock Hold Benefit")
    const holdBtn = this.page.getByRole('button', { name: 'lock Hold Benefit' });

    try {
      await holdBtn.waitFor({ state: 'visible', timeout: 3000 });
      await holdBtn.click();
    } catch {
      // Fallback to text-based selector
      console.log('Role-based selector failed, trying text fallback...');
      await this.page.locator('button:has-text("Hold Benefit")').first().click();
    }
    await this.page.waitForTimeout(1000);
  }

}
