import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';

/**
 * Patient Details Page Object — Ionic 8 (qa2)
 *
 * VERIFIED via MCP Playwright on qa2 (2026-03-05).
 *
 * KEY CHANGES from Ionic 4 (qa1):
 * - Tab navigation: ion-tab-button[data-cy="tab-patient-details"] (was role-based tab)
 * - Tab bar: ion-tab-bar[data-cy="tab-bar-patient"]
 * - Tabs: ion-tabs[data-cy="tabs-patient"]
 * - Section containers: ion-row[data-cy="section-{name}"] (new naming pattern)
 * - Edit icons: ion-icon[data-cy="btn-edit-{section}"] (was btn-edit-{section} on different tags)
 * - Toggle icons: ion-icon[data-cy="btn-{section}-toggle"] (new)
 * - Content containers: div[data-cy="content-{section}"] (new)
 * - Patient details: [data-cy="btn-patient-details"] REMOVED
 *   → Use ion-row[data-cy="section-patient-details"], ion-icon[data-cy="btn-edit-patient-details"]
 * - Fab buttons for add: ion-fab-button[data-cy="btn-add-{section}"] (same data-cy, tag changed)
 * - Brief bar: brief-bar[data-cy="component-brief-bar"], div[data-cy="brief-bar-container"]
 * - Photo: img[data-cy="img-patient-photo"], button[data-cy="btn-upload-photo"]
 * - Top buttons: button[data-cy="btn-plan-of-care"], button[data-cy="btn-open-order-entry-page"]
 */
