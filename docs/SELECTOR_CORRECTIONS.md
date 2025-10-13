# Selector Corrections for HOPE Visit Workflow

## Issue
During Cypress to Playwright migration, many selectors were incorrectly converted. Some non-data-cy selectors were given data-cy attributes that don't exist in the UI.

## Icon Selectors ✅ FIXED
All icon selectors have been corrected to use SVG src paths:
- ✅ vitalsIcon: `'[src*="assets/svg/vitals.svg"]'`
- ✅ preferencesIcon: `'[src*="assets/svg/preferences.svg"]'`
- ✅ neurologicalIcon: `'[src*="assets/svg/neurological.svg"]'`
- ✅ painIcon: `'[src*="assets/svg/pain.svg"]'`
- ✅ respiratoryIcon: `'[src*="assets/svg/respiratory.svg"]'`
- ✅ gastrointestinalIcon: `'[src*="assets/svg/gastrointestinal.svg"]'`
- ✅ skinIcon: `'[src*="assets/svg/skin.svg"]'`
- ✅ hospiceAideIcon: `'[src*="assets/svg/hospiceAide.svg"]'`
- ✅ summaryIcon: `'[src*="assets/svg/summary.svg"]'`

## Vitals Section
### Corrected Selectors (from Cypress):
```javascript
// BP Fields
addBPBtn: '[data-cy="button-bloodPressure-add"] > .button-inner'
bpLocation: '[data-cy="select-bloodPressureLocation"] button'
bpPosition: '[data-cy="select-bloodPressurePosition"] button'
systolic: 'input[data-cy="number-input-bloodPressureSystolic"]'
diastolic: 'input[data-cy="number-input-bloodPressureDiastolic"]'
```

### Current Playwright Selectors:
```typescript
addBPBtn: '[data-cy="btn-add-bp"]' // ❌ INCORRECT
bpLocation: '[data-cy="select-bp-location"]' // ❌ INCORRECT
bpPosition: '[data-cy="select-bp-position"]' // ❌ INCORRECT
systolic: '[data-cy="input-systolic"]' // ❌ INCORRECT
diastolic: '[data-cy="input-diastolic"]' // ❌ INCORRECT
```

## Preferences Section
### CPR F2000:
```javascript
// Cypress correct selectors:
prefHisCPR2000Yes: '[data-cy="radio-wasPatientAskedForPreferences-yesDiscussionOccurred"]'
prefHisCPR2000Refused: '[data-cy="radio-wasPatientAskedForPreferences-yesRefusedToDiscuss"]'
prefHisCPR2000No: '[id="wasPatientAskedForPreferencesRadio-no"]'
prefHisCPR2000NoComment: 'textarea[data-cy="input-cprNotAsked"]'
prefHisCPR2000DT: '[data-cy="date-input-dateAsked-date"] div'
```

### Language & Living:
```javascript
// Cypress correct selectors:
prefinterpreterAssistYes: '[data-cy="radio-interpreterAssist-yes"]'
prefinterpreterAssistNo: '[data-cy="radio-interpreterAssist-no"]'
selectPreferLang: '[data-cy="select-languages"] button'
selectlivingArrangements: '[data-cy="select-livingArrangements"] button'
selectlevelOfAssistance: '[data-cy="select-levelOfAssistance"] button'
```

### Life Sustaining F2100:
```javascript
// Cypress correct selectors:
prefOthlst2100Yes: '[data-cy="radio-wasPatientResponsibleAskedAboutLifeSustainingTreatments-yesAndDiscussed"]'
prefOthlst2100RefuseYes: '[data-cy="radio-wasPatientResponsibleAskedAboutLifeSustainingTreatments-yesAndRefused"]'
prefOthlst2100No: '[data-cy="radio-wasPatientResponsibleAskedAboutLifeSustainingTreatments-no"]'
prefOthlst2100Dt: '[data-cy="date-input-treatmentDateAsked-date"] div'
pref2100LifeSustTreatNo: '[data-cy="radio-patientWantsLifeSustainingTreatments-no"]'
pref2100LifeSustTreatYes: '[data-cy="radio-patientWantsLifeSustainingTreatments-yes"]'
```

### Hospital F2200:
```javascript
// Cypress correct selectors:
prefHospital2200Yes: '[data-cy="radio-patientPreferenceRegardingHospitalization-yesAndDiscussed"]'
prefHospital2200YesRefuse: '[data-cy="radio-patientPreferenceRegardingHospitalization-yesAndRefused"]'
prefHospital2200No: '[data-cy="radio-patientPreferenceRegardingHospitalization-no"]'
prefFurHospital2200No: '[data-cy="radio-patientWantsFurtherHospitalizations-no"]'
prefFurHospital2200Yes: '[data-cy="radio-patientWantsFurtherHospitalizations-yes"]'
prefHospital2200Dt: '[data-cy="date-input-hospitalizationDateAsked-date"] div'
```

