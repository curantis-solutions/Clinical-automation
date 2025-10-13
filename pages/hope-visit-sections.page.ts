import { Page, Locator } from '@playwright/test';

/**
 * HOPE Visit Sections Page Object
 * Contains selectors extracted from actual prod environment
 * Organized by section for easy maintenance
 */
export class HopeVisitSectionsPage {
  readonly page: Page;

  // Section Navigation Icons
  readonly vitalsIcon: Locator;
  readonly preferencesIcon: Locator;
  readonly neurologicalIcon: Locator;
  readonly painIcon: Locator;
  readonly respiratoryIcon: Locator;
  readonly gastrointestinalIcon: Locator;
  readonly skinIcon: Locator;
  readonly hospiceAideIcon: Locator;
  readonly summaryIcon: Locator;

  // Common Elements
  readonly submitBtn: Locator;
  readonly cancelBtn: Locator;
  readonly doneBtn: Locator;

  // Vitals Section
  readonly vitals: {
    declineCheckbox: Locator;
    bloodPressureAdd: Locator;
    bpLocationBtn: Locator;
    bpPositionBtn: Locator;
    bpSystolic: Locator;
    bpDiastolic: Locator;
    temperatureAdd: Locator;
    temperatureRouteBtn: Locator;
    temperatureNumber: Locator;
    pulseAdd: Locator;
    pulseRhythmBtn: Locator;
    pulseStrengthBtn: Locator;
    heartRateNumber: Locator;
    respiratoryRateAdd: Locator;
    respiratoryTypeBtn: Locator;
    respiratoryRateNumber: Locator;
    o2SaturationNumber: Locator;
    heightFeet: Locator;
    heightInches: Locator;
    heightCm: Locator;
    weightAdd: Locator;
    weightLbs: Locator;
    weightKg: Locator;
    muacAdd: Locator;
    muacLeftArmInches: Locator;
    muacLeftArmCm: Locator;
    muacRightArmInches: Locator;
    muacRightArmCm: Locator;
    tricepsSkinfoldAdd: Locator;
    tricepsSkinfoldLeftArmInches: Locator;
    tricepsSkinfoldLeftArmCm: Locator;
    tricepsSkinfoldRightArmInches: Locator;
    tricepsSkinfoldRightArmCm: Locator;
    notesAdd: Locator;
    notesCategoryBtn: Locator;
    notesDescription: Locator;
  };

  // Preferences Section
  readonly preferences: {
    declineCheckbox: Locator;
    patientCheckbox: Locator;
    caregiverCheckbox: Locator;
    familyCheckbox: Locator;
    primaryDiagnosisRadio: (name: string) => Locator;
    secondaryDiagnosisCheckbox: (name: string) => Locator;
    preferredLanguageBtn: Locator;
    interpreterYes: Locator;
    interpreterNo: Locator;
    livingArrangementsBtn: Locator;
    levelOfAssistanceBtn: Locator;
    // CPR Section
    cprRadio: (index: number) => Locator; // rb-180-0, rb-180-1, etc
    cprDate: Locator; // datetime-183-0
    cprNotAskedTextarea: Locator;
    // Life Sustaining
    lifeSustainingRadio: (index: number) => Locator;
    // Hospital Preferences
    hospitalRadio: (index: number) => Locator;
    hospitalDate: Locator;
    // Code Status
    codeStatusBtn: Locator;
    // Out-of-Hospital DNR
    outHospitalDnrRadio: (index: number) => Locator;
    outHospitalDnrLocation: Locator;
    outHospitalDnrDate: Locator;
    inPatientDnrPhysician: Locator;
    // POLST
    polstRadio: (index: number) => Locator;
    polstLocation: Locator;
    polstPhysicianName: Locator;
    polstDate: Locator;
    // Spiritual
    spiritualRadio: (index: number) => Locator;
    spiritualDate: Locator;
    spiritualNotAskedTextarea: Locator;
    spiritualConcernsYes: Locator;
    spiritualConcernsOther: Locator;
    // Death Signs
    deathSignsRadio: (index: number) => Locator;
    deathSignsExplanation: Locator;
    // Notes
    notesAdd: Locator;
    notesCategoryBtn: Locator;
    notesDescriptionTextarea: Locator;
  };

  // Respiratory Section
  readonly respiratory: {
    shortnessOfBreathYes: Locator;
    shortnessOfBreathNo: Locator;
    shortnessOfBreathNowYes: Locator;
    shortnessOfBreathNowNo: Locator;
    shortnessOfBreathScreeningDate: Locator;
    treatmentInitiatedYes: Locator;
    treatmentInitiatedPatientDecline: Locator;
    treatmentInitiatedNo: Locator;
    treatmentDate: Locator;
    rankSymptomImpactNotImpacted: Locator;
    rankSymptomImpactMild: Locator;
    rankSymptomImpactModerate: Locator;
    rankSymptomImpactSevere: Locator;
    rankSymptomImpactNotExperiencing: Locator;
    treatmentOpioids: Locator;
    treatmentOtherMeds: Locator;
    treatmentOxygen: Locator;
    treatmentNonMeds: Locator;
    impactIntake: Locator;
    impactDailyActivities: Locator;
    impactFatigueWeakness: Locator;
    impactSleep: Locator;
    impactConcentration: Locator;
    impactCognitiveImpairment: Locator;
    impactAbilityToInteract: Locator;
    impactEmotionalDistress: Locator;
    impactSpiritualDistress: Locator;
    patientOnOxygenYesInitiated: Locator;
    patientOnOxygenYesContinued: Locator;
    patientOnOxygenNoRoomAir: Locator;
    equipmentHumidifier: Locator;
    equipmentO2Concentrator: Locator;
    ventSupportApap: Locator;
    ventSupportCpap: Locator;
    ventSupportBiLevel: Locator;
    ventSupportVentilatory: Locator;
    issueAirHunger: Locator;
    issueBarrelChest: Locator;
    issueCheyneStokes: Locator;
    issueCirCyanosis: Locator;
    issueCyanosis: Locator;
    issueHypoxia: Locator;
    issueIncreasedExpiratoryPhase: Locator;
    issueIneffectiveLungExpansion: Locator;
    issueLabored: Locator;
    issueOrthopnea: Locator;
    issuePursedLipBreathing: Locator;
    issueShallow: Locator;
    issueStridor: Locator;
    issueUsesAccessoryMuscles: Locator;
    lungSoundsLeftUpper: Locator;
    lungSoundsLeftLower: Locator;
    lungSoundsRightUpper: Locator;
    lungSoundsRightMiddle: Locator;
    lungSoundsRightLower: Locator;
    coughFrequency: Locator;
    respiratoryRateAddBtn: Locator;
  };