export class PatientDetailsPage extends BasePage {
  private readonly selectors = {
    // === Tab Navigation ===
    tabBar: '[data-cy="tab-bar-patient"]',
    patientDetailsTab: '[data-cy="tab-patient-details"]',
    levelOfCareTab: '[data-cy="tab-level-of-care"]',
    diagnosisTab: '[data-cy="tab-diagnosis"]',
    statusTab: '[data-cy="tab-status"]',

    // === Top Action Buttons ===
    planOfCareButton: '[data-cy="btn-plan-of-care"]',
    orderEntryButton: '[data-cy="btn-open-order-entry-page"]',

    // === Brief Bar (patient summary) ===
    briefBar: '[data-cy="component-brief-bar"]',
    briefBarContainer: '[data-cy="brief-bar-container"]',
    patientPhoto: '[data-cy="img-patient-photo"]',
    uploadPhoto: '[data-cy="btn-upload-photo"]',
    patientName: '[data-cy="patient-name-brief"]',
    patientId: '[data-cy="label-patient-id"]',

    // === Section Containers (new pattern in Ionic 8) ===
    sectionPatientDetails: '[data-cy="section-patient-details"]',
    sectionAwareOfReferral: '[data-cy="section-aware-of-referral"]',
    sectionHospiceTransfer: '[data-cy="section-hospice-transfer"]',
    sectionPharmacy: '[data-cy="section-pharmacy"]',
    sectionFuneralHome: '[data-cy="section-funeral-home"]',
    sectionCaller: '[data-cy="section-caller"]',
    sectionReferrer: '[data-cy="section-referrer"]',
    sectionReferringPhysician: '[data-cy="section-referring-physician"]',
    sectionOrderingPhysician: '[data-cy="section-ordering-physician"]',
    sectionPhysiciansOrder: '[data-cy="section-physicians-order"]',
    sectionReferralCredit: '[data-cy="section-referral-credit"]',
    sectionProfile: '[data-cy="section-profile"]',

    // === Edit Icons (ion-icon in Ionic 8) ===
    editPatientDetails: '[data-cy="btn-edit-patient-details"]',
    editCaller: '[data-cy="btn-edit-caller"]',
    editReferrer: '[data-cy="btn-edit-referrer"]',
    editReferringPhysician: '[data-cy="btn-edit-referring-physician"]',
    editOrderingPhysician: '[data-cy="btn-edit-ordering-physician"]',

    // === Toggle Icons (new in Ionic 8) ===
    togglePatientDetails: '[data-cy="btn-patient-details-toggle"]',
    toggleCaller: '[data-cy="btn-caller-toggle"]',
    toggleReferrer: '[data-cy="btn-referrer-toggle"]',
    toggleReferringPhysician: '[data-cy="btn-referring-physician-toggle"]',
    toggleOrderingPhysician: '[data-cy="btn-ordering-physician-toggle"]',

    // === Add Buttons (ion-fab-button) ===
    addAwareOfReferral: '[data-cy="btn-aware-of-referral"]',
    addHospiceTransfer: '[data-cy="btn-add-hospice-transfer"]',
    addPharmacy: '[data-cy="btn-add-pharmacy"]',
    addFuneralHome: '[data-cy="btn-add-funeral-home"]',
    addPhysiciansOrder: '[data-cy="btn-add-physicians-order"]',
    addReferralCredit: '[data-cy="btn-add-referral-credit"]',

    // === Content Containers (for sections with details) ===
    contentPatientDetails: '[data-cy="content-patient-details"]',
    contentCaller: '[data-cy="content-caller"]',
    contentReferrer: '[data-cy="content-referrer"]',
    contentReferringPhysician: '[data-cy="content-referring-physician"]',
    contentOrderingPhysician: '[data-cy="content-ordering-physician"]',

    // === Patient Details Display Values (spans in Ionic 8) ===
    textPatientName: '[data-cy="text-patient-name"]',
    textPatientGender: '[data-cy="text-patient-gender"]',
    textPatientSSN: '[data-cy="text-patient-ssn"]',
    textPatientAge: '[data-cy="text-patient-age"]',
    textPatientTypeOfCare: '[data-cy="text-patient-type-of-care"]',
    textPatientNickname: '[data-cy="text-patient-nickname"]',
    textPatientPreferredLanguage: '[data-cy="text-patient-preferred-language"]',
    textPatientMaritalStatus: '[data-cy="text-patient-marital-status"]',
    textPatientReligion: '[data-cy="text-patient-religion"]',
    textPatientVeteran: '[data-cy="text-patient-veteran"]',
    textPatientHomeAddress: '[data-cy="text-patient-home-address"]',
    textPatientPhoneNumber: '[data-cy="text-patient-phone-number"]',
    textPatientCodeStatus: '[data-cy="text-patient-code-status"]',
    textPatientRiskPriority: '[data-cy="text-patient-risk-priority"]',
    textPatientEthnicityRaceHis: '[data-cy="text-patient-ethnicity-race-his"]',
    textPatientEthnicityHope: '[data-cy="text-patient-ethnicity-hope"]',
    textPatientRaceHope: '[data-cy="text-patient-race-hope"]',
    textPatientLivingWill: '[data-cy="text-patient-living-will"]',
    textPatientSkilledBed: '[data-cy="text-patient-skilled-bed"]',
    textPatientDaysRemaining: '[data-cy="text-patient-days-remaining"]',
    textPatientRoomNumber: '[data-cy="text-patient-room-number"]',
    textPatientEmergencyPreparedness: '[data-cy="text-patient-emergency-preparedness"]',

    // === Sidebar Navigation (same data-cy as qa1) ===
    navProfile: '[data-cy="btn-nav-bar-item-profile"]',
    navCareTeam: '[data-cy="btn-nav-bar-item-care-team"]',
    navBenefits: '[data-cy="btn-nav-bar-item-benefits"]',
    navCertifications: '[data-cy="btn-nav-bar-item-certifications"]',
    navConsents: '[data-cy="btn-nav-bar-item-consents"]',
    navActivity: '[data-cy="btn-nav-bar-item-activity"]',
    navCarePlan: '[data-cy="btn-nav-bar-item-care-plan"]',
    navPatientCalendar: '[data-cy="btn-nav-bar-item-patient-calendar"]',
    navPatientReports: '[data-cy="btn-nav-bar-item-patient-reports"]',
    navAllergies: '[data-cy="btn-nav-bar-item-allergies"]',
    navIntakeMeds: '[data-cy="btn-nav-bar-item-meds"]',
    navErxMeds: '[data-cy="btn-nav-bar-item-erx-meds"]',
    navHisHope: '[data-cy="btn-nav-bar-item-his"]',
    navNotes: '[data-cy="btn-nav-bar-item-notes"]',
    navDocuments: '[data-cy="btn-nav-bar-item-documents"]',

    // === Organization Dropdown ===
    organizationDropdown: '[data-cy="select-organization"]',

    // === Caller Section (verified on qa2 2026-03-12 via MCP) ===
    addCaller: '[data-cy="btn-add-caller"]',
    callerDetails: '[data-cy="btn-caller-details"]',
    callerFormReferralType: '[data-cy="select-referral-type"]',
    callerFormRelation: '[data-cy="select-relation-type"]',
    callerFormSearchPhysician: '[data-cy="select-search-physician"]',
    callerFormSearchPhysicianInput: '[data-cy="select-search-physician"] input',
    callerFormSearchCommunityResource: '[data-cy="input-search-community-resource"] input',
    callerFormPhysicianSearchResults: 'ng-dropdown-panel .ng-option',
    callerFormFirstName: 'ion-modal [data-cy="input-first-name"] input',
    callerFormLastName: 'ion-modal [data-cy="input-last-name"] input',
    callerFormNpi: 'ion-modal [data-cy="input-npi"] input',
    callerFormPhone: 'ion-modal [data-cy="input-phone-number"] input',
    callerFormFax: 'ion-modal [data-cy="input-fax-number"] input',
    callerFormEmail: 'ion-modal [data-cy="input-email-address"] input',
    callerFormSave: 'ion-modal [data-cy="btn-save"]',
    callerFormCancel: 'ion-modal [data-cy="btn-cancel"]',

    // === Referrer Section (verified on qa2 2026-03-12 via MCP) ===
    addReferrer: '[data-cy="btn-add-referrer"]',
    referrerDetails: '[data-cy="btn-referrer-details"]',
    referrerFormSameAsCaller: '[data-cy="checkbox-same-as-caller"]',
    referrerFormRelation: '[data-cy="select-relation-type"]',
    referrerFormSearchPhysician: '[data-cy="select-search-physician"]',
    referrerFormSearchInput: '[data-cy="select-search-physician"] input',
    referrerFormPhysicianSearchResults: 'ng-dropdown-panel .ng-option-label',
    referrerFormFirstName: 'ion-modal [data-cy="input-first-name"] input',
    referrerFormLastName: 'ion-modal [data-cy="input-last-name"] input',
    referrerFormNpi: 'ion-modal [data-cy="input-npi"] input',
    referrerFormPhone: 'ion-modal [data-cy="input-phone-number"] input',
    referrerFormEmail: 'ion-modal [data-cy="input-email-address"] input',
    referrerFormSave: 'ion-modal [data-cy="btn-save"]',
    referrerFormCancel: 'ion-modal [data-cy="btn-cancel"]',

    // === Referring Physician Section (verified on qa2 2026-03-12) ===
    addReferringPhysician: '[data-cy="btn-add-referring-physician"]',
    referringPhysicianDetails: '[data-cy="btn-referring-physician-details"]',
    referringPhysicianSameAsReferrer: '[data-cy="checkbox-same-as-referrer"]',
    referringPhysicianSearchPhysician: '[data-cy="select-search-physician"]',
    referringPhysicianSearchInput: '[data-cy="select-search-physician"] input',
    referringPhysicianSearchResults: 'ng-dropdown-panel .ng-option-label',
    referringPhysicianFormSave: 'ion-modal [data-cy="btn-save"]',
    referringPhysicianFormCancel: 'ion-modal [data-cy="btn-cancel"]',

    // === Ordering Physician Section (same form structure as referring physician) ===
    addOrderingPhysician: '[data-cy="btn-add-ordering-physician"]',
    orderingPhysicianDetails: '[data-cy="btn-ordering-physician-details"]',
    orderingPhysicianSameAsReferringPhysician: '[data-cy="checkbox-same-as-referrer"]',
    orderingPhysicianSearchPhysician: '[data-cy="select-search-physician"]',
    orderingPhysicianSearchInput: '[data-cy="select-search-physician"] input',
    orderingPhysicianSearchResults: 'ng-dropdown-panel .ng-option-label',
    orderingPhysicianFormSave: 'ion-modal [data-cy="btn-save"]',
    orderingPhysicianFormCancel: 'ion-modal [data-cy="btn-cancel"]',

    // === Sidebar Checkmark Icons ===
    sidebarTab: (section: string) => `[data-cy="btn-nav-bar-item-${section}"]`,
    sectionCheckmark: (section: string) => `[data-cy="icon-nav-bar-item-${section}"]`,

    // === Admit Patient / Cancel Referral ===
    admitPatientButton: '[data-cy="btn-admit-patient"]',
    cancelReferralButton: '[data-cy="btn-cancel-referral"]',

    // === Admission Modal ===
    admissionModalSave: '[data-cy="btn-save-admission"]',
    admissionModalCancel: '[data-cy="btn-cancel-dialog"]',
    admissionDatePicker: '[data-cy="input-admit-date"]',
  };