### Spiritual F3000:
```javascript
// Cypress correct selectors:
prefspiritual3000Yes: '[data-cy="radio-wasPatientOrCaregiverAskedAboutSpiritualExistentialConcerns-yesAndDiscussed"]'
prefspiritual3000RefuseYes: '[data-cy="radio-wasPatientOrCaregiverAskedAboutSpiritualExistentialConcerns-yesAndRefused"]'
prefspiritual3000No: '[data-cy="radio-wasPatientOrCaregiverAskedAboutSpiritualExistentialConcerns-no"]'
prefspiritual3000Dt: '[data-cy="date-input-spiritualExistentialDateAsked-date"] div'
prefspiritualConcernYes: '[data-cy="radio-hasPatientSpiritualConcerns-yesAndDiscussionOccurred"]'
prefspiritualConcernNO: '[data-cy="radio-hasPatientSpiritualConcerns-no"]'
```

### Death Signs:
```javascript
// Cypress correct selectors:
prefpatientShowingSignsOfDeathNoSign: '[data-cy="radio-patientShowingSignsOfImminentDeath-no"]'
prefpatientShowingSignsOfEarlyStage: '[data-cy="radio-patientShowingSignsOfImminentDeath-yes"]'
prefpatientShowingSignsOfDeathimminent: '[data-cy="radio-patientShowingSignsOfImminentDeath-imminent"]'
```

## Neurological Section
### Correct Selectors (from Cypress):
```javascript
// Agitation:
agitationNoImpact: '[data-card-id="CL010.223"] [data-cy="radio-rankSymptomImpact-notImpacted"]'
agitationMildImpact: '[data-card-id="CL010.223"] [data-cy="radio-rankSymptomImpact-mildImpact"]'
agitationModerateImpact: '[data-card-id="CL010.223"] [data-cy="radio-rankSymptomImpact-moderateImpact"]'
agitationSevereImpact: '[data-card-id="CL010.223"] [data-cy="radio-rankSymptomImpact-severeImpact"]'
agitationNosymptom: '[data-card-id="CL010.223"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]'
agitationToggle: '[data-cy="toggle-patientExperiencesAgitation"] button'
agitationScore: `[data-cy='input-agitationScore-range'] div[class*='range-tick'][style*='${value}']`

// Anxiety:
anxietyNoImpact: '[data-card-id="CL010.20"] [data-cy="radio-rankSymptomImpact-notImpacted"]'
anxietyMildImpact: '[data-card-id="CL010.20"] [data-cy="radio-rankSymptomImpact-mildImpact"]'
anxietyModerateImpact: '[data-card-id="CL010.20"] [data-cy="radio-rankSymptomImpact-moderateImpact"]'
anxietySevereImpact: '[data-card-id="CL010.20"] [data-cy="radio-rankSymptomImpact-severeImpact"]'
anxietyNosymptom: '[data-card-id="CL010.20"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]'
anxietyToggle: '[data-cy="toggle-patientHasAnxiety"] button'
anxietyScore: `[data-cy='input-anxietyScore-range'] div[class*='range-tick'][style*='${value}']`
```

