import { Page } from '@playwright/test';

/**
 * Field definition for a tab in the HOPE Admission Record
 */
export interface AdmissionField {
  /** Readable label for logging */
  label: string;
  /** CSS selector or element ID to read the value */
  selector: string;
}

/**
 * Tab definition for the HOPE Admission Record
 */
export interface AdmissionTab {
  /** Tab key identifier */
  key: string;
  /** Display label */
  label: string;
  /** Selector for the tab button */
  tabSelector: string;
  /** Fields to verify within this tab */
  fields: AdmissionField[];
}

/**
 * Pre-defined Tab A fields for verification
 */
export const TAB_A_FIELDS: AdmissionField[] = [
  // A0050 — Type of Record (radio group)
  { label: 'A0050 Type of Record', selector: '#automation-type-of-record ion-item.item-radio-checked ion-label' },
  // A0100.A — Facility NPI
  { label: 'A0100.A NPI', selector: '#hospiceNpi input' },
  // A0100.B — CMS Number
  { label: 'A0100.B CMS Number', selector: '#cmsNumber input' },
  // A0215 — Hospice Service
  { label: 'A0215 Hospice Service', selector: '#automation-hospice-service .single-select span' },
  // A0220 — Admission Date
  { label: 'A0220 Admission Date', selector: 'cur-date-picker[formcontrolname="admissionDate"] input#date-value' },
  // A0250 — Reason for Record
  { label: 'A0250 Reason for Record', selector: '#reasonForRecord input' },
  // A0500 — Patient Name
  { label: 'A0500 First Name', selector: '#firstName input' },
  { label: 'A0500 Middle Initial', selector: '#middleName input' },
  { label: 'A0500 Last Name', selector: '#lastName input' },
  { label: 'A0500 Suffix', selector: '#suffix input' },
  // A0550 — ZIP Code
  { label: 'A0550 Zip Code', selector: 'ion-input[formcontrolname="zipcode"] input' },
  { label: 'A0550 Zip Extension', selector: 'ion-input[formcontrolname="zipextension"] input' },
  // A0600.A — Social Security Number
  { label: 'A0600.A SSN', selector: '#ssnNumber input' },
  // A0600.B — Medicare Number
  { label: 'A0600.B Medicare Number', selector: '#medicareNumber input' },
  // A0700 — Medicaid Number
  { label: 'A0700 Medicaid Number', selector: '#medicaidNumber input' },
  // A0810 — Sex (radio group)
  { label: 'A0810 Sex', selector: '#sex ion-item.item-radio-checked ion-label' },
  // A0900 — Birth Date
  { label: 'A0900 Birth Date', selector: 'cur-date-picker[formcontrolname="dateOfBirth"] input#date-value' },
  // A1005 — Ethnicity
  { label: 'A1005 Ethnicity', selector: 'ion-input[formcontrolname="hopeEthnicities"] input' },
  // A1010 — Race
  { label: 'A1010 Race', selector: 'ion-input[formcontrolname="hopeRaces"] input' },
  // A1110.A — Language
  { label: 'A1110.A Language', selector: '#language input' },
  // A1110.B — Interpreter
  { label: 'A1110.B Interpreter', selector: '#interpreter .single-select span' },
  // A1400 — Payer Information
  { label: 'A1400 Payer Information', selector: '#automation-payor-information .select span, #automation-payor-information .custom-placeholder' },
  // A1805 — Admitted From
  { label: 'A1805 Admitted From', selector: '#automation-admitted-from .single-select span' },
  // A1905 — Living Arrangements
  { label: 'A1905 Living Arrangements', selector: '#automation-living-arregemtns .single-select span' },
  // A1910 — Level of Assistance
  { label: 'A1910 Level of Assistance', selector: '#automation-assistance .single-select span' },
];

/**
 * Pre-defined Tab F fields — Preferences
 */
