import { Page } from '@playwright/test';
import { InvVisitConfig } from '../types/hope.types';
import { createSymptomProfile } from '../fixtures/hope-fixtures';

/**
 * HOPE Visit Workflow
 * Handles the complex INV (Initial Nursing Visit) workflow for HOPE assessments
 *
 * This workflow performs:
 * 1. Vitals
 * 2. Preferences (with HOPE-specific language/living questions)
 * 3. Neurological symptoms (agitation, anxiety)
 * 4. Pain assessment
 * 5. Respiratory assessment
 * 6. Gastrointestinal assessment
 * 7. Skin assessment
 * 8. Hospice Aide tasks (role-based)
 * 9. Visit summary
 */
export class HOPEVisitWorkflow {
  private readonly selectors = {
    // Visit Navigation
    careplanAddVisit: '[data-cy="btn-add-visit"]',
    visitRole: '[data-cy="input-visit-role"]',
    visitType: '[data-cy="input-visit-type"]',
    visitModalSubmit: '#inputModalSubmit',
    yesCheckbox: '[data-cy="checkbox-yes"]',
    acknowledgeCheckbox: '[data-cy="checkbox-acknowledge"]',

    // Vitals
    vitalsIcon: '[src*="assets/svg/vitals.svg"]',
    addBPBtn: '[data-cy="button-bloodPressure-add"] > .button-inner',
    bpLocation: '[data-cy="select-bloodPressureLocation"] button',
    bpPosition: '[data-cy="select-bloodPressurePosition"] button',
    systolic: 'input[data-cy="number-input-bloodPressureSystolic"]',
    diastolic: 'input[data-cy="number-input-bloodPressureDiastolic"]',
    vitalsStatus:'#vitalsNavButton > .button-inner > .navContents > .status > .icon',

    // Preferences
    preferencesIcon: '[src*="assets/svg/preferences.svg"]',

    // CPR F2000
    cprYes: '[data-cy="radio-wasPatientAskedForPreferences-yesDiscussionOccurred"]',
    cprNo: '[id="wasPatientAskedForPreferencesRadio-no"]',
    cprRefused: '[data-cy="radio-wasPatientAskedForPreferences-yesRefusedToDiscuss"]',
    cprDate: '[data-cy="date-input-dateAsked-date"] div',
    cprComment: 'textarea[data-cy="input-cprNotAsked"]',

    // Language & Living (HOPE-specific)
    interpreterYes: '[data-cy="radio-interpreterAssist-yes"]',
    interpreterNo: '[data-cy="radio-interpreterAssist-no"]',
    preferredLanguage: '[data-cy="select-languages"] button',
    livingArrangements: '[data-cy="select-livingArrangements"] button',
    levelOfAssistance: '[data-cy="select-levelOfAssistance"] button',

    // Life Sustaining F2100
    lstYes: '[data-cy="radio-wasPatientResponsibleAskedAboutLifeSustainingTreatments-yesAndDiscussed"]',
    lstNo: '[data-cy="radio-wasPatientResponsibleAskedAboutLifeSustainingTreatments-no"]',
    lstRefuseYes: '[data-cy="radio-wasPatientResponsibleAskedAboutLifeSustainingTreatments-yesAndRefused"]',
    lstTreatmentYes: '[data-cy="radio-patientWantsLifeSustainingTreatments-yes"]',
    lstTreatmentNo: '[data-cy="radio-patientWantsLifeSustainingTreatments-no"]',
    lstDate: '[data-cy="date-input-treatmentDateAsked-date"] div',
    lstComment: 'textarea[data-cy="input-whyPatientPreferencesAboutLifeSustainingTreatmentsNotDiscussed"]',

    // Hospital F2200
    hospitalYes: '[data-cy="radio-patientPreferenceRegardingHospitalization-yesAndDiscussed"]',
    hospitalNo: '[data-cy="radio-patientPreferenceRegardingHospitalization-no"]',
    hospitalYesRefuse: '[data-cy="radio-patientPreferenceRegardingHospitalization-yesAndRefused"]',
    hospitalDate: '[data-cy="date-input-hospitalizationDateAsked-date"] div',
    hospitalComment: 'textarea[data-cy="input-whyPatientNotAskedRegardingHospitalization"]',
    hospitalFurtherYes: '[data-cy="radio-patientWantsFurtherHospitalizations-yes"]',
    hospitalFurtherNo: '[data-cy="radio-patientWantsFurtherHospitalizations-no"]',

    // Spiritual F3000
    spiritualYes: '[data-cy="radio-wasPatientOrCaregiverAskedAboutSpiritualExistentialConcerns-yesAndDiscussed"]',
    spiritualNo: '[data-cy="radio-wasPatientOrCaregiverAskedAboutSpiritualExistentialConcerns-no"]',
    spiritualRefuseYes: '[data-cy="radio-wasPatientOrCaregiverAskedAboutSpiritualExistentialConcerns-yesAndRefused"]',
    spiritualDate: '[data-cy="date-input-spiritualExistentialDateAsked-date"] div',
    spiritualComment: 'textarea[data-cy="input-whyPatientOrResponsibleNotAskedAboutSpiritualExistentialConcerns"]',
    spiritualConcernYes: '[data-cy="radio-hasPatientSpiritualConcerns-yesAndDiscussionOccurred"]',
    spiritualConcernNo: '[data-cy="radio-hasPatientSpiritualConcerns-no"]',

    // Death Signs
    deathSignsEarlyStage: '[data-cy="radio-patientShowingSignsOfImminentDeath-yes"]',
    deathSignsNoSign: '[data-cy="radio-patientShowingSignsOfImminentDeath-no"]',

    // Notes
    addNotesBtn: '[data-cy="button-notes-add"]',
    // addNeuroNotesBtn: '[data-cy="button-notes-add"]',
    notesType: '[data-cy="select-notesCategory"] button',
    notesDescription: '[data-cy="input-notesDescription"] textarea',

    preferencesStatus:'#preferencesNavButton > .button-inner > .navContents > .status > .icon',

    // Neurological
    neurologicalIcon: '[src*="assets/svg/neurological.svg"]',
    agitationNoImpact: '[data-card-id="CL010.223"] [data-cy="radio-rankSymptomImpact-notImpacted"]',
    agitationMildImpact: '[data-card-id="CL010.223"] [data-cy="radio-rankSymptomImpact-mildImpact"]',
    agitationModerateImpact: '[data-card-id="CL010.223"] [data-cy="radio-rankSymptomImpact-moderateImpact"]',
    agitationSevereImpact: '[data-card-id="CL010.223"] [data-cy="radio-rankSymptomImpact-severeImpact"]',
    agitationNoSymptom: '[data-card-id="CL010.223"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]',
    agitationToggle: '[data-cy="toggle-patientExperiencesAgitation"] button',
    agitationScore: '[data-cy="input-agitationScore"]',

    anxietyNoImpact: '[data-card-id="CL010.20"] [data-cy="radio-rankSymptomImpact-notImpacted"]',
    anxietyMildImpact: '[data-card-id="CL010.20"] [data-cy="radio-rankSymptomImpact-mildImpact"]',
    anxietyModerateImpact: '[data-card-id="CL010.20"] [data-cy="radio-rankSymptomImpact-moderateImpact"]',
    anxietySevereImpact: '[data-card-id="CL010.20"] [data-cy="radio-rankSymptomImpact-severeImpact"]',
    anxietyNoSymptom: '[data-card-id="CL010.20"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]',
    anxietyToggle: '[data-cy="toggle-patientHasAnxiety"] button',
    anxietyScore: '[data-cy="input-anxietyScore"]',

    neurologicalStatus: '#neurologicalNavButton > .button-inner > .navContents > .status > .icon',

    // Pain
    painIcon: '[src*="assets/svg/pain.svg"]',
    painWongBaker: 'button[data-cy="button-tool-wongBaker"]',
    painNumeric: 'button[data-cy="button-tool-numeric"]',
    wongBaker2: '[id="wongBaker2"]',
    painRange: '.range-knob-handle',
    neuropathicPainYes: '[data-cy="radio-patientHasNeuropathicPain-yes"]',
    neuropathicPainNo: '[data-cy="radio-patientHasNeuropathicPain-no"]',
    painScreeningYes: '[data-cy="radio-experiencingPainQuestion-yes"]',
    painScreeningNo: '[data-cy="radio-experiencingPainQuestion-no"]',
    painScreeningDate: '[data-cy="date-input-dateFirstPainScreening-date"] div',
    painActiveYes: '[data-cy="radio-activePainWith-yes"]',
    painActiveNo: '[data-cy="radio-activePainWith-no"]',
    addCompPain: '[id="addSiteBtn"]',
    nextStepBtn: '[id="nextStepBtn"]',
    generalizedPain: '[id="unspecifiedLocationPain"]',
    painType: '[id="type"] button',
    painCharacter: '[id="character"] button',
    painSeverity: '[id="descriptiveSeverity"] button',
    painFrequency: '[id="frequency"] button',
    painDuration: '[id="duration"] button',
    painOnset: '[id="onset"] button',
    painQuestion1: '[id="painQuestion1"] textarea',
    painQuestion2: '[id="painQuestion2"] textarea',
    painQuestion3: '[id="painQuestion3"] textarea',
    painComprehensiveYes: '[data-cy="radio-wasPainDoneQuestion-yes"]',
    painComprehensiveNo: '[data-cy="radio-wasPainDoneQuestion-no"]',
    painComprehensiveDate: '[data-cy="date-input-dateComprehensivePainAssessment-date"] div',
    scheduledOpioidYes: '[data-cy*="radio-scheduledOpioid"][id*="yes"]',
    scheduledOpioidNo: '[data-cy*="radio-scheduledOpioid"][id*="no"]',
    scheduledOpioidDate: '[data-cy="date-input-scheduledOpioidDate-date"] div',
    prnOpioidYes: '[data-cy*="radio-prnOpioid"][id*="yes"]',
    prnOpioidNo: '[data-cy*="radio-prnOpioid"][id*="no"]',
    prnOpioidDate: '[data-cy="date-input-prnOpioidDate-date"] div',

    painNoImpact: 'pain-screening-tool [data-cy="radio-rankSymptomImpact-notImpacted"]',
    painMildImpact: 'pain-screening-tool [data-cy="radio-rankSymptomImpact-mildImpact"]',
    painModerateImpact: 'pain-screening-tool [data-cy="radio-rankSymptomImpact-moderateImpact"]',
    painSevereImpact: 'pain-screening-tool [data-cy="radio-rankSymptomImpact-severeImpact"]',
    painNoSymptom: 'pain-screening-tool [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]',
    painStatus: '#painNavButton > .button-inner > .navContents > .status > .icon',

    // Respiratory
    respiratoryIcon: '[src*="assets/svg/respiratory.svg"]',
    sobScreeningYes: '[data-cy="radio-shortnessOfBreathScreening-yes"]',
    sobScreeningNo: '[data-cy="radio-shortnessOfBreathScreening-no"]',
    sobScreeningDate: '[data-cy="date-input-shortnessOfBreathScreeningDate-date"] div',
    sobActiveYes: '[data-cy="radio-shortnessOfBreathActive-yes"]',
    treatmentInitYes: '[data-cy="radio-treatmentInitiated-yes"]',
    treatmentDate: '[data-cy="date-input-treatmentInitiatedDate-date"] div',
    oxygenCheckbox: '[data-cy="checkbox-oxygenTherapy"]',

    sobNoImpact: '[data-card-id="CL010.37"] [data-cy="radio-rankSymptomImpact-notImpacted"]',
    sobMildImpact: '[data-card-id="CL010.37"] [data-cy="radio-rankSymptomImpact-mildImpact"]',
    sobModerateImpact: '[data-card-id="CL010.37"] [data-cy="radio-rankSymptomImpact-moderateImpact"]',
    sobSevereImpact: '[data-card-id="CL010.37"] [data-cy="radio-rankSymptomImpact-severeImpact"]',
    sobNoSymptom: '[data-card-id="CL010.37"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]',
    respiratoryStatus: '#respiratoryNavButton > .button-inner > .navContents > .status > .icon',

    // Gastrointestinal
    gastrointestinalIcon: '[src*="assets/svg/gastrointestinal.svg"]',
    bowelRegimenYes: '[data-cy="radio-patientHasBowelRegimen-yes"]',
    bowelRegimenNo: '[data-cy="radio-patientHasBowelRegimen-no"]',
    bowelRegimenDecline: '[data-cy="radio-patientHasBowelRegimen-patientDeclinedTreatment"]',
    bowelRegimenDate: '[data-cy="date-input-bowelRegimenDate-date"] div',
    bmTypeIrregular: '[data-cy="radio-bmType-irregular"]',
    bmTypeRegular: '[data-cy="radio-bmType-regular"]',
    bmTypeDiarrhea: '[data-cy="radio-bmIrregular-diarrhea"]',
    bmTypeConstipation: '[data-cy="radio-bmIrregular-constipation"]',

    // GI Symptom Impact
    bowelNoImpact: '[data-card-id="CL010.68"] [data-cy="radio-rankSymptomImpact-notImpacted"]',
    bowelMildImpact: '[data-card-id="CL010.68"] [data-cy="radio-rankSymptomImpact-mildImpact"]',
    bowelModerateImpact: '[data-card-id="CL010.68"] [data-cy="radio-rankSymptomImpact-moderateImpact"]',
    bowelSevereImpact: '[data-card-id="CL010.68"] [data-cy="radio-rankSymptomImpact-severeImpact"]',
    bowelNoSymptom: '[data-card-id="CL010.68"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]',

    vomitNoImpact: '[data-card-id="CL010.72"] [data-cy="radio-rankSymptomImpact-notImpacted"]',
    vomitMildImpact: '[data-card-id="CL010.72"] [data-cy="radio-rankSymptomImpact-mildImpact"]',
    vomitModerateImpact: '[data-card-id="CL010.72"] [data-cy="radio-rankSymptomImpact-moderateImpact"]',
    vomitSevereImpact: '[data-card-id="CL010.72"] [data-cy="radio-rankSymptomImpact-severeImpact"]',
    vomitNoSymptom: '[data-card-id="CL010.72"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]',

    nauseaNoImpact: '[data-card-id="CL010.73"] [data-cy="radio-rankSymptomImpact-notImpacted"]',
    nauseaMildImpact: '[data-card-id="CL010.73"] [data-cy="radio-rankSymptomImpact-mildImpact"]',
    nauseaModerateImpact: '[data-card-id="CL010.73"] [data-cy="radio-rankSymptomImpact-moderateImpact"]',
    nauseaSevereImpact: '[data-card-id="CL010.73"] [data-cy="radio-rankSymptomImpact-severeImpact"]',
    nauseaNoSymptom: '[data-card-id="CL010.73"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]',
    gastrointestinalStatus: '#painNavButton > .button-inner > .navContents > .status > .icon',

    // Skin
    skinIcon: '[src*="assets/svg/skin.svg"]',
    skinLocationTitle: '#locationTitle input',
    skinLocationType: '#locationType button',
    skinWoundType: '#woundType button',
    skinWoundWidth: '#width',
    skinCanvas: 'canvas',
    skinNextBtn: '.tabButton button:nth-child(2)',
    scoringTool: '[data-cy="select-scoring-tool"]',
    skinScore: '.summary-sidebar button[id*="select"]',
    woundCareNotes: 'new-wound-notes textarea',
    woundAlertActive: '.alert-button-group button:nth-child(2)',
    woundAlertHealed: '.alert-button-group button:nth-child(1)',
    noneOfAbove: '[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-noneOfTheAbove"]',
    pressureDeviceChair: '[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-pressureReducingDeviceForChair"]',
    skinStatus: '#skinNavButton > .button-inner > .navContents > .status > .icon',
    toggleDecline:'[data-cy="toggle-declineCard"]',
    // Hospice Aide
    hospiceAideIcon: '[src*="assets/svg/hospiceAide.svg"]',
    addHATask: '[data-cy="button-addTask-add"]',
    taskCategory: '[data-cy="select-addTaskCategory"] button',
    taskName: '[data-cy="select-addTaskTask"] button',
    levelSelf:'[data-cy="radio-addTaskAssistance-self"]',
    levelAssist:'[data-cy="radio-addTaskAssistance-assist"]',
    levelTotal:'[data-cy="radio-addTaskAssistance-total"]',
    frequencyTimes: 'input[data-cy="number-input-frequencyNumerator"]',
    frequencyPer: 'input[data-cy="number-input-frequencyDenominator"]',
    taskComments: 'textarea[data-cy="input-addTaskHaComments"]',
    haStatus: '#hospiceAideNavButton > .button-inner > .navContents > .status > .icon',
    haEndTaskSubmit:'.button-md-success > .button-inner',
    // Summary
    summaryIcon: '[src*="assets/svg/summary.svg"]',
    coordinateCareAdd: '[data-cy="button-coordinationOfCare-add"] > .fab-close-icon',
    careRelation: '[data-cy="select-coordinationRelation"]',
    careContact: '[data-cy="select-coordinationPerson"]',
    careVia: '[data-cy="select-coordinationVia"]',
    careDescription: '.inputBox > .text-input',
    summaryStatus: '#summaryNavButton > .button-inner > .navContents > .status > .icon',

    // Common
    saveBtn: '[data-cy="btn-input-modal-submit"]',
    completeBtn: '[data-cy="btn-complete"]',
    taskCheckbox: '[data-cy="checkbox-task"]',
    eSignedBy: '[data-cy="input-esigned-by"]',
  };

