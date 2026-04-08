# Visits Module Knowledge Base

## Navigation
- Care Plan from black nav bar: `button:has-text("Careplan")` or `[data-cy="btn-nav-bar-item-care-plan"]`
- Add Visit: `#addVisit` (+ button on Visit(s) section header)
- URL after navigating to Care Plan: `/#/patient/{patientId}/carePlan/visits`

## Create Visit Modal (confirmed 2026-04-06)

Triggered by clicking + on Visit(s) section in Care Plan.

| Element | Selector | Notes |
|---------|----------|-------|
| Modal title | `text=Create Visit` | |
| Role dropdown | `button:has-text("Role")` | Opens ion-select radiogroup |
| Type dropdown | `button:has-text("Type")` | Opens ion-select radiogroup |
| PRN Visit checkbox | `ion-checkbox` | Optional |
| Comments | `textarea` | Optional |
| Submit | `ion-modal button:has-text("Submit")` | Disabled until Role + Type selected |
| Cancel | `ion-modal button:has-text("Cancel")` | |

### Role Options
- Medical Director (used for F2F visits)
- Registered Nurse (RN) (used for INA visits)

### Type Options (varies by role)
**Medical Director**: Face to Face Visit
**Registered Nurse**: Initial Nursing Assessment, Initial/Comprehensive Assessment, Comprehensive Assessment, Routine, Emergent, Watch Care Visit, Phone Call, Supervisory Visit, Hospice Aide Routine, Postmortem Encounter, External Face to Face Visit, LCD

- After submit: navigates to assessment page. URL segment varies by visit type (see table below).
- White screen: don't reload — wait 30s for nav buttons. If truly stuck, navigate via Patient module.
- **Role dropdown is role-scoped**: RN login only sees "Registered Nurse (RN)"; MD login sees "Medical Director". Confirmed 2026-04-08.

### Visit Type Flow Summary (confirmed 2026-04-08)

| Visit Type | Role | Sections | URL Segment | Complete Flow | Special |
|------------|------|----------|-------------|---------------|---------|
| Face to Face Visit | MD | 2 (Vitals, Face To Face) | `/vitals` | 1-step Task | Attestation, Signatory |
| Initial Nursing Assessment | RN | 17 | `/symptomSummary` | 2-step (Sig+Task) | HIS preview gate, Narrative Origin/Category |
| Initial/Comprehensive Assessment | RN | 17 (same as INA, no Supervisory Visit) | `/symptomSummary` | 1-step | — |
| Comprehensive Assessment | RN | 18 (INA + Supervisory Visit) | `/symptomSummary` | 1-step | — |
| Routine | RN | 18 (INA + Supervisory Visit) | `/symptomSummary` | 1-step | Requires: Summary + Vitals + 1 other |
| Emergent | RN | 18 (same as Routine) | `/symptomSummary` | 1-step | — |
| Watch Care Visit | RN | 18 (same as Routine) | `/symptomSummary` | 1-step | — |
| Phone Call | RN | 18 (same as Routine) | `/symptomSummary` | 1-step | Requires: Summary |
| Supervisory Visit | RN | 2 (Supervisory Visit, Hospice Aide) | `/supervisoryVisit` | 1-step | Requires: Supervisory Visit section |
| Hospice Aide Routine | RN | 2 (Hospice Aide Care Plan, Summary) | `/hospiceAideHACarePlanRN` | 1-step | — |
| Postmortem Encounter | RN | 3 (Death Assessment, Vitals, Summary) | `/deathAssessment` | **Discharge modal** | Discharges patient as Expired. Required: Death Assessment + Summary |
| External Face to Face Visit | RN | 1 (External Face To Face Visit) | `/faceToFaceExternal` | 1-step | Conducted By* field, upload note |
| LCD | RN | 13 (disease-specific sections) | `/lcdGeneralDecline1` | 1-step | General Decline 1&2, Cancer, Non-Cancer, ALS, Dementia, Heart/HIV/Liver/Pulmonary/Renal Disease, Stroke and Coma, Additional |

### Section Groups

**17-section (INA)**: Symptom Summary, Vitals, Preferences, Neurological, Pain, Respiratory, Cardiovascular, Gastrointestinal, Genitourinary, Nutritional & Metabolic, Skin, Musculoskeletal, ADLs/Functional Needs, Precautions Safety & Teachings, Hospice Aide, Military History, Summary