export const TAB_F_FIELDS: AdmissionField[] = [
  // F2000 — CPR Preference
  { label: 'F2000.A CPR Preference', selector: '#automation-cpr-preference ion-item.item-radio-checked ion-label' },
  { label: 'F2000.B CPR Date', selector: '#automation-cpr-preference-date input#date-value' },
  // F2100 — Life-Sustaining Treatment
  { label: 'F2100.A Life-Sustaining', selector: '#automation-life-sustaining-preferences ion-item.item-radio-checked ion-label' },
  { label: 'F2100.B Life-Sustaining Date', selector: '#automation-life-sustaining-preferences-date input#date-value' },
  // F2200 — Hospitalization Preferences
  { label: 'F2200.A Hospitalization', selector: '#automation-hospitalization-preferences ion-item.item-radio-checked ion-label' },
  // F3000 — Spiritual/Existential Concerns
  { label: 'F3000.A Spiritual Concerns', selector: '#automation-spiritual-concerns ion-item.item-radio-checked ion-label' },
];

/**
 * Pre-defined Tab I fields — Active Diagnosis
 */
export const TAB_I_FIELDS: AdmissionField[] = [
  // I0010 — Principal Diagnosis (radio group)
  { label: 'I0010 Principal Diagnosis', selector: '#automation-principal-diagnosis ion-item.item-radio-checked ion-label' },
  // Other Conditions (checkboxes — use label text to find checkbox button)
  { label: 'I0100 Cancer', selector: 'ion-item:has(ion-label:has-text("I0100 - Cancer")) button' },
  { label: 'I0600 Heart Failure', selector: 'ion-item:has(ion-label:has-text("I0600 - Heart Failure")) button' },
  { label: 'I0900 PVD/PAD', selector: 'ion-item:has(ion-label:has-text("I0900 - Peripheral")) button' },
  { label: 'I0950 Cardiovascular', selector: 'ion-item:has(ion-label:has-text("I0950 - Cardiovascular")) button' },
  { label: 'I1101 Liver Disease', selector: 'ion-item:has(ion-label:has-text("I1101 - Liver")) button' },
  { label: 'I1510 Renal Disease', selector: 'ion-item:has(ion-label:has-text("I1510 - Renal")) button' },
  { label: 'I2102 Sepsis', selector: 'ion-item:has(ion-label:has-text("I2102 - Sepsis")) button' },
  { label: 'I2900 Diabetes', selector: 'ion-item:has(ion-label:has-text("I2900 - Diabetes")) button' },
  { label: 'I2910 Neuropathy', selector: 'ion-item:has(ion-label:has-text("I2910 - Neuropathy")) button' },
  { label: 'I4501 Stroke', selector: 'ion-item:has(ion-label:has-text("I4501 - Stroke")) button' },
  { label: 'I4801 Dementia', selector: 'ion-item:has(ion-label:has-text("I4801 - Dementia")) button' },
  { label: 'I5150 Neurological', selector: 'ion-item:has(ion-label:has-text("I5150 - Neurological")) button' },
  { label: 'I5401 Seizure Disorder', selector: 'ion-item:has(ion-label:has-text("I5401 - Seizure")) button' },
  { label: 'I6202 COPD', selector: 'ion-item:has(ion-label:has-text("I6202 - COPD")) button' },
  { label: 'I8005 Other Medical', selector: 'ion-item:has(ion-label:has-text("I8005 - Other")) button' },
];

/**
 * Pre-defined Tab J fields — Health Conditions
 */