  // Gastrointestinal Section
  readonly gastrointestinal: {
    bowelRegimenYes: Locator;
    bowelRegimenNo: Locator;
    bowelRegimenPatientDeclined: Locator;
    bowelRegimenDate: Locator;
    bmTypeRegular: Locator;
    bmTypeIrregular: Locator;
    bmIrregularDiarrhea: Locator;
    bmIrregularConstipation: Locator;
    bmLast: Locator;
    bmConsistency: Locator;
    bmAmount: Locator;
    bmColor: Locator;
    bmFrequencyUnit: Locator;
    rankSymptomImpactNotImpacted: Locator;
    rankSymptomImpactMild: Locator;
    rankSymptomImpactModerate: Locator;
    rankSymptomImpactSevere: Locator;
    rankSymptomImpactNotExperiencing: Locator;
    treatmentEnema: Locator;
    treatmentIncreasedFiber: Locator;
    treatmentLaxatives: Locator;
    treatmentPrescriptiveMed: Locator;
    treatmentSuppositories: Locator;
    impactIntake: Locator;
    impactDailyActivities: Locator;
    impactFatigueWeakness: Locator;
    impactSleep: Locator;
    impactConcentration: Locator;
    impactCognitiveImpairment: Locator;
    impactAbilityToInteract: Locator;
    impactEmotionalDistress: Locator;
    impactSpiritualDistress: Locator;
    abdomenLargeExtends: Locator;
    abdomenHardBoardLike: Locator;
    abdomenSoft: Locator;
    abdomenFlabby: Locator;
    abdomenFlat: Locator;
    abdomenHurtsWhenTouched: Locator;
    abdomenRounded: Locator;
    abdomenPresenceOfRash: Locator;
    bowelSoundsLeftUpper: Locator;
    bowelSoundsLeftLower: Locator;
    bowelSoundsRightUpper: Locator;
    bowelSoundsRightLower: Locator;
    ileostomyTypeIleoanalReservoir: Locator;
    ileostomyTypeContinentIleostomy: Locator;
    colostomyType: Locator;
    nauseaFrequencyConstant: Locator;
    nauseaFrequencyIntermittent: Locator;
    vomitingMostRecent: Locator;
    vomitingFrequencyUnit: Locator;
    issueCramping: Locator;
    issueFecalIncontinence: Locator;
    issueFlatulence: Locator;
    issueImpaction: Locator;
    issueGerd: Locator;
    issueAscites: Locator;
    issueReflux: Locator;
  };

  // Skin Section
  readonly skin: {
    colorPink: Locator;
    colorAshen: Locator;
    colorBloodless: Locator;
    colorCyanotic: Locator;
    colorDusky: Locator;
    colorFair: Locator;
    colorGray: Locator;
    colorJaundiced: Locator;
    colorMottled: Locator;
    colorPale: Locator;
    colorPallid: Locator;
    colorSallow: Locator;
    treatmentPressureReducingDeviceChair: Locator;
    treatmentPressureReducingDeviceBed: Locator;
    treatmentTurningRepositioning: Locator;
    treatmentNutritionHydration: Locator;
    treatmentPressureUlcerCare: Locator;
    treatmentSurgicalWoundCare: Locator;
    treatmentNonSurgicalDressings: Locator;
    treatmentOintmentsMedications: Locator;
    treatmentDressingsToFeet: Locator;
    treatmentIncontinenceManagement: Locator;
    treatmentNoneOfAbove: Locator;
    issueAcne: Locator;
    issueAcrodermatitis: Locator;
    issueCankerSore: Locator;
    issueCarbuncle: Locator;
    issueCellulitis: Locator;
    issueColdSore: Locator;
    issueDecubitusUlcer: Locator;
    issueEczema: Locator;
    issueErysipelas: Locator;
    issueFungalNailInfection: Locator;
    issueHives: Locator;
    issueIchythyosisVulgaris: Locator;
    issueImpetigo: Locator;
    issueJaundice: Locator;
    issueKeloid: Locator;
    issueLegUlcers: Locator;
    issueLupus: Locator;
    issueNecrotizingFasciitis: Locator;
    issuePsoriasis: Locator;
    issueRiskForPressureSores: Locator;
    issueRosacea: Locator;
    issueScars: Locator;
    issueSeborrheicKeratosis: Locator;
    issueSeborrheicEczema: Locator;
    issueSebaceousCyst: Locator;
    issueShingles: Locator;
    issueSkinCancer: Locator;
    issueStasisDermatitis: Locator;
    issueVitiligio: Locator;
    issueWarts: Locator;
    tricepsSkinfoldAddBtn: Locator;
  };

  // Hospice Aide Section
  readonly hospiceAide: {
    issueAmputee: Locator;
    issueBedAlarm: Locator;
    issueBlind: Locator;
    issueCallLightWithinReach: Locator;
    issueChairAlarm: Locator;
    issueConfused: Locator;
    issueDeaf: Locator;
    issueDenturesFull: Locator;
    issueDenturesPartial: Locator;
    issueFallPrecaution: Locator;
    issueGlasses: Locator;
    issueHearingAideInPlace: Locator;
    issueLapBuddy: Locator;
    issueLanguage: Locator;
    issueMechanicalStairsLift: Locator;
    issueProsthesis: Locator;
    issueSeatBelt: Locator;
    issueSeizurePrecaution: Locator;
    issueSpeechDeficit: Locator;
    issueSwallowingPrecaution: Locator;
    issueImpendingDeath: Locator;
    issueChangeInLOC: Locator;
    issueSkinBreakdown: Locator;
    issueRespiratoryDistress: Locator;
  };

  // Pain Section
  readonly pain: {
    patientCheckbox: Locator;
    caregiverCheckbox: Locator;
    familyCheckbox: Locator;
    // J0900 Pain Screening
    painScreeningToolBtn: Locator;
    flaccBtn: Locator;
    wongBakerBtn: Locator;
    numericBtn: Locator;
    abbeyBtn: Locator;
    painAdBtn: Locator;
    verbalBtn: Locator;
    clearAllBtn: Locator;
    // Wong-Baker faces
    wongBaker0: Locator;
    wongBaker2: Locator;
    wongBaker4: Locator;
    wongBaker6: Locator;
    wongBaker8: Locator;
    wongBaker10: Locator;
    // Pain screening questions
    neuropathicPainYes: Locator;
    neuropathicPainNo: Locator;
    screenedForPainYes: Locator;
    screenedForPainNo: Locator;
    firstScreeningNotAskedRadio: Locator;
    firstScreeningDate: Locator;
    painImpactRadio: (name: string) => Locator;
    // Impact areas checkboxes
    intakeCheckbox: Locator;
    dailyActivitiesCheckbox: Locator;
    fatigueWeaknessCheckbox: Locator;
    sleepCheckbox: Locator;
    concentrationCheckbox: Locator;
    cognitiveImpairmentCheckbox: Locator;
    abilityToInteractCheckbox: Locator;
    emotionalDistressCheckbox: Locator;
    spiritualDistressCheckbox: Locator;
    otherImpactText: Locator;
    explanationTextarea: Locator;
    // J0905 Active Pain Problem
    activePainYes: Locator;
    activePainNo: Locator;
    // J0910.C Comprehensive Pain Assessment
    addSiteBtn: Locator;
    nextBtn: Locator;
    generalizedCheckbox: Locator;
    typeBtn: Locator;
    characterBtn: Locator;
    severityBtn: Locator;
    frequencyBtn: Locator;
    durationBtn: Locator;
    onsetBtn: Locator;
    painWorseText: Locator;
    qualityOfLifeText: Locator;
    adlText: Locator;
    additionalNotesText: Locator;
    // J0910.A&B Comprehensive Assessment Done
    comprehensiveAssessmentYes: Locator;
    comprehensiveAssessmentNo: Locator;
    comprehensiveAssessmentDate: Locator;
    // N0500 N0510 Opioid Administration
    scheduledOpioidYes: Locator;
    scheduledOpioidNo: Locator;
    scheduledOpioidDate: Locator;
    prnOpioidYes: Locator;
    prnOpioidNo: Locator;
    prnOpioidDate: Locator;
    prnCommentTextarea: Locator;
    // Notes
    notesAdd: Locator;
    notesCategoryBtn: Locator;
    notesDescription: Locator;
  };

