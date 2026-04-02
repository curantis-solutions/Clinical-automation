import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Patient Details Page Object
 * Handles patient profile details view and edit operations
 * This page displays patient information sections like:
 * - Patient Details, Aware of Referral, Hospice Transfer
 * - Pharmacy, Funeral Home, Caller, Referrer
 * - Referring Physician, Ordering Physician, Physician's Order, Referral Credit
 */
export class PatientDetailsPage extends BasePage {
  // Selectors from patient-details.html (data-cy attributes)
  private readonly selectors = {
    // Patient Details Section
    patientDetailsButton: '[data-cy="btn-patient-details"]',

    // Aware of Referral Section
    addAwareOfReferral: '[data-cy="btn-aware-of-referral"]',
    editAwareOfReferral: '[data-cy="btn-edit-aware-of-referral"]',
    awareOfReferralDetails: '[data-cy="btn-aware-of-referral-details"]',

    // Aware of Referral Form (Popover) - from aware-of-referral.html
    // Multiple checkboxes with same data-cy - use index or label to differentiate
    awareOfReferralCheckboxAll: '[data-cy="checkbox-aware-of-referral"]',
    awareOfReferralCheckboxByIndex: (index: number) => `[data-cy="checkbox-aware-of-referral"]:nth-of-type(${index + 1})`,
    awareOfReferralCheckboxByLabel: (labelText: string) => `ion-item:has(ion-label:text-is("${labelText}")) [data-cy="checkbox-aware-of-referral"]`,
    awareOfReferralCheckboxRow: (index: number) => `ion-grid[name="awareOfReferrals"] ion-row:nth-child(${index + 1}) [data-cy="checkbox-aware-of-referral"]`,
    awareOfReferralFormSave: '[data-cy="btn-save"]',
    awareOfReferralFormCancel: '[data-cy="btn-cancel"]',
    awareOfReferralFormSaveById: '#inputModalSubmit',
    awareOfReferralFormCancelById: '#inputModalCancel',
    awareOfReferralFormGrid: 'ion-grid[name="awareOfReferrals"]',

    // Hospice Transfer Section
    addHospiceTransferFab: '[data-cy="btn-add-hospice-transfer"]',
    addHospiceTransferButton: '#addHospiceTransfer',
    editHospiceTransfer: '[data-cy="btn-edit-hospice-transfer"]',
    hospiceTransferDetails: '[data-cy="btn-hospice-transfer-details"]',

    // Hospice Transfer Form (Popover) - from hospice-transfer.html
    hospiceTransferFormContent: '.hospice-transfer-content',
    hospiceTransferForm: '#hospiceForm',
    hospiceTransferRadioYes: '[data-cy="radio-hospice-radio-yes"]',
    hospiceTransferRadioNo: '[data-cy="radio-hospice-radio-no"]',
    hospiceTransferNpiNumber: '[data-cy="input-previousHospiceProviderNumber"]',
    hospiceTransferName: '[data-cy="input-name"]',
    hospiceTransferPhone: '[data-cy="input-phone-number"]',
    hospiceTransferFax: '[data-cy="input-fax-number"]',
    hospiceTransferEmail: '[data-cy="input-email-address"]',
    hospiceTransferStreetAddress: '[data-cy="input-streeet-address"]',
    hospiceTransferCity: '[data-cy="input-city"]',
    hospiceTransferState: '[data-cy="select-state"]',
    hospiceTransferStateOption: (state: string) => `.hospice-transfer-content [data-cy="option-state-${state}"]`,
    hospiceTransferZipCode: '[data-cy="input-zip-code"]',
    hospiceTransferZipExtension: '[data-cy="input-zip-extension"]',
    hospiceTransferCounty: '[data-cy="input-county"]',
    hospiceTransferDate: '[data-cy="datetime-transfer-date"]',
    hospiceTransferPrevAdmissionDate: '[data-cy="datetime-previous-hospice-admission-date"]',
    // Save/Cancel buttons - using form context to differentiate from other forms
    hospiceTransferFormSave: '.hospice-transfer-content ~ ion-footer [data-cy="btn-save"]',
    hospiceTransferFormCancel: '.hospice-transfer-content ~ ion-footer [data-cy="btn-cancel"]',
    hospiceTransferFormSaveAlt: 'ion-footer:has(#inputModalSubmit) [data-cy="btn-save"]',
    hospiceTransferFormCancelAlt: 'ion-footer:has(#inputModalCancel) [data-cy="btn-cancel"]',
    hospiceTransferNpiLink: '.hospice-transfer-assistance a[href*="npiregistry"]',

    // Pharmacy Section
    addPharmacyFab: '[data-cy="btn-add-pharmacy"]',
    addPharmacyIcon: '#addPharmacy',
    editPharmacy: '[data-cy="btn-edit-pharmacy"]',
    pharmacyDetails: '[data-cy="btn-pharmacy-details"]',

    // Funeral Home Section
    addFuneralHomeFab: '[data-cy="btn-add-funeral-home"]',
    addFuneralHomeIcon: '#addFuneralHome',
    editFuneralHome: '[data-cy="btn-edit-funeral-home"]',
    funeralHomeDetails: '[data-cy="btn-funeral-home-details"]',

    // Funeral Home / Pharmacy Form (Shared Popover) - from funeral-home-pharmacy.html
    // This form is used for both Pharmacy and Funeral Home
    funeralPharmacyFormContent: '.funeral-home-pharmacy-content',
    funeralPharmacyRadioYes: '[data-cy="radio-patient-have-preferred-yes"]',
    funeralPharmacyRadioNo: '[data-cy="radio-patient-have-preferred-no"]',
    funeralPharmacyLocationName: '[data-cy="input-location-name"]',
    funeralPharmacyFacilitiesOptions: '[data-cy="btn-hide-facilities-options"]',
    funeralPharmacyFacilityOption: (index: number) => `.searchOptionsContainer .searchOptionName:nth-child(${index + 2})`,
    funeralPharmacyName: '.funeral-home-pharmacy-content [data-cy="input-name"]',
    funeralPharmacyPhone: '.funeral-home-pharmacy-content [data-cy="input-phone-number"]',
    funeralPharmacyFax: '.funeral-home-pharmacy-content [data-cy="input-fax-number"]',
    funeralPharmacyEmail: '.funeral-home-pharmacy-content [data-cy="input-email-address"]',
    funeralPharmacyStreetAddress: '[data-cy="input-street-address"]',
    funeralPharmacyCity: '.funeral-home-pharmacy-content [data-cy="input-city"]',
    funeralPharmacyState: '.funeral-home-pharmacy-content [data-cy="select-state"]',
    funeralPharmacyStateOption: (state: string) => `.funeral-home-pharmacy-content [data-cy="option-state-${state}"]`,
    funeralPharmacyZipCode: '.funeral-home-pharmacy-content [data-cy="input-zip-code"]',
    funeralPharmacyZipExtension: '.funeral-home-pharmacy-content [data-cy="input-zip-extension"]',
    funeralPharmacyCounty: '[data-cy="input-country"]',
    // Save/Cancel - note: Cancel uses "input-cancel" not "btn-cancel"
    funeralPharmacyFormSave: '.funeral-home-pharmacy-content ~ ion-footer [data-cy="btn-save"]',
    funeralPharmacyFormCancel: '.funeral-home-pharmacy-content ~ ion-footer [data-cy="input-cancel"]',
    funeralPharmacyFormSaveById: '.funeral-home-pharmacy-content ~ ion-footer #inputModalSubmit',
    funeralPharmacyFormCancelById: '.funeral-home-pharmacy-content ~ ion-footer #inputModalCancel',

    // Caller Section
    addCaller: '[data-cy="btn-add-caller"]',
    editCaller: '[data-cy="btn-edit-caller"]',
    callerDetails: '[data-cy="btn-caller-details"]',

    // Caller Form (Popover) - from caller-popover.html
    // This form is used for Caller (type can vary)
    callerFormReferralType: '[data-cy="select-referral-type"]',
    callerFormReferralTypeOption: (id: string | number) => `[data-cy="option-referral-type-${id}"]`,
    callerFormReferralTypeOther: '[data-cy="input-referral-type"]',
    callerFormRelation: '[data-cy="select-relation"]',
    callerFormRelationOption: (id: string | number) => `[data-cy="option-relation-${id}"]`,
    callerFormSearchPhysician: '[data-cy="input-search-physician"] input',
    callerFormSearchCommunityResource: '[data-cy="input-search-community-resource"] input',
    callerFormPhysicianSearchResults: '.searchOptionsContainer .searchOptionName',
    callerFormFirstName: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="input-first-name"] input',
    callerFormLastName: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="input-last-name"] input',
    callerFormCredentials: '[data-cy="select-credentials"]',
    callerFormCredentialOption: (description: string) => `[data-cy="option-credential-${description}"]`,
    callerFormCredentialOther: '[data-cy="input-credential-other"] input',
    callerFormNpi: '[data-cy="input-npi"] input',
    callerFormPhone: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="input-phone-number"] input',
    callerFormMobile: '[data-cy="input-mobile-number"] input',
    callerFormFax: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="input-fax-number"] input',
    callerFormEmail: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="input-email-address"] input',
    callerFormStreetAddress: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="input-street-address"] input',
    callerFormStreetAddress2: '[data-cy="input-street-address-2"] input',
    callerFormCity: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="input-city"] input',
    callerFormState: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="select-state"]',
    callerFormStateOption: (state: string) => `ion-popover [data-cy="option-state-${state}"]`,
    callerFormZipCode: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="input-zip-code"] input',
    callerFormZipExtension: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="input-zip-extension"] input',
    callerFormCounty: 'ion-content:has([data-cy="select-referral-type"]) [data-cy="input-country"] input',
    callerFormSituationNotes: '[data-cy="textarea-situation-notes"]',
    // Save/Cancel buttons with form context
    callerFormSave: 'ion-content:has([data-cy="select-referral-type"]) ~ ion-footer [data-cy="btn-save"]',
    callerFormCancel: 'ion-content:has([data-cy="select-referral-type"]) ~ ion-footer [data-cy="btn-cancel"]',

    // Referrer Section
    addReferrer: '[data-cy="btn-add-referrer"]',
    referrerDetails: '[data-cy="btn-referrer-details"]',

    // Referrer Form (Popover) - from referrer.html
    // Unique element: checkbox-same-as-caller identifies this form
    referrerFormSameAsCaller: '[data-cy="checkbox-same-as-caller"]',
    referrerFormRelation: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="select-relation"]',
    referrerFormRelationOption: (id: string | number) => `ion-popover [data-cy="option-relation-${id}"]`,
    referrerFormSearchPhysician: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-search-physician"] input',
    referrerFormSearchCommunityResource: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-search-community-resource"] input',
    referrerFormPhysicianSearchResults: 'ion-content:has([data-cy="checkbox-same-as-caller"]) .searchOptionsContainer .searchOptionName',
    referrerFormFirstName: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-first-name"] input',
    referrerFormLastName: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-last-name"] input',
    referrerFormCredentials: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="select-credentials"]',
    referrerFormCredentialOption: (description: string) => `ion-popover [data-cy="option-credential-${description}"]`,
    referrerFormCredentialOther: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-credential-other"] input',
    referrerFormNpi: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-npi"] input',
    referrerFormPhone: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-phone-number"] input',
    referrerFormMobile: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-mobile-number"] input',
    referrerFormFax: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-fax-number"] input',
    referrerFormEmail: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-email-address"] input',
    // Note: Street Address 1 and 2 both use same data-cy, use ID to differentiate
    referrerFormStreetAddress: 'ion-content:has([data-cy="checkbox-same-as-caller"]) #street_address input',
    referrerFormStreetAddress2: 'ion-content:has([data-cy="checkbox-same-as-caller"]) #street_address_2 input',
    referrerFormCity: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-city"] input',
    referrerFormState: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="select-state"]',
    referrerFormStateOption: (state: string) => `ion-popover [data-cy="option-state-${state}"]`,
    referrerFormZipCode: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-zip-code"] input',
    referrerFormZipExtension: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-zip-extension"] input',
    referrerFormCounty: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="input-country"] input',
    referrerFormSituationNotes: 'ion-content:has([data-cy="checkbox-same-as-caller"]) [data-cy="textarea-situation-notes"]',
    // Save/Cancel buttons with form context
    referrerFormSave: 'ion-content:has([data-cy="checkbox-same-as-caller"]) ~ ion-footer [data-cy="btn-save"]',
    referrerFormCancel: 'ion-content:has([data-cy="checkbox-same-as-caller"]) ~ ion-footer [data-cy="btn-cancel"]',

    // Referring Physician Section
    addReferringPhysician: '[data-cy="btn-add-referring-physician"]',
    editReferringPhysician: '[data-cy="btn-edit-referring-physician"]',
    referringPhysicianDetails: '[data-cy="btn-referring-physician-details"]',

    // Referring Physician Form (Popover) - from referring-physician.html
    // Unique elements: .referring-physician-content class, checkbox-same-as-referrer
    referringPhysicianFormContent: '.referring-physician-content',
    referringPhysicianSameAsReferrer: '[data-cy="checkbox-same-as-referrer"]',
    referringPhysicianRelation: '.referring-physician-content [data-cy="input-relation"]',
    referringPhysicianSearchPhysician: '.referring-physician-content [data-cy="input-search-physician"] input',
    referringPhysicianSearchResults: '.referring-physician-content .searchOptionsContainer .searchOptionName',
    referringPhysicianFirstName: '.referring-physician-content [data-cy="input-first-name"] input',
    referringPhysicianLastName: '.referring-physician-content [data-cy="input-last-name"] input',
    referringPhysicianCredentials: '.referring-physician-content [data-cy="select-credentials"]',
    referringPhysicianCredentialOption: (description: string) => `ion-popover [data-cy="option-credential-${description}"]`,
    referringPhysicianCredentialOther: '.referring-physician-content [data-cy="input-credential-other"] input',
    referringPhysicianNpi: '.referring-physician-content [data-cy="input-npi"] input',
    referringPhysicianPhone: '.referring-physician-content [data-cy="input-phone-number"] input',
    referringPhysicianMobile: '.referring-physician-content [data-cy="input-mobile-number"] input',
    referringPhysicianFax: '.referring-physician-content [data-cy="input-fax-number"] input',
    referringPhysicianEmail: '.referring-physician-content [data-cy="input-email-address"] input',
    referringPhysicianStreetAddress: '.referring-physician-content [data-cy="input-street-address"] input',
    referringPhysicianStreetAddress2: '.referring-physician-content [data-cy="input-street-address-2"] input',
    referringPhysicianCity: '.referring-physician-content [data-cy="input-city"] input',
    referringPhysicianState: '.referring-physician-content [data-cy="select-state"]',
    referringPhysicianStateOption: (state: string) => `ion-popover [data-cy="option-state-${state}"]`,
    referringPhysicianZipCode: '.referring-physician-content [data-cy="input-zip-code"] input',
    referringPhysicianZipExtension: '.referring-physician-content [data-cy="input-zip-extension"] input',
    referringPhysicianCounty: '.referring-physician-content [data-cy="input-county"] input',
    referringPhysicianSituationNotes: '.referring-physician-content [data-cy="textarea-situation-notes"]',
    referringPhysicianFormSave: '.referring-physician-content ~ ion-footer [data-cy="btn-save"]',
    referringPhysicianFormCancel: '.referring-physician-content ~ ion-footer [data-cy="btn-cancel"]',

    // Ordering Physician Section
    addOrderingPhysician: '[data-cy="btn-add-ordering-physician"]',
    editOrderingPhysician: '[data-cy="btn-edit-ordering-physician"]',
    orderingPhysicianDetails: '[data-cy="btn-ordering-physician-details"]',

    // Ordering Physician Form (Popover) - uses same HTML as referring physician
    orderingPhysicianFormContent: '.referring-physician-content',
    orderingPhysicianSameAsReferringPhysician: '[data-cy="checkbox-same-as-referrer"]',
    orderingPhysicianRelation: '.referring-physician-content [data-cy="input-relation"]',
    orderingPhysicianSearchPhysician: '.referring-physician-content [data-cy="input-search-physician"] input',
    orderingPhysicianSearchResults: '.referring-physician-content .searchOptionsContainer .searchOptionName',
    orderingPhysicianFirstName: '.referring-physician-content [data-cy="input-first-name"] input',
    orderingPhysicianLastName: '.referring-physician-content [data-cy="input-last-name"] input',
    orderingPhysicianCredentials: '.referring-physician-content [data-cy="select-credentials"]',
    orderingPhysicianCredentialOption: (description: string) => `ion-popover [data-cy="option-credential-${description}"]`,
    orderingPhysicianCredentialOther: '.referring-physician-content [data-cy="input-credential-other"] input',
    orderingPhysicianNpi: '.referring-physician-content [data-cy="input-npi"] input',
    orderingPhysicianPhone: '.referring-physician-content [data-cy="input-phone-number"] input',
    orderingPhysicianMobile: '.referring-physician-content [data-cy="input-mobile-number"] input',
    orderingPhysicianFax: '.referring-physician-content [data-cy="input-fax-number"] input',
    orderingPhysicianEmail: '.referring-physician-content [data-cy="input-email-address"] input',
    orderingPhysicianStreetAddress: '.referring-physician-content [data-cy="input-street-address"] input',
    orderingPhysicianStreetAddress2: '.referring-physician-content [data-cy="input-street-address-2"] input',
    orderingPhysicianCity: '.referring-physician-content [data-cy="input-city"] input',
    orderingPhysicianState: '.referring-physician-content [data-cy="select-state"]',
    orderingPhysicianStateOption: (state: string) => `ion-popover [data-cy="option-state-${state}"]`,
    orderingPhysicianZipCode: '.referring-physician-content [data-cy="input-zip-code"] input',
    orderingPhysicianZipExtension: '.referring-physician-content [data-cy="input-zip-extension"] input',
    orderingPhysicianCounty: '.referring-physician-content [data-cy="input-county"] input',
    orderingPhysicianSituationNotes: '.referring-physician-content [data-cy="textarea-situation-notes"]',
    orderingPhysicianFormSave: '.referring-physician-content ~ ion-footer [data-cy="btn-save"]',
    orderingPhysicianFormCancel: '.referring-physician-content ~ ion-footer [data-cy="btn-cancel"]',

    // Physician's Order Section
    addPhysicianOrder: '[data-cy="btn-add-physician-order"]',
    editPhysicianOrder: '[data-cy="btn-edit-physician-order"]',
    physicianOrderDetails: '[data-cy="btn-physician-order-details"]',

    // Physician's Order Form (Popover) - from physicians-order.html
    physicianOrderRadioAdmit: '[data-cy="radio-physician-order-admit"]',
    physicianOrderRadioEvaluate: '[data-cy="radio-physician-order-evaluate"]',
    physicianOrderRadioEvaluateAdmit: '[data-cy="radio-physician-order-evaluate-admit"]',
    physicianOrderRadioNo: '[data-cy="radio-physician-order-no"]',
    physicianOrderFormSave: 'ion-content:has([data-cy="radio-physician-order-admit"]) ~ ion-footer [data-cy="btn-save"]',
    physicianOrderFormCancel: 'ion-content:has([data-cy="radio-physician-order-admit"]) ~ ion-footer [data-cy="btn-cancel"]',

    // Referral Credit Section
    addReferralCredit: '[data-cy="btn-add-referral-credit"]',
    editReferralCredit: '[data-cy="btn-edit-referral-credit"]',
    referralCreditDetails: '[data-cy="btn-referral-credit-details"]',

    // Referral Credit Form (Popover) - from referrals-credit.html
    // Unique identifier: .page-referrals-credit class, select-referral-credit
    referralCreditFormContent: '.page-referrals-credit',
    referralCreditType: '[data-cy="select-referral-credit"]',
    referralCreditTypeOption: (id: string | number) => `[data-cy="option-referral-credit-${id}"]`,
    // Note: Relation dropdown has incomplete data-cy="select-", using ID instead
    referralCreditRelation: '.page-referrals-credit #relationSelect',
    referralCreditRelationOption: (id: string | number) => `ion-popover [data-cy="option-relation-${id}"]`,
    referralCreditFirstName: '.page-referrals-credit [data-cy="input-first-name"]',
    referralCreditLastName: '.page-referrals-credit [data-cy="input-last-name"]',
    referralCreditNpi: '.page-referrals-credit [data-cy="input-npi"]',
    referralCreditPhone: '.page-referrals-credit [data-cy="input-phone-number"]',
    referralCreditMobile: '.page-referrals-credit [data-cy="input-mobile-number"]',
    referralCreditFax: '.page-referrals-credit [data-cy="input-fax-number"]',
    referralCreditEmail: '.page-referrals-credit [data-cy="input-email-address"]',
    referralCreditStreetAddress: '.page-referrals-credit [data-cy="input-street-address"]',
    referralCreditCity: '.page-referrals-credit [data-cy="input-city"]',
    referralCreditState: '.page-referrals-credit [data-cy="select-state"]',
    referralCreditStateOption: (state: string) => `ion-popover [data-cy="option-state-${state}"]`,
    referralCreditZipCode: '.page-referrals-credit [data-cy="input-zip-code"]',
    // Note: This form uses "input-zip-code-extension" instead of "input-zip-extension"
    referralCreditZipExtension: '.page-referrals-credit [data-cy="input-zip-code-extension"]',
    referralCreditCounty: '.page-referrals-credit [data-cy="input-county"]',
    referralCreditSituationNotes: '.page-referrals-credit [data-cy="textarea-situation-notes"]',
    referralCreditFormSave: '.page-referrals-credit ~ ion-footer [data-cy="btn-save"]',
    referralCreditFormCancel: '.page-referrals-credit ~ ion-footer [data-cy="btn-cancel"]',

    // Common UI Elements
    profileHeader: '.referral-header-bar',
    patientDetailsSection: '.patient-details',
    notAuthorizedMessage: '.not_authorized_box',
    moreIcon: '.more-icon',

    // Sidebar Navigation Tabs
    sidebarTab: (section: string) => `[data-cy="btn-nav-bar-item-${section}"]`,

    // Sidebar Checkmark Icons (conditionally rendered when section is complete)
    sectionCheckmark: (section: string) => `[data-cy="icon-nav-bar-item-${section}"]`,

    // Admit Patient / Cancel Referral Buttons
    admitPatientButton: '[data-cy="btn-admit-patient"]',
    cancelReferralButton: '[data-cy="btn-cancel-referral"]',

    // Admission Complete Modal
    admissionModalSave: '#inputModalSubmit',
    admissionModalCancel: '#inputModalCancel',
  };

  constructor(page: Page) {
    super(page);
  }

  // ==================== Patient Details Section ====================

  /**
   * Click on Patient Details button to open edit/view popover
   */
  async clickPatientDetails(): Promise<void> {
    await this.waitForElement(this.selectors.patientDetailsButton);
    await this.page.locator(this.selectors.patientDetailsButton).first().click();
    console.log('Clicked Patient Details button');
  }

  /**
   * Check if patient details section is visible
   */
  async isPatientDetailsSectionVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.patientDetailsSection);
  }

  // ==================== Aware of Referral Section ====================

  /**
   * Click Add Aware of Referral button
   */
  async clickAddAwareOfReferral(): Promise<void> {
    await this.waitForElement(this.selectors.addAwareOfReferral);
    await this.page.locator(this.selectors.addAwareOfReferral).click();
    console.log('Clicked Add Aware of Referral button');
  }

  /**
   * Click Edit Aware of Referral button
   */
  async clickEditAwareOfReferral(): Promise<void> {
    await this.waitForElement(this.selectors.editAwareOfReferral);
    await this.page.locator(this.selectors.editAwareOfReferral).click();
    console.log('Clicked Edit Aware of Referral button');
  }

  /**
   * Toggle Aware of Referral details section
   */
  async toggleAwareOfReferralDetails(): Promise<void> {
    await this.waitForElement(this.selectors.awareOfReferralDetails);
    await this.page.locator(this.selectors.awareOfReferralDetails).click();
    console.log('Toggled Aware of Referral details');
  }

  /**
   * Check if Add Aware of Referral button is visible
   */
  async isAddAwareOfReferralVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addAwareOfReferral);
  }

  // ==================== Aware of Referral Form Methods ====================

  /**
   * Click Aware of Referral checkbox by index (0-based)
   * @param index - 0-based index of the checkbox
   */
  async clickAwareOfReferralCheckboxByIndex(index: number): Promise<void> {
    const selector = this.selectors.awareOfReferralCheckboxRow(index);
    await this.waitForElement(selector);
    await this.page.locator(selector).click();
    console.log(`Clicked Aware of Referral checkbox at index: ${index}`);
  }

  /**
   * Click Aware of Referral checkbox by label text
   * @param labelText - The label text associated with the checkbox
   */
  async clickAwareOfReferralCheckboxByLabel(labelText: string): Promise<void> {
    const selector = this.selectors.awareOfReferralCheckboxByLabel(labelText);
    await this.waitForElement(selector);
    await this.page.locator(selector).click();
    console.log(`Clicked Aware of Referral checkbox with label: ${labelText}`);
  }

  /**
   * Click all Aware of Referral checkboxes
   */
  async clickAllAwareOfReferralCheckboxes(): Promise<void> {
    const checkboxes = this.page.locator(this.selectors.awareOfReferralCheckboxAll);
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).click();
      await this.page.waitForTimeout(300);
    }
    console.log(`Clicked all ${count} Aware of Referral checkboxes`);
  }

  /**
   * Get count of Aware of Referral checkboxes
   */
  async getAwareOfReferralCheckboxCount(): Promise<number> {
    const checkboxes = this.page.locator(this.selectors.awareOfReferralCheckboxAll);
    return await checkboxes.count();
  }

  /**
   * Check if specific Aware of Referral checkbox is checked by index
   * @param index - 0-based index of the checkbox
   */
  async isAwareOfReferralCheckboxChecked(index: number): Promise<boolean> {
    const selector = this.selectors.awareOfReferralCheckboxRow(index);
    const checkbox = this.page.locator(selector);
    const isChecked = await checkbox.getAttribute('checked');
    return isChecked === 'true' || isChecked === '';
  }

  /**
   * Click Save button on Aware of Referral form
   */
  async clickAwareOfReferralFormSave(): Promise<void> {
    await this.waitForElement(this.selectors.awareOfReferralFormSave);
    await this.page.locator(this.selectors.awareOfReferralFormSave).click();
    await this.page.waitForLoadState('networkidle');
    console.log('Clicked Save on Aware of Referral form');
  }

  /**
   * Click Cancel button on Aware of Referral form
   */
  async clickAwareOfReferralFormCancel(): Promise<void> {
    await this.waitForElement(this.selectors.awareOfReferralFormCancel);
    await this.page.locator(this.selectors.awareOfReferralFormCancel).click();
    console.log('Clicked Cancel on Aware of Referral form');
  }

  /**
   * Check if Aware of Referral form is visible
   */
  async isAwareOfReferralFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.awareOfReferralFormGrid);
  }

  // ==================== Hospice Transfer Section ====================

  /**
   * Click Add Hospice Transfer button
   */
  async clickAddHospiceTransfer(): Promise<void> {
    const fabVisible = await this.isElementVisible(this.selectors.addHospiceTransferFab);
    if (fabVisible) {
      await this.page.locator(this.selectors.addHospiceTransferFab).click();
    } else {
      await this.page.locator(this.selectors.addHospiceTransferButton).click();
    }
    console.log('Clicked Add Hospice Transfer button');
  }

  /**
   * Click Edit Hospice Transfer button
   */
  async clickEditHospiceTransfer(): Promise<void> {
    await this.waitForElement(this.selectors.editHospiceTransfer);
    await this.page.locator(this.selectors.editHospiceTransfer).click();
    console.log('Clicked Edit Hospice Transfer button');
  }

  /**
   * Toggle Hospice Transfer details section
   */
  async toggleHospiceTransferDetails(): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferDetails);
    await this.page.locator(this.selectors.hospiceTransferDetails).click();
    console.log('Toggled Hospice Transfer details');
  }

  /**
   * Check if Add Hospice Transfer button is visible
   */
  async isAddHospiceTransferVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addHospiceTransferFab);
  }

  // ==================== Hospice Transfer Form Methods ====================

  /**
   * Select Yes for hospice transfer question
   */
  async selectHospiceTransferYes(): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferRadioYes);
    await this.page.locator(this.selectors.hospiceTransferRadioYes).click();
    console.log('Selected Yes for hospice transfer');
  }

  /**
   * Select No for hospice transfer question
   */
  async selectHospiceTransferNo(): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferRadioNo);
    await this.page.locator(this.selectors.hospiceTransferRadioNo).click();
    console.log('Selected No for hospice transfer');
  }

  /**
   * Fill Previous Hospice NPI Number
   */
  async fillHospiceTransferNpiNumber(npiNumber: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferNpiNumber);
    await this.page.locator(`${this.selectors.hospiceTransferNpiNumber} input`).fill(npiNumber);
    console.log(`Filled NPI Number: ${npiNumber}`);
  }

  /**
   * Fill Hospice Name
   */
  async fillHospiceTransferName(name: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferName);
    await this.page.locator(`${this.selectors.hospiceTransferName} input`).fill(name);
    console.log(`Filled Hospice Name: ${name}`);
  }

  /**
   * Fill Hospice Transfer Phone Number
   */
  async fillHospiceTransferPhone(phone: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferPhone);
    await this.page.locator(`${this.selectors.hospiceTransferPhone} input`).fill(phone);
    console.log(`Filled Phone: ${phone}`);
  }

  /**
   * Fill Hospice Transfer Fax Number
   */
  async fillHospiceTransferFax(fax: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferFax);
    await this.page.locator(`${this.selectors.hospiceTransferFax} input`).fill(fax);
    console.log(`Filled Fax: ${fax}`);
  }

  /**
   * Fill Hospice Transfer Email Address
   */
  async fillHospiceTransferEmail(email: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferEmail);
    await this.page.locator(`${this.selectors.hospiceTransferEmail} input`).fill(email);
    console.log(`Filled Email: ${email}`);
  }

  /**
   * Fill Hospice Transfer Street Address
   */
  async fillHospiceTransferStreetAddress(address: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferStreetAddress);
    await this.page.locator(`${this.selectors.hospiceTransferStreetAddress} input`).fill(address);
    console.log(`Filled Street Address: ${address}`);
  }

  /**
   * Fill Hospice Transfer City
   */
  async fillHospiceTransferCity(city: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferCity);
    await this.page.locator(`${this.selectors.hospiceTransferCity} input`).fill(city);
    console.log(`Filled City: ${city}`);
  }

  /**
   * Select Hospice Transfer State
   */
  async selectHospiceTransferState(state: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferState);
    await this.page.locator(this.selectors.hospiceTransferState).click();
    await this.page.waitForTimeout(500);
    const stateOption = this.selectors.hospiceTransferStateOption(state);
    await this.page.locator(stateOption).click();
    console.log(`Selected State: ${state}`);
  }

  /**
   * Fill Hospice Transfer Zip Code
   */
  async fillHospiceTransferZipCode(zipCode: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferZipCode);
    await this.page.locator(`${this.selectors.hospiceTransferZipCode} input`).fill(zipCode);
    console.log(`Filled Zip Code: ${zipCode}`);
  }

  /**
   * Fill Hospice Transfer Zip Extension
   */
  async fillHospiceTransferZipExtension(zipExt: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferZipExtension);
    await this.page.locator(`${this.selectors.hospiceTransferZipExtension} input`).fill(zipExt);
    console.log(`Filled Zip Extension: ${zipExt}`);
  }

  /**
   * Get Hospice Transfer County (read-only field)
   */
  async getHospiceTransferCounty(): Promise<string | null> {
    await this.waitForElement(this.selectors.hospiceTransferCounty);
    return await this.page.locator(`${this.selectors.hospiceTransferCounty} input`).inputValue();
  }

  /**
   * Select Hospice Transfer Date
   */
  async selectHospiceTransferDate(date: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferDate);
    await this.page.locator(this.selectors.hospiceTransferDate).click();
    await this.page.waitForTimeout(500);
    // Date picker interaction - may need adjustment based on actual picker behavior
    console.log(`Selected Transfer Date: ${date}`);
  }

  /**
   * Select Previous Hospice Admission Date
   */
  async selectHospiceTransferPrevAdmissionDate(date: string): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferPrevAdmissionDate);
    await this.page.locator(this.selectors.hospiceTransferPrevAdmissionDate).click();
    await this.page.waitForTimeout(500);
    // Date picker interaction - may need adjustment based on actual picker behavior
    console.log(`Selected Previous Admission Date: ${date}`);
  }

  /**
   * Click Save button on Hospice Transfer form
   */
  async clickHospiceTransferFormSave(): Promise<void> {
    // Try the specific selector first, then fallback
    const saveVisible = await this.isElementVisible(this.selectors.hospiceTransferFormSave);
    if (saveVisible) {
      await this.page.locator(this.selectors.hospiceTransferFormSave).click();
    } else {
      await this.page.locator(this.selectors.hospiceTransferFormSaveAlt).click();
    }
    await this.page.waitForLoadState('networkidle');
    console.log('Clicked Save on Hospice Transfer form');
  }

  /**
   * Click Cancel button on Hospice Transfer form
   */
  async clickHospiceTransferFormCancel(): Promise<void> {
    const cancelVisible = await this.isElementVisible(this.selectors.hospiceTransferFormCancel);
    if (cancelVisible) {
      await this.page.locator(this.selectors.hospiceTransferFormCancel).click();
    } else {
      await this.page.locator(this.selectors.hospiceTransferFormCancelAlt).click();
    }
    console.log('Clicked Cancel on Hospice Transfer form');
  }

  /**
   * Check if Hospice Transfer form is visible
   */
  async isHospiceTransferFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.hospiceTransferFormContent);
  }

  /**
   * Click NPI Registry link
   */
  async clickNpiRegistryLink(): Promise<void> {
    await this.waitForElement(this.selectors.hospiceTransferNpiLink);
    await this.page.locator(this.selectors.hospiceTransferNpiLink).click();
    console.log('Clicked NPI Registry link');
  }

  /**
   * Fill complete Hospice Transfer form
   */
  async fillHospiceTransferForm(data: {
    npiNumber?: string;
    name?: string;
    phone?: string;
    fax?: string;
    email?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipExtension?: string;
  }): Promise<void> {
    if (data.npiNumber) await this.fillHospiceTransferNpiNumber(data.npiNumber);
    if (data.name) await this.fillHospiceTransferName(data.name);
    if (data.phone) await this.fillHospiceTransferPhone(data.phone);
    if (data.fax) await this.fillHospiceTransferFax(data.fax);
    if (data.email) await this.fillHospiceTransferEmail(data.email);
    if (data.streetAddress) await this.fillHospiceTransferStreetAddress(data.streetAddress);
    if (data.city) await this.fillHospiceTransferCity(data.city);
    if (data.state) await this.selectHospiceTransferState(data.state);
    if (data.zipCode) await this.fillHospiceTransferZipCode(data.zipCode);
    if (data.zipExtension) await this.fillHospiceTransferZipExtension(data.zipExtension);
    console.log('Filled Hospice Transfer form');
  }

  // ==================== Pharmacy Section ====================

  /**
   * Click Add Pharmacy button
   */
  async clickAddPharmacy(): Promise<void> {
    const fabVisible = await this.isElementVisible(this.selectors.addPharmacyFab);
    if (fabVisible) {
      await this.page.locator(this.selectors.addPharmacyFab).click();
    } else {
      await this.page.locator(this.selectors.addPharmacyIcon).click();
    }
    console.log('Clicked Add Pharmacy button');
  }

  /**
   * Click Edit Pharmacy button
   */
  async clickEditPharmacy(): Promise<void> {
    await this.waitForElement(this.selectors.editPharmacy);
    await this.page.locator(this.selectors.editPharmacy).click();
    console.log('Clicked Edit Pharmacy button');
  }

  /**
   * Toggle Pharmacy details section
   */
  async togglePharmacyDetails(): Promise<void> {
    await this.waitForElement(this.selectors.pharmacyDetails);
    await this.page.locator(this.selectors.pharmacyDetails).click();
    console.log('Toggled Pharmacy details');
  }

  /**
   * Check if Add Pharmacy button is visible
   */
  async isAddPharmacyVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addPharmacyFab);
  }

  // ==================== Funeral Home Section ====================

  /**
   * Click Add Funeral Home button
   */
  async clickAddFuneralHome(): Promise<void> {
    const fabVisible = await this.isElementVisible(this.selectors.addFuneralHomeFab);
    if (fabVisible) {
      await this.page.locator(this.selectors.addFuneralHomeFab).click();
    } else {
      await this.page.locator(this.selectors.addFuneralHomeIcon).click();
    }
    console.log('Clicked Add Funeral Home button');
  }

  /**
   * Click Edit Funeral Home button
   */
  async clickEditFuneralHome(): Promise<void> {
    await this.waitForElement(this.selectors.editFuneralHome);
    await this.page.locator(this.selectors.editFuneralHome).click();
    console.log('Clicked Edit Funeral Home button');
  }

  /**
   * Toggle Funeral Home details section
   */
  async toggleFuneralHomeDetails(): Promise<void> {
    await this.waitForElement(this.selectors.funeralHomeDetails);
    await this.page.locator(this.selectors.funeralHomeDetails).click();
    console.log('Toggled Funeral Home details');
  }

  /**
   * Check if Add Funeral Home button is visible
   */
  async isAddFuneralHomeVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addFuneralHomeFab);
  }

  // ==================== Funeral Home / Pharmacy Form Methods ====================
  // This form is shared for both Pharmacy and Funeral Home

  /**
   * Select Yes for "Does patient have preferred Pharmacy/Funeral Home" question
   */
  async selectFuneralPharmacyYes(): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyRadioYes);
    await this.page.locator(this.selectors.funeralPharmacyRadioYes).click();
    console.log('Selected Yes for preferred Funeral Home/Pharmacy');
  }

  /**
   * Select No for "Does patient have preferred Pharmacy/Funeral Home" question
   */
  async selectFuneralPharmacyNo(): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyRadioNo);
    await this.page.locator(this.selectors.funeralPharmacyRadioNo).click();
    console.log('Selected No for preferred Funeral Home/Pharmacy');
  }

  /**
   * Search for facility by location name
   */
  async searchFuneralPharmacyByLocationName(locationName: string): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyLocationName);
    await this.page.locator(`${this.selectors.funeralPharmacyLocationName} input`).fill(locationName);
    await this.page.waitForTimeout(1000);
    console.log(`Searched for location: ${locationName}`);
  }

  /**
   * Select facility from search results by index (0-based)
   */
  async selectFuneralPharmacyFacilityByIndex(index: number): Promise<void> {
    const selector = this.selectors.funeralPharmacyFacilityOption(index);
    await this.waitForElement(selector);
    await this.page.locator(selector).click();
    console.log(`Selected facility at index: ${index}`);
  }

  /**
   * Check if facility search options are visible
   */
  async isFuneralPharmacyFacilitiesOptionsVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.funeralPharmacyFacilitiesOptions);
  }

  /**
   * Fill Funeral Home / Pharmacy Name
   */
  async fillFuneralPharmacyName(name: string): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyName);
    await this.page.locator(`${this.selectors.funeralPharmacyName} input`).fill(name);
    console.log(`Filled Name: ${name}`);
  }

  /**
   * Fill Funeral Home / Pharmacy Phone Number
   */
  async fillFuneralPharmacyPhone(phone: string): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyPhone);
    await this.page.locator(`${this.selectors.funeralPharmacyPhone} input`).fill(phone);
    console.log(`Filled Phone: ${phone}`);
  }

  /**
   * Fill Funeral Home / Pharmacy Fax Number
   */
  async fillFuneralPharmacyFax(fax: string): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyFax);
    await this.page.locator(`${this.selectors.funeralPharmacyFax} input`).fill(fax);
    console.log(`Filled Fax: ${fax}`);
  }

  /**
   * Fill Funeral Home / Pharmacy Email Address
   */
  async fillFuneralPharmacyEmail(email: string): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyEmail);
    await this.page.locator(`${this.selectors.funeralPharmacyEmail} input`).fill(email);
    console.log(`Filled Email: ${email}`);
  }

  /**
   * Fill Funeral Home / Pharmacy Street Address
   */
  async fillFuneralPharmacyStreetAddress(address: string): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyStreetAddress);
    await this.page.locator(`${this.selectors.funeralPharmacyStreetAddress} input`).fill(address);
    console.log(`Filled Street Address: ${address}`);
  }

  /**
   * Fill Funeral Home / Pharmacy City
   */
  async fillFuneralPharmacyCity(city: string): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyCity);
    await this.page.locator(`${this.selectors.funeralPharmacyCity} input`).fill(city);
    console.log(`Filled City: ${city}`);
  }

  /**
   * Select Funeral Home / Pharmacy State
   */
  async selectFuneralPharmacyState(state: string): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyState);
    await this.page.locator(this.selectors.funeralPharmacyState).click();
    await this.page.waitForTimeout(500);
    const stateOption = this.selectors.funeralPharmacyStateOption(state);
    await this.page.locator(stateOption).click();
    console.log(`Selected State: ${state}`);
  }

  /**
   * Fill Funeral Home / Pharmacy Zip Code
   */
  async fillFuneralPharmacyZipCode(zipCode: string): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyZipCode);
    await this.page.locator(`${this.selectors.funeralPharmacyZipCode} input`).fill(zipCode);
    console.log(`Filled Zip Code: ${zipCode}`);
  }

  /**
   * Fill Funeral Home / Pharmacy Zip Extension
   */
  async fillFuneralPharmacyZipExtension(zipExt: string): Promise<void> {
    await this.waitForElement(this.selectors.funeralPharmacyZipExtension);
    await this.page.locator(`${this.selectors.funeralPharmacyZipExtension} input`).fill(zipExt);
    console.log(`Filled Zip Extension: ${zipExt}`);
  }

  /**
   * Get Funeral Home / Pharmacy County (read-only field)
   */
  async getFuneralPharmacyCounty(): Promise<string | null> {
    await this.waitForElement(this.selectors.funeralPharmacyCounty);
    return await this.page.locator(`${this.selectors.funeralPharmacyCounty} input`).inputValue();
  }

  /**
   * Click Save button on Funeral Home / Pharmacy form
   */
  async clickFuneralPharmacyFormSave(): Promise<void> {
    const saveVisible = await this.isElementVisible(this.selectors.funeralPharmacyFormSave);
    if (saveVisible) {
      await this.page.locator(this.selectors.funeralPharmacyFormSave).click();
    } else {
      await this.page.locator(this.selectors.funeralPharmacyFormSaveById).click();
    }
    await this.page.waitForLoadState('networkidle');
    console.log('Clicked Save on Funeral Home/Pharmacy form');
  }

  /**
   * Click Cancel button on Funeral Home / Pharmacy form
   */
  async clickFuneralPharmacyFormCancel(): Promise<void> {
    const cancelVisible = await this.isElementVisible(this.selectors.funeralPharmacyFormCancel);
    if (cancelVisible) {
      await this.page.locator(this.selectors.funeralPharmacyFormCancel).click();
    } else {
      await this.page.locator(this.selectors.funeralPharmacyFormCancelById).click();
    }
    console.log('Clicked Cancel on Funeral Home/Pharmacy form');
  }

  /**
   * Check if Funeral Home / Pharmacy form is visible
   */
  async isFuneralPharmacyFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.funeralPharmacyFormContent);
  }

  /**
   * Fill complete Funeral Home / Pharmacy form
   */
  async fillFuneralPharmacyForm(data: {
    name?: string;
    phone?: string;
    fax?: string;
    email?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipExtension?: string;
  }): Promise<void> {
    if (data.name) await this.fillFuneralPharmacyName(data.name);
    if (data.phone) await this.fillFuneralPharmacyPhone(data.phone);
    if (data.fax) await this.fillFuneralPharmacyFax(data.fax);
    if (data.email) await this.fillFuneralPharmacyEmail(data.email);
    if (data.streetAddress) await this.fillFuneralPharmacyStreetAddress(data.streetAddress);
    if (data.city) await this.fillFuneralPharmacyCity(data.city);
    if (data.state) await this.selectFuneralPharmacyState(data.state);
    if (data.zipCode) await this.fillFuneralPharmacyZipCode(data.zipCode);
    if (data.zipExtension) await this.fillFuneralPharmacyZipExtension(data.zipExtension);
    console.log('Filled Funeral Home/Pharmacy form');
  }

  // ==================== Caller Section ====================

  /**
   * Click Add Caller button
   */
  async clickAddCaller(): Promise<void> {
    await this.waitForElement(this.selectors.addCaller);
    await this.page.locator(this.selectors.addCaller).click();
    console.log('Clicked Add Caller button');
  }

  /**
   * Click Edit Caller button
   */
  async clickEditCaller(): Promise<void> {
    await this.waitForElement(this.selectors.editCaller);
    await this.page.locator(this.selectors.editCaller).click();
    console.log('Clicked Edit Caller button');
  }

  /**
   * Toggle Caller details section
   */
  async toggleCallerDetails(): Promise<void> {
    await this.waitForElement(this.selectors.callerDetails);
    await this.page.locator(this.selectors.callerDetails).click();
    console.log('Toggled Caller details');
  }

  /**
   * Check if Add Caller button is visible
   */
  async isAddCallerVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addCaller);
  }

  // ==================== Caller Form Methods ====================

  /**
   * Select Referral Type from dropdown
   */
  async selectCallerReferralType(id: string | number): Promise<void> {
    await this.waitForElement(this.selectors.callerFormReferralType);
    await this.page.locator(this.selectors.callerFormReferralType).click();
    await this.page.waitForTimeout(500);
    const option = this.selectors.callerFormReferralTypeOption(id);
    await this.page.locator(option).click();
    console.log(`Selected Referral Type: ${id}`);
  }

  /**
   * Fill Other Referral Type (when id=4 is selected)
   */
  async fillCallerOtherReferralType(value: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormReferralTypeOther);
    await this.page.locator(`${this.selectors.callerFormReferralTypeOther} input`).fill(value);
    console.log(`Filled Other Referral Type: ${value}`);
  }

  /**
   * Select Relation from dropdown
   */
  async selectCallerRelation(id: string | number): Promise<void> {
    await this.waitForElement(this.selectors.callerFormRelation);
    await this.page.locator(this.selectors.callerFormRelation).click();
    await this.page.waitForTimeout(500);
    const option = this.selectors.callerFormRelationOption(id);
    await this.page.locator(option).click();
    console.log(`Selected Relation: ${id}`);
  }

  /**
   * Search for Physician (when relation type = 10)
   */
  async searchCallerPhysician(searchTerm: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormSearchPhysician);
    await this.page.locator(`${this.selectors.callerFormSearchPhysician} input`).fill(searchTerm);
    await this.page.waitForTimeout(1000);
    console.log(`Searched for Physician: ${searchTerm}`);
  }

  /**
   * Search for Community Resource (when relation type = 2)
   */
  async searchCallerCommunityResource(searchTerm: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormSearchCommunityResource);
    await this.page.locator(`${this.selectors.callerFormSearchCommunityResource} input`).fill(searchTerm);
    await this.page.waitForTimeout(1000);
    console.log(`Searched for Community Resource: ${searchTerm}`);
  }

  /**
   * Select Physician from search results by index (0-based)
   */
  async selectCallerPhysicianByIndex(index: number): Promise<void> {
    const results = this.page.locator(this.selectors.callerFormPhysicianSearchResults);
    await results.nth(index).click();
    console.log(`Selected Physician at index: ${index}`);
  }

  /**
   * Fill Caller First Name
   */
  async fillCallerFirstName(firstName: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormFirstName);
    await this.page.locator(`${this.selectors.callerFormFirstName} input`).fill(firstName);
    console.log(`Filled First Name: ${firstName}`);
  }

  /**
   * Fill Caller Last Name
   */
  async fillCallerLastName(lastName: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormLastName);
    await this.page.locator(`${this.selectors.callerFormLastName} input`).fill(lastName);
    console.log(`Filled Last Name: ${lastName}`);
  }

  /**
   * Select Credentials (for Physician relation type)
   */
  async selectCallerCredentials(credential: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormCredentials);
    await this.page.locator(this.selectors.callerFormCredentials).click();
    await this.page.waitForTimeout(500);
    const option = this.selectors.callerFormCredentialOption(credential);
    await this.page.locator(option).click();
    console.log(`Selected Credentials: ${credential}`);
  }

  /**
   * Fill Other Credential (when "Other" is selected)
   */
  async fillCallerOtherCredential(value: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormCredentialOther);
    await this.page.locator(`${this.selectors.callerFormCredentialOther} input`).fill(value);
    console.log(`Filled Other Credential: ${value}`);
  }

  /**
   * Fill Caller NPI (for Physician relation type)
   */
  async fillCallerNpi(npi: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormNpi);
    await this.page.locator(`${this.selectors.callerFormNpi} input`).fill(npi);
    console.log(`Filled NPI: ${npi}`);
  }

  /**
   * Fill Caller Phone Number
   */
  async fillCallerPhone(phone: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormPhone);
    await this.page.locator(`${this.selectors.callerFormPhone} input`).fill(phone);
    console.log(`Filled Phone: ${phone}`);
  }

  /**
   * Fill Caller Mobile Number
   */
  async fillCallerMobile(mobile: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormMobile);
    await this.page.locator(`${this.selectors.callerFormMobile} input`).fill(mobile);
    console.log(`Filled Mobile: ${mobile}`);
  }

  /**
   * Fill Caller Fax Number
   */
  async fillCallerFax(fax: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormFax);
    await this.page.locator(`${this.selectors.callerFormFax} input`).fill(fax);
    console.log(`Filled Fax: ${fax}`);
  }

  /**
   * Fill Caller Email Address
   */
  async fillCallerEmail(email: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormEmail);
    await this.page.locator(`${this.selectors.callerFormEmail} input`).fill(email);
    console.log(`Filled Email: ${email}`);
  }

  /**
   * Fill Caller Street Address 1
   */
  async fillCallerStreetAddress(address: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormStreetAddress);
    await this.page.locator(`${this.selectors.callerFormStreetAddress} input`).fill(address);
    console.log(`Filled Street Address: ${address}`);
  }

  /**
   * Fill Caller Street Address 2
   */
  async fillCallerStreetAddress2(address: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormStreetAddress2);
    await this.page.locator(`${this.selectors.callerFormStreetAddress2} input`).fill(address);
    console.log(`Filled Street Address 2: ${address}`);
  }

  /**
   * Fill Caller City
   */
  async fillCallerCity(city: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormCity);
    await this.page.locator(`${this.selectors.callerFormCity} input`).fill(city);
    console.log(`Filled City: ${city}`);
  }

  /**
   * Select Caller State
   */
  async selectCallerState(state: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormState);
    await this.page.locator(this.selectors.callerFormState).click();
    await this.page.waitForTimeout(500);
    const stateOption = this.selectors.callerFormStateOption(state);
    await this.page.locator(stateOption).click();
    console.log(`Selected State: ${state}`);
  }

  /**
   * Fill Caller Zip Code
   */
  async fillCallerZipCode(zipCode: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormZipCode);
    await this.page.locator(`${this.selectors.callerFormZipCode} input`).fill(zipCode);
    console.log(`Filled Zip Code: ${zipCode}`);
  }

  /**
   * Fill Caller Zip Extension
   */
  async fillCallerZipExtension(zipExt: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormZipExtension);
    await this.page.locator(`${this.selectors.callerFormZipExtension} input`).fill(zipExt);
    console.log(`Filled Zip Extension: ${zipExt}`);
  }

  /**
   * Get Caller County (read-only field)
   */
  async getCallerCounty(): Promise<string | null> {
    await this.waitForElement(this.selectors.callerFormCounty);
    return await this.page.locator(`${this.selectors.callerFormCounty} input`).inputValue();
  }

  /**
   * Fill Caller Situation Notes
   */
  async fillCallerSituationNotes(notes: string): Promise<void> {
    await this.waitForElement(this.selectors.callerFormSituationNotes);
    await this.page.locator(`${this.selectors.callerFormSituationNotes} textarea`).fill(notes);
    console.log(`Filled Situation Notes`);
  }

  /**
   * Click Save button on Caller form
   */
  async clickCallerFormSave(): Promise<void> {
    await this.waitForElement(this.selectors.callerFormSave);
    await this.page.locator(this.selectors.callerFormSave).click();
    await this.page.waitForLoadState('networkidle');
    console.log('Clicked Save on Caller form');
  }

  /**
   * Click Cancel button on Caller form
   */
  async clickCallerFormCancel(): Promise<void> {
    await this.waitForElement(this.selectors.callerFormCancel);
    await this.page.locator(this.selectors.callerFormCancel).click();
    console.log('Clicked Cancel on Caller form');
  }

  /**
   * Check if Caller form is visible
   */
  async isCallerFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.callerFormReferralType);
  }

  /**
   * Fill complete Caller form (basic fields)
   */
  async fillCallerForm(data: {
    referralTypeId?: string | number;
    relationId?: string | number;
    firstName?: string;
    lastName?: string;
    phone?: string;
    mobile?: string;
    fax?: string;
    email?: string;
    streetAddress?: string;
    streetAddress2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipExtension?: string;
    situationNotes?: string;
  }): Promise<void> {
    if (data.referralTypeId) await this.selectCallerReferralType(data.referralTypeId);
    if (data.relationId) await this.selectCallerRelation(data.relationId);
    if (data.firstName) await this.fillCallerFirstName(data.firstName);
    if (data.lastName) await this.fillCallerLastName(data.lastName);
    if (data.phone) await this.fillCallerPhone(data.phone);
    if (data.mobile) await this.fillCallerMobile(data.mobile);
    if (data.fax) await this.fillCallerFax(data.fax);
    if (data.email) await this.fillCallerEmail(data.email);
    if (data.streetAddress) await this.fillCallerStreetAddress(data.streetAddress);
    if (data.streetAddress2) await this.fillCallerStreetAddress2(data.streetAddress2);
    if (data.city) await this.fillCallerCity(data.city);
    if (data.state) await this.selectCallerState(data.state);
    if (data.zipCode) await this.fillCallerZipCode(data.zipCode);
    if (data.zipExtension) await this.fillCallerZipExtension(data.zipExtension);
    if (data.situationNotes) await this.fillCallerSituationNotes(data.situationNotes);
    console.log('Filled Caller form');
  }

  // ==================== Referrer Section ====================

  /**
   * Click Add Referrer button
   */
  async clickAddReferrer(): Promise<void> {
    await this.waitForElement(this.selectors.addReferrer);
    await this.page.locator(this.selectors.addReferrer).click();
    console.log('Clicked Add Referrer button');
  }

  /**
   * Toggle Referrer details section
   */
  async toggleReferrerDetails(): Promise<void> {
    await this.waitForElement(this.selectors.referrerDetails);
    await this.page.locator(this.selectors.referrerDetails).click();
    console.log('Toggled Referrer details');
  }

  /**
   * Check if Add Referrer button is visible
   */
  async isAddReferrerVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addReferrer);
  }

  // ==================== Referrer Form Methods ====================

  /**
   * Toggle "Same as Caller" checkbox
   */
  async toggleReferrerSameAsCaller(): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormSameAsCaller);
    await this.page.locator(this.selectors.referrerFormSameAsCaller).click();
    console.log('Toggled Same as Caller checkbox');
  }

  /**
   * Check if "Same as Caller" is checked
   */
  async isReferrerSameAsCallerChecked(): Promise<boolean> {
    const checkbox = this.page.locator(this.selectors.referrerFormSameAsCaller);
    const isChecked = await checkbox.getAttribute('checked');
    return isChecked === 'true' || isChecked === '';
  }

  /**
   * Select Referrer Relation from dropdown
   */
  async selectReferrerRelation(id: string | number): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormRelation);
    await this.page.locator(this.selectors.referrerFormRelation).click();
    await this.page.waitForTimeout(500);
    const option = this.selectors.referrerFormRelationOption(id);
    await this.page.locator(option).click();
    console.log(`Selected Referrer Relation: ${id}`);
  }

  /**
   * Search for Physician in Referrer form (when relation type = 10)
   */
  async searchReferrerPhysician(searchTerm: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormSearchPhysician);
    await this.page.locator(`${this.selectors.referrerFormSearchPhysician} input`).fill(searchTerm);
    await this.page.waitForTimeout(1000);
    console.log(`Searched for Physician: ${searchTerm}`);
  }

  /**
   * Search for Community Resource in Referrer form (when relation type = 2)
   */
  async searchReferrerCommunityResource(searchTerm: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormSearchCommunityResource);
    await this.page.locator(`${this.selectors.referrerFormSearchCommunityResource} input`).fill(searchTerm);
    await this.page.waitForTimeout(1000);
    console.log(`Searched for Community Resource: ${searchTerm}`);
  }

  /**
   * Select Physician from Referrer search results by index (0-based)
   */
  async selectReferrerPhysicianByIndex(index: number): Promise<void> {
    const results = this.page.locator(this.selectors.referrerFormPhysicianSearchResults);
    await results.nth(index).click();
    console.log(`Selected Physician at index: ${index}`);
  }

  /**
   * Fill Referrer First Name
   */
  async fillReferrerFirstName(firstName: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormFirstName);
    await this.page.locator(`${this.selectors.referrerFormFirstName} input`).fill(firstName);
    console.log(`Filled First Name: ${firstName}`);
  }

  /**
   * Fill Referrer Last Name
   */
  async fillReferrerLastName(lastName: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormLastName);
    await this.page.locator(`${this.selectors.referrerFormLastName} input`).fill(lastName);
    console.log(`Filled Last Name: ${lastName}`);
  }

  /**
   * Select Referrer Credentials (for Physician relation type)
   */
  async selectReferrerCredentials(credential: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormCredentials);
    await this.page.locator(this.selectors.referrerFormCredentials).click();
    await this.page.waitForTimeout(500);
    const option = this.selectors.referrerFormCredentialOption(credential);
    await this.page.locator(option).click();
    console.log(`Selected Credentials: ${credential}`);
  }

  /**
   * Fill Referrer Other Credential (when "Other" is selected)
   */
  async fillReferrerOtherCredential(value: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormCredentialOther);
    await this.page.locator(`${this.selectors.referrerFormCredentialOther} input`).fill(value);
    console.log(`Filled Other Credential: ${value}`);
  }

  /**
   * Fill Referrer NPI (for Physician relation type)
   */
  async fillReferrerNpi(npi: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormNpi);
    await this.page.locator(`${this.selectors.referrerFormNpi} input`).fill(npi);
    console.log(`Filled NPI: ${npi}`);
  }

  /**
   * Fill Referrer Phone Number
   */
  async fillReferrerPhone(phone: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormPhone);
    await this.page.locator(`${this.selectors.referrerFormPhone} input`).fill(phone);
    console.log(`Filled Phone: ${phone}`);
  }

  /**
   * Fill Referrer Mobile Number
   */
  async fillReferrerMobile(mobile: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormMobile);
    await this.page.locator(`${this.selectors.referrerFormMobile} input`).fill(mobile);
    console.log(`Filled Mobile: ${mobile}`);
  }

  /**
   * Fill Referrer Fax Number
   */
  async fillReferrerFax(fax: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormFax);
    await this.page.locator(`${this.selectors.referrerFormFax} input`).fill(fax);
    console.log(`Filled Fax: ${fax}`);
  }

  /**
   * Fill Referrer Email Address
   */
  async fillReferrerEmail(email: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormEmail);
    await this.page.locator(`${this.selectors.referrerFormEmail} input`).fill(email);
    console.log(`Filled Email: ${email}`);
  }

  /**
   * Fill Referrer Street Address 1
   */
  async fillReferrerStreetAddress(address: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormStreetAddress);
    await this.page.locator(`${this.selectors.referrerFormStreetAddress} input`).fill(address);
    console.log(`Filled Street Address: ${address}`);
  }

  /**
   * Fill Referrer Street Address 2
   */
  async fillReferrerStreetAddress2(address: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormStreetAddress2);
    await this.page.locator(`${this.selectors.referrerFormStreetAddress2} input`).fill(address);
    console.log(`Filled Street Address 2: ${address}`);
  }

  /**
   * Fill Referrer City
   */
  async fillReferrerCity(city: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormCity);
    await this.page.locator(`${this.selectors.referrerFormCity} input`).fill(city);
    console.log(`Filled City: ${city}`);
  }

  /**
   * Select Referrer State
   */
  async selectReferrerState(state: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormState);
    await this.page.locator(this.selectors.referrerFormState).click();
    await this.page.waitForTimeout(500);
    const stateOption = this.selectors.referrerFormStateOption(state);
    await this.page.locator(stateOption).click();
    console.log(`Selected State: ${state}`);
  }

  /**
   * Fill Referrer Zip Code
   */
  async fillReferrerZipCode(zipCode: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormZipCode);
    await this.page.locator(`${this.selectors.referrerFormZipCode} input`).fill(zipCode);
    console.log(`Filled Zip Code: ${zipCode}`);
  }

  /**
   * Fill Referrer Zip Extension
   */
  async fillReferrerZipExtension(zipExt: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormZipExtension);
    await this.page.locator(`${this.selectors.referrerFormZipExtension} input`).fill(zipExt);
    console.log(`Filled Zip Extension: ${zipExt}`);
  }

  /**
   * Get Referrer County (read-only field)
   */
  async getReferrerCounty(): Promise<string | null> {
    await this.waitForElement(this.selectors.referrerFormCounty);
    return await this.page.locator(`${this.selectors.referrerFormCounty} input`).inputValue();
  }

  /**
   * Fill Referrer Situation Notes
   */
  async fillReferrerSituationNotes(notes: string): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormSituationNotes);
    await this.page.locator(`${this.selectors.referrerFormSituationNotes} textarea`).fill(notes);
    console.log(`Filled Situation Notes`);
  }

  /**
   * Click Save button on Referrer form
   */
  async clickReferrerFormSave(): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormSave);
    await this.page.locator(this.selectors.referrerFormSave).click();
    await this.page.waitForLoadState('networkidle');
    console.log('Clicked Save on Referrer form');
  }

  /**
   * Click Cancel button on Referrer form
   */
  async clickReferrerFormCancel(): Promise<void> {
    await this.waitForElement(this.selectors.referrerFormCancel);
    await this.page.locator(this.selectors.referrerFormCancel).click();
    console.log('Clicked Cancel on Referrer form');
  }

  /**
   * Check if Referrer form is visible
   */
  async isReferrerFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.referrerFormSameAsCaller);
  }

  /**
   * Fill complete Referrer form (basic fields)
   */
  async fillReferrerForm(data: {
    sameAsCaller?: boolean;
    relationId?: string | number;
    firstName?: string;
    lastName?: string;
    phone?: string;
    mobile?: string;
    fax?: string;
    email?: string;
    streetAddress?: string;
    streetAddress2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipExtension?: string;
    situationNotes?: string;
  }): Promise<void> {
    if (data.sameAsCaller) await this.toggleReferrerSameAsCaller();
    if (data.relationId && !data.sameAsCaller) await this.selectReferrerRelation(data.relationId);
    if (data.firstName && !data.sameAsCaller) await this.fillReferrerFirstName(data.firstName);
    if (data.lastName && !data.sameAsCaller) await this.fillReferrerLastName(data.lastName);
    if (data.phone && !data.sameAsCaller) await this.fillReferrerPhone(data.phone);
    if (data.mobile && !data.sameAsCaller) await this.fillReferrerMobile(data.mobile);
    if (data.fax && !data.sameAsCaller) await this.fillReferrerFax(data.fax);
    if (data.email && !data.sameAsCaller) await this.fillReferrerEmail(data.email);
    if (data.streetAddress && !data.sameAsCaller) await this.fillReferrerStreetAddress(data.streetAddress);
    if (data.streetAddress2 && !data.sameAsCaller) await this.fillReferrerStreetAddress2(data.streetAddress2);
    if (data.city && !data.sameAsCaller) await this.fillReferrerCity(data.city);
    if (data.state && !data.sameAsCaller) await this.selectReferrerState(data.state);
    if (data.zipCode && !data.sameAsCaller) await this.fillReferrerZipCode(data.zipCode);
    if (data.zipExtension && !data.sameAsCaller) await this.fillReferrerZipExtension(data.zipExtension);
    if (data.situationNotes && !data.sameAsCaller) await this.fillReferrerSituationNotes(data.situationNotes);
    console.log('Filled Referrer form');
  }

  // ==================== Referring Physician Section ====================

  /**
   * Click Add Referring Physician button
   */
  async clickAddReferringPhysician(): Promise<void> {
    await this.waitForElement(this.selectors.addReferringPhysician);
    await this.page.locator(this.selectors.addReferringPhysician).click();
    console.log('Clicked Add Referring Physician button');
  }

  /**
   * Click Edit Referring Physician button
   */
  async clickEditReferringPhysician(): Promise<void> {
    await this.waitForElement(this.selectors.editReferringPhysician);
    await this.page.locator(this.selectors.editReferringPhysician).click();
    console.log('Clicked Edit Referring Physician button');
  }

  /**
   * Toggle Referring Physician details section
   */
  async toggleReferringPhysicianDetails(): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianDetails);
    await this.page.locator(this.selectors.referringPhysicianDetails).click();
    console.log('Toggled Referring Physician details');
  }

  /**
   * Check if Add Referring Physician button is visible
   */
  async isAddReferringPhysicianVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addReferringPhysician);
  }

  // ==================== Referring Physician Form Methods ====================

  /**
   * Toggle "Same as Referrer" checkbox
   */
  async toggleReferringPhysicianSameAsReferrer(): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianSameAsReferrer);
    await this.page.locator(this.selectors.referringPhysicianSameAsReferrer).click();
    console.log('Toggled Same as Referrer checkbox');
  }

  /**
   * Check if "Same as Referrer" is checked
   */
  async isReferringPhysicianSameAsReferrerChecked(): Promise<boolean> {
    const checkbox = this.page.locator(this.selectors.referringPhysicianSameAsReferrer);
    const isChecked = await checkbox.getAttribute('checked');
    return isChecked === 'true' || isChecked === '';
  }

  /**
   * Get Referring Physician Relation (read-only field)
   */
  async getReferringPhysicianRelation(): Promise<string | null> {
    await this.waitForElement(this.selectors.referringPhysicianRelation);
    return await this.page.locator(`${this.selectors.referringPhysicianRelation} input`).inputValue();
  }

  /**
   * Search for Physician in Referring Physician form
   */
  async searchReferringPhysician(searchTerm: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianSearchPhysician);
    await this.page.locator(`${this.selectors.referringPhysicianSearchPhysician} input`).fill(searchTerm);
    await this.page.waitForTimeout(1000);
    console.log(`Searched for Physician: ${searchTerm}`);
  }

  /**
   * Select Physician from Referring Physician search results by index (0-based)
   */
  async selectReferringPhysicianByIndex(index: number): Promise<void> {
    const results = this.page.locator(this.selectors.referringPhysicianSearchResults);
    await results.nth(index).click();
    console.log(`Selected Physician at index: ${index}`);
  }

  /**
   * Fill Referring Physician First Name
   */
  async fillReferringPhysicianFirstName(firstName: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianFirstName);
    await this.page.locator(`${this.selectors.referringPhysicianFirstName} input`).fill(firstName);
    console.log(`Filled First Name: ${firstName}`);
  }

  /**
   * Fill Referring Physician Last Name
   */
  async fillReferringPhysicianLastName(lastName: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianLastName);
    await this.page.locator(`${this.selectors.referringPhysicianLastName} input`).fill(lastName);
    console.log(`Filled Last Name: ${lastName}`);
  }

  /**
   * Select Referring Physician Credentials
   */
  async selectReferringPhysicianCredentials(credential: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianCredentials);
    await this.page.locator(this.selectors.referringPhysicianCredentials).click();
    await this.page.waitForTimeout(500);
    const option = this.selectors.referringPhysicianCredentialOption(credential);
    await this.page.locator(option).click();
    console.log(`Selected Credentials: ${credential}`);
  }

  /**
   * Fill Referring Physician Other Credential (when "Other" is selected)
   */
  async fillReferringPhysicianOtherCredential(value: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianCredentialOther);
    await this.page.locator(`${this.selectors.referringPhysicianCredentialOther} input`).fill(value);
    console.log(`Filled Other Credential: ${value}`);
  }

  /**
   * Fill Referring Physician NPI
   */
  async fillReferringPhysicianNpi(npi: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianNpi);
    await this.page.locator(`${this.selectors.referringPhysicianNpi} input`).fill(npi);
    console.log(`Filled NPI: ${npi}`);
  }

  /**
   * Fill Referring Physician Phone Number
   */
  async fillReferringPhysicianPhone(phone: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianPhone);
    await this.page.locator(`${this.selectors.referringPhysicianPhone} input`).fill(phone);
    console.log(`Filled Phone: ${phone}`);
  }

  /**
   * Fill Referring Physician Mobile Number
   */
  async fillReferringPhysicianMobile(mobile: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianMobile);
    await this.page.locator(`${this.selectors.referringPhysicianMobile} input`).fill(mobile);
    console.log(`Filled Mobile: ${mobile}`);
  }

  /**
   * Fill Referring Physician Fax Number
   */
  async fillReferringPhysicianFax(fax: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianFax);
    await this.page.locator(`${this.selectors.referringPhysicianFax} input`).fill(fax);
    console.log(`Filled Fax: ${fax}`);
  }

  /**
   * Fill Referring Physician Email Address
   */
  async fillReferringPhysicianEmail(email: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianEmail);
    await this.page.locator(`${this.selectors.referringPhysicianEmail} input`).fill(email);
    console.log(`Filled Email: ${email}`);
  }

  /**
   * Fill Referring Physician Street Address 1
   */
  async fillReferringPhysicianStreetAddress(address: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianStreetAddress);
    await this.page.locator(`${this.selectors.referringPhysicianStreetAddress} input`).fill(address);
    console.log(`Filled Street Address: ${address}`);
  }

  /**
   * Fill Referring Physician Street Address 2
   */
  async fillReferringPhysicianStreetAddress2(address: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianStreetAddress2);
    await this.page.locator(`${this.selectors.referringPhysicianStreetAddress2} input`).fill(address);
    console.log(`Filled Street Address 2: ${address}`);
  }

  /**
   * Fill Referring Physician City
   */
  async fillReferringPhysicianCity(city: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianCity);
    await this.page.locator(`${this.selectors.referringPhysicianCity} input`).fill(city);
    console.log(`Filled City: ${city}`);
  }

  /**
   * Select Referring Physician State
   */
  async selectReferringPhysicianState(state: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianState);
    await this.page.locator(this.selectors.referringPhysicianState).click();
    await this.page.waitForTimeout(500);
    const stateOption = this.selectors.referringPhysicianStateOption(state);
    await this.page.locator(stateOption).click();
    console.log(`Selected State: ${state}`);
  }

  /**
   * Fill Referring Physician Zip Code
   */
  async fillReferringPhysicianZipCode(zipCode: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianZipCode);
    await this.page.locator(`${this.selectors.referringPhysicianZipCode} input`).fill(zipCode);
    console.log(`Filled Zip Code: ${zipCode}`);
  }

  /**
   * Fill Referring Physician Zip Extension
   */
  async fillReferringPhysicianZipExtension(zipExt: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianZipExtension);
    await this.page.locator(`${this.selectors.referringPhysicianZipExtension} input`).fill(zipExt);
    console.log(`Filled Zip Extension: ${zipExt}`);
  }

  /**
   * Get Referring Physician County (read-only field)
   */
  async getReferringPhysicianCounty(): Promise<string | null> {
    await this.waitForElement(this.selectors.referringPhysicianCounty);
    return await this.page.locator(`${this.selectors.referringPhysicianCounty} input`).inputValue();
  }

  /**
   * Fill Referring Physician Situation Notes
   */
  async fillReferringPhysicianSituationNotes(notes: string): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianSituationNotes);
    await this.page.locator(`${this.selectors.referringPhysicianSituationNotes} textarea`).fill(notes);
    console.log(`Filled Situation Notes`);
  }

  /**
   * Click Save button on Referring Physician form
   */
  async clickReferringPhysicianFormSave(): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianFormSave);
    await this.page.locator(this.selectors.referringPhysicianFormSave).click();
    await this.page.waitForLoadState('networkidle');
    console.log('Clicked Save on Referring Physician form');
  }

  /**
   * Click Cancel button on Referring Physician form
   */
  async clickReferringPhysicianFormCancel(): Promise<void> {
    await this.waitForElement(this.selectors.referringPhysicianFormCancel);
    await this.page.locator(this.selectors.referringPhysicianFormCancel).click();
    console.log('Clicked Cancel on Referring Physician form');
  }

  /**
   * Check if Referring Physician form is visible
   */
  async isReferringPhysicianFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.referringPhysicianFormContent);
  }

  /**
   * Fill complete Referring Physician form
   */
  async fillReferringPhysicianForm(data: {
    sameAsReferrer?: boolean;
    firstName?: string;
    lastName?: string;
    credentials?: string;
    otherCredential?: string;
    npi?: string;
    phone?: string;
    mobile?: string;
    fax?: string;
    email?: string;
    streetAddress?: string;
    streetAddress2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipExtension?: string;
    situationNotes?: string;
  }): Promise<void> {
    if (data.sameAsReferrer) {
      await this.toggleReferringPhysicianSameAsReferrer();
    } else {
      if (data.firstName) await this.fillReferringPhysicianFirstName(data.firstName);
      if (data.lastName) await this.fillReferringPhysicianLastName(data.lastName);
      if (data.credentials) await this.selectReferringPhysicianCredentials(data.credentials);
      if (data.otherCredential) await this.fillReferringPhysicianOtherCredential(data.otherCredential);
      if (data.npi) await this.fillReferringPhysicianNpi(data.npi);
      if (data.phone) await this.fillReferringPhysicianPhone(data.phone);
      if (data.mobile) await this.fillReferringPhysicianMobile(data.mobile);
      if (data.fax) await this.fillReferringPhysicianFax(data.fax);
      if (data.email) await this.fillReferringPhysicianEmail(data.email);
      if (data.streetAddress) await this.fillReferringPhysicianStreetAddress(data.streetAddress);
      if (data.streetAddress2) await this.fillReferringPhysicianStreetAddress2(data.streetAddress2);
      if (data.city) await this.fillReferringPhysicianCity(data.city);
      if (data.state) await this.selectReferringPhysicianState(data.state);
      if (data.zipCode) await this.fillReferringPhysicianZipCode(data.zipCode);
      if (data.zipExtension) await this.fillReferringPhysicianZipExtension(data.zipExtension);
      if (data.situationNotes) await this.fillReferringPhysicianSituationNotes(data.situationNotes);
    }
    console.log('Filled Referring Physician form');
  }

  // ==================== Ordering Physician Section ====================

  /**
   * Click Add Ordering Physician button
   */
  async clickAddOrderingPhysician(): Promise<void> {
    await this.waitForElement(this.selectors.addOrderingPhysician);
    await this.page.locator(this.selectors.addOrderingPhysician).click();
    console.log('Clicked Add Ordering Physician button');
  }

  /**
   * Click Edit Ordering Physician button
   */
  async clickEditOrderingPhysician(): Promise<void> {
    await this.waitForElement(this.selectors.editOrderingPhysician);
    await this.page.locator(this.selectors.editOrderingPhysician).click();
    console.log('Clicked Edit Ordering Physician button');
  }

  /**
   * Toggle Ordering Physician details section
   */
  async toggleOrderingPhysicianDetails(): Promise<void> {
    await this.waitForElement(this.selectors.orderingPhysicianDetails);
    await this.page.locator(this.selectors.orderingPhysicianDetails).click();
    console.log('Toggled Ordering Physician details');
  }

  /**
   * Check if Add Ordering Physician button is visible
   */
  async isAddOrderingPhysicianVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addOrderingPhysician);
  }

  // ==================== Physician's Order Section ====================

  /**
   * Click Add Physician's Order button
   */
  async clickAddPhysicianOrder(): Promise<void> {
    await this.waitForElement(this.selectors.addPhysicianOrder);
    await this.page.locator(this.selectors.addPhysicianOrder).click();
    console.log('Clicked Add Physicians Order button');
  }

  /**
   * Click Edit Physician's Order button
   */
  async clickEditPhysicianOrder(): Promise<void> {
    await this.waitForElement(this.selectors.editPhysicianOrder);
    await this.page.locator(this.selectors.editPhysicianOrder).click();
    console.log('Clicked Edit Physicians Order button');
  }

  /**
   * Toggle Physician's Order details section
   */
  async togglePhysicianOrderDetails(): Promise<void> {
    await this.waitForElement(this.selectors.physicianOrderDetails);
    await this.page.locator(this.selectors.physicianOrderDetails).click();
    console.log('Toggled Physicians Order details');
  }

  /**
   * Check if Add Physician's Order button is visible
   */
  async isAddPhysicianOrderVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addPhysicianOrder);
  }

  // ==================== Physician's Order Form Methods ====================

  /**
   * Select "Admit" option for Physician's Order
   */
  async selectPhysicianOrderAdmit(): Promise<void> {
    await this.waitForElement(this.selectors.physicianOrderRadioAdmit);
    await this.page.locator(this.selectors.physicianOrderRadioAdmit).click();
    console.log('Selected Physician Order: Admit');
  }

  /**
   * Select "Evaluate" option for Physician's Order
   */
  async selectPhysicianOrderEvaluate(): Promise<void> {
    await this.waitForElement(this.selectors.physicianOrderRadioEvaluate);
    await this.page.locator(this.selectors.physicianOrderRadioEvaluate).click();
    console.log('Selected Physician Order: Evaluate');
  }

  /**
   * Select "Evaluate and Admit, if Appropriate" option for Physician's Order
   */
  async selectPhysicianOrderEvaluateAdmit(): Promise<void> {
    await this.waitForElement(this.selectors.physicianOrderRadioEvaluateAdmit);
    await this.page.locator(this.selectors.physicianOrderRadioEvaluateAdmit).click();
    console.log('Selected Physician Order: Evaluate and Admit if Appropriate');
  }

  /**
   * Select "No" option for Physician's Order
   */
  async selectPhysicianOrderNo(): Promise<void> {
    await this.waitForElement(this.selectors.physicianOrderRadioNo);
    await this.page.locator(this.selectors.physicianOrderRadioNo).click();
    console.log('Selected Physician Order: No');
  }

  /**
   * Select Physician's Order by type
   * @param orderType - 'ADMIT' | 'EVALUATE' | 'EVALUATE_AND_ADMIT_IF_APPROPRIATE' | 'NO'
   */
  async selectPhysicianOrderByType(orderType: 'ADMIT' | 'EVALUATE' | 'EVALUATE_AND_ADMIT_IF_APPROPRIATE' | 'NO'): Promise<void> {
    switch (orderType) {
      case 'ADMIT':
        await this.selectPhysicianOrderAdmit();
        break;
      case 'EVALUATE':
        await this.selectPhysicianOrderEvaluate();
        break;
      case 'EVALUATE_AND_ADMIT_IF_APPROPRIATE':
        await this.selectPhysicianOrderEvaluateAdmit();
        break;
      case 'NO':
        await this.selectPhysicianOrderNo();
        break;
    }
  }

  /**
   * Click Save button on Physician's Order form
   */
  async clickPhysicianOrderFormSave(): Promise<void> {
    await this.waitForElement(this.selectors.physicianOrderFormSave);
    await this.page.locator(this.selectors.physicianOrderFormSave).click();
    await this.page.waitForLoadState('networkidle');
    console.log('Clicked Save on Physician Order form');
  }

  /**
   * Click Cancel button on Physician's Order form
   */
  async clickPhysicianOrderFormCancel(): Promise<void> {
    await this.waitForElement(this.selectors.physicianOrderFormCancel);
    await this.page.locator(this.selectors.physicianOrderFormCancel).click();
    console.log('Clicked Cancel on Physician Order form');
  }

  /**
   * Check if Physician's Order form is visible
   */
  async isPhysicianOrderFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.physicianOrderRadioAdmit);
  }

  // ==================== Referral Credit Section ====================

  /**
   * Click Add Referral Credit button
   */
  async clickAddReferralCredit(): Promise<void> {
    await this.waitForElement(this.selectors.addReferralCredit);
    await this.page.locator(this.selectors.addReferralCredit).click();
    console.log('Clicked Add Referral Credit button');
  }

  /**
   * Click Edit Referral Credit button
   */
  async clickEditReferralCredit(): Promise<void> {
    await this.waitForElement(this.selectors.editReferralCredit);
    await this.page.locator(this.selectors.editReferralCredit).click();
    console.log('Clicked Edit Referral Credit button');
  }

  /**
   * Toggle Referral Credit details section
   */
  async toggleReferralCreditDetails(): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditDetails);
    await this.page.locator(this.selectors.referralCreditDetails).click();
    console.log('Toggled Referral Credit details');
  }

  /**
   * Check if Add Referral Credit button is visible
   */
  async isAddReferralCreditVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.addReferralCredit);
  }

  // ==================== Referral Credit Form Methods ====================

  /**
   * Select Referral Credit Type
   */
  async selectReferralCreditType(id: string | number): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditType);
    await this.page.locator(this.selectors.referralCreditType).click();
    await this.page.waitForTimeout(500);
    const option = this.selectors.referralCreditTypeOption(id);
    await this.page.locator(option).click();
    console.log(`Selected Referral Credit Type: ${id}`);
  }

  /**
   * Select Referral Credit Relation
   */
  async selectReferralCreditRelation(id: string | number): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditRelation);
    await this.page.locator(this.selectors.referralCreditRelation).click();
    await this.page.waitForTimeout(500);
    const option = this.selectors.referralCreditRelationOption(id);
    await this.page.locator(option).click();
    console.log(`Selected Relation: ${id}`);
  }

  /**
   * Fill Referral Credit First Name
   */
  async fillReferralCreditFirstName(firstName: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditFirstName);
    await this.page.locator(`${this.selectors.referralCreditFirstName} input`).fill(firstName);
    console.log(`Filled First Name: ${firstName}`);
  }

  /**
   * Fill Referral Credit Last Name
   */
  async fillReferralCreditLastName(lastName: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditLastName);
    await this.page.locator(`${this.selectors.referralCreditLastName} input`).fill(lastName);
    console.log(`Filled Last Name: ${lastName}`);
  }

  /**
   * Fill Referral Credit NPI (for Physician relation type)
   */
  async fillReferralCreditNpi(npi: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditNpi);
    await this.page.locator(`${this.selectors.referralCreditNpi} input`).fill(npi);
    console.log(`Filled NPI: ${npi}`);
  }

  /**
   * Fill Referral Credit Phone Number
   */
  async fillReferralCreditPhone(phone: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditPhone);
    await this.page.locator(`${this.selectors.referralCreditPhone} input`).fill(phone);
    console.log(`Filled Phone: ${phone}`);
  }

  /**
   * Fill Referral Credit Mobile Number
   */
  async fillReferralCreditMobile(mobile: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditMobile);
    await this.page.locator(`${this.selectors.referralCreditMobile} input`).fill(mobile);
    console.log(`Filled Mobile: ${mobile}`);
  }

  /**
   * Fill Referral Credit Fax Number
   */
  async fillReferralCreditFax(fax: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditFax);
    await this.page.locator(`${this.selectors.referralCreditFax} input`).fill(fax);
    console.log(`Filled Fax: ${fax}`);
  }

  /**
   * Fill Referral Credit Email Address
   */
  async fillReferralCreditEmail(email: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditEmail);
    await this.page.locator(`${this.selectors.referralCreditEmail} input`).fill(email);
    console.log(`Filled Email: ${email}`);
  }

  /**
   * Fill Referral Credit Street Address
   */
  async fillReferralCreditStreetAddress(address: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditStreetAddress);
    await this.page.locator(`${this.selectors.referralCreditStreetAddress} input`).fill(address);
    console.log(`Filled Street Address: ${address}`);
  }

  /**
   * Fill Referral Credit City
   */
  async fillReferralCreditCity(city: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditCity);
    await this.page.locator(`${this.selectors.referralCreditCity} input`).fill(city);
    console.log(`Filled City: ${city}`);
  }

  /**
   * Select Referral Credit State
   */
  async selectReferralCreditState(state: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditState);
    await this.page.locator(this.selectors.referralCreditState).click();
    await this.page.waitForTimeout(500);
    const stateOption = this.selectors.referralCreditStateOption(state);
    await this.page.locator(stateOption).click();
    console.log(`Selected State: ${state}`);
  }

  /**
   * Fill Referral Credit Zip Code
   */
  async fillReferralCreditZipCode(zipCode: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditZipCode);
    await this.page.locator(`${this.selectors.referralCreditZipCode} input`).fill(zipCode);
    console.log(`Filled Zip Code: ${zipCode}`);
  }

  /**
   * Fill Referral Credit Zip Extension
   */
  async fillReferralCreditZipExtension(zipExt: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditZipExtension);
    await this.page.locator(`${this.selectors.referralCreditZipExtension} input`).fill(zipExt);
    console.log(`Filled Zip Extension: ${zipExt}`);
  }

  /**
   * Get Referral Credit County (read-only field)
   */
  async getReferralCreditCounty(): Promise<string | null> {
    await this.waitForElement(this.selectors.referralCreditCounty);
    return await this.page.locator(`${this.selectors.referralCreditCounty} input`).inputValue();
  }

  /**
   * Fill Referral Credit Situation Notes
   */
  async fillReferralCreditSituationNotes(notes: string): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditSituationNotes);
    await this.page.locator(`${this.selectors.referralCreditSituationNotes} textarea`).fill(notes);
    console.log(`Filled Situation Notes`);
  }

  /**
   * Click Save button on Referral Credit form
   */
  async clickReferralCreditFormSave(): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditFormSave);
    await this.page.locator(this.selectors.referralCreditFormSave).click();
    await this.page.waitForLoadState('networkidle');
    console.log('Clicked Save on Referral Credit form');
  }

  /**
   * Click Cancel button on Referral Credit form
   */
  async clickReferralCreditFormCancel(): Promise<void> {
    await this.waitForElement(this.selectors.referralCreditFormCancel);
    await this.page.locator(this.selectors.referralCreditFormCancel).click();
    console.log('Clicked Cancel on Referral Credit form');
  }

  /**
   * Check if Referral Credit form is visible
   */
  async isReferralCreditFormVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.referralCreditFormContent);
  }

  /**
   * Fill complete Referral Credit form
   */
  async fillReferralCreditForm(data: {
    creditTypeId?: string | number;
    relationId?: string | number;
    firstName?: string;
    lastName?: string;
    npi?: string;
    phone?: string;
    mobile?: string;
    fax?: string;
    email?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipExtension?: string;
    situationNotes?: string;
  }): Promise<void> {
    if (data.creditTypeId) await this.selectReferralCreditType(data.creditTypeId);
    if (data.relationId) await this.selectReferralCreditRelation(data.relationId);
    if (data.firstName) await this.fillReferralCreditFirstName(data.firstName);
    if (data.lastName) await this.fillReferralCreditLastName(data.lastName);
    if (data.npi) await this.fillReferralCreditNpi(data.npi);
    if (data.phone) await this.fillReferralCreditPhone(data.phone);
    if (data.mobile) await this.fillReferralCreditMobile(data.mobile);
    if (data.fax) await this.fillReferralCreditFax(data.fax);
    if (data.email) await this.fillReferralCreditEmail(data.email);
    if (data.streetAddress) await this.fillReferralCreditStreetAddress(data.streetAddress);
    if (data.city) await this.fillReferralCreditCity(data.city);
    if (data.state) await this.selectReferralCreditState(data.state);
    if (data.zipCode) await this.fillReferralCreditZipCode(data.zipCode);
    if (data.zipExtension) await this.fillReferralCreditZipExtension(data.zipExtension);
    if (data.situationNotes) await this.fillReferralCreditSituationNotes(data.situationNotes);
    console.log('Filled Referral Credit form');
  }

  // ==================== Utility Methods ====================

  /**
   * Check if user is authorized to view patient details
   */
  async isNotAuthorizedMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.notAuthorizedMessage);
  }

  /**
   * Check if profile header is visible
   */
  async isProfileHeaderVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.profileHeader);
  }

  /**
   * Wait for patient details page to load
   */
  async waitForPageToLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForElement(this.selectors.profileHeader, 15000);
    console.log('Patient Details page loaded');
  }

  // ==================== Sidebar Checkmark Methods ====================

  /**
   * Check if a section's checkmark icon is visible
   * @param section - Section name: 'profile' | 'care-team' | 'benefits' | 'certifications' | 'consents'
   */
  async isSectionCheckmarkVisible(section: string): Promise<boolean> {
    const selector = this.selectors.sectionCheckmark(section);
    return await this.isElementVisible(selector);
  }

  /**
   * Wait for a section's checkmark icon to appear
   * @param section - Section name
   * @param timeout - Timeout in ms (default 15000)
   */
  async waitForSectionCheckmark(section: string, timeout: number = 15000): Promise<void> {
    const selector = this.selectors.sectionCheckmark(section);
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
    console.log(`Checkmark visible for section: ${section}`);
  }

  /**
   * Get list of sections that have checkmarks visible
   */
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

  /**
   * Check if all 5 required sections have checkmarks
   */
  async areAllSectionsComplete(): Promise<boolean> {
    const completed = await this.getCompletedSections();
    return completed.length === 5;
  }

  // ==================== Admit Patient Methods ====================

  /**
   * Check if Admit Patient button is visible
   */
  async isAdmitPatientButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.admitPatientButton);
  }

  /**
   * Click the Admit Patient button
   */
  async clickAdmitPatient(): Promise<void> {
    await this.waitForElement(this.selectors.admitPatientButton);
    await this.page.locator(this.selectors.admitPatientButton).click();
    console.log('Clicked Admit Patient button');
  }

  /**
   * Confirm the Admission Complete modal, optionally setting the admit date
   * @param admitDate - Optional date string in MM/DD/YYYY format. If not provided, keeps the default (today).
   */
  async confirmAdmission(admitDate?: string): Promise<void> {
    await this.waitForElement(this.selectors.admissionModalSave, 10000);

    // If a custom admit date is provided, use the Ionic datetime picker
    if (admitDate) {
      await this.selectAdmitDate(admitDate);
    }

    await this.page.locator(this.selectors.admissionModalSave).click();
    await this.page.waitForLoadState('networkidle');
    console.log(`Confirmed admission - clicked Save on modal${admitDate ? ` (date: ${admitDate})` : ''}`);
  }

  /**
   * Select admit date using the Ionic picker (3 columns: Month, Day, Year).
   * Picker is opened by clicking #admitDate, confirmed with .picker-toolbar-button button.
   * @param dateString - Date in MM/DD/YYYY format
   */
  private async selectAdmitDate(dateString: string): Promise<void> {
    const [month, day, year] = dateString.split('/');
    const monthPadded = month.padStart(2, '0');
    const dayPadded = day.padStart(2, '0');

    // Open the picker
    await this.page.locator('#admitDate').click();
    await this.page.waitForTimeout(1000);

    // Wait for picker columns to be visible
    await this.page.locator('.picker-columns').waitFor({ state: 'visible', timeout: 5000 });

    // Helper: use touch event simulation with REAL time delays to scroll a picker column.
    //
    // Why this approach: Ionic's picker calculates velocity from the time between touchmove
    // events. If all events are dispatched synchronously (no real time gaps), Ionic sees
    // near-infinite velocity and adds momentum, causing overshoot. By using async delays
    // (setTimeout) between touchmove events and pausing before touchend, the velocity
    // at release is ~0, so scroll-snap lands precisely on the target option.
    const selectInColumn = async (colIndex: number, text: string) => {
      const col = this.page.locator('.picker-col').nth(colIndex);

      // Find currently selected and target option indices
      const { currentIdx, targetIdx, optHeight } = await col.evaluate((colEl, targetText) => {
        const opts = Array.from(colEl.querySelectorAll('.picker-opt'));
        const selectedIdx = opts.findIndex(o => o.classList.contains('picker-opt-selected'));
        const tIdx = opts.findIndex(o => o.textContent?.trim() === targetText);
        const height = opts[0]?.getBoundingClientRect().height || 34;
        return { currentIdx: selectedIdx, targetIdx: tIdx, optHeight: height };
      }, text);

      if (targetIdx === -1) {
        throw new Error(`Picker option "${text}" not found in column ${colIndex}`);
      }

      const steps = targetIdx - currentIdx;
      if (steps === 0) {
        console.log(`  Picker col ${colIndex}: "${text}" ✓ (already selected)`);
        return;
      }

      const colBox = await col.boundingBox();
      if (!colBox) throw new Error(`Column ${colIndex} has no bounding box`);
      const centerX = colBox.x + colBox.width / 2;
      const centerY = colBox.y + colBox.height / 2;

      // Total distance to drag — full optHeight per step (no scaling factor needed
      // because we eliminate momentum by pausing before touchend)
      const totalDelta = steps * optHeight;
      const endY = centerY - totalDelta;

      // Dispatch touch events with REAL async delays inside the browser
      // This makes Ionic calculate near-zero velocity at touchend → no momentum
      await this.page.evaluate(({ cx, sy, ey, ci }) => {
        return new Promise<void>((resolve) => {
          const colEl = document.querySelectorAll('.picker-col')[ci] as HTMLElement;
          const optsEl = colEl?.querySelector('.picker-opts') as HTMLElement;
          if (!optsEl) { resolve(); return; }

          const createTouch = (y: number) => new Touch({
            identifier: 1, target: optsEl,
            clientX: cx, clientY: y, pageX: cx, pageY: y,
          });

          const dispatch = (type: string, y: number, isFinal = false) => {
            const touches = isFinal ? [] : [createTouch(y)];
            const targetTouches = isFinal ? [] : [createTouch(y)];
            optsEl.dispatchEvent(new TouchEvent(type, {
              bubbles: true, cancelable: true,
              touches, targetTouches, changedTouches: [createTouch(y)],
            }));
          };

          // 1. touchstart
          dispatch('touchstart', sy);

          // 2. touchmove in small increments with 30ms real delays between them
          const moveCount = Math.max(8, Math.abs(Math.round((ey - sy) / 5)));
          const stepSize = (ey - sy) / moveCount;
          let i = 0;

          const doMove = () => {
            i++;
            const y = sy + stepSize * i;
            dispatch('touchmove', y);

            if (i < moveCount) {
              setTimeout(doMove, 30);
            } else {
              // 3. CRITICAL: pause 300ms at final position before touchend
              // This zeroes out the velocity calculation → no momentum
              setTimeout(() => {
                // One final touchmove at exact end position (velocity = 0)
                dispatch('touchmove', ey);
                setTimeout(() => {
                  dispatch('touchend', ey, true);
                  resolve();
                }, 50);
              }, 300);
            }
          };

          setTimeout(doMove, 30);
        });
      }, { cx: centerX, sy: centerY, ey: endY, ci: colIndex });

      // Wait for scroll-snap animation to settle
      await this.page.waitForTimeout(600);

      // Verify selection
      const selectedText = await col.evaluate((colEl) => {
        return colEl.querySelector('.picker-opt-selected')?.textContent?.trim();
      });

      if (selectedText === text) {
        console.log(`  Picker col ${colIndex}: "${text}" ✓`);
      } else {
        console.log(`  Picker col ${colIndex}: wanted "${text}", got "${selectedText}" — will retry`);
        // Single retry with fresh index calculation
        await this.page.waitForTimeout(300);
        await selectInColumn(colIndex, text);
      }
    };

    // Select Year (3rd column), then Day (2nd column), then Month (1st column)
    await selectInColumn(2, year);
    await selectInColumn(1, dayPadded);
    await selectInColumn(0, monthPadded);

    // Click Done on the picker toolbar (last button — first is Cancel)
    await this.page.locator('.picker-toolbar-button button').last().click();
    await this.page.waitForTimeout(1000);

    console.log(`Set admission date to: ${dateString}`);
  }

  /**
   * Cancel the Admission Complete modal
   */
  async cancelAdmission(): Promise<void> {
    await this.waitForElement(this.selectors.admissionModalCancel, 10000);
    await this.page.locator(this.selectors.admissionModalCancel).click();
    console.log('Cancelled admission modal');
  }

  /**
   * Click a sidebar navigation tab
   * @param section - Section name
   */
  async clickSidebarTab(section: string): Promise<void> {
    const selector = this.selectors.sidebarTab(section);
    await this.waitForElement(selector);
    await this.page.locator(selector).click();
    await this.page.waitForTimeout(1000);
    console.log(`Clicked sidebar tab: ${section}`);
  }

  /**
    * Returns string for static selectors, or function for dynamic selectors
         */
    getSelector<K extends keyof typeof this.selectors>(key: K): typeof this.selectors[K] {
    return this.selectors[key];
  }

  /**
   * Read the patient display name from the Profile section on the patient detail page.
   * The profile shows "Name: FirstName MI LastName" (e.g., "Name: Cristian E Heathcote").
   * This method returns the name in billing grid format: "LastName, FirstName MI"
   * (e.g., "Heathcote, Cristian E").
   *
   * Call this after navigating to the patient detail page.
   */
  async getPatientBillingName(): Promise<string> {
    // DOM structure: <ion-col><span class="cs-h2">Name:</span> Cristian E Heathcote</ion-col>
    // There is only one span.cs-h2 with exactly "Name:" text on the page.
    // We evaluate in the browser to extract just the name value from the parent ion-col.
    const nameValue = await this.page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span.cs-h2'));
      const nameSpan = spans.find(s => s.textContent?.trim() === 'Name:');
      if (!nameSpan) return '';
      const col = nameSpan.closest('ion-col');
      if (!col) return '';
      return col.textContent!.replace(/Name:\s*/, '').trim();
    });

    if (!nameValue) throw new Error('Could not find patient name on profile page');

    // Convert "FirstName MI LastName" → "LastName, FirstName MI"
    const parts = nameValue.split(/\s+/);
    if (parts.length < 2) return nameValue; // fallback: return as-is

    const lastName = parts[parts.length - 1];
    const firstAndMiddle = parts.slice(0, -1).join(' ');
    return `${lastName}, ${firstAndMiddle}`;
  }
}


     