export const TAB_J_FIELDS: AdmissionField[] = [
  // J0050 — Imminent Death
  { label: 'J0050 Imminent Death', selector: '#automation-imminent-death ion-item.item-radio-checked ion-label' },
  // J0900 — Pain Screening
  { label: 'J0900.A Pain Screening', selector: '#automation-pain-screening ion-item.item-radio-checked ion-label' },
  { label: 'J0900.B Pain Screening Date', selector: '#automation-pain-screening-date input#date-value' },
  { label: 'J0900.C Pain Severity', selector: '#automation-pain-severity .single-select span' },
  { label: 'J0900.D Pain Tool', selector: '#automation-pain-tool .single-select span' },
  // J0905 — Pain Active Problem
  { label: 'J0905 Pain Active', selector: '#automation-pain-active ion-item.item-radio-checked ion-label' },
  // J0910 — Comprehensive Pain Assessment
  { label: 'J0910.B Comprehensive Pain Date', selector: '#automation-comprehensive-pain-assessment-date input#date-value' },
  // J0910.C — Comprehensive Pain Methods (checkboxes by label text)
  { label: 'J0910.C 01 Location', selector: '#assessment ion-item:has(ion-label:has-text("01. Location")) button' },
  { label: 'J0910.C 02 Severity', selector: '#assessment ion-item:has(ion-label:has-text("02. Severity")) button' },
  { label: 'J0910.C 03 Character', selector: '#assessment ion-item:has(ion-label:has-text("03. Character")) button' },
  { label: 'J0910.C 04 Duration', selector: '#assessment ion-item:has(ion-label:has-text("04. Duration")) button' },
  { label: 'J0910.C 05 Frequency', selector: '#assessment ion-item:has(ion-label:has-text("05. Frequency")) button' },
  { label: 'J0910.C 06 Relieves/Worsens', selector: '#assessment ion-item:has(ion-label:has-text("06. What relieves")) button' },
  { label: 'J0910.C 07 Effect on QoL', selector: '#assessment ion-item:has(ion-label:has-text("07. Effect on")) button' },
  { label: 'J0910.C 09 None', selector: '#assessment ion-item:has(ion-label:has-text("09. None")) button' },
  // J0915 — Neuropathic Pain
  { label: 'J0915 Neuropathic Pain', selector: '#J0915 ion-item.item-radio-checked ion-label' },
  // J2030 — SOB Screening
  { label: 'J2030.A SOB Screening', selector: '#automation-screening-shortness-of-breath ion-item.item-radio-checked ion-label' },
  { label: 'J2030.B SOB Screening Date', selector: '#automation-screening-shortness-of-breath-date input#date-value' },
  { label: 'J2030.C SOB Indicated', selector: '#automation-screening-indicate-shortness ion-item.item-radio-checked ion-label' },
  // J2040 — SOB Treatment
  { label: 'J2040.A SOB Treatment', selector: '#automation-treatment-for-shortness ion-item.item-radio-checked ion-label' },
  { label: 'J2040.B SOB Treatment Date', selector: '#automation-treatment-for-shortness-date input#date-value' },
  // J2050 — Symptom Impact Screening
  { label: 'J2050.A Symptom Impact Screening', selector: '#automation-symptom-impact-screening-performed ion-item.item-radio-checked ion-label' },
  { label: 'J2050.B Symptom Impact Date', selector: '#automation-symptom-impact-date input#date-value' },
  // J2051 — Symptom Impact (per symptom)
  { label: 'J2051.A Pain', selector: '#automation-pain-symptom-severity .single-select span' },
  { label: 'J2051.B SOB', selector: '#automation-shortness-of-breath-symptom-severity .single-select span' },
  { label: 'J2051.C Anxiety', selector: '#automation-anxiety-symptom-severity .single-select span' },
  { label: 'J2051.D Nausea', selector: '#automation-nausea-symptom-severity .single-select span' },
  { label: 'J2051.E Vomiting', selector: '#automation-vomiting-symptom-severity .single-select span' },
  { label: 'J2051.F Diarrhea', selector: '#automation-diarrhea-symptom-severity .single-select span' },
  { label: 'J2051.G Constipation', selector: '#automation-constipation-symptom-severity .single-select span' },
  { label: 'J2051.H Agitation', selector: '#automation-agitation-symptom-severity .single-select span' },
];

/**
 * Pre-defined Tab M fields — Skin Conditions
 */