**18-section (Standard RN)**: Same as INA + **Supervisory Visit** section (between Precautions Safety & Teachings and Hospice Aide)

**Vitals section content** (shared across INA, Standard RN, Postmortem): Blood Pressure, Temperature, Pulse, Respiratory Rate, Height, Weight, MUAC, Triceps Skinfold, COVID-19 Screening (5 questions), Notes. "Patient declines Vitals Assessment" checkbox.

**Summary section content** (shared across INA, Standard RN, Postmortem, Hospice Aide Routine): Coordination of Care + Narratives cards. Narrative modal uses origin-category style (same `select-narrativeOrigin`, `select-narrativeCategory`, `input-narrativeDescription`).

### Postmortem Encounter — Death Assessment Section (confirmed 2026-04-08)

4 sub-sections:
1. **Assessment of Death**: Physical Assessment (9 checkboxes), Skin Color (3 checkboxes), Position of Body (2 checkboxes), Post Mortem Care (Yes/No), Bathing/Positioning (Yes/No), Cultural & Religious (Yes/No), Medication Disposal (Yes/No), Supplies Disposal (Yes/No), Medications Destroyed (Yes/No), Medical Devices Removed (Yes/No)
2. **Patient Information**: Date of Death* (ion-picker), Location of Death* (radio: Patient's Care Location / Other), Time of Death* (ion-picker HH:MM), Hospice Physician Notified (Yes/No), Date/Time Notified, Coroner/ME Notification (Yes/No)
3. **Notifications**: Attending Physician (textbox), Notified By (Phone/Fax checkboxes), Pharmacy/Funeral Home/Coroner/DME/Personal Items/Caregivers Notified (all Yes/No), Body Received By (textbox)
4. **Family and Bereavement Support**: Death attended by staff (Yes/No), Emotional response (Calm/Distraught/Numb checkboxes), Family grieving time (Yes/No), Support offered (Yes/No), Bereavement Follow-Up (Yes/No)

- Date/Time pickers use `ion-picker-cmp` (same as F2F attestation date) — click Done to accept
- Complete triggers **Discharge Patient** modal then **Task modal** (2-step): discharge acknowledge → dates/times
- Overlap acknowledgement checkbox may appear in Task modal if visit dates overlap with existing visits

### Visit RLIS in Billing (confirmed 2026-04-08)

When visits are completed, they generate Revenue Line Items (RLIS) on the billing claim:

| Visit Type | Revenue Code | Revenue Description | HCPCS Code | SIA |
|------------|-------------|---------------------|------------|-----|
| INA (RN) | 0551 | Skilled Nursing Visit | G0299 | ~$33.93 |
| Postmortem (RN) | 0551 | Skilled Nursing Visit | G0299 | ~$33.93 |
| Routine Home Care | 0651 | Routine Home Care (1-60) | Q5001 | $0.00 |

- **SIA (Service Intensity Add-on)**: Calculated per visit, summed at claim level. Only Skilled Nursing Visits have non-zero SIA.
- **Service End date on 814 claim = death date** (discharge claim)
- **Bill type 814**: Discharge claim when discharge month differs from admit month. Bill type 811 if same month.
- RLIS appears in Claim Details tab after expanding the claim row

## Assessment Page Layout (confirmed 2026-04-06)

### Left Nav Sections
| Section | Selector | URL segment |
|---------|----------|-------------|
| Vitals | `button:has-text("Vitals")` | `/assessment/{id}/vitals` |
| Face To Face | `button:has-text("Face To Face")` | `/assessment/{id}/faceToFaceMD` |

### Action Buttons (top of assessment page)
| Button | Selector | Notes |
|--------|----------|-------|
| Cancel Visit | `button:has-text("Cancel Visit")` | Returns to Care Plan visits page |
| Continue Later | `button:has-text("Continue Later")` | Saves progress |
| Complete | `button:has-text("Complete")` | Opens completion popup |

## Vitals — Blood Pressure (confirmed 2026-04-06)

BP modal triggered by + button on Blood Pressure section.

| Element | Selector | Notes |
|---------|----------|-------|
| BP Add button | `#bloodPressureAdd` | + button on Blood Pressure row |
| Location dropdown | `ion-modal button:has-text("Location")` | Required, ion-select radio (e.g., "Left Arm") |
| Position dropdown | `ion-modal button:has-text("Position")` | Required, ion-select radio (e.g., "Sitting") |
| Systolic | first `spinbutton` in modal | Systolic (mm Hg) |
| Diastolic | second `spinbutton` in modal | Diastolic (mm Hg) |
| Submit | `ion-modal button:has-text("Submit")` | Disabled until required fields filled |
| Cancel | `ion-modal button:has-text("Cancel")` | |

## Face To Face Section — `/faceToFaceMD` (confirmed 2026-04-06)

### Sections within F2F page
- Lab Results — + button to add
- Clinical Narrative — + button to add (opens textarea modal)
- Attestation — inline form

### Clinical Narrative Modal
| Element | Selector | Notes |
|---------|----------|-------|
| Add button | `ion-card:has-text("Clinical Narrative") img[alt="add"]` | Opens modal with textarea |
| Textarea | `ion-modal textarea` | Free text |
| Submit | `ion-modal button:has-text("Submit")` | |

### Attestation
| Element | Selector | Notes |
|---------|----------|-------|
| Attestation text | `p:has-text("I confirm that I,")` | Pre-filled: "I confirm that I, {userName} had a face to face encounter with {patientName}..." |
| Checkbox | `checkbox:has-text("By checking this box")` | Enables signatory name + date fields |
| Name of Signatory | `input[aria-label="Name of Signatory"]` | Disabled until checkbox checked |
| Date dropdown | `button:has-text("Please Select")` in attestation section | Disabled until checkbox checked |
| Role label | `text=Medical Director` | Static label at bottom |

- **Signatory name extraction**: Parse from attestation paragraph — regex `I confirm that I, (.+?) had a face to face`

## Complete Visit Popup — "Task" Modal (confirmed 2026-04-06)

Triggered by clicking Complete button on assessment page.

| Element | Selector / data-cy | Notes |
|---------|---------------------|-------|
| On-Call checkbox | `data-cy="checkbox-onCallCheck-onCall"` | Optional |
| Start Date | `#assessmentStartDate input#date-value` | **ngb-datepicker — MUST use calendar, fill() won't trigger Angular** |
| Start Date calendar | `#assessmentStartDate button` | Opens ngb-datepicker inline |
| Start Hours | `textbox[name="Hours"]` first | Placeholder "HH" |
| Start Minutes | `textbox[name="Minutes"]` first | Placeholder "MM" |
| End Date | `#assessmentEndDate input#date-value` | **ngb-datepicker — MUST use calendar** |
| End Date calendar | `#assessmentEndDate button` | Opens ngb-datepicker inline |
| End Hours | `textbox[name="Hours"]` second | |
| End Minutes | `textbox[name="Minutes"]` second | |
| Overlap acknowledge | `data-cy="checkbox-ackOverlapCheck-acknowledgeOverlappingVisitText"` | May appear |
| Mileage | `data-cy="number-input-mileage"` | Optional, spinbutton |
| Submit | `data-cy="btn-input-modal-submit"` | Disabled until dates filled via calendar |
| Cancel | `data-cy="btn-input-modal-cancel"` | |

### ngb-datepicker Date Selection Pattern
The date inputs use `ngb-datepicker` — **`fill()` does NOT trigger Angular change detection**.
Must open via JS click on the input, then:
1. Select month via `ngb-datepicker select:first` (`selectOption('3')` for March)
2. Select year via `ngb-datepicker select:nth(1)` (`selectOption('2026')`)
3. Click day via `page.evaluate()` targeting `.ngb-dp-day div` matching text

## Void/Cancel Visit Dialog (confirmed 2026-04-06)

Triggered by clicking "Cancel Visit" on assessment page.

| Element | Selector | Notes |
|---------|----------|-------|
| Reason dropdown | `text=Select a reason for void/cancelling` | Opens popover with options |
| Notes | `ion-modal textarea` (last) | Required |
| Acknowledge checkbox | `ion-modal ion-checkbox` (last) | Required — "Please acknowledge" |
| Submit | `ion-modal button:has-text("Submit")` (last) | Disabled until all filled |
| Cancel | `ion-modal button:has-text("Cancel")` | Returns to assessment |

**Reason options**: Incorrect Location, Incorrect Patient, Incorrect Visit Type, Non-Admit Patient, Not for Medical Record, Other, Patient Passed, Unfinished Visit

## Initial Nursing Assessment (INA) — `/assessment/{id}/summary` (confirmed 2026-04-07)

### Left Nav (17 sections)
Symptom Summary, Vitals, Preferences, Neurological, Pain, Respiratory, Cardiovascular, Gastrointestinal, Genitourinary, Nutritional & Metabolic, Skin, Musculoskeletal, ADLs/Functional Needs, Precautions Safety & Teachings, Hospice Aide, Military History, Summary

### Narratives Modal (in Summary section)
| Element | Selector | Notes |
|---------|----------|-------|
| Add button | `#narrativesCardAdd` | In Summary → Narratives card |
| Origin* | `data-cy="select-narrativeOrigin"` | ion-select → radio popover. Section-specific origins enable Category |
| Category* | `data-cy="select-narrativeCategory"` | Disabled for General/Symptom Summary/Preferences. Enabled for Pain, Vitals, etc. |
| Description* | `getByRole('textbox', { name: 'Please specify' })` | voice-ion-textarea |
| Submit | `data-cy="btn-input-modal-submit"` | |

**Origin → Category mapping**: General/Symptom Summary/Preferences → Category disabled. Pain → Pain Assessment, Comprehensive Pain Assessment, Opioid Administration, Patient Declined Assessment.

### HIS Report Preview
| Element | Selector | Notes |
|---------|----------|-------|
| HOPE Report button | `data-cy="btn-hope-report"` | Must click before Complete — validation gate (was btn-his-report) |
| Go Back button | `data-cy="btn-go-back"` | Returns to section from HOPE preview |

### INA Complete — Two-Step Process
**Step 1: Signature Modal**
| Element | Selector | Notes |
|---------|----------|-------|
| Acknowledge checkbox | `data-cy="checkbox-disclaimerChkCheck-labelAcknowledge"` | Required |
| Signature input | `data-cy="input-signature"` | Must match exact name from hint |
| Signature hint | `p:has-text("Input must match:")` | Red text showing required name |
| Submit | `data-cy="btn-input-modal-submit"` | |

**Step 2: Task Modal** — Same as F2F (start/end dates + times + mileage)

### Post-Completion (confirmed 2026-04-08)
- Page often stays on assessment page after completion (does NOT reliably auto-navigate)
- Two auto-dismiss dialogs: "Completing Assessment..." + "Visit completed successfully"
- **Best pattern for grid verification**: `waitForVisitCompletionDialogs()` → `clickSidebarTab('profile')` → `navigateToCarePlan()` — forces grid reload
- **Do NOT use** `page.goto()` for navigation — always use sidebar/module navigation like a real user

### Care Plan Visit Grid (confirmed 2026-04-07)
| Column | data-cy |
|--------|---------|
| ID | `label-visit-id` |
| Discipline | `label-visit-discipline` |
| Type | `label-visit-type` |
| Performed By | `label-visit-performed-by` |
| Start | `label-visit-start-date` |
| End | `label-visit-end-date` |
| Duration | `label-visit-duration` |
| Status | `label-visit-status` |

## Key Behaviors
- **Create Visit modal**: Role and Type are both ion-select with radiogroup popover — click button to open, click radio to select
- **After Create Visit submit**: Direct navigation to assessment page
- **White screen**: Don't reload — wait 30s for nav buttons. Assessment page (17 sections for INA) loads slowly.
- **Cancel Visit**: On fresh/unsaved visits → returns directly to Care Plan (no dialog). On visits with saved data → shows Void/Cancel dialog (reason, notes, acknowledge) — then returns to Care Plan
- **Attestation fields disabled**: Name of Signatory and Date are disabled until checkbox is checked
- **BP modal required fields**: Location and Position must be selected before Submit is enabled
- **BP modal Submit**: Uses `data-cy="btn-input-modal-submit"` — systolic/diastolic must use `input[type="number"]` not spinbutton role
- **Clinical Narrative modal**: Has **Subject*** (required) AND **Description*** (required) — both must be filled
- **Attestation date**: Uses `ion-picker-cmp` (3 scroll columns: Month, Day, Year) — click Done to accept. Selector: `data-cy="date-input-attestationSignOnDate-date"` (dynamic `#datetime-*` IDs are NOT stable)
- **Signatory name field**: Use `getByPlaceholder('Name of Signatory')` not `getByLabel` (placeholder, not aria-label)
- **Complete popup dates**: **CRITICAL** — ngb-datepicker dates must be picked via calendar, `fill()` alone won't work. Use `selectDateFromPicker()` from `utils/form-helpers.ts`
- **Complete popup date sequence**: Must wait for first datepicker to close (`waitFor hidden`) before opening second. Fill times between dates as a natural pause.
- **Complete popup times**: Hours/Minutes textbox `fill()` works fine
- **End date calendar**: Use `nth(1)` calendar button in modal (second `custom calendar` button)
- **Overlap acknowledgement**: Task modal may show overlap checkbox (`data-cy="checkbox-ackOverlapCheck-..."`) if visit dates overlap with existing visits — check if visible and click before submitting
- **Visit grid row text**: Grid shows "Face to Face Visit" (not "Face to Face") — use exact text for `openVisitFromGrid`
- **Create Visit modal scoping**: Must scope Role/Type button clicks to `ion-modal` to avoid matching other text on page
- **Shared modal submit**: `data-cy="btn-input-modal-submit"` is reused across BP modal, Narrative modal, and Complete popup

## Ionic Selector Gotchas (confirmed 2026-04-08)
- **ion-select radio popovers render OUTSIDE ion-modal** — use `page.getByRole('radio', { name })` (page-level), NOT `modal.getByRole('radio')`
- **After selecting ion-select option, button text changes** — e.g., "Origin" → "Pain". Don't match by old name after selection.
- **getByRole works, CSS often doesn't for Ionic** — `ion-modal button:has-text("Role")` may fail where `modal.getByRole('button', { name: 'Role' })` succeeds. Always prefer `getByRole` for Ionic interactive elements.
- **Narrative modal timing is critical** — need 1000-1500ms between Origin click → radio select → Category click → radio select. 500ms is too fast.
- **Description textarea**: Use `data-cy="input-narrativeDescription" textarea` selector + `click()` then `fill()` then `press('Tab')` to trigger Angular change detection

## Role Switching (confirmed 2026-04-08)
- Use `pages.login.loginAsRole('RN')` / `loginAsRole('MD')` — handles logout → login → wait for dashboard
- `loginAsRole` checks if already on login page (skips logout) or logs out via `AuthHelper.logout()` first
- After role switch, call `TestDataManager.setRole('RN'/'MD')` to update physician/nurse context

## Page Objects & Workflows
- `pages/care-plan.page.ts` — Care Plan navigation, visits grid (findVisitByType, getVisitStatus), filters, visit frequency, MAR
- `pages/visit-recording.page.ts` — Create Visit modal, vitals BP, F2F narrative/attestation, INA narrative/signature/HIS, Death Assessment, completion (task/signature/discharge), edit visit
- `types/visit.types.ts` — VISIT_TYPES config (all 13 types), VisitTypeKey, helper functions
- `workflows/visit.workflow.ts` — Config-driven orchestration:
  - `createVisitByType(key)` — resolves role/type from VISIT_TYPES config
  - `recordF2FVisit()` / `recordINAVisit()` / `recordPostmortemVisit()` — recording implementations
  - `completeVisitByType(key, dateOptions)` — dispatches task/signature/discharge
  - `createAndRecordVisit(key, options)` — unified full flow (create → record → complete)

## Tests
- `tests/billing/e2e-hospice-medicare-visits.spec.ts` — **35 steps**: Full E2E: create patient → admit → verify claims → INA visit (RN) → Postmortem visit (RN) → verify 814 discharge claim + SIA + RLIS
- `tests/billing/face-to-face-hospice-medicare.spec.ts` — 15 steps: CR-2993 F2F visit validation (error states + visit recording)
- `tests/billing/debug-ina-visit.spec.ts` — 5 steps: INA visit debug (config-driven)
- `tests/billing/debug-f2f-visit.spec.ts` — 5 steps: F2F visit debug (config-driven)
- `tests/billing/debug-postmortem-visit.spec.ts` — 5 steps: Postmortem visit debug (config-driven)

## File Map
```
types/
└── visit.types.ts                 ← VISIT_TYPES config (all 13 types), VisitTypeKey, helpers

pages/
├── care-plan.page.ts              ← Care Plan grid, navigation, filters
├── login.page.ts                  ← loginAsRole(role) for multi-role tests
└── visit-recording.page.ts        ← Visit recording (Create Visit, vitals, F2F, INA, Death Assessment, completion)

workflows/
└── visit.workflow.ts              ← Config-driven orchestration (createVisitByType, recordF2F/INA/Postmortem, completeVisitByType)

fixtures/
└── page-objects.fixture.ts        ← visitRecording + visitWorkflow registered

tests/billing/
├── e2e-hospice-medicare-visits.spec.ts  ← Main E2E: INA + Postmortem + SIA billing
├── face-to-face-hospice-medicare.spec.ts ← CR-2993 F2F billing validation
└── debug-*.spec.ts                       ← Debug/verification specs (to be removed)

docs/test-cases/
└── CR-2993.md                     ← F2F billing validation test case
```

## How to Add a New Visit Type Test

The framework is config-driven. To add automation for a new visit type:

### 1. Check if config exists
Look in `types/visit.types.ts` → `VISIT_TYPES`. All 13 types are already configured with sections, URL segments, and complete flow types.

### 2. Add a recording method (if needed)
In `workflows/visit.workflow.ts`, add a `recordXxxVisit()` method that fills the required sections:
```typescript
async recordRoutineVisit(options?: { ... }): Promise<void> {
  // Navigate to required sections and fill them
  await this.visitRecording.navigateToINAVitals();
  await this.visitRecording.fillVitalsBloodPressure('120', '80');
  await this.visitRecording.navigateToSummary();
  await this.visitRecording.fillINANarrative(description, origin, category);
  // Add any visit-type-specific sections here
}
```

### 3. Register in the recording dispatch
In `createAndRecordVisit()`, add a case to the switch:
```typescript
case 'STANDARD_RN_18':
  await this.recordRoutineVisit(options);
  break;
```

### 4. Add page object methods for new sections
If the visit type has unique sections not yet in `visit-recording.page.ts`:
- Add selectors to the `selectors` object
- Add navigation + fill methods
- Use `getByRole` for Ionic interactive elements (NOT CSS `button:has-text`)

### 5. Add new section content fill methods
Each assessment section follows a pattern:
- **Vitals**: BP + Temperature + Pulse + etc. (shared across INA/Standard RN/Postmortem)
- **Clinical sections** (Pain, Respiratory, etc.): Coordination of Care + Narratives cards
- **Summary**: Coordination of Care + Narratives (origin-category style)
- **Supervisory Visit**: Records card with add button
- **Hospice Aide**: Tasks + Orientation + Parameters + Instructions + Notes

### 6. Verify in a test
Use the pattern from the E2E spec:
```typescript
await pages.visitWorkflow.createVisitByType('ROUTINE');
await pages.visitWorkflow.recordRoutineVisit();
await pages.visitWorkflow.completeVisitByType('ROUTINE', { visitDate });

// Verify in grid
await pages.patientDetails.clickSidebarTab('profile');
await pages.carePlan.navigateToCarePlan();
const row = await pages.carePlan.findVisitByType('Routine');
expect(row).toBeGreaterThanOrEqual(0);
```

### Visit types with confirmed recording implementations
| Visit Type | Key | Recording Method | Status |
|------------|-----|-----------------|--------|
| Face to Face | `F2F` | `recordF2FVisit()` | Done |
| Initial Nursing Assessment | `INA` | `recordINAVisit()` | Done |
| Postmortem Encounter | `POSTMORTEM` | `recordPostmortemVisit()` | Done |
| Routine | `ROUTINE` | — | Config ready, needs recording method |
| Emergent | `EMERGENT` | — | Config ready, shares STANDARD_RN_18 flow |
| Phone Call | `PHONE_CALL` | — | Config ready, shares STANDARD_RN_18 flow |
| Watch Care Visit | `WATCH_CARE` | — | Config ready, shares STANDARD_RN_18 flow |
| Comprehensive Assessment | `COMPREHENSIVE` | — | Config ready, shares STANDARD_RN_18 flow |
| Initial/Comprehensive | `INITIAL_COMPREHENSIVE` | — | Config ready, shares STANDARD_RN_17 flow |
| Supervisory Visit | `SUPERVISORY` | — | Config ready, unique 2-section flow |
| Hospice Aide Routine | `HOSPICE_AIDE_ROUTINE` | — | Config ready, unique 2-section flow |
| External Face to Face | `EXTERNAL_F2F` | — | Config ready, unique 1-section flow |
| LCD | `LCD` | — | Config ready, unique 13-section flow |