## Pain Assessment Section
### Correct Selectors (from Cypress):
```javascript
painScreenj0900Yes: '[data-cy="radio-experiencingPainQuestion-yes"]'
painScreenj0900No: '[data-cy="radio-experiencingPainQuestion-no"]'
painScreenDt: '[data-cy="date-input-dateFirstPainScreening-date"] div'
painActivej0905Yes: '[data-cy="radio-activePainWith-yes"]'
painActivej0905No: '[data-cy="radio-activePainWith-no"]'
j0900NeuroPainYes: '[data-cy="radio-patientHasNeuropathicPain-yes"]'
j0900NeuroPainNo: '[data-cy="radio-patientHasNeuropathicPain-no"]'

// Comprehensive Pain:
addCompPain: '[id="addSiteBtn"]'
nextStepBtn: '[id="nextStepBtn"]'
generalizedCB: '[id="unspecifiedLocationPain"]'
type: '[id="type"] button'
character: '[id="character"] button'
severity: '[id="descriptiveSeverity"] button'
frequency: '[id="frequency"] button'
duration: '[id="duration"] button'
onset: '[id="onset"] button'
painQuestion1: '[id="painQuestion1"] textarea'
painQuestion2: '[id="painQuestion2"] textarea'
painQuestion3: '[id="painQuestion3"] textarea'

// Tools:
painNumericTool: 'button[data-cy="button-tool-numeric"]'
painwongBakerTool: 'button[data-cy="button-tool-wongBaker"]'
wongBaker2: '[id="wongBaker2"]'

// Pain Impact:
painNoImpact: 'pain-screening-tool [data-cy="radio-rankSymptomImpact-notImpacted"]'
painMildImpact: 'pain-screening-tool [data-cy="radio-rankSymptomImpact-mildImpact"]'
painModerateImpact: 'pain-screening-tool [data-cy="radio-rankSymptomImpact-moderateImpact"]'
painSevereImpact: 'pain-screening-tool [data-cy="radio-rankSymptomImpact-severeImpact"]'
painNosymptom: 'pain-screening-tool [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]'

// Opioids:
painj0910comprehenYes: '[data-cy="radio-wasPainDoneQuestion-yes"]'
painj0910comprehenNO: '[data-cy="radio-wasPainDoneQuestion-no"]'
painj0910comprehenDt: '[data-cy="date-input-dateComprehensivePainAssessment-date"] div'
OpioidschedYes: '[data-cy*="radio-scheduledOpioid"][id*="yes"]'
rnOpioidschedNO: '[data-cy*="radio-scheduledOpioid"][id*="no"]'
OpioidschedDt: '[data-cy="date-input-scheduledOpioidDate-date"] div'
PrnOpioidYes: '[data-cy*="radio-prnOpioid"][id*="yes"]'
rnPrnOpioidNO: '[data-cy*="radio-prnOpioid"][id*="no"]'
PrnOpioidDt: '[data-cy="date-input-prnOpioidDate-date"] div'
```

## Respiratory Section
### Correct Selectors (from Cypress):
```javascript
respshortBreadthj20302040Yes: '[data-cy="radio-shortnessOfBreathScreening-yes"]'
respshortBreadthj20302040No: '[data-cy="radio-shortnessOfBreathScreening-no"]'
respshortBreadthDT: '[data-cy="date-input-shortnessOfBreathScreeningDate-date"] div'
respsobYes: '[data-cy="radio-shortnessOfBreathNow-yes"]'
respsobNo: '[data-cy="radio-shortnessOfBreathNow-no"]'
treatmentInitYES: '[data-cy="radio-treatmentInitiated-yes"]'
treatmentInitNO: '[data-cy="radio-treatmentInitiated-no"]'
treatmentDate: '[data-cy="date-input-treatmentDate-date"] div'
oxygenCB: '[data-cy="checkbox-treatmentTypeCheck-oxygen"]'

// SOB Impact:
sobNoImpact: '[data-card-id="CL010.37"] [data-cy="radio-rankSymptomImpact-notImpacted"]'
sobMildImpact: '[data-card-id="CL010.37"] [data-cy="radio-rankSymptomImpact-mildImpact"]'
sobModerateImpact: '[data-card-id="CL010.37"] [data-cy="radio-rankSymptomImpact-moderateImpact"]'
sobSevereImpact: '[data-card-id="CL010.37"] [data-cy="radio-rankSymptomImpact-severeImpact"]'
sobNosymptom: '[data-card-id="CL010.37"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]'
```