export const TAB_M_FIELDS: AdmissionField[] = [
  // M1190 — Skin Conditions
  { label: 'M1190 Skin Conditions', selector: '#M1190 ion-item.item-radio-checked ion-label' },
  // M1195 — Types of skin conditions (checkboxes by label text)
  { label: 'M1195.A Diabetic Foot Ulcers', selector: 'ion-item:has(ion-label:has-text("A. Diabetic Foot")) button' },
  { label: 'M1195.B Open Lesion', selector: 'ion-item:has(ion-label:has-text("B. Open Lesion")) button' },
  { label: 'M1195.C Pressure Ulcer/Injury', selector: 'ion-item:has(ion-label:has-text("C. Pressure Ulcer")) button' },
  { label: 'M1195.D Rash', selector: 'ion-item:has(ion-label:has-text("D. Rash")) button' },
  { label: 'M1195.E Skin Tear', selector: 'ion-item:has(ion-label:has-text("E. Skin Tear")) button' },
  { label: 'M1195.F Surgical Wound', selector: 'ion-item:has(ion-label:has-text("F. Surgical Wound")) button' },
  { label: 'M1195.G Other Ulcers', selector: 'ion-item:has(ion-label:has-text("G. Ulcers other")) button' },
  { label: 'M1195.H Moisture Damage', selector: 'ion-item:has(ion-label:has-text("H. Moisture")) button' },
  { label: 'M1195.Z None Present', selector: 'ion-item:has(ion-label:has-text("Z. None of the above were present")) button' },
  // M1200 — Skin Treatments (checkboxes by label text)
  { label: 'M1200.A Pressure Device Chair', selector: 'ion-item:has(ion-label:has-text("A. Pressure reducing device for chair")) button' },
  { label: 'M1200.B Pressure Device Bed', selector: 'ion-item:has(ion-label:has-text("B. Pressure reducing device for bed")) button' },
  { label: 'M1200.C Turning/Repositioning', selector: 'ion-item:has(ion-label:has-text("C. Turning/Repositioning")) button' },
  { label: 'M1200.D Nutrition/Hydration', selector: 'ion-item:has(ion-label:has-text("D. Nutrition or hydration")) button' },
  { label: 'M1200.E Pressure Ulcer Care', selector: 'ion-item:has(ion-label:has-text("E. Pressure ulcer/injury care")) button' },
  { label: 'M1200.F Surgical Wound Care', selector: 'ion-item:has(ion-label:has-text("F. Surgical wound care")) button' },
  { label: 'M1200.G Non-Surgical Dressings', selector: 'ion-item:has(ion-label:has-text("G. Application of nonsurgical")) button' },
  { label: 'M1200.H Ointments/Medications', selector: 'ion-item:has(ion-label:has-text("H. Application of ointments")) button' },
  { label: 'M1200.I Dressings to Feet', selector: 'ion-item:has(ion-label:has-text("I. Application of dressings to feet")) button' },
  { label: 'M1200.J Incontinence Mgmt', selector: 'ion-item:has(ion-label:has-text("J. Incontinence")) button' },
  { label: 'M1200.Z None Provided', selector: 'ion-item:has(ion-label:has-text("Z. None of the above were provided")) button' },
];

/**
 * Pre-defined Tab N fields — Medications
 */
export const TAB_N_FIELDS: AdmissionField[] = [
  // N0500 — Scheduled Opioid
  { label: 'N0500.A Scheduled Opioid', selector: '#automation-scheduled-opioid ion-item.item-radio-checked ion-label' },
  { label: 'N0500.B Scheduled Opioid Date', selector: '#automation-scheduled-opioid-date input#date-value' },
  // N0510 — PRN Opioid
  { label: 'N0510.A PRN Opioid', selector: '#automation-prn-opioid ion-item.item-radio-checked ion-label' },
  { label: 'N0510.B PRN Opioid Date', selector: '#automation-prn-opioid-date input#date-value' },
  // N0520 — Bowel Regimen
  { label: 'N0520.A Bowel Regimen', selector: '#automation-bowel-regimen ion-item.item-radio-checked ion-label' },
  { label: 'N0520.B Bowel Regimen Date', selector: '#automation-bowel-regimen-date input#date-value' },
];

/**
 * Pre-defined Tab Z fields — Record Administration
 */
export const TAB_Z_FIELDS: AdmissionField[] = [
  // Z0400 — Signatures table (read from first data row)
  { label: 'Z0400 Signature', selector: '.z0400-row .bg-grey ion-col:nth-child(1) .left-col' },
  { label: 'Z0400 Sections', selector: '.z0400-row .bg-grey ion-col:nth-child(2) div' },
  { label: 'Z0400 Date Completed', selector: '.z0400-row .bg-grey ion-col:nth-child(3) div' },
  // Z0500.A — Signature of Verifier
  { label: 'Z0500.A Verifier Signature', selector: '#automation-signature-of-verifier input' },
  // Z0500.B — Date section completed
  { label: 'Z0500.B Date Completed', selector: 'cur-date-picker[formcontrolname="lastDateSelection"] input#date-value' },
];

