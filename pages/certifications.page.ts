import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { selectDateFormatted } from '../utils/date-helper';

/**
 * Certifications Page Object
 * Handles patient certifications (verbal and written)
 */

export interface WrittenCertificationData {
  hospicePhysician: string;
  signedOnDate: string;
  attendingPhysician: string;
  attendingSignedOnDate: string;
  role: 'MD' | 'RN';
  narrativeStatement?: string;
  narrativeOnFile?: boolean;
}

export class CertificationsPage extends BasePage {
  private readonly selectors = {
    // Navigation
    certificationsNavBarItem: "[data-cy='btn-nav-bar-item-certifications']",

    // Add Certification
    addCertification: '[data-cy="btn-add-certifications"]',

    // Certification Type
    verbalCertification: '[data-cy="radio-certification-verbal"]',
    writtenCertification: '[data-cy="radio-certification-written"]',
    benefitsPeriodsDates: '[data-cy="input-benefits-period-dates"]',

    // Written Certification Fields
    hospicePhysicianInput: 'input[data-cy="input-hospice-physician"]',
    setPhysicianButton: (index: number) => `[data-cy="btn-set-physician-${index}"]`,
    signedOnPicker: '[data-cy="date-signed-on-picker"]',

    attendingPhysicianInput: 'input[data-cy="input-attending-physician"]',
    setAttendingPhysicianButton: (index: number) => `[data-cy="btn-set-attending-physician-${index}"]`,
    signedOnPicker2: '[data-cy="date-signed-on-picker2"]',

    briefNarrativeStatement: 'textarea[data-cy="input-narrative-statement"]',
    narrativeOnFile: '[data-cy="checkbox-narrative-on-file"]',
    signatureReceivedFromAttending: '[data-cy="checkbox-signature-received"]',

    // Buttons
    cancelCertification: '[data-cy="btn-cancel"]',
    saveCertification: '[data-cy="btn-save"]',

    // Edit
    clickEditCertifications: '[data-cy="btn-certification-written-options-0"]',
    editCertification: ':nth-child(1) > .item-inner > .input-wrapper',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Certifications tab
   */
  async navigateToCertificationsTab(): Promise<void> {
    await this.page.locator(this.selectors.certificationsNavBarItem).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.certificationsNavBarItem).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Navigated to Certifications tab');
  }

  /**
   * Click Add Certification button
   */
  async clickAddCertification(): Promise<void> {
    await this.page.locator(this.selectors.addCertification).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Clicked Add Certification button');
  }

  /**
   * Select Written Certification type
   */
  async selectWrittenCertification(): Promise<void> {
    await this.page.locator(this.selectors.writtenCertification).click();
    await this.page.waitForTimeout(3000);
    console.log('✅ Selected Written Certification');
  }


  /**
   * Type physician name character by character to avoid autocomplete issues
   * @param selector - Input selector
   * @param physicianName - Full name of physician
   */
  private async typePhysicianName(selector: string, physicianName: string): Promise<void> {
    const input = this.page.locator(selector);

    // Wait for input to be enabled (it may be disabled initially)
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(2000); // Wait for form to fully load

    // Check if field is enabled, if not wait a bit more
    const isEnabled = await input.isEnabled();
    if (!isEnabled) {
      console.log('⏳ Waiting for input field to be enabled...');
      await this.page.waitForTimeout(3000);
    }

    await input.clear();

    // Type character by character with delays
    for (let i = 0; i < physicianName.length; i++) {
      await input.type(physicianName[i]);
      await this.page.waitForTimeout(200);
    }
    await this.page.waitForTimeout(1000);
  }

  /**
   * Complete Written Certification form
   * @param certData - Written certification data
   */
  async completeWrittenCertification(certData: WrittenCertificationData): Promise<void> {
    console.log('\n📄 Completing Written Certification...');

    await this.navigateToCertificationsTab();
    await this.clickAddCertification();
    await this.selectWrittenCertification();

    // Fill Hospice Physician
    await this.typePhysicianName(this.selectors.hospicePhysicianInput, certData.hospicePhysician);
    await this.page.locator(this.selectors.setPhysicianButton(0)).click();
    console.log(`✅ Set Hospice Physician: ${certData.hospicePhysician}`);

    // Set signed on date for hospice physician
    await this.page.locator(this.selectors.signedOnPicker).click();
    await this.page.waitForTimeout(1000);
    await selectDateFormatted(this.page, certData.signedOnDate);
    console.log(`✅ Set Signed On Date: ${certData.signedOnDate}`);

    // Fill Attending Physician
    await this.page.locator(this.selectors.attendingPhysicianInput).click();
    await this.page.locator(this.selectors.attendingPhysicianInput).fill(certData.attendingPhysician);
    await this.page.waitForTimeout(1000);
    await this.page.locator(this.selectors.setAttendingPhysicianButton(0)).click();
    console.log(`✅ Set Attending Physician: ${certData.attendingPhysician}`);

    // Set signed on date for attending physician
    await this.page.locator(this.selectors.signedOnPicker2).click();
    await this.page.waitForTimeout(1000);
    await selectDateFormatted(this.page, certData.attendingSignedOnDate);
    console.log(`✅ Set Attending Signed On Date: ${certData.attendingSignedOnDate}`);

    // Fill narrative based on role
    if (certData.role === 'MD') {
      const narrative = certData.narrativeStatement || 'Test narrative statement';
      await this.page.locator(this.selectors.briefNarrativeStatement).click();
      await this.page.locator(this.selectors.briefNarrativeStatement).fill(narrative);
      console.log('✅ Filled narrative statement');
    } else if (certData.role === 'RN' || certData.narrativeOnFile) {
      await this.page.locator(this.selectors.narrativeOnFile).click();
      await this.page.waitForTimeout(1000);
      console.log('✅ Checked narrative on file');
    }

    // Save certification
    await this.page.locator(this.selectors.saveCertification).click({ force: true });
    await this.page.waitForTimeout(2000);

    console.log('✅ Written Certification completed successfully\n');
  }
}