  constructor(private page: Page) {}

  /**
   * Add new hospice visit
   * @param visitType - Type of visit (e.g., "Initial Nursing Assessment")
   * @param role - User role performing visit
   */
  async addHospiceVisit(visitType: string, role: string): Promise<void> {
    console.log(`\n📋 Adding ${visitType} visit for role: ${role}...`);

    await this.page.waitForTimeout(10000);

    // Click add visit
    await this.page.locator(this.selectors.careplanAddVisit).click();
    await this.page.waitForTimeout(2000);

    // Select role
    await this.page.locator(this.selectors.visitRole).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator(`ion-item.item-radio:has-text("${role}")`).click();
    await this.page.waitForTimeout(1000);

    // Select visit type
    await this.page.locator(this.selectors.visitType).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator(`ion-item.item-radio:has-text("${visitType}")`).click();
    await this.page.waitForTimeout(2000);

    // Handle modal confirmations if present
    const modalContent = await this.page.locator('page-create-visit-modal[class*="ion-page"] ion-content');
    if (await modalContent.isVisible()) {
      const popupText = await modalContent.textContent();

      if (popupText?.includes('Check to continue')) {
        await this.page.locator(this.selectors.acknowledgeCheckbox).click({ force: true });
        await this.page.waitForTimeout(2000);
      }

      if (popupText?.includes('Yes')) {
        const yesCheckbox = this.page.locator(this.selectors.yesCheckbox);
        if (await yesCheckbox.isVisible()) {
          await yesCheckbox.click({ force: true });
          await this.page.waitForTimeout(2000);
        }
      }
    }

    // Submit
    await this.page.locator(this.selectors.visitModalSubmit).click();
    await this.page.waitForTimeout(10000);

    console.log(`✅ Visit added: ${visitType}`);
  }