/**
 * Pre-defined Tab A fields for Discharge records.
 * Discharge records have fewer fields than Admission — no Hospice Service,
 * no demographics (ethnicity, race, language, etc.), but include Discharge Date
 * and Reason for Discharge.
 */
export const TAB_A_DISCHARGE_FIELDS: AdmissionField[] = [
  { label: 'A0050 Type of Record', selector: '#automation-type-of-record ion-item.item-radio-checked ion-label' },
  { label: 'A0100.A NPI', selector: '#hospiceNpi input' },
  { label: 'A0100.B CMS Number', selector: '#cmsNumber input' },
  { label: 'A0220 Admission Date', selector: 'cur-date-picker[formcontrolname="admissionDate"] input#date-value' },
  { label: 'A0250 Reason for Record', selector: '#reasonForRecord input' },
  { label: 'A0270 Discharge Date', selector: 'cur-date-picker[formcontrolname="dischargeDate"] input#date-value' },
  { label: 'A0500 First Name', selector: '#firstName input' },
  { label: 'A0500 Middle Initial', selector: '#middleName input' },
  { label: 'A0500 Last Name', selector: '#lastName input' },
  { label: 'A0500 Suffix', selector: '#suffix input' },
  { label: 'A0600.A SSN', selector: '#ssnNumber input' },
  { label: 'A0600.B Medicare Number', selector: '#medicareNumber input' },
  { label: 'A0700 Medicaid Number', selector: '#medicaidNumber input' },
  { label: 'A0810 Sex', selector: '#sex ion-item.item-radio-checked ion-label' },
  { label: 'A0900 Birth Date', selector: 'cur-date-picker[formcontrolname="dateOfBirth"] input#date-value' },
  { label: 'A2115 Reason for Discharge', selector: '#reasonForDischarge ion-item.item-radio-checked ion-label' },
];

/**
 * HOPE Admission Record Page Object
 *
 * After completing a visit, the HIS/HOPE module shows admission records.
 * Clicking a record opens a detail view with multiple tabs containing
 * data mapped from the assessment modules.
 *
 * Flow:
 *   1. Navigate to HIS/HOPE module (btn-nav-bar-item-his)
 *   2. Click the admission record row
 *   3. Walk each tab, read field values
 *   4. Optionally complete the record
 */
export class HopeAdmissionPage {
  readonly page: Page;

  private readonly selectors = {
    // ── HIS/HOPE Module ─────────────────────────────────────────────
    hopeNavBtn: '[data-cy="btn-nav-bar-item-his"]',
    pageHeader: '.header-title',
    reportRow: '#automation-report-row',

    // ── Admission Record Detail ─────────────────────────────────────
    tabBar: '.tabs-container',
    tabButton: (label: string) => `.tabs-container span:has-text("${label}")`,

    // ── Complete Action ─────────────────────────────────────────────
    completeBtn: 'button:has-text("Complete"), [data-cy="hope-complete-btn"]',
    confirmBtn: 'button:has-text("Yes"), button:has-text("OK")',
    statusLabel: '.record-status, [data-cy="hope-record-status"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Navigation
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Navigate to HIS/HOPE module from the patient nav bar
   */
  async navigateToHopeModule(): Promise<void> {
    const hopeBtn = this.page.locator(this.selectors.hopeNavBtn);
    await hopeBtn.waitFor({ state: 'visible', timeout: 10000 });
    await hopeBtn.click();
    await this.page.waitForTimeout(3000);
    console.log('Navigated to HIS/HOPE module');
  }

  /**
   * Click the latest admission record row to open it
   */
  async openLatestAdmissionRecord(): Promise<void> {
    const row = this.page.locator(this.selectors.reportRow).last();
    await row.waitFor({ state: 'visible', timeout: 10000 });
    await row.click();
    // Wait for tab bar to render — confirms the record detail view loaded
    await this.page.locator(this.selectors.tabBar).waitFor({ state: 'visible', timeout: 15000 });
    await this.page.waitForTimeout(2000);
    console.log('Opened latest admission record');
  }

  /**
   * Wait for a specific record to appear in the grid by report name (e.g., "HUV1", "Admission").
   * Polls the grid rows until a matching record appears or timeout.
   * @param reportName - Text to match in the Report column (e.g., "HUV1", "HUV2", "Admission")
   * @param timeout - Max wait time in ms (default 30000)
   * @returns The row index of the matching record
   */
  async waitForRecordInGrid(reportName: string, timeout = 30000): Promise<number> {
    console.log(`Waiting for "${reportName}" record in grid...`);
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const rows = this.page.locator(this.selectors.reportRow);
      const count = await rows.count();

      for (let i = 0; i < count; i++) {
        const reportCol = rows.nth(i).locator('ion-col').nth(1).locator('.label');
        const text = (await reportCol.textContent().catch(() => ''))?.trim() || '';
        if (text.includes(reportName)) {
          console.log(`Found "${reportName}" record at row ${i}`);
          return i;
        }
      }

      // Refresh the page and retry
      await this.page.waitForTimeout(5000);
      await this.navigateToHopeModule();
    }

    throw new Error(`Record "${reportName}" not found in grid after ${timeout}ms`);
  }