## Gastrointestinal Section
### Correct Selectors (from Cypress):
```javascript
gasN0520bowlregYES: '[data-cy="radio-patientHasBowelRegimen-yes"]'
gasN0520bowlregNo: '[data-cy="radio-patientHasBowelRegimen-no"]'
gasN0520bowlregDecline: '[data-cy="radio-patientHasBowelRegimen-patientDeclinedTreatment"]'
bowelRegimenDate: '[data-cy="date-input-bowelRegimenDate-date"] div'
gasBmTyperegular: '[data-cy="radio-bmType-regular"]'
gasBmTypeirregular: '[data-cy="radio-bmType-irregular"]'
gasBmTypeDiarrhea: '[data-cy="radio-bmIrregular-diarrhea"]'
gasBmTypeConstipation: '[data-cy="radio-bmIrregular-constipation"]'

// Bowel Impact:
gastroBowlNoImpact: '[data-card-id="CL010.68"] [data-cy="radio-rankSymptomImpact-notImpacted"]'
gastroBowlMildImpact: '[data-card-id="CL010.68"] [data-cy="radio-rankSymptomImpact-mildImpact"]'
gastroBowlModerateImpact: '[data-card-id="CL010.68"] [data-cy="radio-rankSymptomImpact-moderateImpact"]'
gastroBowlSevereImpact: '[data-card-id="CL010.68"] [data-cy="radio-rankSymptomImpact-severeImpact"]'
gastroBowlNosymptom: '[data-card-id="CL010.68"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]'

// Vomit Impact:
gastroVomitNoImpact: '[data-card-id="CL010.72"] [data-cy="radio-rankSymptomImpact-notImpacted"]'
gastroVomitMildImpact: '[data-card-id="CL010.72"] [data-cy="radio-rankSymptomImpact-mildImpact"]'
gastroVomitModerateImpact: '[data-card-id="CL010.72"] [data-cy="radio-rankSymptomImpact-moderateImpact"]'
gastroVomitSevereImpact: '[data-card-id="CL010.72"] [data-cy="radio-rankSymptomImpact-severeImpact"]'
gastroVomitNosymptom: '[data-card-id="CL010.72"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]'

// Nausea Impact:
gastroNauseaNoImpact: '[data-card-id="CL010.73"] [data-cy="radio-rankSymptomImpact-notImpacted"]'
gastroNauseaMildImpact: '[data-card-id="CL010.73"] [data-cy="radio-rankSymptomImpact-mildImpact"]'
gastroNauseaModerateImpact: '[data-card-id="CL010.73"] [data-cy="radio-rankSymptomImpact-moderateImpact"]'
gastroNauseaSevereImpact: '[data-card-id="CL010.73"] [data-cy="radio-rankSymptomImpact-severeImpact"]'
gastroNauseaNosymptom: '[data-card-id="CL010.73"] [data-cy="radio-rankSymptomImpact-patientNotExperiencingTheSymptom"]'
```

## Skin Section
### Correct Selectors (from Cypress):
```javascript
skinlocationTitle: '#locationTitle input'
skinlocationType: '#locationType button'
skinwoundype: '#woundType button'
skinwoundWidth: '#width'
skinNext: ".tabButton button:nth-child(2)"
scoringTool: ".summary-sidebar button[id*='select']"
woundCareNotes: 'new-wound-notes textarea'
woundAlertActive: ".alert-button-group button:nth-child(2)"
woundAlertHealed: ".alert-button-group button:nth-child(1)"
pressureReducingDeviceForChair: '[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-pressureReducingDeviceForChair"]'
noneOfTheAbove: '[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-noneOfTheAbove"]'
```

## Hospice Aide Section
### Correct Selectors (from Cypress):
```javascript
addHAtask: '[data-cy="button-addTask-add"]'
taskCategory: '[data-cy="select-addTaskCategory"] button'
addTask: '[data-cy="select-addTaskTask"] button'
levelSelf: '[data-cy="radio-addTaskAssistance-self"]'
levelAssist: '[data-cy="radio-addTaskAssistance-assist"]'
levelTotal: '[data-cy="radio-addTaskAssistance-total"]'
frequencyTimes: 'input[data-cy="number-input-frequencyNumerator"]'
frequecncyUnit: '[data-cy="select-frequencyUnit"] button'
comments: 'textarea[data-cy="input-addTaskHaComments"]'
```

## Summary Section
### Correct Selectors (from Cypress):
```javascript
coordinateCareAdd: '[data-cy="button-coordinationOfCare-add"] > .fab-close-icon'
careRelationselect: '[data-cy="select-coordinationRelation"]'
careContactselect: '[data-cy="select-coordinationPerson"]'
careViaselect: '[data-cy="select-coordinationVia"]'
CareDesc: '.inputBox > .text-input'
```

## Common Buttons
### Correct Selectors (from Cypress):
```javascript
save: '.buttonContainer > #inputModalSubmit'
completeBtn: '[data-cy="btn-complete-visit"] > .button-inner'
taskcheck: '[data-cy="checkbox-disclaimerChkCheck-labelAcknowledge"]'
esignedby: 'input[data-cy="input-signature"]'
```

## Priority Fixes Needed

### High Priority (Breaking Current Tests):
1. **Vitals section** - All BP selectors need correction
2. **Preferences CPR** - Incorrect data-cy attributes
3. **Neurological** - Missing data-card-id prefixes
4. **Pain** - Many selectors need ID-based approach
5. **Respiratory/GI** - Missing data-card-id for symptom impact

### Medium Priority:
1. Date picker selectors (need `div` suffix)
2. Button selectors (need proper class/structure)
3. Toggle selectors (need `button` suffix)

### Low Priority:
1. Status indicators
2. Optional fields

## Next Steps
1. Update selectors systematically section by section
2. Test each section after correction
3. Document any UI changes that differ from Cypress version