  /**
   * Perform complete INV Visit with HOPE assessment
   * @param config - Visit configuration
   */
  async performInvVisitHope(config: InvVisitConfig): Promise<void> {
    console.log('\n🏥 Performing INV Visit with HOPE Assessment...\n');

    // // Step 1: Add Vitals
    // await this.addVitals();

    // // Step 2: Add Preferences (HOPE-specific)
    // await this.addPreferencesByType(config.preferenceResponse, config.cprmsg, config.lifeSustainingMsg);

    // // Step 3: Add Neurological Symptoms
    // await this.addNeuroSymptoms(config.impactLevel);

    // // Step 4: Add Pain Assessment
    // await this.addPainAssessment('INV', config.cprmsg || 'Yes', config.impactLevel);

    // // Step 5: Add Respiratory Assessment
    // await this.addRespiratoryAssessment('INV', config.cprmsg || 'Yes', config.impactLevel);

    // Step 6: Add Gastrointestinal Assessment
    await this.addGastrointestinalAssessment(config.bowelRegimen, config.bowelType, config.impactLevel);

    // Step 7: Add Skin Assessment
    await this.addSkinAssessment(config.bowelRegimen === 'Yes' ? 'Yes' : 'No');

    // Step 8: Role-based Hospice Aide Task
    if (config.role === 'Registered Nurse (RN)' || config.role === 'Case Manager' || config.role === 'NP') {
      await this.addHospiceAideTask('Bathing', 'Bed - Full', 'self', 'Visit');
    }

    // Step 9: Add Visit Summary
    await this.addVisitSummary();

    console.log('\n✅ INV Visit with HOPE Assessment complete!\n');
  }