  // Neurological Section
  readonly neurological: {
    declineCheckbox: Locator;
    // Orientation
    orientedCheckbox: Locator;
    disorientedCheckbox: Locator;
    // Anxiety
    anxietyCheckbox: Locator;
    anxietyScore: Locator;
    anxietyImpactRadio: (index: number) => Locator;
    anxietyOtherText: Locator;
    // Agitation
    agitationCheckbox: Locator;
    agitationScore: Locator;
    agitationImpactRadio: (index: number) => Locator;
    agitationOtherText: Locator;
    // Seizures
    seizuresCheckbox: Locator;
    seizuresMostRecentTime: Locator;
    seizuresLastTime: Locator;
    seizuresFrequencyNumerator: Locator;
    seizuresFrequencyDenominator: Locator;
    seizuresFrequencyUnit: Locator;
    seizuresDurationMin: Locator;
    seizuresDurationMax: Locator;
    // Aphasia
    aphasiaCheckbox: Locator;
    aphasiaType: Locator;
    aphasiaQuotient: Locator;
    // Ataxia
    ataxiaCheckbox: Locator;
    ataxiaType: Locator;
    // Apraxia
    apraxiaCheckbox: Locator;
    // Coma
    comatoseCheckbox: Locator;
    comaText: Locator;
    comaEyeOpeningRadio: (index: number) => Locator;
    comaVerbalResponseRadio: (index: number) => Locator;
    comaMotorResponseRadio: (index: number) => Locator;
    // Confusion
    confusionCheckbox: Locator;
    // Depression
    depressionCheckbox: Locator;
    // Headaches
    headachesCheckbox: Locator;
    headachesOnsetDate: Locator;
    headachesMostRecent: Locator;
    headachesTypeRadio: (type: string) => Locator;
    headachesLocationUnilateral: Locator;
    headachesLocationBilateral: Locator;
    headachesLocationOccipital: Locator;
    headachesFrequencyNumerator: Locator;
    headachesFrequencyDenominator: Locator;
    headachesFrequencyUnit: Locator;
    headachesCharacteristicsBtn: Locator;
    headachesSeverity: Locator;
    headachesAssociatedNausea: Locator;
    headachesRadiation: Locator;
    headachesRecentHeadInjury: Locator;
    headachesRecentHeadInjuryDate: Locator;
    headachesAssociatedVomiting: Locator;
    headachesAssociatedVomitingDate: Locator;
    headachesAssociatedVomitingFreqNum: Locator;
    headachesAssociatedVomitingFreqDenom: Locator;
    headachesAssociatedVomitingFreqUnit: Locator;
    headachesRecentConcussion: Locator;
    headachesRecentConcussionDate: Locator;
    // Hemiplegia
    hemiplegicCheckbox: Locator;
    hemiplegicOnsetDate: Locator;
    hemiplegicAffectedSideRadio: (side: string) => Locator;
    // Paraplegia
    paraplegicCheckbox: Locator;
    paraplegicOnsetDate: Locator;
    // Quadriplegia
    quadraplegicCheckbox: Locator;
    quadraplegicOnsetDate: Locator;
    // Other Issues
    otherIssues: {
      akinesthesia: Locator;
      blindness: Locator;
      decreasedVision: Locator;
      dysphasia: Locator;
      gagReflexImpaired: Locator;
      shufflingGait: Locator;
      tremors: Locator;
      gagReflexAbsent: Locator;
      pillRolling: Locator;
      terminalRestlessness: Locator;
      insomnia: Locator;
      dyskinesia: Locator;
      obtunded: Locator;
      syncope: Locator;
      vertigo: Locator;
      dysarthria: Locator;
      impairedSpeechPattern: Locator;
      stupor: Locator;
      tia: Locator;
      other: Locator;
    };
    // Notes
    notesAdd: Locator;
    notesCategoryBtn: Locator;
    notesDescription: Locator;
  };