  /**
   * Open a record by matching its Report column text (e.g., "HUV1", "Admission").
   * Waits for the record to appear, then clicks it.
   */
  async openRecordByReport(reportName: string, timeout = 30000): Promise<void> {
    const rowIndex = await this.waitForRecordInGrid(reportName, timeout);
    await this.openRecordByIndex(rowIndex);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Tab Navigation
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Click a tab by its label text (e.g. "A - Administrative Information")
   */
  async navigateToTab(tabLabel: string): Promise<void> {
    const tabBtn = this.page.locator(this.selectors.tabButton(tabLabel)).first();
    if (await tabBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tabBtn.click();
      // Wait for tab content to load — some tabs render in sub-components
      await this.page.waitForTimeout(3000);
      console.log(`  Navigated to tab: ${tabLabel}`);
    } else {
      console.log(`  WARNING: Tab "${tabLabel}" not found`);
    }
  }

  /**
   * Get all visible tab names
   */
  async getTabNames(): Promise<string[]> {
    const tabs = this.page.locator('.tabs-container span');
    const count = await tabs.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await tabs.nth(i).textContent())?.trim() || '';
      if (text) names.push(text);
    }
    return names;
  }

  /**
   * Check if a tab shows a checkmark (completed) or radio-button-off (incomplete)
   */
  async isTabComplete(tabLabel: string): Promise<boolean> {
    const tab = this.page.locator(this.selectors.tabButton(tabLabel)).first();
    const icon = tab.locator('ion-icon');
    const iconName = await icon.getAttribute('ng-reflect-name').catch(() => '');
    return iconName === 'md-checkmark-circle';
  }

  // ══════════════════════════════════════════════════════════════════════
  // Field Reading
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Read a field value by selector.
   * For checkbox buttons (role="checkbox"), reads aria-checked.
   * For inputs, reads the value attribute.
   * For other elements, reads textContent.
   */
  async getFieldValue(selector: string): Promise<string> {
    const el = this.page.locator(selector).first();
    // Use count() instead of isVisible() — elements in scrollable containers
    // may exist in DOM but not be in viewport
    const exists = await el.count().catch(() => 0);
    if (exists > 0) {
      try {
        const role = await el.getAttribute('role').catch(() => null);
        if (role === 'checkbox') {
          return (await el.getAttribute('aria-checked')) || 'false';
        }
        const tagName = await el.evaluate(e => e.tagName.toLowerCase()).catch(() => '');
        if (tagName === 'input') {
          return (await el.inputValue()) || '';
        }
        return (await el.textContent())?.trim() || '';
      } catch {
        return '';
      }
    }
    return '';
  }

  /**
   * Read all fields in a tab and return as key-value pairs
   */
  async readTabFields(tab: AdmissionTab): Promise<Record<string, string>> {
    await this.navigateToTab(tab.label);
    const results: Record<string, string> = {};

    for (const field of tab.fields) {
      results[field.label] = await this.getFieldValue(field.selector);
    }

    const filledCount = Object.values(results).filter(v => v !== '').length;
    console.log(`  Tab "${tab.label}": ${filledCount}/${tab.fields.length} fields populated`);
    return results;
  }

  /**
   * Verify all tabs — walk each tab, read all fields, return combined results
   */
  async verifyAllTabs(tabs: AdmissionTab[]): Promise<Record<string, Record<string, string>>> {
    const allResults: Record<string, Record<string, string>> = {};

    for (const tab of tabs) {
      allResults[tab.key] = await this.readTabFields(tab);
    }

    return allResults;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Grid Verification
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Read admission record grid row data
   */
  async getGridRowData(rowIndex = -1): Promise<Record<string, string>> {
    const row = rowIndex === -1
      ? this.page.locator(this.selectors.reportRow).last()
      : this.page.locator(this.selectors.reportRow).nth(rowIndex);

    await row.waitFor({ state: 'visible', timeout: 10000 });

    const cols = row.locator('ion-col .label');
    const colCount = await cols.count();
    const labels = ['Report Type', 'Report', 'Date Generated', 'Date Completed', 'Type of Record', 'File Status'];

    const data: Record<string, string> = {};
    for (let i = 0; i < Math.min(colCount, labels.length); i++) {
      data[labels[i]] = (await cols.nth(i).textContent())?.trim() || '';
    }

    console.log('Admission record grid data:', data);
    return data;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Complete Record
  // ══════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════
  // Editing Fields
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Select payer information — opens multi-select dropdown and checks first option
   */
  async selectPayerInformation(): Promise<void> {
    // Click the .click-cover inside the multi-select-dropdown
    const clickCover = this.page.locator('multi-select-dropdown#automation-payor-information .click-cover');
    await clickCover.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await this.page.waitForTimeout(1000);
    await clickCover.click({ force: true });
    await this.page.waitForTimeout(1000);

    const firstOption = this.page.locator('.option ion-checkbox button').first();
    if (await firstOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstOption.click({ force: true });
      await this.page.waitForTimeout(500);
      console.log('  Selected first payer option');
    }

    // Click OK to confirm selection
    const okBtn = this.page.locator('[data-cy="btn-ok"]');
    if (await okBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await okBtn.click();
      await this.page.waitForTimeout(1000);
      console.log('  Clicked OK to confirm payer selection');
    }
  }

  /**
   * Select first option from a single-select-dropdown (custom component)
   */
  async selectSingleDropdownFirstOption(dropdownId: string): Promise<void> {
    // Click the .single-select__clickeable inside the dropdown (avoids duplicate ID issue)
    const dropdown = this.page.locator(`single-select-dropdown#${dropdownId} .single-select__clickeable, .single-select__clickeable#${dropdownId}`).first();
    await dropdown.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await this.page.waitForTimeout(500);
    await dropdown.click({ force: true });
    await this.page.waitForTimeout(1000);

    const firstItem = this.page.locator('.select-popover__item').first();
    if (await firstItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstItem.click();
      await this.page.waitForTimeout(500);
      console.log(`  Selected first option for ${dropdownId}`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // Grid Status & SFV Indicator
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Get the number of records in the HIS/HOPE grid
   */
  async getRecordCount(): Promise<number> {
    const rows = this.page.locator(this.selectors.reportRow);
    await this.page.waitForTimeout(2000);
    return await rows.count();
  }

  /**
   * Read the file status column for a specific record row
   */
  async getRecordStatus(rowIndex = -1): Promise<string> {
    const data = await this.getGridRowData(rowIndex);
    return data['File Status'] || '';
  }

  /**
   * Open a specific record by row index
   */
  async openRecordByIndex(rowIndex: number): Promise<void> {
    const row = this.page.locator(this.selectors.reportRow).nth(rowIndex);
    await row.waitFor({ state: 'visible', timeout: 10000 });
    await row.click();
    await this.page.waitForTimeout(3000);
    console.log(`Opened record at index ${rowIndex}`);
  }

  /**
   * Check if the SFV Pending indicator is visible on any grid row
   */
  async isSFVPendingIndicatorVisible(): Promise<boolean> {
    const indicator = this.page.locator('text=SFV Pending, :has-text("SFV Pending")').first();
    return await indicator.isVisible({ timeout: 5000 }).catch(() => false);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Complete Record
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Click the Complete button on Tab Z
   */
  async clickComplete(): Promise<void> {
    const completeBtn = this.page.locator('#inputModalSubmit');
    await completeBtn.waitFor({ state: 'visible', timeout: 10000 });
    await completeBtn.click();
    await this.page.waitForTimeout(3000);
    console.log('  Clicked Complete');
  }
}