  /**
   * Add vitals (blood pressure)
   */
  private async addVitals(): Promise<void> {
    console.log('📊 Adding Vitals...');

    await this.page.waitForTimeout(5000);
    await this.page.locator(this.selectors.vitalsIcon).click();
    await this.page.waitForTimeout(3000);

    await this.page.locator(this.selectors.addBPBtn).click({ force: true });
    await this.page.waitForTimeout(2000);

    // Select BP location (first option)
    await this.page.locator(this.selectors.bpLocation).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('ion-item.item-radio').first().click();
    await this.page.waitForTimeout(2000);

    // Select BP position (first option)
    await this.page.locator(this.selectors.bpPosition).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('ion-item.item-radio').first().click();
    await this.page.waitForTimeout(2000);

    // Enter systolic
    const systolic = Math.floor(Math.random() * 90) + 110; // 110-200
    await this.page.locator(this.selectors.systolic).fill(String(systolic));
    await this.page.waitForTimeout(2000);

    // Enter diastolic
    const diastolic = Math.floor(Math.random() * 40) + 60; // 60-100
    await this.page.locator(this.selectors.diastolic).fill(String(diastolic));
    await this.page.waitForTimeout(2000);

    // Save
    await this.page.locator(this.selectors.saveBtn).click();
    await this.page.waitForTimeout(2000);

    console.log(`✅ Vitals added: ${systolic}/${diastolic}`);
  }