  constructor(page: Page) {
    this.page = page;

    // Section Icons
    this.vitalsIcon = page.getByRole('button', { name: /vitals icon/ });
    this.preferencesIcon = page.getByRole('button', { name: /preferences icon/ });
    this.neurologicalIcon = page.getByRole('button', { name: /neurological icon/ });
    this.painIcon = page.getByRole('button', { name: /pain icon/ });
    this.respiratoryIcon = page.getByRole('button', { name: /respiratory icon/ });
    this.gastrointestinalIcon = page.getByRole('button', { name: /gastrointestinal icon/ });
    this.skinIcon = page.getByRole('button', { name: /skin icon/ });
    this.hospiceAideIcon = page.getByRole('button', { name: /hospiceAide icon/ });
    this.summaryIcon = page.getByRole('button', { name: /symptomSummary icon/ });

    // Common Elements
    this.submitBtn = page.getByRole('button', { name: 'Submit' });
    this.cancelBtn = page.getByRole('button', { name: 'Cancel', exact: true });
    this.doneBtn = page.getByRole('button', { name: 'Done' });

    // Vitals Section
    this.vitals = {
      declineCheckbox: page.getByRole('checkbox', { name: 'Patient declines Vitals' }),
      bloodPressureAdd: page.locator('#bloodPressureAdd'),
      bpLocationBtn: page.getByRole('button', { name: 'Location' }),
      bpPositionBtn: page.getByRole('button', { name: 'Position' }),
      bpSystolic: page.locator('#bloodPressureSystolicNumber').getByRole('spinbutton'),
      bpDiastolic: page.locator('#bloodPressureDiastolicNumber').getByRole('spinbutton'),
      temperatureAdd: page.locator('#temperatureCardTitleAdd'),
      temperatureRouteBtn: page.getByRole('button', { name: 'Route' }),
      temperatureNumber: page.locator('#temperatureNumber').getByRole('spinbutton'),
      pulseAdd: page.locator('#pulseAdd'),
      pulseRhythmBtn: page.getByRole('button', { name: 'Rhythm' }),
      pulseStrengthBtn: page.getByRole('button', { name: 'Strength' }),
      heartRateNumber: page.locator('#heartRateNumber').getByRole('spinbutton'),
      respiratoryRateAdd: page.locator('#respiratoryRateAdd'),
      respiratoryTypeBtn: page.getByRole('button', { name: 'Respiration Type' }),
      respiratoryRateNumber: page.locator('#respiratoryRateNumber').getByRole('spinbutton'),
      o2SaturationNumber: page.locator('#o2saturationNumber').getByRole('spinbutton'),
      heightFeet: page.locator('#heightCurrentLengthFeet').getByRole('spinbutton'),
      heightInches: page.locator('#heightCurrentLengthInches').getByRole('spinbutton'),
      heightCm: page.locator('#heightCurrentLengthCm').getByRole('spinbutton'),
      weightAdd: page.locator('#weightAdd'),
      weightLbs: page.locator('#weightConversion-lbs').getByRole('spinbutton'),
      weightKg: page.locator('#weightConversion-kg'),
      muacAdd: page.locator('#muacAdd'),
      muacLeftArmInches: page.locator('#muacLeftarmConversion-inches').getByRole('spinbutton'),
      muacLeftArmCm: page.locator('#muacLeftarmConversion-cm'),
      muacRightArmInches: page.locator('#muacRightArmConversion-inches').getByRole('spinbutton'),
      muacRightArmCm: page.locator('#muacRightArmConversion-cm').getByRole('spinbutton'),
      tricepsSkinfoldAdd: page.locator('#tricepsSkinfoldAdd'),
      tricepsSkinfoldLeftArmInches: page.locator('#tricepsSkinfoldLeftArmConversion-inches').getByRole('spinbutton'),
      tricepsSkinfoldLeftArmCm: page.locator('#tricepsSkinfoldLeftArmConversion-cm'),
      tricepsSkinfoldRightArmInches: page.locator('#tricepsSkinfoldRightArmConversion-inches').getByRole('spinbutton'),
      tricepsSkinfoldRightArmCm: page.locator('#tricepsSkinfoldRightArmConversion-cm').getByRole('spinbutton'),
      notesAdd: page.locator('#notesAdd'),
      notesCategoryBtn: page.getByRole('button', { name: 'Category' }),
      notesDescription: page.getByRole('textbox', { name: 'Please specify' }),
    };

    // Preferences Section
    this.preferences = {
      declineCheckbox: page.getByRole('checkbox', { name: 'Patient declines Preferences' }),
      patientCheckbox: page.getByRole('checkbox', { name: 'Patient/Responsible Party' }),
      caregiverCheckbox: page.getByRole('checkbox', { name: 'Caregiver' }),
      familyCheckbox: page.getByRole('checkbox', { name: 'Family' }),
      primaryDiagnosisRadio: (name: string) => page.getByRole('radio', { name }),
      secondaryDiagnosisCheckbox: (name: string) => page.getByRole('checkbox', { name }),
      preferredLanguageBtn: page.getByRole('button', { name: 'Preferred Language' }),
      interpreterYes: page.locator('#rb-173-0'),
      interpreterNo: page.locator('#rb-174-0'),
      livingArrangementsBtn: page.getByRole('button', { name: /What are the patient's living/ }),
      levelOfAssistanceBtn: page.getByRole('button', { name: /What level of assistance is/ }),
      // CPR
      cprRadio: (index: number) => page.locator(`#rb-180-${index}`),
      cprDate: page.locator('#datetime-183-0'),
      cprNotAskedTextarea: page.locator('#cprNotAskedTextArea').getByRole('textbox', { name: 'Please specify' }),
      // Life Sustaining
      lifeSustainingRadio: (index: number) => page.locator(`#rb-216-${index}`),
      // Hospital
      hospitalRadio: (index: number) => page.locator(`#rb-224-${index}`),
      hospitalDate: page.locator('#datetime-227-0'),
      // Code Status
      codeStatusBtn: page.getByRole('button', { name: 'Code Status' }),
      // Out-of-Hospital DNR
      outHospitalDnrRadio: (index: number) => page.locator(`#rb-193-${index}`),
      outHospitalDnrLocation: page.locator('#outHospitalDnrLocationText').getByRole('textbox'),
      outHospitalDnrDate: page.locator('#datetime-200-0'),
      inPatientDnrPhysician: page.locator('#inPatientDnrPhysicianText').getByRole('textbox'),
      // POLST
      polstRadio: (index: number) => page.locator(`#rb-202-${index}`),
      polstLocation: page.locator('#polstLocationText'),
      polstPhysicianName: page.locator('#nameOfPhysicianText'),
      polstDate: page.locator('#datetime-215-0'),
      // Spiritual
      spiritualRadio: (index: number) => page.locator(`#rb-232-${index}`),
      spiritualDate: page.locator('#datetime-235-0'),
      spiritualNotAskedTextarea: page.locator('#whyPatientOrResponsibleNotAskedAboutSpiritualExistentialConcernsTextArea').getByRole('textbox', { name: 'Please specify' }),
      spiritualConcernsYes: page.locator('#rb-237-0'),
      spiritualConcernsOther: page.locator('#otherSpiritualExistentialConcernsTextArea').getByRole('textbox', { name: 'Please specify' }),
      // Death Signs
      deathSignsRadio: (index: number) => page.locator(`#rb-240-${index}`),
      deathSignsExplanation: page.locator('#signsOfImminentDeathExplanationTextArea').getByRole('textbox', { name: 'Please specify' }),
      // Notes
      notesAdd: page.getByRole('button', { name: 'close add' }),
      notesCategoryBtn: page.getByRole('button', { name: 'Category' }),
      notesDescriptionTextarea: page.locator('#notesDescriptionVoiceTextArea').getByRole('textbox', { name: 'Please specify' }),
    };

    // Respiratory Section - Using stable data-cy attributes
    this.respiratory = {
      shortnessOfBreathYes: page.locator('[data-cy="radio-shortnessOfBreathScreening-yes"]'),
      shortnessOfBreathNo: page.locator('[data-cy="radio-shortnessOfBreathScreening-no"]'),
      shortnessOfBreathNowYes: page.locator('[data-cy="radio-shortnessOfBreathNow-yes"]'),
      shortnessOfBreathNowNo: page.locator('[data-cy="radio-shortnessOfBreathNow-no"]'),
      shortnessOfBreathScreeningDate: page.locator('[data-cy="date-input-shortnessOfBreathScreeningDate-date"]'),
      treatmentInitiatedYes: page.locator('[data-cy="radio-treatmentInitiated-yes"]'),
      treatmentInitiatedPatientDecline: page.locator('[data-cy="radio-treatmentInitiated-patientDecline"]'),
      treatmentInitiatedNo: page.locator('[data-cy="radio-treatmentInitiated-no"]'),
      treatmentDate: page.locator('[data-cy="date-input-treatmentDate-date"]'),
      rankSymptomImpactNotImpacted: page.locator('[data-cy="radio-rankSymptomImpact-notImpacted"]'),
      rankSymptomImpactMild: page.locator('[data-cy="radio-rankSymptomImpact-mildImpact"]'),
      rankSymptomImpactModerate: page.locator('[data-cy="radio-rankSymptomImpact-moderateImpact"]'),
      rankSymptomImpactSevere: page.locator('[data-cy="radio-rankSymptomImpact-severeImpact"]'),
      rankSymptomImpactNotExperiencing: page.locator('[data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]'),
      treatmentOpioids: page.locator('[data-cy="checkbox-treatmentTypeCheck-opioids"]'),
      treatmentOtherMeds: page.locator('[data-cy="checkbox-treatmentTypeCheck-otherMedications"]'),
      treatmentOxygen: page.locator('[data-cy="checkbox-treatmentTypeCheck-oxygen"]'),
      treatmentNonMeds: page.locator('[data-cy="checkbox-treatmentTypeCheck-nonMedications"]'),
      impactIntake: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-intakeOnly"]'),
      impactDailyActivities: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-dailyActivities"]'),
      impactFatigueWeakness: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-fatigueWeakness"]'),
      impactSleep: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-sleep"]'),
      impactConcentration: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-concentration"]'),
      impactCognitiveImpairment: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-cognitiveImpairment"]'),
      impactAbilityToInteract: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-abilityToInteract"]'),
      impactEmotionalDistress: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-emotionalDistress"]'),
      impactSpiritualDistress: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-spiritualDistress"]'),
      patientOnOxygenYesInitiated: page.locator('[data-cy="radio-patientOnOxygen-yesInitiated"]'),
      patientOnOxygenYesContinued: page.locator('[data-cy="radio-patientOnOxygen-yesContinued"]'),
      patientOnOxygenNoRoomAir: page.locator('[data-cy="radio-patientOnOxygen-noRoomAir"]'),
      equipmentHumidifier: page.locator('[data-cy="checkbox-equipmentInUseCheck-humidifier"]'),
      equipmentO2Concentrator: page.locator('[data-cy="checkbox-equipmentInUseCheck-o2Concentrator"]'),
      ventSupportApap: page.locator('[data-cy="checkbox-undefinedCheck-apap"]'),
      ventSupportCpap: page.locator('[data-cy="checkbox-undefinedCheck-cpap"]'),
      ventSupportBiLevel: page.locator('[data-cy="checkbox-undefinedCheck-biLevelBiPapVpap"]'),
      ventSupportVentilatory: page.locator('[data-cy="checkbox-undefinedCheck-ventilatorySupport"]'),
      issueAirHunger: page.locator('[data-cy="checkbox-otherIssuesCheck-airHunger"]'),
      issueBarrelChest: page.locator('[data-cy="checkbox-otherIssuesCheck-barrelChest"]'),
      issueCheyneStokes: page.locator('[data-cy="checkbox-otherIssuesCheck-cheyneStokes"]'),
      issueCirCyanosis: page.locator('[data-cy="checkbox-otherIssuesCheck-circumoralCyanosis"]'),
      issueCyanosis: page.locator('[data-cy="checkbox-otherIssuesCheck-cyanosis"]'),
      issueHypoxia: page.locator('[data-cy="checkbox-otherIssuesCheck-hypoxia"]'),
      issueIncreasedExpiratoryPhase: page.locator('[data-cy="checkbox-otherIssuesCheck-increasedExpiratoryPhase"]'),
      issueIneffectiveLungExpansion: page.locator('[data-cy="checkbox-otherIssuesCheck-ineffectiveLungExpansion"]'),
      issueLabored: page.locator('[data-cy="checkbox-otherIssuesCheck-labored"]'),
      issueOrthopnea: page.locator('[data-cy="checkbox-otherIssuesCheck-orthopnea"]'),
      issuePursedLipBreathing: page.locator('[data-cy="checkbox-otherIssuesCheck-pursedLipBreathing"]'),
      issueShallow: page.locator('[data-cy="checkbox-otherIssuesCheck-shallow"]'),
      issueStridor: page.locator('[data-cy="checkbox-otherIssuesCheck-stridor"]'),
      issueUsesAccessoryMuscles: page.locator('[data-cy="checkbox-otherIssuesCheck-usesAccessoryMuscles"]'),
      lungSoundsLeftUpper: page.locator('[data-cy="select-leftUpperSounds"]'),
      lungSoundsLeftLower: page.locator('[data-cy="select-leftLowerSounds"]'),
      lungSoundsRightUpper: page.locator('[data-cy="select-rightUpperSounds"]'),
      lungSoundsRightMiddle: page.locator('[data-cy="select-rightMiddleSounds"]'),
      lungSoundsRightLower: page.locator('[data-cy="select-rightLowerSounds"]'),
      coughFrequency: page.locator('[data-cy="select-patientCoughFrequency"]'),
      respiratoryRateAddBtn: page.locator('[data-cy="button-respiratoryRate-add"]'),
    };

    // Gastrointestinal Section - Using stable data-cy attributes
    this.gastrointestinal = {
      bowelRegimenYes: page.locator('[data-cy="radio-patientHasBowelRegimen-yes"]'),
      bowelRegimenNo: page.locator('[data-cy="radio-patientHasBowelRegimen-no"]'),
      bowelRegimenPatientDeclined: page.locator('[data-cy="radio-patientHasBowelRegimen-patientDeclinedTreatment"]'),
      bowelRegimenDate: page.locator('[data-cy="date-input-bowelRegimenDate-date"]'),
      bmTypeRegular: page.locator('[data-cy="radio-bmType-regular"]'),
      bmTypeIrregular: page.locator('[data-cy="radio-bmType-irregular"]'),
      bmIrregularDiarrhea: page.locator('[data-cy="radio-bmIrregular-diarrhea"]'),
      bmIrregularConstipation: page.locator('[data-cy="radio-bmIrregular-constipation"]'),
      bmLast: page.locator('[data-cy="date-input-bmLast-date"]'),
      bmConsistency: page.locator('[data-cy="select-bmConsistency"]'),
      bmAmount: page.locator('[data-cy="select-bmAmount"]'),
      bmColor: page.locator('[data-cy="select-bmColor"]'),
      bmFrequencyUnit: page.locator('[data-cy="select-bmFrequencyUnit"]'),
      rankSymptomImpactNotImpacted: page.locator('[data-cy="radio-rankSymptomImpact-notImpacted"]'),
      rankSymptomImpactMild: page.locator('[data-cy="radio-rankSymptomImpact-mildImpact"]'),
      rankSymptomImpactModerate: page.locator('[data-cy="radio-rankSymptomImpact-moderateImpact"]'),
      rankSymptomImpactSevere: page.locator('[data-cy="radio-rankSymptomImpact-severeImpact"]'),
      rankSymptomImpactNotExperiencing: page.locator('[data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]'),
      treatmentEnema: page.locator('[data-cy="checkbox-treatmentsCheck-enema"]'),
      treatmentIncreasedFiber: page.locator('[data-cy="checkbox-treatmentsCheck-increasedFiber"]'),
      treatmentLaxatives: page.locator('[data-cy="checkbox-treatmentsCheck-laxatives"]'),
      treatmentPrescriptiveMed: page.locator('[data-cy="checkbox-treatmentsCheck-prescriptiveMedication"]'),
      treatmentSuppositories: page.locator('[data-cy="checkbox-treatmentsCheck-suppositories"]'),
      impactIntake: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-intakeOnly"]'),
      impactDailyActivities: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-dailyActivities"]'),
      impactFatigueWeakness: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-fatigueWeakness"]'),
      impactSleep: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-sleep"]'),
      impactConcentration: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-concentration"]'),
      impactCognitiveImpairment: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-cognitiveImpairment"]'),
      impactAbilityToInteract: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-abilityToInteract"]'),
      impactEmotionalDistress: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-emotionalDistress"]'),
      impactSpiritualDistress: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-spiritualDistress"]'),
      abdomenLargeExtends: page.locator('[data-cy="checkbox-abdomenStateCheck-largeAndExtendsOutward"]'),
      abdomenHardBoardLike: page.locator('[data-cy="checkbox-abdomenStateCheck-hardBoardLike"]'),
      abdomenSoft: page.locator('[data-cy="checkbox-abdomenStateCheck-soft"]'),
      abdomenFlabby: page.locator('[data-cy="checkbox-abdomenStateCheck-flabby"]'),
      abdomenFlat: page.locator('[data-cy="checkbox-abdomenStateCheck-flat"]'),
      abdomenHurtsWhenTouched: page.locator('[data-cy="checkbox-abdomenStateCheck-hurtsWhenTouched"]'),
      abdomenRounded: page.locator('[data-cy="checkbox-abdomenStateCheck-rounded"]'),
      abdomenPresenceOfRash: page.locator('[data-cy="checkbox-abdomenStateCheck-presenceOfRash"]'),
      bowelSoundsLeftUpper: page.locator('[data-cy="select-bowelSoundsLeftUpper"]'),
      bowelSoundsLeftLower: page.locator('[data-cy="select-bowelSoundsLeftLower"]'),
      bowelSoundsRightUpper: page.locator('[data-cy="select-bowelSoundsRightUpper"]'),
      bowelSoundsRightLower: page.locator('[data-cy="select-bowelSoundsRightLower"]'),
      ileostomyTypeIleoanalReservoir: page.locator('[data-cy="radio-ileostomyType-ileoanalReservoir"]'),
      ileostomyTypeContinentIleostomy: page.locator('[data-cy="radio-ileostomyType-continentIleostomy"]'),
      colostomyType: page.locator('[data-cy="select-colostomyType"]'),
      nauseaFrequencyConstant: page.locator('[data-cy="radio-nauseaFrequency-constant"]'),
      nauseaFrequencyIntermittent: page.locator('[data-cy="radio-nauseaFrequency-intermittent"]'),
      vomitingMostRecent: page.locator('[data-cy="date-input-vomitingMostRecent-date"]'),
      vomitingFrequencyUnit: page.locator('[data-cy="select-vomitingFrequencyUnit"]'),
      issueCramping: page.locator('[data-cy="checkbox-otherIssuesCheck-cramping"]'),
      issueFecalIncontinence: page.locator('[data-cy="checkbox-otherIssuesCheck-fecalIncontinence"]'),
      issueFlatulence: page.locator('[data-cy="checkbox-otherIssuesCheck-flatulence"]'),
      issueImpaction: page.locator('[data-cy="checkbox-otherIssuesCheck-impaction"]'),
      issueGerd: page.locator('[data-cy="checkbox-otherIssuesCheck-gerd"]'),
      issueAscites: page.locator('[data-cy="checkbox-otherIssuesCheck-ascites"]'),
      issueReflux: page.locator('[data-cy="checkbox-otherIssuesCheck-reflux"]'),
    };

    // Skin Section - Using stable data-cy attributes
    this.skin = {
      colorPink: page.locator('[data-cy="checkbox-skinColorCheck-pink"]'),
      colorAshen: page.locator('[data-cy="checkbox-skinColorCheck-ashen"]'),
      colorBloodless: page.locator('[data-cy="checkbox-skinColorCheck-bloodless"]'),
      colorCyanotic: page.locator('[data-cy="checkbox-skinColorCheck-cyanotic"]'),
      colorDusky: page.locator('[data-cy="checkbox-skinColorCheck-dusky"]'),
      colorFair: page.locator('[data-cy="checkbox-skinColorCheck-fair"]'),
      colorGray: page.locator('[data-cy="checkbox-skinColorCheck-gray"]'),
      colorJaundiced: page.locator('[data-cy="checkbox-skinColorCheck-jaundiced"]'),
      colorMottled: page.locator('[data-cy="checkbox-skinColorCheck-mottled"]'),
      colorPale: page.locator('[data-cy="checkbox-skinColorCheck-pale"]'),
      colorPallid: page.locator('[data-cy="checkbox-skinColorCheck-pallid"]'),
      colorSallow: page.locator('[data-cy="checkbox-skinColorCheck-sallow"]'),
      treatmentPressureReducingDeviceChair: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-pressureReducingDeviceForChair"]'),
      treatmentPressureReducingDeviceBed: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-pressureReducingDeviceForBed"]'),
      treatmentTurningRepositioning: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-turningRepositioningProgram"]'),
      treatmentNutritionHydration: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-nutritionOrHydrationInterventionToManageSkinProblems"]'),
      treatmentPressureUlcerCare: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-pressureUlcerInjuryCare"]'),
      treatmentSurgicalWoundCare: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-surgicalWoundCare"]'),
      treatmentNonSurgicalDressings: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-applicationOfNonSurgicalDressings"]'),
      treatmentOintmentsMedications: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-applicationOfOintmentsMedicationsOtherThanToFeet"]'),
      treatmentDressingsToFeet: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-applicationOfDressingsToFeet"]'),
      treatmentIncontinenceManagement: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-incontinenceManagement"]'),
      treatmentNoneOfAbove: page.locator('[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-noneOfTheAbove"]'),
      issueAcne: page.locator('[data-cy="checkbox-otherIssuesCheck-acne"]'),
      issueAcrodermatitis: page.locator('[data-cy="checkbox-otherIssuesCheck-acrodermatitis"]'),
      issueCankerSore: page.locator('[data-cy="checkbox-otherIssuesCheck-cankerSore"]'),
      issueCarbuncle: page.locator('[data-cy="checkbox-otherIssuesCheck-carbuncle"]'),
      issueCellulitis: page.locator('[data-cy="checkbox-otherIssuesCheck-cellulitis"]'),
      issueColdSore: page.locator('[data-cy="checkbox-otherIssuesCheck-coldSore"]'),
      issueDecubitusUlcer: page.locator('[data-cy="checkbox-otherIssuesCheck-decubitusUlcer"]'),
      issueEczema: page.locator('[data-cy="checkbox-otherIssuesCheck-eczema"]'),
      issueErysipelas: page.locator('[data-cy="checkbox-otherIssuesCheck-erysipelas"]'),
      issueFungalNailInfection: page.locator('[data-cy="checkbox-otherIssuesCheck-fungalNailInfection"]'),
      issueHives: page.locator('[data-cy="checkbox-otherIssuesCheck-hives"]'),
      issueIchythyosisVulgaris: page.locator('[data-cy="checkbox-otherIssuesCheck-ichythyosisVulgaris"]'),
      issueImpetigo: page.locator('[data-cy="checkbox-otherIssuesCheck-impetigo"]'),
      issueJaundice: page.locator('[data-cy="checkbox-otherIssuesCheck-jaundice"]'),
      issueKeloid: page.locator('[data-cy="checkbox-otherIssuesCheck-keloid"]'),
      issueLegUlcers: page.locator('[data-cy="checkbox-otherIssuesCheck-legUlcers"]'),
      issueLupus: page.locator('[data-cy="checkbox-otherIssuesCheck-lupus"]'),
      issueNecrotizingFasciitis: page.locator('[data-cy="checkbox-otherIssuesCheck-necrotizingFasciitis"]'),
      issuePsoriasis: page.locator('[data-cy="checkbox-otherIssuesCheck-psoriasis"]'),
      issueRiskForPressureSores: page.locator('[data-cy="checkbox-otherIssuesCheck-riskForPressureSores"]'),
      issueRosacea: page.locator('[data-cy="checkbox-otherIssuesCheck-rosacea"]'),
      issueScars: page.locator('[data-cy="checkbox-otherIssuesCheck-scars"]'),
      issueSeborrheicKeratosis: page.locator('[data-cy="checkbox-otherIssuesCheck-seborrheicKeratosis"]'),
      issueSeborrheicEczema: page.locator('[data-cy="checkbox-otherIssuesCheck-seborrheicEczema"]'),
      issueSebaceousCyst: page.locator('[data-cy="checkbox-otherIssuesCheck-sebaceousCyst"]'),
      issueShingles: page.locator('[data-cy="checkbox-otherIssuesCheck-shingles"]'),
      issueSkinCancer: page.locator('[data-cy="checkbox-otherIssuesCheck-skinCancer"]'),
      issueStasisDermatitis: page.locator('[data-cy="checkbox-otherIssuesCheck-stasisDermatitis"]'),
      issueVitiligio: page.locator('[data-cy="checkbox-otherIssuesCheck-vitiligio"]'),
      issueWarts: page.locator('[data-cy="checkbox-otherIssuesCheck-warts"]'),
      tricepsSkinfoldAddBtn: page.locator('[data-cy="button-tricepsSkinfold-add"]'),
    };

    // Hospice Aide Section - Using stable data-cy attributes
    this.hospiceAide = {
      issueAmputee: page.locator('[data-cy="checkbox-otherIssuesCheck-amputee"]'),
      issueBedAlarm: page.locator('[data-cy="checkbox-otherIssuesCheck-bedAlarm"]'),
      issueBlind: page.locator('[data-cy="checkbox-otherIssuesCheck-blind"]'),
      issueCallLightWithinReach: page.locator('[data-cy="checkbox-otherIssuesCheck-callLightWithinReach"]'),
      issueChairAlarm: page.locator('[data-cy="checkbox-otherIssuesCheck-chairAlarm"]'),
      issueConfused: page.locator('[data-cy="checkbox-otherIssuesCheck-confused"]'),
      issueDeaf: page.locator('[data-cy="checkbox-otherIssuesCheck-deaf"]'),
      issueDenturesFull: page.locator('[data-cy="checkbox-otherIssuesCheck-denturesFull"]'),
      issueDenturesPartial: page.locator('[data-cy="checkbox-otherIssuesCheck-denturesPartial"]'),
      issueFallPrecaution: page.locator('[data-cy="checkbox-otherIssuesCheck-fallPrecaution"]'),
      issueGlasses: page.locator('[data-cy="checkbox-otherIssuesCheck-glasses"]'),
      issueHearingAideInPlace: page.locator('[data-cy="checkbox-otherIssuesCheck-hearingAideInPlace"]'),
      issueLapBuddy: page.locator('[data-cy="checkbox-otherIssuesCheck-lapBuddy"]'),
      issueLanguage: page.locator('[data-cy="checkbox-otherIssuesCheck-language"]'),
      issueMechanicalStairsLift: page.locator('[data-cy="checkbox-otherIssuesCheck-mechanicalStairsLift"]'),
      issueProsthesis: page.locator('[data-cy="checkbox-otherIssuesCheck-prosthesis"]'),
      issueSeatBelt: page.locator('[data-cy="checkbox-otherIssuesCheck-seatBelt"]'),
      issueSeizurePrecaution: page.locator('[data-cy="checkbox-otherIssuesCheck-seizurePrecaution"]'),
      issueSpeechDeficit: page.locator('[data-cy="checkbox-otherIssuesCheck-speechDeficit"]'),
      issueSwallowingPrecaution: page.locator('[data-cy="checkbox-otherIssuesCheck-swallowingPrecaution"]'),
      issueImpendingDeath: page.locator('[data-cy="checkbox-otherIssuesCheck-impendingDeath"]'),
      issueChangeInLOC: page.locator('[data-cy="checkbox-otherIssuesCheck-changeInLOC"]'),
      issueSkinBreakdown: page.locator('[data-cy="checkbox-otherIssuesCheck-skinBreakdown"]'),
      issueRespiratoryDistress: page.locator('[data-cy="checkbox-otherIssuesCheck-respiratoryDistress"]'),
    };

    // Pain Section - Using stable data-cy attributes
    this.pain = {
      patientCheckbox: page.locator('[data-cy="checkbox-assessmentWithCheck-patientResponsibleParty"]'),
      caregiverCheckbox: page.locator('[data-cy="checkbox-assessmentWithCheck-caregiver"]'),
      familyCheckbox: page.locator('[data-cy="checkbox-assessmentWithCheck-family"]'),
      // J0900 Pain Screening
      painScreeningToolBtn: page.getByRole('button', { name: 'pain icon add Pain' }),
      flaccBtn: page.getByRole('button', { name: 'FLACC' }),
      wongBakerBtn: page.getByRole('button', { name: 'Wong-Baker' }),
      numericBtn: page.getByRole('button', { name: 'Numeric' }),
      abbeyBtn: page.getByRole('button', { name: 'Abbey' }),
      painAdBtn: page.getByRole('button', { name: 'PAIN-AD' }),
      verbalBtn: page.getByRole('button', { name: 'Verbal' }),
      clearAllBtn: page.getByRole('button', { name: 'Clear All' }),
      // Wong-Baker faces
      wongBaker0: page.locator('#wongBaker0').getByRole('img'),
      wongBaker2: page.locator('#wongBaker2').getByRole('img'),
      wongBaker4: page.locator('#wongBaker4').getByRole('img'),
      wongBaker6: page.locator('#wongBaker6').getByRole('img'),
      wongBaker8: page.locator('#wongBaker8').getByRole('img'),
      wongBaker10: page.locator('#wongBaker10').getByRole('img'),
      // Pain screening questions - using stable data-cy
      neuropathicPainYes: page.locator('[data-cy="radio-patientHasNeuropathicPain-yes"]'),
      neuropathicPainNo: page.locator('[data-cy="radio-patientHasNeuropathicPain-no"]'),
      screenedForPainYes: page.locator('[data-cy="radio-experiencingPainQuestion-yes"]'),
      screenedForPainNo: page.locator('[data-cy="radio-experiencingPainQuestion-no"]'),
      firstScreeningNotAskedRadio: page.locator('[data-cy="radio-patientScreenedForPain-notAsked"]'), // Need to verify
      firstScreeningDate: page.locator('[data-cy="date-patientScreenedForPainDate"]'), // Need to verify
      painImpactRadio: (name: string) => page.getByRole('radio', { name }),
      // Impact areas checkboxes - using stable data-cy
      intakeCheckbox: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-intakeOnly"]'),
      dailyActivitiesCheckbox: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-dailyActivities"]'),
      fatigueWeaknessCheckbox: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-fatigueWeakness"]'),
      sleepCheckbox: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-sleep"]'),
      concentrationCheckbox: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-concentration"]'),
      cognitiveImpairmentCheckbox: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-cognitiveImpairment"]'),
      abilityToInteractCheckbox: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-abilityToInteract"]'),
      emotionalDistressCheckbox: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-emotionalDistress"]'),
      spiritualDistressCheckbox: page.locator('[data-cy="checkbox-explainSymptomImpactCheck-spiritualDistress"]'),
      otherImpactText: page.locator('[data-cy="input-explainSymptomImpactOther-other"]'),
      explanationTextarea: page.locator('[data-cy="input-explainSymptomImpact-explanation"]'),
      // J0905 Active Pain Problem - using stable data-cy
      activePainYes: page.locator('[data-cy="radio-activePainWith-yes"]'),
      activePainNo: page.locator('[data-cy="radio-activePainWith-no"]'),
      // J0910.C Comprehensive Pain Assessment
      addSiteBtn: page.locator('[data-cy="button-siteOfPain-add"]'),
      nextBtn: page.getByRole('button', { name: 'Next' }),
      generalizedCheckbox: page.getByRole('checkbox', { name: 'Generalized' }),
      typeBtn: page.getByRole('button', { name: '* Type' }),
      characterBtn: page.getByRole('button', { name: '* Character' }),
      severityBtn: page.getByRole('button', { name: '* Severity' }),
      frequencyBtn: page.getByRole('button', { name: '* Frequency' }),
      durationBtn: page.getByRole('button', { name: '* Duration' }),
      onsetBtn: page.getByRole('button', { name: '* Onset' }),
      painWorseText: page.getByRole('textbox', { name: '* What makes pain worse/' }),
      qualityOfLifeText: page.getByRole('textbox', { name: '* How does pain affect patient\'s quality of life?' }),
      adlText: page.getByRole('textbox', { name: '* How does pain affect patient\'s ability to perform normal ADL\'s?' }),
      additionalNotesText: page.getByRole('textbox', { name: 'Additional Notes' }),
      // J0910.A&B Comprehensive Assessment Done - using stable data-cy
      comprehensiveAssessmentYes: page.locator('[data-cy="radio-wasPainDoneQuestion-yes"]'),
      comprehensiveAssessmentNo: page.locator('[data-cy="radio-wasPainDoneQuestion-no"]'),
      comprehensiveAssessmentDate: page.locator('[data-cy="date-wasPainDoneQuestionDate"]'),
      // N0500 N0510 Opioid Administration - using stable data-cy
      scheduledOpioidYes: page.locator('[data-cy="radio-scheduledOpioidInitiatedOrContinued-yes"]'),
      scheduledOpioidNo: page.locator('[data-cy="radio-scheduledOpioidInitiatedOrContinued-no"]'),
      scheduledOpioidDate: page.locator('[data-cy="date-scheduledOpioidInitiatedOrContinuedDate"]'),
      prnOpioidYes: page.locator('[data-cy="radio-prnOpioidInitiatedOrContinued-yes"]'),
      prnOpioidNo: page.locator('[data-cy="radio-prnOpioidInitiatedOrContinued-no"]'),
      prnOpioidDate: page.locator('[data-cy="date-prnOpioidInitiatedOrContinuedDate"]'),
      prnCommentTextarea: page.locator('[data-cy="input-prnOpioidInitiatedOrContinued-comment"]'),
      // Notes
      notesAdd: page.locator('[data-cy="button-notes-add"]'),
      notesCategoryBtn: page.getByRole('button', { name: 'Category' }),
      notesDescription: page.locator('[data-cy="input-notes-description"]'),
    };

    // Neurological Section
    this.neurological = {
      declineCheckbox: page.getByRole('checkbox', { name: 'Patient declines Neurological' }),
      // Orientation
      orientedCheckbox: page.locator('#checkbox-391-0'),
      disorientedCheckbox: page.getByText('Disoriented'),
      // Anxiety
      anxietyCheckbox: page.getByRole('checkbox', { name: 'Patient Experiences Anxiety' }),
      anxietyScore: page.locator('#anxietyScoreRange').getByRole('slider'),
      anxietyImpactRadio: (index: number) => page.locator(`#rb-404-${index}`),
      anxietyOtherText: page.locator('ion-col').filter({ hasText: 'Patient Experiences Anxiety' }).getByPlaceholder('Please specify'),
      // Agitation
      agitationCheckbox: page.getByRole('checkbox', { name: 'Patient Experiences Agitation' }),
      agitationScore: page.locator('#agitationScoreRange > .range-slider'),
      agitationImpactRadio: (index: number) => page.locator(`#rb-410-${index}`),
      agitationOtherText: page.locator('ion-col').filter({ hasText: 'Patient Experiences Agitation' }).getByPlaceholder('Please specify'),
      // Seizures
      seizuresCheckbox: page.getByRole('checkbox', { name: 'Patient Experiences Seizures' }),
      seizuresMostRecentTime: page.locator('#datetime-440-0'),
      seizuresLastTime: page.locator('#datetime-441-0'),
      seizuresFrequencyNumerator: page.locator('#bmFrequencyNumeratorNumber').getByRole('spinbutton'),
      seizuresFrequencyDenominator: page.locator('#bmFrequencyDenominatorNumber').getByRole('spinbutton'),
      seizuresFrequencyUnit: page.locator('#select-444-0'),
      seizuresDurationMin: page.locator('#seizureDurationMinNumber').getByRole('spinbutton'),
      seizuresDurationMax: page.locator('#seizureDurationMaxNumber').getByRole('spinbutton'),
      // Aphasia
      aphasiaCheckbox: page.getByRole('checkbox', { name: 'Patient Experiences Aphasia' }),
      aphasiaType: page.locator('#typeText').getByRole('textbox'),
      aphasiaQuotient: page.locator('#aphasiaQuotientNumber').getByRole('spinbutton'),
      // Ataxia
      ataxiaCheckbox: page.getByRole('checkbox', { name: 'Patient Experiences Ataxia' }),
      ataxiaType: page.locator('#ataxiaTypeText').getByRole('textbox'),
      // Apraxia
      apraxiaCheckbox: page.getByRole('checkbox', { name: 'Patient Experiences Apraxia' }),
      // Coma
      comatoseCheckbox: page.getByRole('checkbox', { name: 'Patient Comatose' }),
      comaText: page.locator('#comaText'),
      comaEyeOpeningRadio: (index: number) => page.locator(`#rb-467-${index}`),
      comaVerbalResponseRadio: (index: number) => page.locator(`#rb-462-${index}`),
      comaMotorResponseRadio: (index: number) => page.locator(`#rb-474-${index}`),
      // Confusion
      confusionCheckbox: page.getByRole('checkbox', { name: 'Patient Experiences Confusion' }),
      // Depression
      depressionCheckbox: page.getByRole('checkbox', { name: 'Patient Experiences Depression' }),
      // Headaches
      headachesCheckbox: page.getByRole('checkbox', { name: 'Patient Experiences Headaches' }),
      headachesOnsetDate: page.locator('#datetime-489-0'),
      headachesMostRecent: page.locator('#datetime-490-0'),
      headachesTypeRadio: (type: string) => page.getByRole('radio', { name: type }),
      headachesLocationUnilateral: page.getByRole('checkbox', { name: 'Unilateral' }),
      headachesLocationBilateral: page.getByRole('checkbox', { name: 'Bilateral' }),
      headachesLocationOccipital: page.getByRole('checkbox', { name: 'Occipital' }),
      headachesFrequencyNumerator: page.locator('#headacheFrequencyNumeratorNumber').getByRole('spinbutton'),
      headachesFrequencyDenominator: page.locator('#headacheFrequencyDenominatorNumber').getByRole('spinbutton'),
      headachesFrequencyUnit: page.locator('#select-493-0'),
      headachesCharacteristicsBtn: page.getByRole('button', { name: 'Pain Characteristics' }),
      headachesSeverity: page.locator('#headacheSeverityRange > .range-slider'),
      headachesAssociatedNausea: page.getByRole('checkbox', { name: 'Associated Nausea' }),
      headachesRadiation: page.getByRole('checkbox', { name: 'Radiation' }),
      headachesRecentHeadInjury: page.getByRole('checkbox', { name: 'Recent Head Inury' }),
      headachesRecentHeadInjuryDate: page.locator('#datetime-500-0'), // Approximate based on pattern
      headachesAssociatedVomiting: page.getByRole('checkbox', { name: 'Associated Vomiting' }),
      headachesAssociatedVomitingDate: page.locator('#datetime-505-0'), // Approximate
      headachesAssociatedVomitingFreqNum: page.locator('#headacheAssociatedVomitingFrequencyNumeratorNumber').getByRole('spinbutton'),
      headachesAssociatedVomitingFreqDenom: page.locator('#headacheAssociatedVomitingFrequencyDenominatorNumber').getByRole('spinbutton'),
      headachesAssociatedVomitingFreqUnit: page.locator('#select-508-0'),
      headachesRecentConcussion: page.getByRole('checkbox', { name: 'Recent Concussion' }),
      headachesRecentConcussionDate: page.locator('#datetime-510-0'), // Approximate
      // Hemiplegia
      hemiplegicCheckbox: page.getByRole('checkbox', { name: 'Patient Hemiplegic' }),
      hemiplegicOnsetDate: page.locator('#datetime-511-0'),
      hemiplegicAffectedSideRadio: (side: string) => page.getByRole('radio', { name: side }),
      // Paraplegia
      paraplegicCheckbox: page.getByRole('checkbox', { name: 'Patient Paraplegic' }),
      paraplegicOnsetDate: page.locator('#datetime-515-0'),
      // Quadriplegia
      quadraplegicCheckbox: page.getByRole('checkbox', { name: 'Patient Quadraplegic' }),
      quadraplegicOnsetDate: page.locator('#datetime-517-0'), // Approximate
      // Other Issues
      otherIssues: {
        akinesthesia: page.getByRole('checkbox', { name: 'Akinesthesia' }),
        blindness: page.getByRole('checkbox', { name: 'Blindness' }),
        decreasedVision: page.getByRole('checkbox', { name: 'Decreased Vision' }),
        dysphasia: page.getByRole('checkbox', { name: 'Dysphasia' }),
        gagReflexImpaired: page.getByRole('checkbox', { name: 'Gag Reflex Imparied' }),
        shufflingGait: page.getByRole('checkbox', { name: 'Shuffling Gait' }),
        tremors: page.getByRole('checkbox', { name: 'Tremors' }),
        gagReflexAbsent: page.getByRole('checkbox', { name: 'Gag Reflex Absent' }),
        pillRolling: page.getByRole('checkbox', { name: 'Pill Rolling' }),
        terminalRestlessness: page.getByRole('checkbox', { name: 'Terminal Restlessness' }),
        insomnia: page.getByRole('checkbox', { name: 'Insomnia' }),
        dyskinesia: page.getByRole('checkbox', { name: 'Dyskinesia' }),
        obtunded: page.getByRole('checkbox', { name: 'Obtunded' }),
        syncope: page.getByRole('checkbox', { name: 'Syncope' }),
        vertigo: page.getByRole('checkbox', { name: 'Vertigo' }),
        dysarthria: page.getByRole('checkbox', { name: 'Dysarthia' }),
        impairedSpeechPattern: page.getByRole('checkbox', { name: 'Impaired Speech Pattern' }),
        stupor: page.getByRole('checkbox', { name: 'Stupor' }),
        tia: page.getByRole('checkbox', { name: 'TIA' }),
        other: page.locator('#otherIssuesOtherText').getByRole('textbox', { name: 'Other' }),
      },
      // Notes
      notesAdd: page.getByRole('button', { name: 'close add' }),
      notesCategoryBtn: page.getByRole('button', { name: 'Category' }),
      notesDescription: page.locator('#notesDescriptionVoiceTextArea').getByRole('textbox', { name: 'Please specify' }),
    };
  }

  // Helper method to select radio option by role
  async selectRadioOption(name: string): Promise<void> {
    await this.page.getByRole('radio', { name }).click();
  }

  // Helper method to click datetime and confirm
  async selectDate(locator: Locator): Promise<void> {
    await locator.click();
    await this.doneBtn.click();
  }

  // Helper method to fill and submit notes
  async addNotes(category: string, description: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Category' }).click();
    await this.selectRadioOption(category);
    await this.page.getByRole('textbox', { name: 'Please specify' }).fill(description);
    await this.submitBtn.click();
  }
}