  constructor(page: Page) {
    super(page);
  }

  // === Tab Navigation ===
  async clickPatientDetailsTab(): Promise<void> {
    await this.page.locator(this.selectors.patientDetailsTab).click();
    await this.page.waitForTimeout(1000);
  }

  async clickLevelOfCareTab(): Promise<void> {
    await this.page.locator(this.selectors.levelOfCareTab).click();
    await this.page.waitForTimeout(1000);
  }

  async clickDiagnosisTab(): Promise<void> {
    await this.page.locator(this.selectors.diagnosisTab).click();
    await this.page.waitForTimeout(1000);
  }

  async clickStatusTab(): Promise<void> {
    await this.page.locator(this.selectors.statusTab).click();
    await this.page.waitForTimeout(1000);
  }

  // === Section Actions ===
  async editPatientDetails(): Promise<void> {
    await this.page.locator(this.selectors.editPatientDetails).click();
    await this.page.waitForTimeout(1000);
  }

  async togglePatientDetails(): Promise<void> {
    await this.page.locator(this.selectors.togglePatientDetails).click();
    await this.page.waitForTimeout(500);
  }

  async clickAddHospiceTransfer(): Promise<void> {
    await this.page.locator(this.selectors.addHospiceTransfer).click();
    await this.page.waitForTimeout(1000);
  }