  /**
   * Add preferences based on response type (Yes/No/Refuse)
   * @param type - Preference response type
   * @param cprmsg - CPR message type
   * @param lifeSustainingMsg - Life sustaining message type
   */
  private async addPreferencesByType(
    type: 'Yes' | 'No' | 'Refuse',
    cprmsg?: string,
    lifeSustainingMsg?: string
  ): Promise<void> {
    console.log(`💭 Adding Preferences (${type})...`);

    await this.page.waitForTimeout(3000);
    await this.page.locator(this.selectors.preferencesIcon).click();
    await this.page.waitForTimeout(3000);

    if (type === 'Yes') {
      // CPR - Yes, occurred
      await this.page.locator(this.selectors.cprYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.cprDate).click();
      await this.page.waitForTimeout(1000);

      // Language - Interpreter Yes
      await this.page.locator(this.selectors.interpreterYes).click();
      await this.page.waitForTimeout(2000);

      // Living Arrangements - Alone
      await this.page.locator(this.selectors.livingArrangements).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio:has-text("Alone")').click();
      await this.page.waitForTimeout(2000);

      // Level of Assistance - Around the Clock
      await this.page.locator(this.selectors.levelOfAssistance).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio:has-text("Around the Clock")').click();
      await this.page.waitForTimeout(2000);

      // Life Sustaining - Yes
      await this.page.locator(this.selectors.lstYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.lstDate).click();
      await this.page.waitForTimeout(1000);

      // Hospitalization - Yes
      await this.page.locator(this.selectors.hospitalYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.hospitalDate).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator(this.selectors.hospitalFurtherNo).click();
      await this.page.waitForTimeout(2000);

      // Spiritual - Yes
      await this.page.locator(this.selectors.spiritualYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.spiritualDate).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator(this.selectors.spiritualConcernNo).click();
      await this.page.waitForTimeout(2000);
    } else if (type === 'No') {
      // CPR - Not asked with comment
      await this.page.locator(this.selectors.cprNo).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.cprComment).fill('Patient declined to discuss');
      await this.page.waitForTimeout(2000);

      // Language - French, No interpreter
      await this.page.locator(this.selectors.preferredLanguage).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio:has-text("French")').click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.interpreterNo).click();
      await this.page.waitForTimeout(2000);

      // Living Arrangements - With Others in Home
      await this.page.locator(this.selectors.livingArrangements).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio:has-text("With Others in Home")').click();
      await this.page.waitForTimeout(2000);

      // Level of Assistance - Regular Nighttime Only
      await this.page.locator(this.selectors.levelOfAssistance).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio:has-text("Regular Nighttime Only")').click();
      await this.page.waitForTimeout(2000);

      // Life Sustaining - No with document or No
      if (lifeSustainingMsg === 'NowithDocument') {
        await this.page.locator(this.selectors.lstNo).click();
        await this.page.waitForTimeout(2000);
        await this.page.locator(this.selectors.lstComment).fill('Documented in advance directive');
        await this.page.waitForTimeout(2000);
      } else {
        await this.page.locator(this.selectors.lstNo).click();
        await this.page.waitForTimeout(2000);
      }

      // Hospitalization - No
      await this.page.locator(this.selectors.hospitalNo).click();
      await this.page.waitForTimeout(2000);

      // Spiritual - No
      await this.page.locator(this.selectors.spiritualNo).click();
      await this.page.waitForTimeout(2000);
    } else if (type === 'Refuse') {
      // CPR - Refused
      await this.page.locator(this.selectors.cprRefused).click();
      await this.page.waitForTimeout(2000);

      // Language - Korean
      await this.page.locator(this.selectors.preferredLanguage).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio:has-text("Korean")').click();
      await this.page.waitForTimeout(2000);

      // Living Arrangements - Congregate Home
      await this.page.locator(this.selectors.livingArrangements).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio:has-text("Congregate Home")').click();
      await this.page.waitForTimeout(2000);

      // Level of Assistance - Occasional
      await this.page.locator(this.selectors.levelOfAssistance).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio:has-text("Occasional")').click();
      await this.page.waitForTimeout(2000);

      // Life Sustaining - Refused Yes
      await this.page.locator(this.selectors.lstRefuseYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.lstTreatmentNo).click();
      await this.page.waitForTimeout(2000);

      // Hospitalization - Yes but Refused
      await this.page.locator(this.selectors.hospitalYesRefuse).click();
      await this.page.waitForTimeout(2000);

      // Spiritual - Refused Yes
      await this.page.locator(this.selectors.spiritualRefuseYes).click();
      await this.page.waitForTimeout(2000);
    }

    // Death signs
    await this.page.locator(this.selectors.deathSignsNoSign).click();
    await this.page.waitForTimeout(2000);

    await this.page.locator(this.selectors.addNotesBtn).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator(this.selectors.notesType).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('ion-item.item-radio:has-text("General")').click();
    await this.page.waitForTimeout(2000);
    await this.page.locator(this.selectors.notesDescription).fill('Adding notes for preferences section');
    await this.page.waitForTimeout(2000);
    await this.page.locator(this.selectors.saveBtn).click();
    await this.page.waitForTimeout(2000);
    await this.page.locator(this.selectors.preferencesIcon).click();
    const prefStatusName = await this.page.locator(this.selectors.preferencesStatus).getAttribute('name');  
    if (prefStatusName !== "md-checkmark") {
      throw new Error(`Preferences status not marked complete. Expected "md-checkmark", got "${prefStatusName}"`);
    }

