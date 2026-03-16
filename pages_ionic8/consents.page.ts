import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';

/**
 * Consents Page Object — Ionic 8 (qa2)
 *
 * VERIFIED via MCP Playwright on qa2 (2026-03-05).
 *
 * KEY CHANGES from Ionic 4 (qa1):
 * - Navigation: [data-cy="btn-nav-bar-item-consents"] SAME
 * - Each consent type now has UNIQUE radio selectors (major improvement!)
 *   qa1: All shared [data-cy="radio-allow-data-publication-yes/no"] with nth() indexing
 *   qa2: Each has its own: radio-hospice-election-form-yes, radio-health-care-proxy-yes, etc.
 * - List view: ion-list[data-cy="list-consents"], ion-card[data-cy="card-consents"]
 * - More icon: ion-icon[data-cy="btn-consents-page-more"] (same data-cy)
 * - Details icon: ion-icon[data-cy="btn-consents-details"] (new)
 * - Container: div[data-cy="container-consents"], ion-content[data-cy="content-consents"]
 * - Form header: div[data-cy="header-consents"] (new)
 * - Save/Cancel: ion-button[data-cy="btn-save"], ion-button[data-cy="btn-cancel"] (same)
 */
export class ConsentsPage extends BasePage {
  private readonly selectors = {
    // Navigation
    consentsNavBarItem: '[data-cy="btn-nav-bar-item-consents"]',

    // List view
    consentsCard: '[data-cy="card-consents"]',
    consentsCardContent: '[data-cy="card-content-consents"]',
    consentsList: '[data-cy="list-consents"]',
    consentsContainer: '[data-cy="container-consents"]',
    consentsContent: '[data-cy="content-consents"]',
    consentsLayout: '[data-cy="container-consents-layout"]',
    consentsHeader: '[data-cy="row-consents-header"]',
    consentsActions: '[data-cy="container-consents-actions"]',
    consentsIcons: '[data-cy="container-consents-icons"]',
    consentsPageMore: '[data-cy="btn-consents-page-more"]',
    consentsDetails: '[data-cy="btn-consents-details"]',

    // Form header
    formHeader: '[data-cy="header-consents"]',
    requiredFieldLabel: '[data-cy="label-required-field"]',

    // UNIQUE radio selectors (Ionic 8 — each consent type has its own data-cy!)
    allRecordsYes: '[data-cy="radio-all-records-yes"]',
    allRecordsNo: '[data-cy="radio-all-records-no"]',
    roiConsentYes: '[data-cy="radio-roi-consent-yes"]',
    roiConsentNo: '[data-cy="radio-roi-consent-no"]',
    allowDataPublicationYes: '[data-cy="radio-allow-data-publication-yes"]',
    allowDataPublicationNo: '[data-cy="radio-allow-data-publication-no"]',
    hospiceElectionFormYes: '[data-cy="radio-hospice-election-form-yes"]',
    hospiceElectionFormNo: '[data-cy="radio-hospice-election-form-no"]',
    healthCareProxyYes: '[data-cy="radio-health-care-proxy-yes"]',
    healthCareProxyNo: '[data-cy="radio-health-care-proxy-no"]',
    acknowledgmentOfCareYes: '[data-cy="radio-acknowledgment-of-care-yes"]',
    acknowledgmentOfCareNo: '[data-cy="radio-acknowledgment-of-care-no"]',
    financialPowerOfAttorneyYes: '[data-cy="radio-financial-power-of-attorney-yes"]',
    financialPowerOfAttorneyNo: '[data-cy="radio-financial-power-of-attorney-no"]',
    durablePowerOfAttorneyYes: '[data-cy="radio-durable-power-of-attorney-yes"]',
    durablePowerOfAttorneyNo: '[data-cy="radio-durable-power-of-attorney-no"]',
    providerReferralOrdersYes: '[data-cy="radio-provider-referral-orders-yes"]',
    providerReferralOrdersNo: '[data-cy="radio-provider-referral-orders-no"]',

    // Form Actions
    saveButton: '[data-cy="btn-save"]',
    cancelButton: '[data-cy="btn-cancel"]',
  };

  constructor(page: Page) {
    super(page);
  }