  async clickAddPharmacy(): Promise<void> {
    await this.page.locator(this.selectors.addPharmacy).click();
    await this.page.waitForTimeout(1000);
  }

  async clickAddFuneralHome(): Promise<void> {
    await this.page.locator(this.selectors.addFuneralHome).click();
    await this.page.waitForTimeout(1000);
  }

  // === Sidebar Navigation ===
  async navigateToProfile(): Promise<void> {
    await this.page.locator(this.selectors.navProfile).click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToCareTeam(): Promise<void> {
    await this.page.locator(this.selectors.navCareTeam).click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToBenefits(): Promise<void> {
    await this.page.locator(this.selectors.navBenefits).last().click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToCertifications(): Promise<void> {
    await this.page.locator(this.selectors.navCertifications).last().click();
    await this.page.waitForTimeout(1000);
  }

  async navigateToConsents(): Promise<void> {
    await this.page.locator(this.selectors.navConsents).last().click();
    await this.page.waitForTimeout(1000);
  }

  // === Top Actions ===
  async clickPlanOfCare(): Promise<void> {
    await this.page.locator(this.selectors.planOfCareButton).click();
    await this.page.waitForTimeout(1000);
  }

  async clickOrderEntry(): Promise<void> {
    await this.page.locator(this.selectors.orderEntryButton).click();
    await this.page.waitForTimeout(1000);
  }

  // === Display Value Getters ===
  async getPatientName(): Promise<string> {
    return (await this.page.locator(this.selectors.textPatientName).textContent())?.trim() || '';
  }

  async getPatientGender(): Promise<string> {
    return (await this.page.locator(this.selectors.textPatientGender).textContent())?.trim() || '';
  }

  async getPatientTypeOfCare(): Promise<string> {
    return (await this.page.locator(this.selectors.textPatientTypeOfCare).textContent())?.trim() || '';
  }

  // === Sidebar Tab Navigation ===

  async clickSidebarTab(section: string): Promise<void> {
    const selector = this.selectors.sidebarTab(section);
    const tab = this.page.locator(selector).locator('visible=true');
    await tab.waitFor({ state: 'visible', timeout: 10000 });
    await tab.click();
    await this.page.waitForTimeout(1000);
    console.log(`Clicked sidebar tab: ${section}`);
  }

  // === Section Checkmark Methods ===

  async isSectionCheckmarkVisible(section: string): Promise<boolean> {
    const selector = this.selectors.sectionCheckmark(section);
    try {
      await this.page.locator(selector).locator('visible=true').waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForSectionCheckmark(section: string, timeout: number = 15000): Promise<void> {
    const selector = this.selectors.sectionCheckmark(section);
    await this.page.locator(selector).locator('visible=true').waitFor({ state: 'visible', timeout });
    console.log(`Checkmark visible for section: ${section}`);
  }

  async getCompletedSections(): Promise<string[]> {
    const sections = ['profile', 'care-team', 'benefits', 'certifications', 'consents'];
    const completed: string[] = [];
    for (const section of sections) {
      if (await this.isSectionCheckmarkVisible(section)) {
        completed.push(section);
      }
    }
    return completed;
  }

  async areAllSectionsComplete(): Promise<boolean> {
    const completed = await this.getCompletedSections();
    return completed.length === 5;
  }

  // === Admit Patient Methods ===

  async isAdmitPatientButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.admitPatientButton);
  }

  async clickAdmitPatient(): Promise<void> {
    const btn = this.page.locator(this.selectors.admitPatientButton).locator('visible=true');
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click();
    console.log('Clicked Admit Patient button');
  }

  async confirmAdmission(admitDate?: string): Promise<void> {
    await this.waitForElement(this.selectors.admissionModalSave, 10000);

    if (admitDate) {
      const dateInput = this.page.locator(`${this.selectors.admissionDatePicker} input`);
      if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dateInput.clear();
        await dateInput.fill(admitDate);
        await this.page.waitForTimeout(500);
      }
    }

    await this.page.locator(this.selectors.admissionModalSave).click({ force: true });
    await this.page.waitForLoadState('networkidle');
    console.log(`Confirmed admission${admitDate ? ` (date: ${admitDate})` : ''}`);
  }

  // === Selector Access ===

  getSelector<K extends keyof typeof this.selectors>(key: K): typeof this.selectors[K] {
    return this.selectors[key];
  }
}