    console.log(`✅ Preferences (${type}) added`);
  }

  /**
   * Add neurological symptoms (agitation and anxiety)
   * @param impactLevel - Symptom impact level
   */
  private async addNeuroSymptoms(impactLevel: string): Promise<void> {
    console.log('🧠 Adding Neurological Symptoms...');

    await this.page.waitForTimeout(3000);
    await this.page.locator(this.selectors.neurologicalIcon).click();
    await this.page.waitForTimeout(3000);

    // Handle agitation
    if (impactLevel === 'NoSymptoms') {
      await this.page.locator(this.selectors.agitationNoSymptom).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'NoImpact') {
      await this.page.locator(this.selectors.agitationNoImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'MildImpact') {
      await this.page.locator(this.selectors.agitationMildImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'ModerateImpact') {
      await this.page.locator(this.selectors.agitationModerateImpact).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.agitationToggle).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator(this.selectors.agitationScore).fill('5');
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'SevereImpact') {
      await this.page.locator(this.selectors.agitationSevereImpact).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.agitationToggle).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator(this.selectors.agitationScore).fill('8');
      await this.page.waitForTimeout(2000);
    }

    // Handle anxiety (same logic)
    if (impactLevel === 'NoSymptoms') {
      await this.page.locator(this.selectors.anxietyNoSymptom).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'NoImpact') {
      await this.page.locator(this.selectors.anxietyNoImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'MildImpact') {
      await this.page.locator(this.selectors.anxietyMildImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'ModerateImpact') {
      await this.page.locator(this.selectors.anxietyModerateImpact).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.anxietyToggle).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator(this.selectors.anxietyScore).fill('6');
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'SevereImpact') {
      await this.page.locator(this.selectors.anxietySevereImpact).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.anxietyToggle).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator(this.selectors.anxietyScore).fill('9');
      await this.page.waitForTimeout(2000);
    }

    await this.page.locator(this.selectors.neurologicalIcon).click();
    await this.page.waitForTimeout(2000);

    console.log('  → Checking neurological status...');
    try {
      await this.page.locator(this.selectors.neurologicalStatus).waitFor({ state: 'visible', timeout: 5000 });
      const neuroStatusName = await this.page.locator(this.selectors.neurologicalStatus).getAttribute('name', { timeout: 5000 });
      console.log(`  → Neurological status: ${neuroStatusName}`);
      if (neuroStatusName !== "md-checkmark") {
        console.warn(`⚠️ WARNING: Neurological status not marked complete. Expected "md-checkmark", got "${neuroStatusName}"`);
      }
    } catch (error) {
      console.warn(`⚠️ WARNING: Could not check neurological status: ${error.message}`);
      // Continue anyway
    }

    console.log('✅ Neurological symptoms added');
  }

  /**
   * Add pain assessment
   * @param visitType - INV or NonINV
   * @param type - Yes or No
   * @param impactLevel - Symptom impact level
   */
  private async addPainAssessment(visitType: string, type: string, impactLevel: string): Promise<void> {
    console.log('🩹 Adding Pain Assessment...');

    await this.page.waitForTimeout(3000);
    await this.page.locator(this.selectors.painIcon).click();
    await this.page.waitForTimeout(3000);

    if (visitType === 'INV' && type === 'Yes') {
      // Pain screening J0900 - Yes
      await this.page.locator(this.selectors.painScreeningYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.painScreeningDate).click();
      await this.page.waitForTimeout(1000);

      // Pain active J0905 - Yes
      await this.page.locator(this.selectors.painActiveYes).click();
      await this.page.waitForTimeout(2000);

      // Add comprehensive pain assessment
      await this.page.locator(this.selectors.addCompPain).click();
      await this.page.waitForTimeout(3000);

      // Pain scale - Wong Baker
      await this.page.locator(this.selectors.painWongBaker).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.wongBaker2).click();
      await this.page.waitForTimeout(2000);

      // Neuropathic pain
      await this.page.locator(this.selectors.neuropathicPainNo).click();
      await this.page.waitForTimeout(2000);

      // Next step
      await this.page.locator(this.selectors.nextStepBtn).click();
      await this.page.waitForTimeout(2000);

      // Generalized pain
      await this.page.locator(this.selectors.generalizedPain).click();
      await this.page.waitForTimeout(2000);

      // Pain type
      await this.page.locator(this.selectors.painType).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio').first().click();
      await this.page.waitForTimeout(2000);

      // Pain character
      await this.page.locator(this.selectors.painCharacter).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio').first().click();
      await this.page.waitForTimeout(2000);

      // Next step
      await this.page.locator(this.selectors.nextStepBtn).click();
      await this.page.waitForTimeout(2000);

      // Pain severity, frequency, duration, onset
      await this.page.locator(this.selectors.painSeverity).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio').first().click();
      await this.page.waitForTimeout(2000);

      await this.page.locator(this.selectors.painFrequency).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio').first().click();
      await this.page.waitForTimeout(2000);

      await this.page.locator(this.selectors.painDuration).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio').first().click();
      await this.page.waitForTimeout(2000);

      await this.page.locator(this.selectors.painOnset).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio').first().click();
      await this.page.waitForTimeout(2000);

      // Next step
      await this.page.locator(this.selectors.nextStepBtn).click();
      await this.page.waitForTimeout(2000);

      // Pain questions
      await this.page.locator(this.selectors.painQuestion1).fill('Patient reports pain improves with medication');
      await this.page.waitForTimeout(1000);
      await this.page.locator(this.selectors.painQuestion2).fill('Pain is managed with current regimen');
      await this.page.waitForTimeout(1000);
      await this.page.locator(this.selectors.painQuestion3).fill('No significant interference with daily activities');
      await this.page.waitForTimeout(2000);

      // Save comprehensive pain
      await this.page.locator(this.selectors.saveBtn).click();
      await this.page.waitForTimeout(3000);

      // Comprehensive pain assessment J0910 - Yes
      await this.page.locator(this.selectors.painComprehensiveYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.painComprehensiveDate).click();
      await this.page.waitForTimeout(1000);

      // Scheduled opioid - Yes
      await this.page.locator(this.selectors.scheduledOpioidYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.scheduledOpioidDate).click();
      await this.page.waitForTimeout(1000);

      // PRN opioid - Yes
      await this.page.locator(this.selectors.prnOpioidYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.prnOpioidDate).click();
      await this.page.waitForTimeout(1000);
    } else {
      // Pain screening - No
      await this.page.locator(this.selectors.painScreeningNo).click();
      await this.page.waitForTimeout(2000);

      // Scheduled opioid - No
      await this.page.locator(this.selectors.scheduledOpioidNo).click();
      await this.page.waitForTimeout(2000);

      // PRN opioid - No
      await this.page.locator(this.selectors.prnOpioidNo).click();
      await this.page.waitForTimeout(2000);
    }

    // Pain impact
    if (impactLevel === 'NoSymptoms') {
      await this.page.locator(this.selectors.painNoSymptom).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'NoImpact') {
      await this.page.locator(this.selectors.painNoImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'MildImpact') {
      await this.page.locator(this.selectors.painMildImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'ModerateImpact') {
      await this.page.locator(this.selectors.painModerateImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'SevereImpact') {
      await this.page.locator(this.selectors.painSevereImpact).click();
      await this.page.waitForTimeout(2000);
    }

    // Save
    // await this.page.locator(this.selectors.saveBtn).click();
    // await this.page.waitForTimeout(3000);

    console.log('✅ Pain assessment added');
  }

  /**
   * Add respiratory assessment (shortness of breath)
   * @param visitType - INV or NonINV
   * @param type - Yes or No
   * @param impactLevel - Symptom impact level
   */
  private async addRespiratoryAssessment(visitType: string, type: string, impactLevel: string): Promise<void> {
    console.log('🫁 Adding Respiratory Assessment...');

    await this.page.waitForTimeout(3000);
    await this.page.locator(this.selectors.respiratoryIcon).click();
    await this.page.waitForTimeout(3000);

    if (visitType === 'INV' && type === 'Yes') {
      // SOB screening J2030 - Yes
      await this.page.locator(this.selectors.sobScreeningYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.sobScreeningDate).click();
      await this.page.waitForTimeout(1000);

      // SOB active - Yes
      await this.page.locator(this.selectors.sobActiveYes).click();
      await this.page.waitForTimeout(2000);

      // Treatment initiated - Yes
      await this.page.locator(this.selectors.treatmentInitYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.treatmentDate).click();
      await this.page.waitForTimeout(1000);

      // Oxygen
      await this.page.locator(this.selectors.oxygenCheckbox).click();
      await this.page.waitForTimeout(2000);
    } else {
      // SOB screening - No
      await this.page.locator(this.selectors.sobScreeningNo).click();
      await this.page.waitForTimeout(2000);
    }

    // SOB impact
    if (impactLevel === 'NoSymptoms') {
      await this.page.locator(this.selectors.sobNoSymptom).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'NoImpact') {
      await this.page.locator(this.selectors.sobNoImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'MildImpact') {
      await this.page.locator(this.selectors.sobMildImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'ModerateImpact') {
      await this.page.locator(this.selectors.sobModerateImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'SevereImpact') {
      await this.page.locator(this.selectors.sobSevereImpact).click();
      await this.page.waitForTimeout(2000);
    }

    // Save
    // await this.page.locator(this.selectors.saveBtn).click();
    // await this.page.waitForTimeout(3000);

    console.log('✅ Respiratory assessment added');
  }

  /**
   * Add gastrointestinal assessment
   * @param bowelRegimen - Yes/No/NowithDocument
   * @param bowelType - Regular/Diarrhea/Constipation
   * @param impactLevel - Symptom impact level
   */
  private async addGastrointestinalAssessment(
    bowelRegimen: string,
    bowelType: string,
    impactLevel: string
  ): Promise<void> {
    console.log('🍽️ Adding Gastrointestinal Assessment...');

    await this.page.waitForTimeout(3000);
    await this.page.locator(this.selectors.gastrointestinalIcon).click();
    await this.page.waitForTimeout(3000);

    // Bowel regimen N0520
    if (bowelRegimen === 'Yes') {
      await this.page.locator(this.selectors.bowelRegimenYes).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.bowelRegimenDate).click();
      await this.page.waitForTimeout(1000);
    } else if (bowelRegimen === 'NowithDocument') {
      await this.page.locator(this.selectors.bowelRegimenDecline).click();
      await this.page.waitForTimeout(2000);
    } else {
      await this.page.locator(this.selectors.bowelRegimenNo).click();
      await this.page.waitForTimeout(2000);
    }

    // Bowel movement type
    if (bowelType === 'Regular') {
      await this.page.locator(this.selectors.bmTypeRegular).click();
      await this.page.waitForTimeout(2000);
    } else if (bowelType === 'Diarrhea') {
      await this.page.locator(this.selectors.bmTypeIrregular).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.bmTypeDiarrhea).click();
      await this.page.waitForTimeout(2000);
    } else if (bowelType === 'Constipation') {
      await this.page.locator(this.selectors.bmTypeIrregular).click();
      await this.page.waitForTimeout(2000);
      await this.page.locator(this.selectors.bmTypeConstipation).click();
      await this.page.waitForTimeout(2000);
    }

    // Bowel symptom impact (diarrhea)
    if (bowelType === 'Diarrhea' && impactLevel !== 'NoSymptoms') {
      if (impactLevel === 'NoImpact') {
        await this.page.locator(this.selectors.bowelNoImpact).click();
        await this.page.waitForTimeout(2000);
      } else if (impactLevel === 'MildImpact') {
        await this.page.locator(this.selectors.bowelMildImpact).click();
        await this.page.waitForTimeout(2000);
      } else if (impactLevel === 'ModerateImpact') {
        await this.page.locator(this.selectors.bowelModerateImpact).click();
        await this.page.waitForTimeout(2000);
      } else if (impactLevel === 'SevereImpact') {
        await this.page.locator(this.selectors.bowelSevereImpact).click();
        await this.page.waitForTimeout(2000);
      }
    } else {
      // For constipation or no bowel issues, mark diarrhea as not experiencing
            await this.page.locator(this.selectors.bowelNoSymptom).click({ force: true });
      await this.page.waitForTimeout(2000);
    }

    // Scroll down the page to reveal vomit and nausea sections
    await this.page.evaluate(() => {
      window.scrollBy(0, 800);
    });
    // Scroll safely to the vomiting section element
    const vomitElement = this.page.locator(this.selectors.vomitNoSymptom);
    await vomitElement.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(2000);

    // Vomiting impact
    if (impactLevel === 'NoSymptoms') {
      await this.page.locator(this.selectors.vomitNoSymptom).click({ force: true });
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'NoImpact') {
      await this.page.locator(this.selectors.vomitNoImpact).click({ force: true });
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'MildImpact') {
      await this.page.locator(this.selectors.vomitMildImpact).click({ force: true });
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'ModerateImpact') {
      await this.page.locator(this.selectors.vomitModerateImpact).click({ force: true });
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'SevereImpact') {
      await this.page.locator(this.selectors.vomitSevereImpact).click({ force: true });
      await this.page.waitForTimeout(2000);
    }

    // Nausea impact
    if (impactLevel === 'NoSymptoms') {
      await this.page.locator(this.selectors.nauseaNoSymptom).click({ force: true });
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'NoImpact') {
      await this.page.locator(this.selectors.nauseaNoImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'MildImpact') {
      await this.page.locator(this.selectors.nauseaMildImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'ModerateImpact') {
      await this.page.locator(this.selectors.nauseaModerateImpact).click();
      await this.page.waitForTimeout(2000);
    } else if (impactLevel === 'SevereImpact') {
      await this.page.locator(this.selectors.nauseaSevereImpact).click();
      await this.page.waitForTimeout(2000);
    }

    // Save
    // await this.page.locator(this.selectors.saveBtn).click();
    // await this.page.waitForTimeout(3000);

    console.log('✅ Gastrointestinal assessment added');
  }

  /**
   * Add skin assessment
   * @param hasWounds - Yes or No
   */
  private async addSkinAssessment(hasWounds: string): Promise<void> {
    console.log('🩹 Adding Skin Assessment...');

    await this.page.waitForTimeout(3000);
    await this.page.locator(this.selectors.skinIcon).click();
    await this.page.waitForTimeout(3000);

    if (hasWounds === 'Yes') {
      // Add wound location
      await this.page.locator(this.selectors.skinLocationTitle).fill('Right heel');
      await this.page.waitForTimeout(2000);

      // Location type
      await this.page.locator(this.selectors.skinLocationType).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio:has-text("Foot")').click();
      await this.page.waitForTimeout(2000);

      // Wound type
      await this.page.locator(this.selectors.skinWoundType).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio:has-text("Diabetic Foot Ulcer")').click();
      await this.page.waitForTimeout(2000);

      // Wound width
      await this.page.locator(this.selectors.skinWoundWidth).fill('2.5');
      await this.page.waitForTimeout(2000);

      // Next
      await this.page.locator(this.selectors.skinNextBtn).click();
      await this.page.waitForTimeout(2000);

      // Mark on body diagram (click center of canvas)
      const canvas = await this.page.locator(this.selectors.skinCanvas).first();
      await canvas.click();
      await this.page.waitForTimeout(2000);

      // Next
      await this.page.locator(this.selectors.skinNextBtn).click();
      await this.page.waitForTimeout(2000);

      // Scoring tool
      await this.page.locator(this.selectors.scoringTool).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-item.item-radio').first().click();
      await this.page.waitForTimeout(2000);

      // Score
      await this.page.locator(this.selectors.skinScore).fill('8');
      await this.page.waitForTimeout(2000);

      // Wound care notes
      await this.page.locator(this.selectors.woundCareNotes).fill('Wound cleaned and dressed. No signs of infection.');
      await this.page.waitForTimeout(2000);

      // Next
      await this.page.locator(this.selectors.skinNextBtn).click();
      await this.page.waitForTimeout(2000);

      // Wound alert - Active
      await this.page.locator(this.selectors.woundAlertActive).click();
      await this.page.waitForTimeout(2000);

      // Save
      await this.page.locator(this.selectors.saveBtn).click();
      await this.page.waitForTimeout(3000);

      // Pressure device - Chair
      await this.page.locator(this.selectors.pressureDeviceChair).click();
      await this.page.waitForTimeout(2000);
    } else {
      // None of above
      await this.page.locator(this.selectors.noneOfAbove).click();
      await this.page.waitForTimeout(2000);
    }

    // Save
    // await this.page.locator(this.selectors.saveBtn).click();
    // await this.page.waitForTimeout(3000);

    console.log('✅ Skin assessment added');
  }

  /**
   * Add Hospice Aide task
   * @param category - Task category
   * @param name - Task name
   * @param level - self/assist/total
   * @param frequency - Visit/Day/Week
   */
  private async addHospiceAideTask(category: string, name: string, level: string, frequency: string): Promise<void> {
    console.log('👩‍⚕️ Adding Hospice Aide Task...');

    await this.page.waitForTimeout(3000);
    await this.page.locator(this.selectors.hospiceAideIcon).click();
    await this.page.waitForTimeout(3000);

    // Add HA task
    await this.page.locator(this.selectors.addHATask).click();
    await this.page.waitForTimeout(2000);

    // Task category
    await this.page.locator(this.selectors.taskCategory).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator(`ion-item.item-radio:has-text("${category}")`).click();
    await this.page.waitForTimeout(2000);

    // Task name
    await this.page.locator(this.selectors.taskName).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator(`ion-item.item-radio:has-text("${name}")`).click();
    await this.page.waitForTimeout(2000);

    // Level
    if (level === 'self') {
      await this.page.locator(this.selectors.levelSelf).click();
      await this.page.waitForTimeout(2000);
    } else if (level === 'assist') {
      await this.page.locator(this.selectors.levelAssist).click();
      await this.page.waitForTimeout(2000);
    } else if (level === 'total') {
      await this.page.locator(this.selectors.levelTotal).click();
      await this.page.waitForTimeout(2000);
    }

    // Frequency
    await this.page.locator(this.selectors.frequencyTimes).fill('1');
    await this.page.waitForTimeout(2000);

    await this.page.locator(this.selectors.frequencyPer).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator(`ion-item.item-radio:has-text("${frequency}")`).click();
    await this.page.waitForTimeout(2000);

    // Comments
    await this.page.locator(this.selectors.taskComments).fill(`${category} - ${name} task completed`);
    await this.page.waitForTimeout(2000);

    // Save
    await this.page.locator(this.selectors.saveBtn).click();
    await this.page.waitForTimeout(3000);

    console.log('✅ Hospice Aide task added');
  }

  /**
   * Add visit summary (coordination of care)
   */
  private async addVisitSummary(): Promise<void> {
    console.log('📝 Adding Visit Summary...');

    await this.page.waitForTimeout(3000);
    await this.page.locator(this.selectors.summaryIcon).click();
    await this.page.waitForTimeout(3000);

    // Add coordination of care
    await this.page.locator(this.selectors.coordinateCareAdd).click();
    await this.page.waitForTimeout(2000);

    // Relation
    await this.page.locator(this.selectors.careRelation).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('ion-item.item-radio').first().click();
    await this.page.waitForTimeout(2000);

    // Contact
    await this.page.locator(this.selectors.careContact).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('ion-item.item-radio').first().click();
    await this.page.waitForTimeout(2000);

    // Via
    await this.page.locator(this.selectors.careVia).click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('ion-item.item-radio').first().click();
    await this.page.waitForTimeout(2000);

    // Description
    await this.page.locator(this.selectors.careDescription).fill('Discussed patient care plan with family. All concerns addressed.');
    await this.page.waitForTimeout(2000);

    // Save
    await this.page.locator(this.selectors.saveBtn).click();
    await this.page.waitForTimeout(3000);

    console.log('✅ Visit summary added');
  }

  /**
   * Complete visit with electronic signature
   * @param signedBy - Name of person signing
   */
  async taskEsignby(signedBy: string): Promise<void> {
    console.log('✍️ Completing visit with e-signature...');

    await this.page.waitForTimeout(3000);

    // Check all required task checkboxes
    const taskCheckboxes = await this.page.locator(this.selectors.taskCheckbox).all();
    for (const checkbox of taskCheckboxes) {
      if (await checkbox.isVisible()) {
        await checkbox.click({ force: true });
        await this.page.waitForTimeout(1000);
      }
    }

    // Complete visit
    await this.page.locator(this.selectors.completeBtn).click();
    await this.page.waitForTimeout(2000);

    // E-signature
    await this.page.locator(this.selectors.eSignedBy).fill(signedBy);
    await this.page.waitForTimeout(2000);

    // Final save
    await this.page.locator(this.selectors.saveBtn).click();
    await this.page.waitForTimeout(5000);

    console.log(`✅ Visit completed and signed by ${signedBy}`);
  }
}