  async navigateToConsentsTab(): Promise<void> {
    await this.page.waitForTimeout(1000);
    const navButton = this.page.locator(this.selectors.consentsNavBarItem).last();
    await navButton.scrollIntoViewIfNeeded();
    await navButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickMoreOptions(): Promise<void> {
    await this.waitForElement(this.selectors.consentsPageMore);
    await this.page.locator(this.selectors.consentsPageMore).click();
    await this.page.waitForTimeout(500);
  }

  async clickEditButton(): Promise<void> {
    await this.page.locator('[data-cy="btn-edit-option"]').click();
    await this.page.waitForTimeout(1000);
  }

  async openConsentsForm(): Promise<void> {
    await this.clickMoreOptions();
    await this.clickEditButton();
  }

  // ==================== Consent Selection — SIMPLIFIED (unique selectors!) ====================

  async selectAllRecordsObtained(value: 'yes' | 'no'): Promise<void> {
    const sel = value === 'yes' ? this.selectors.allRecordsYes : this.selectors.allRecordsNo;
    await this.page.locator(sel).click();
    await this.page.waitForTimeout(300);
  }

  async selectRoiConsent(value: 'yes' | 'no'): Promise<void> {
    const sel = value === 'yes' ? this.selectors.roiConsentYes : this.selectors.roiConsentNo;
    await this.page.locator(sel).click();
    await this.page.waitForTimeout(300);
  }

  async selectCahpsReporting(value: 'yes' | 'no'): Promise<void> {
    const sel = value === 'yes' ? this.selectors.allowDataPublicationYes : this.selectors.allowDataPublicationNo;
    await this.page.locator(sel).click();
    await this.page.waitForTimeout(300);
  }

  async selectHospiceElectionForm(value: 'yes' | 'no'): Promise<void> {
    const sel = value === 'yes' ? this.selectors.hospiceElectionFormYes : this.selectors.hospiceElectionFormNo;
    await this.page.locator(sel).click();
    await this.page.waitForTimeout(300);
  }

  async selectHealthCareProxy(value: 'yes' | 'no'): Promise<void> {
    const sel = value === 'yes' ? this.selectors.healthCareProxyYes : this.selectors.healthCareProxyNo;
    await this.page.locator(sel).click();
    await this.page.waitForTimeout(300);
  }

  async selectAcknowledgmentOfCare(value: 'yes' | 'no'): Promise<void> {
    const sel = value === 'yes' ? this.selectors.acknowledgmentOfCareYes : this.selectors.acknowledgmentOfCareNo;
    await this.page.locator(sel).click();
    await this.page.waitForTimeout(300);
  }

  async selectFinancialPowerOfAttorney(value: 'yes' | 'no'): Promise<void> {
    const sel = value === 'yes' ? this.selectors.financialPowerOfAttorneyYes : this.selectors.financialPowerOfAttorneyNo;
    await this.page.locator(sel).click();
    await this.page.waitForTimeout(300);
  }

  async selectDurablePowerOfAttorney(value: 'yes' | 'no'): Promise<void> {
    const sel = value === 'yes' ? this.selectors.durablePowerOfAttorneyYes : this.selectors.durablePowerOfAttorneyNo;
    await this.page.locator(sel).click();
    await this.page.waitForTimeout(300);
  }

  async selectProviderReferralOrders(value: 'yes' | 'no'): Promise<void> {
    const sel = value === 'yes' ? this.selectors.providerReferralOrdersYes : this.selectors.providerReferralOrdersNo;
    await this.page.locator(sel).click();
    await this.page.waitForTimeout(300);
  }

  async fillAllConsents(value: 'yes' | 'no'): Promise<void> {
    await this.selectAllRecordsObtained(value);
    await this.selectRoiConsent(value);
    await this.selectCahpsReporting(value);
    await this.selectHospiceElectionForm(value);
    await this.selectHealthCareProxy(value);
    await this.selectAcknowledgmentOfCare(value);
    await this.selectFinancialPowerOfAttorney(value);
    await this.selectDurablePowerOfAttorney(value);
    await this.selectProviderReferralOrders(value);
  }

  // Form Actions
  async clickSave(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click();
    await this.page.waitForTimeout(1000);
  }

  async clickCancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelButton).click();
    await this.page.waitForTimeout(500);
  }

  async isSaveButtonEnabled(): Promise<boolean> {
    return await this.page.locator(this.selectors.saveButton).isEnabled();
  }

  // ============================================
  // Visibility Checks
  // ============================================

  async isAddButtonVisible(timeout: number = 2000): Promise<boolean> {
    // In Ionic 8, the add button may be a FAB or the consentsPageMore
    // Check for common add selectors
    const addBtn = this.page.locator('[data-cy="btn-consents-page"], [data-cy="btn-add-consents"]');
    return await addBtn.isVisible({ timeout }).catch(() => false);
  }

  async isMoreButtonVisible(timeout: number = 2000): Promise<boolean> {
    return await this.page.locator(this.selectors.consentsPageMore)
      .isVisible({ timeout })
      .catch(() => false);
  }

  // ============================================
  // Add Consents
  // ============================================

  async clickAddConsents(): Promise<void> {
    // Try the consents-page button first, then fallback
    const addBtn = this.page.locator('[data-cy="btn-consents-page"]');
    if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addBtn.click();
    } else {
      // May already need to use more + edit flow
      await this.openConsentsForm();
      return;
    }
    await this.page.waitForTimeout(500);
    console.log('Clicked Add Consents button');
  }

  // ============================================
  // Complete Form
  // ============================================

  async completeConsentsForm(consents: {
    allRecordsObtained?: 'yes' | 'no';
    roiConsent?: 'yes' | 'no';
    cahpsReporting?: 'yes' | 'no';
    hospiceElectionForm?: 'yes' | 'no';
    healthCareProxy?: 'yes' | 'no';
    acknowledgmentOfCare?: 'yes' | 'no';
    financialPowerOfAttorney?: 'yes' | 'no';
    durablePowerOfAttorney?: 'yes' | 'no';
    providerReferralOrders?: 'yes' | 'no';
  }): Promise<void> {
    if (consents.allRecordsObtained) await this.selectAllRecordsObtained(consents.allRecordsObtained);
    if (consents.roiConsent) await this.selectRoiConsent(consents.roiConsent);
    if (consents.cahpsReporting) await this.selectCahpsReporting(consents.cahpsReporting);
    if (consents.hospiceElectionForm) await this.selectHospiceElectionForm(consents.hospiceElectionForm);
    if (consents.healthCareProxy) await this.selectHealthCareProxy(consents.healthCareProxy);
    if (consents.acknowledgmentOfCare) await this.selectAcknowledgmentOfCare(consents.acknowledgmentOfCare);
    if (consents.financialPowerOfAttorney) await this.selectFinancialPowerOfAttorney(consents.financialPowerOfAttorney);
    if (consents.durablePowerOfAttorney) await this.selectDurablePowerOfAttorney(consents.durablePowerOfAttorney);
    if (consents.providerReferralOrders) await this.selectProviderReferralOrders(consents.providerReferralOrders);
    console.log('Consents form completed');
  }
}
