import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Consents Page Object
 * Handles patient consents management
 */

export interface ConsentsData {
  allRecords?: boolean;
  roiConsent?: boolean;
  allowDataPublication?: boolean;
  hospiceElectionForm?: boolean;
  healthCareProxy?: boolean;
  acknowledgmentOfCare?: boolean;
  financialPowerOfAttorney?: boolean;
  durablePowerOfAttorney?: boolean;
  advanceDirective?: boolean;
  providerReferralOrders?: boolean;
}

export class ConsentsPage extends BasePage {
  private readonly selectors = {
    // Navigation
    consentsNavBarItem: "[src*='assets/svg/Consents_icon.svg']",

    // Page Actions
    admitReferral: '[data-cy="btn-admit-patient"]',
    cancelReferral: '[data-cy="btn-cancel-referral"]',
    options: '[data-cy="btn-consents-page-more"]',
    editConsents: '[data-cy="btn-edit-option"]',
    detailsConsents: '[data-cy="btn-consents-details"]',

    // Consent Fields - All Records
    allRecordsYes: '[data-cy="radio-all-records-yes"]',
    allRecordsNo: '[data-cy="radio-all-records-no"]',

    // ROI Consent
    roiConsentYes: '[data-cy="radio-roi-consent-yes"]',
    roiConsentNo: '[data-cy="radio-roi-consent-no"]',

    // CAHPS Reporting - Allow Data Publication
    allowDataPublicationYes: '[id="cahpsReporting"] [data-cy="radio-allow-data-publication-yes"]',
    allowDataPublicationNo: '[data-cy="radio-allow-data-publication-no"]',

    // Hospice Election Form
    hospiceElectionFormYes: '[id="hospiceElectionForm"] [data-cy="radio-allow-data-publication-yes"]',
    hospiceElectionFormNo: '[id="hospiceElectionForm"] [data-cy="radio-allow-data-publication-no"]',

    // Health Care Proxy
    healthCareProxyYes: '[id="healthCareProxy"] [data-cy="radio-allow-data-publication-yes"]',
    healthCareProxyNo: '[id="healthCareProxy"] [data-cy="radio-allow-data-publication-no"]',

    // Acknowledgment of Care
    acknowledgmentOfCareYes: '[id="acknowledgmentOfCare"] [data-cy="radio-allow-data-publication-yes"]',
    acknowledgmentOfCareNo: '[id="acknowledgmentOfCare"] [data-cy="radio-allow-data-publication-no"]',

    // Financial Power of Attorney
    financialPowerOfAttorneyYes: '[id="financialPowerOfAttorney"] [data-cy="radio-allow-data-publication-yes"]',
    financialPowerOfAttorneyNo: '[id="financialPowerOfAttorney"] [data-cy="radio-allow-data-publication-no"]',

    // Durable Power of Attorney
    durablePowerOfAttorneyYes: '[id="durablePowerOfAttorney"] [data-cy="radio-allow-data-publication-yes"]',
    durablePowerOfAttorneyNo: '[id="durablePowerOfAttorney"] [data-cy="radio-allow-data-publication-no"]',

    // Advance Directive
    advanceDirectiveYes: '[id="advanceDirective"] [data-cy="radio-allow-data-publication-yes"]',
    advanceDirectiveNo: '[id="advanceDirective"] [data-cy="radio-allow-data-publication-no"]',

    // Provider Referral Orders
    providerReferralOrdersYes: '[id="providerReferralOrders"] [data-cy="radio-allow-data-publication-yes"]',
    providerReferralOrdersNo: '[id="providerReferralOrders"] [data-cy="radio-allow-data-publication-no"]',

    // Buttons
    saveConsent: '[data-cy="btn-save"]',
    cancelConsent: '[data-cy="btn-cancel"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Consents tab
   */
  async navigateToConsentsTab(): Promise<void> {
    await this.page.waitForTimeout(4000);
    await this.page.locator(this.selectors.consentsNavBarItem).scrollIntoViewIfNeeded();
    await this.waitForElement(this.selectors.consentsNavBarItem);
    await this.page.locator(this.selectors.consentsNavBarItem).click();
    await this.page.waitForTimeout(3000);
    console.log('✅ Navigated to Consents tab');
  }

  /**
   * Click options button and edit consents
   */
  async openEditConsents(): Promise<void> {
    await this.page.locator(this.selectors.options).click({ force: true });
    await this.page.waitForTimeout(1000);
    await this.page.locator(this.selectors.editConsents).locator('..').click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Opened Edit Consents');
  }

  /**
   * Complete basic consents (for non-RI states)
   * Sets: All Records, ROI Consent, Allow Data Publication
   */
  async completeBasicConsents(): Promise<void> {
    console.log('\n📝 Completing Basic Consents...');

    await this.navigateToConsentsTab();
    await this.openEditConsents();

    // All Records - Yes
    await this.page.locator(this.selectors.allRecordsYes).click();

    // ROI Consent - Yes
    await this.page.locator(this.selectors.roiConsentYes).click();

    // Allow Data Publication - Yes
    await this.page.locator(this.selectors.allowDataPublicationYes).click();

    // Save
    await this.page.locator(this.selectors.saveConsent).click();
    await this.page.waitForTimeout(3000);

    console.log('✅ Basic Consents completed successfully\n');
  }

  /**
   * Complete RI (Rhode Island) specific consents
   * Includes additional consent forms required for RI
   */
  async completeRIConsents(): Promise<void> {
    console.log('\n📝 Completing RI Consents...');

    await this.navigateToConsentsTab();
    await this.openEditConsents();

    // All Records - Yes
    await this.page.locator(this.selectors.allRecordsYes).click();

    // ROI Consent - Yes
    await this.page.locator(this.selectors.roiConsentYes).click();

    // Allow Data Publication - Yes
    await this.page.locator(this.selectors.allowDataPublicationYes).click();

    // Hospice Election Form - Yes
    await this.page.locator(this.selectors.hospiceElectionFormYes).click();

    // Health Care Proxy - Yes
    await this.page.locator(this.selectors.healthCareProxyYes).click();

    // Acknowledgment of Care - Yes
    await this.page.locator(this.selectors.acknowledgmentOfCareYes).click();

    // Financial Power of Attorney - Yes
    await this.page.locator(this.selectors.financialPowerOfAttorneyYes).click();

    // Durable Power of Attorney - Yes
    await this.page.locator(this.selectors.durablePowerOfAttorneyYes).click();

    // Provider Referral Orders - Yes
    await this.page.locator(this.selectors.providerReferralOrdersYes).click();
    await this.page.waitForTimeout(1000);

    // Save
    await this.page.locator(this.selectors.saveConsent).click();
    await this.page.waitForTimeout(3000);

    console.log('✅ RI Consents completed successfully\n');
  }

  /**
   * Complete custom consents based on provided data
   * @param consentsData - Custom consent selections
   */
  async completeCustomConsents(consentsData: ConsentsData): Promise<void> {
    console.log('\n📝 Completing Custom Consents...');

    await this.navigateToConsentsTab();
    await this.openEditConsents();

    // All Records
    if (consentsData.allRecords !== undefined) {
      const selector = consentsData.allRecords ? this.selectors.allRecordsYes : this.selectors.allRecordsNo;
      await this.page.locator(selector).click();
    }

    // ROI Consent
    if (consentsData.roiConsent !== undefined) {
      const selector = consentsData.roiConsent ? this.selectors.roiConsentYes : this.selectors.roiConsentNo;
      await this.page.locator(selector).click();
    }

    // Allow Data Publication
    if (consentsData.allowDataPublication !== undefined) {
      const selector = consentsData.allowDataPublication
        ? this.selectors.allowDataPublicationYes
        : this.selectors.allowDataPublicationNo;
      await this.page.locator(selector).click();
    }

    // Hospice Election Form
    if (consentsData.hospiceElectionForm !== undefined) {
      const selector = consentsData.hospiceElectionForm
        ? this.selectors.hospiceElectionFormYes
        : this.selectors.hospiceElectionFormNo;
      await this.page.locator(selector).click();
    }

    // Health Care Proxy
    if (consentsData.healthCareProxy !== undefined) {
      const selector = consentsData.healthCareProxy
        ? this.selectors.healthCareProxyYes
        : this.selectors.healthCareProxyNo;
      await this.page.locator(selector).click();
    }

    // Acknowledgment of Care
    if (consentsData.acknowledgmentOfCare !== undefined) {
      const selector = consentsData.acknowledgmentOfCare
        ? this.selectors.acknowledgmentOfCareYes
        : this.selectors.acknowledgmentOfCareNo;
      await this.page.locator(selector).click();
    }

    // Financial Power of Attorney
    if (consentsData.financialPowerOfAttorney !== undefined) {
      const selector = consentsData.financialPowerOfAttorney
        ? this.selectors.financialPowerOfAttorneyYes
        : this.selectors.financialPowerOfAttorneyNo;
      await this.page.locator(selector).click();
    }

    // Durable Power of Attorney
    if (consentsData.durablePowerOfAttorney !== undefined) {
      const selector = consentsData.durablePowerOfAttorney
        ? this.selectors.durablePowerOfAttorneyYes
        : this.selectors.durablePowerOfAttorneyNo;
      await this.page.locator(selector).click();
    }

    // Advance Directive
    if (consentsData.advanceDirective !== undefined) {
      const selector = consentsData.advanceDirective
        ? this.selectors.advanceDirectiveYes
        : this.selectors.advanceDirectiveNo;
      await this.page.locator(selector).click();
    }

    // Provider Referral Orders
    if (consentsData.providerReferralOrders !== undefined) {
      const selector = consentsData.providerReferralOrders
        ? this.selectors.providerReferralOrdersYes
        : this.selectors.providerReferralOrdersNo;
      await this.page.locator(selector).click();
      await this.page.waitForTimeout(1000);
    }

    // Save
    await this.page.locator(this.selectors.saveConsent).click();
    await this.page.waitForTimeout(3000);

    console.log('✅ Custom Consents completed successfully\n');
  }
}
