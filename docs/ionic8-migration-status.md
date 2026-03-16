# Ionic 8 Migration — Status & Implementation Notes

**Last updated:** 2026-03-16 (Session 9)
**Branch:** `feat/ionic8-locator-diff`
**Test file:** `tests/ionic8/addpatient-ionic8.spec.ts`
**Target env:** qa2 (`https://clinical.qa2.curantissolutions.com`)

---

## Runtime Test Status (Latest)

### Test run: 2026-03-16 Session 9 — Full E2E admit flow verified

| Step | Status | Notes |
|------|--------|-------|
| Step 01: Navigate to Patient List | **PASS** | Rubik's cube → apps popover → "Patients" |
| Step 02: Create Hospice Patient | **PASS** | Patient created, ID captured via API |
| Step 03: Search and Open Patient Chart | **PASS** | Search + grid click + navigate to chart |
| Step 04a: Add Caller Information | **PASS** | Caller physician search: `select-search-physician` (ng-select) |
| Step 04b: Add Referrer Information | **PASS** | "Same as Caller" with timing wait |
| Step 04c: Add Referring Physician | **PASS** | ng-select physician search |
| Step 04d: Add Ordering Physician | **PASS** | ng-select physician search |
| Step 05a: Add Routine Home Care LOC | **PASS** | `btn-add-order` (was `btn-create-new-order-for-patient`), grid rows now `tr[data-cy^="row-order-created"]` |
| Step 05b: Void LOC and Recreate | **BLOCKED** | qa2 bug: `this.spinner.present is not a function` on void submit |
| Step 06a: Add Primary Diagnosis | **PASS** | `btn-add-diagnosis` (ion-fab), ng-select search pattern |
| Step 06a-edit: Edit Primary Diagnosis | **PASS** | `btn-edit-option` (was `button:has-text("Edit")`), ng-select edit works |
| Step 06b: Verify Profile checkmark | **PASS** | Duplicate nav-bar handled with `visible=true` locator |
| Step 07a: Add Care Team + Standard Roles | **PASS** | Role names have `*` suffix — `startsWith` match |
| Step 07b: Add Attending Physician | **PASS** | Physician search + date picker |
| Step 07c: Add Caregiver | **PASS** | Relationship + save |
| Step 07d: Verify Care Team checkmark | **PASS** | `visible=true` locator |
| Step 08a: Add Benefit | **PASS** | Payer name ng-select, plan name, ion-input |
| Step 08a-edit: Edit Benefit Period Start Date | **PASS** | Edit via more options button |
| Step 08b: Verify Benefits checkmark | **PASS** | `visible=true` locator |
| Step 09a: Add Consents | **PASS** | `btn-edit-option` pattern |
| Step 09a-edit: Edit Consents (mixed values) | **PASS** | Mixed yes/no values |
| Step 09b: Verify Consents checkmark | **PASS** | `visible=true` locator |
| Step 10a: Add Verbal Certification | **PASS** | Physician + date + received-by |
| Step 10a-edit: Edit Verbal Certification | **PASS** | `textarea-reason-for-change` (was `input-narrative-statement`) |
| Step 10b: Add Written Certification | **PASS** | `textarea-brief-narrative-statement` (was `input-narrative-statement`) |
| Step 10b-edit: Edit Written Certification | **BLOCKED** | qa2 bug: saved narrative not loaded in edit form |
| Step 10c: Verify Certifications checkmark | **PASS** | `visible=true` locator |
| Step 11: Verify All 5 Sections Complete | **PASS** | All checkmarks present |
| Step 12: Admit Patient and Confirm Modal | **PASS** | `btn-save-admission`, `input-admit-date` (cur-date-picker) |
| Step 13: Verify Admission Success | **PASS** | Admit button gone after admission |

### Key fixes in Session 9 (2026-03-16)

| File | Changes |
|------|---------|
| `fixtures/page-objects-ionic8.fixture.ts` | **NEW** — `createIonic8PageObjects()` factory (mirrors qa1 golden standard) |
| `pages_ionic8/dashboard.page.ts` | `navigateToModule` uses rubik's cube → apps popover for Patient/Billing/etc. |
| `pages_ionic8/diagnosis.page.ts` | `btn-add-diagnosis`, ng-select search, `btn-edit-option`, `visible=true` tab, `force:true` save |
| `pages_ionic8/patient-details.page.ts` | Admit modal: `btn-save-admission`/`btn-cancel-dialog`/`input-admit-date`; sidebar/checkmarks use `visible=true` locator |
| `pages_ionic8/loc.page.ts` | `btn-add-order`, `tr[data-cy^="row-order-created"]`, longer exit timeout |
| `pages_ionic8/care-team.page.ts` | `startsWith` for role names with `*` suffix |
| `pages_ionic8/certification.page.ts` | `textarea-brief-narrative-statement`, `textarea-reason-for-change` |
| `workflows_ionic8/patient-profile/caller-info.workflow.ts` | `select-search-physician` ng-select pattern for caller physician |
| `tests/ionic8/addpatient-ionic8.spec.ts` | Uses `po` factory; all steps un-skipped except 05b, 10b-edit |

---

## Verified qa2 Selectors (MCP-confirmed 2026-03-11)

### Patient List Page
| Element | qa2 data-cy | Page object had (WRONG) |
|---------|-------------|------------------------|
| Search bar | `input-search-patients` | `input-search` |
| Add patient button | `btn-add-patient` (ion-fab-button) | `btn-add` / `icon-add` |
| Patient rows | `item-patient-{N}` (div) | `row-patient-{N}` |
| Patient checkbox | `checkbox-patient-{N}` | — |
| Row children | No data-cy, positional: [checkbox, MRN, ID, LastName, FirstName, Team, CareType, Status] | Had `label-patient-name-{N}`, `link-patient-profile-{N}` (don't exist) |

### Add Patient Modal (ion-modal dialog)
| Element | qa2 data-cy | Page object had (WRONG) |
|---------|-------------|------------------------|
| Form | `form-patient-details` | ✓ correct |
| Care type | `radio-type-of-care-hospice/palliative/evaluation` (RADIO) | `select-care-type` (ng-select) |
| Gender | `radio-gender-male/female` (RADIO) | `select-gender` (ng-select) |
| Veteran | `radio-veteran-yes/no` (RADIO) | `select-veteran` (ng-select) |
| SSN unknown | `checkbox-unknown` | `checkbox-unknown-ssn` |
| Ethnicity HIS | `select-his-ethnicity` (ng-select) | `select-ethnicity` |
| Phone | `input-phone` | `input-phone-number` |
| Email | `input-email` | `input-email-address` |
| Zip ext | `input-zip-code-ext` | `input-zip-extension` |
| County | `select-county` (ng-select) | `input-county` |
| Same address | `checkbox-same-address` | `checkbox-same-as-home-address` |
| Save | `btn-add-patient-save` | `btn-save-patient-details` |
| Cancel | `btn-add-patient-cancel` | `btn-cancel-patient-details` |
| Skilled bed | `radio-skilled-bed-yes/no` (RADIO) | ✓ correct |
| Living will | `radio-living-will-yes/no` (RADIO) | — (new field) |
| Code status | `select-code-status` (ng-select) | — (new field) |
| Risk priority | `select-risk-priority` (ng-select) | — (new field) |
| Emergency prep | `textarea-emergengy-preparedness` | — (new field) |

### HIS Ethnicity Options (ng-select, multiselect)
- American Indian or Alaska Native
- Asian
- Black or African American
- Hispanic or Latino
- Native Hawaiian or Other Pacific Islander
- White

### HOPE Ethnicity Options
- No, Not of Hispanic, Latino/a, or Spanish Origin
- Yes, Mexican, Mexican American, or Chicano/a
- Yes, Puerto Rican
- Yes, Cuban
- Yes, Another Hispanic, Latino/a, or Spanish Origin
- Patient Unable to Respond
- Patient Declines to Respond

### Patient Details Page (profile/chart)
| Element | qa2 data-cy |
|---------|-------------|
| Edit patient details | `btn-edit-patient-details` |
| Edit caller | `btn-edit-caller` |
| Caller section | `section-caller` |
| Caller content | `content-caller`, `list-caller` |
| Caller fields (read) | `text-caller-relation-type`, `text-caller-referral-type`, `text-caller-name`, etc. |
| Edit referrer | `btn-edit-referrer` |
| Edit referring physician | `btn-edit-referring-physician` |
| Edit ordering physician | `btn-edit-ordering-physician` |
| Edit hospice transfer | `btn-edit-hospice-transfer` |
| Edit pharmacy | `btn-edit-pharmacy` |
| Edit funeral home | `btn-edit-funeral-home` |
| Edit referral credit | `btn-edit-referral-credit` |
| Edit option button | `btn-edit-option` |

---

## Verified qa2 Selectors — Caller Form (MCP-confirmed 2026-03-12)

| Element | qa2 data-cy | Type |
|---------|-------------|------|
| Form container | `form-caller` | form |
| Referral type | `select-referral-type` | ng-select |
| Relation | `select-relation-type` | ng-select |
| First name | `input-first-name` | ion-input |
| Last name | `input-last-name` | ion-input |
| NPI | `input-npi` | ion-input |
| Phone | `input-phone-number` | ion-input |
| Mobile | `input-mobile-number` | ion-input |
| Fax | `input-fax-number` | ion-input |
| Email | `input-email-address` | ion-input |
| State | `select-state` | ng-select |
| County | `select-county` | ng-select |
| Situation notes | `textarea-situation-notes` | ion-textarea |
| Save | `btn-save` | ion-button |
| Cancel | `btn-cancel` | ion-button |

## Verified qa2 Selectors — Referrer Form (MCP-confirmed 2026-03-12)

| Element | qa2 data-cy | Type |
|---------|-------------|------|
| Form container | `form-referrer` | form |
| Same as Caller | `checkbox-same-as-caller` | ion-checkbox |
| Relation | `select-relation-type` | ng-select |
| Search physician | `select-search-physician` | ng-select |
| First/Last/NPI/Phone/Email | Same as caller form | ion-input |
| Save/Cancel | `btn-save` / `btn-cancel` | ion-button |

## Verified qa2 Selectors — Referring/Ordering Physician Form (MCP-confirmed 2026-03-12)

| Element | qa2 data-cy | Type |
|---------|-------------|------|
| Form container | `form-referring-physician` | form |
| Same as Referrer | `checkbox-same-as-referrer` | ion-checkbox |
| Relation | `input-relation` (readonly, auto "Physician") | ion-input |
| Search physician | `select-search-physician` | ng-select |
| Credentials | `select-credentials` | ng-select |
| First/Last/NPI/Phone/Email | Same pattern as caller | ion-input |
| Save/Cancel | `btn-save` / `btn-cancel` | ion-button |

**Note:** Both referring and ordering physician forms share `checkbox-same-as-referrer` data-cy. Since they open as separate ion-modals, the selector is unambiguous.

---

## Verified qa2 Selectors — Care Team (MCP-confirmed 2026-03-12)

### Care Team Selection
| Element | qa2 data-cy | Type |
|---------|-------------|------|
| Care team dropdown | `select-care-team` | ng-select |

### Care Team Member Modal (role assignment)
| Element | qa2 data-cy | Type |
|---------|-------------|------|
| Modal content | `content-care-teams-modal` | ion-content |
| Role select (disabled) | `select-team-role` | ng-select |
| Member select | `select-person-0` (indexed) | ng-select |
| Save | `btn-done-care-team` | ion-button |
| Cancel | `btn-cancel-care-team` | ion-button |
| Add new member fab | `btn-add-new-member` | ion-fab-button |

**Note:** Role options icon (`btn-team-role-options-{N}`) opens ion-popover with `btn-add-option` → then modal opens.

### Attending Physician Modal
| Element | qa2 data-cy | Page object had (WRONG) |
|---------|-------------|------------------------|
| Physician select | `select-physician` | `select-select-physician` |
| Start date | `input-start-date` (cur-date-picker) | `datetime-picker-start` |
| Save | `btn-save-physician` | `btn-done` |
| Cancel | `btn-cancel-physician` | `btn-cancel` |

### Caregiver Modal
| Element | qa2 data-cy | Type |
|---------|-------------|------|
| Modal content | `content-caregiver-modal` | ion-content |
| Relationship | `select-relationship` | ng-select |
| First/Last name | `input-first-name`, `input-last-name` | ion-input (need `input` suffix) |
| Phone/Mobile/Fax/Email | `input-phone`, `input-mobile`, `input-fax`, `input-email` | ion-input |
| Primary contact | `checkbox-primary-contact` | ion-checkbox |
| Address/City | `input-address`, `input-city` | ion-input |
| State | `select-state` | ng-select |
| ZIP/Ext | `input-zipcode`, `input-zip-extension` | ion-input |
| Save | `btn-done-caregiver` | ion-button |
| Cancel | `btn-cancel-caregiver` | ion-button |

**Note:** All ion-input fields in caregiver modal require targeting inner `input` element (e.g., `[data-cy="input-first-name"] input`).

---

## Verified qa2 Selectors — Consents (MCP-confirmed 2026-03-12)

### Consents List View
| Element | qa2 data-cy | Type |
|---------|-------------|------|
| Card | `card-consents` | ion-card |
| Card content | `card-content-consents` | ion-card-content |
| Header row | `row-consents-header` | ion-row |
| Label | `label-consents` | span |
| Actions container | `container-consents-actions` | div |
| More options | `btn-consents-page-more` | ion-icon (ellipsis-vertical) |
| Details toggle | `btn-consents-details` | ion-icon |
| Consent item rows | `row-consent-item-{N}` (0–8) | ion-row |

### Consents More Options Popover
| Element | qa2 data-cy | Page object had (WRONG) |
|---------|-------------|------------------------|
| Edit button | `btn-edit-option` | `getByRole('button', { name: 'create' })` |

### Consents Edit Form (radio buttons — all unique per type)
| Element | qa2 data-cy | Type |
|---------|-------------|------|
| All Records Obtained | `radio-all-records-yes/no` | ion-radio |
| ROI Consent | `radio-roi-consent-yes/no` | ion-radio |
| CAHPS Reporting | `radio-allow-data-publication-yes/no` | ion-radio |
| Hospice Election Form | `radio-hospice-election-form-yes/no` | ion-radio |
| Health Care Proxy | `radio-health-care-proxy-yes/no` | ion-radio |
| Acknowledgment of Care | `radio-acknowledgment-of-care-yes/no` | ion-radio |
| Financial Power of Attorney | `radio-financial-power-of-attorney-yes/no` | ion-radio |
| Durable Power of Attorney | `radio-durable-power-of-attorney-yes/no` | ion-radio |
| Provider Referral/Orders | `radio-provider-referral-orders-yes/no` | ion-radio |
| Save | `btn-save` | ion-button |
| Cancel | `btn-cancel` | ion-button |

**Key improvement over qa1:** Each consent type has unique `data-cy` — no more shared `radio-allow-data-publication` with nth() indexing.

---

## Verified qa2 Selectors — Benefits Form (MCP-confirmed 2026-03-12)

### Benefits List View
| Element | qa2 data-cy | Type |
|---------|-------------|------|
| Add benefit button | `btn-add-benefit` | ion-fab-button |
| Benefits card | `card-patient-benefits` | ion-card |
| Benefits grid | `container-benefits-grid` | table |
| Header row | `row-header-active-benefits` | tr |
| Active benefit row | `row-active-benefit-{N}` | tr |
| More options | `btn-show-more-options-{N}` | ion-icon |
| Expand details | `btn-benefits-details-{N}` | td |
| Payers tab | `tab-payers` | ion-tab-button |
| Eligibility tab | `tab-eligibility` | ion-tab-button |

### Benefits More Options Popover
| Element | qa2 data-cy | Type |
|---------|-------------|------|
| Options list | `list-patient-benefits-options` | ion-list |
| Edit | `btn-edit-benefit` | ion-item |
| Copy to Edit | `btn-copy-benefit` | ion-item |
| Hold Benefit | `btn-hold-benefit` | ion-item |

### Benefits Add/Edit Form
| Element | qa2 data-cy | Page object had (WRONG) | Type |
|---------|-------------|------------------------|------|
| Payer Level | `select-payer-level-list` | ✓ correct | ng-select |
| Payer Type | `select-payer-type-list` | ✓ correct | ng-select |
| Payer Name | `select-payer-name` | `input-search-input` custom pattern | ng-select (type-ahead) |
| Payer Effective Date | `date-payer-effective-date` | ✓ correct | cur-date-picker |
| VBID | `checkbox-vbid` | ✓ correct | ion-checkbox |
| Medicare # | `input-medicare-number` | ✓ correct | ion-input |
| Medicaid # | `input-medicaid-number` | ✓ correct | ion-input |
| Medicaid Pending | `checkbox-medicaid-pending` | ✓ correct | ion-checkbox |
| Plan Name | `select-plan-name` | `#planName` | ng-select |
| Eligibility Verified | `checkbox-patient-eligivility` | ✓ correct | ion-checkbox |
| Relationship | `select-relationships` | ✓ correct | ng-select |
| Group Number | `input-group-number` | ✓ correct | ion-input |
| Date of Birth | `date-birth` | (missing) | cur-date-picker |
| First/Last/Middle | `input-first-name`, `input-last-name`, `input-middle-initial` | ✓ correct | ion-input |
| Address/City | `input-address`, `input-city` | ✓ correct | ion-input |
| State | `input-state` | `select-state` | ng-select |
| Zip/Ext | `input-zipcode`, `input-zipcode-extension` | ✓ correct | ion-input |
| Phone/Email | `input-phone`, `input-email` | ✓ correct | ion-input |
| Additional Info | `textarea-additional-info` | ✓ correct | ion-textarea |
| Policy Number | `input-policy-number-{N}` | ✓ correct | ion-input |
| Subscriber Effective Date | `date-subscriber-effective-date-{N}` | ✓ correct | cur-date-picker |
| Subscriber Expired Date | `date-subscriber-expired-date-{N}` | ✓ correct | ion-input (readonly) |
| Benefit Election Date | `date-benefit-election-date` | ✓ correct | cur-date-picker |
| Admit Benefit Period | `input-admit-benefit-period` | ✓ correct | ion-input |
| Benefit Period Start Date | `date-admit-benefit-period-start-date` | ✓ correct (method was wrong) | cur-date-picker |
| High Days Used | `input-routine-home-care-high-days-used` | ✓ correct | ion-input (spinbutton) |
| Date of Final Bill | `date-off-final-bill` | (missing) | cur-date-picker |
| Add Subscriber ID | `btn-add-new-subscriber-id` | (new) | ion-fab-button |
| Add Authorization | `btn-add-new-authorization` | (new) | ion-fab-button |
| Save | `btn-save` | ✓ correct | ion-button |
| Cancel | `btn-cancel` | ✓ correct | ion-button |

**Key fixes:**
- **Payer Name** was using custom `input-search-input` / `input-filtered-options` pattern — now uses ng-select type-ahead
- **Plan Name** selector was `#planName` — now `[data-cy="select-plan-name"]`
- **State** selector was `select-state` — now `input-state`
- **All ion-input fields** need `[data-cy="..."] input` suffix to target inner native input
- **fillBenefitPeriodStartDate** was using label-based `getByRole('button', { name: 'custom calendar' })` which silently failed — now uses `cur-date-picker[data-cy="..."] button`
- **Edit flow**: `btn-show-more-options-{N}` → popover with `btn-edit-benefit` (was text-based "more" button search)

---

## What Was Done (Session 8 — 2026-03-12)

### Void LOC Investigation (MCP-confirmed)

Investigated the Void LOC → Recreate flow on qa2 for patient 214095.

**Void modal selectors — all correct:**
| Element | qa2 data-cy | Status |
|---------|-------------|--------|
| Options popover | `order-created-row-btn-show-edit-view-options-popover` | ✓ works |
| Void menu item | `btn-void-loc` | ✓ works (via popover) |
| Void date | `input-void-date` (cur-date-picker, pre-filled with today) | ✓ works |
| Void reason | `input-void-reason` (input, placeholder "Please be specific") | ✓ works |
| Submit void | `btn-submit-void-order` | ✓ works (but see bugs below) |
| Cancel void | `btn-cancel-void-order` | ✓ works |
| Confirm dialog | `ion-alert button:has-text("Yes")` | Not triggered in this flow |

**Void flow on qa2 (observed):**
1. Click options popover → "Void Order"
2. Void modal opens with warning: "Voiding the only Level of Care order will remove the patient's current LOC assignment..."
3. Fill void reason → Submit becomes enabled
4. **BUG:** First Submit click triggers `TypeError: this.spinner.present is not a function` — void does NOT submit
5. Second Submit click (via `element.click()`) actually submits the void
6. Order row shows "Voided" status in grid
7. **"Add Order" dialog** auto-opens with Order Type = "Level of Care" (disabled/locked), Cancel disabled, **Proceed** button (`data-cy="btn-submit-order"`)
8. Click Proceed → page hangs/becomes unresponsive (empty accessibility snapshot, screenshot shows modal still visible)

**qa2 Bugs Found:**
- **`this.spinner.present is not a function`** — void submit handler crashes on first click, spinner service is broken
- **Add Order "Proceed" hangs** — after void, the Proceed button doesn't reliably transition to the LOC form

**Conclusion:** Void LOC flow is blocked by qa2 app bugs. The `voidAndRecreateLOCOrder` workflow logic is correct but the app itself is unstable. Step 05b test added but skipped pending app fixes.

### Files Modified

| File | Changes |
|------|---------|
| `pages_ionic8/loc.page.ts` | `navigateToProfile()`: added `.last()` for qa2 duplicate nav-bar |
| `tests/ionic8/step04a-debug.spec.ts` | Added Step 05b (Void LOC and Recreate as Respite Care) — skipped, blocked by qa2 bug |

---

## What Was Done (Session 7 — 2026-03-12)

### Files Modified

| File | Changes |
|------|---------|
| `pages_ionic8/certification.page.ts` | **Physician inputs**: `input[data-cy="..."]` → `[data-cy="..."] input` (ion-input needs inner native input target); **Received-by inputs**: same pattern fix; **Narrative textarea**: `textarea[data-cy="..."]` → `[data-cy="..."] textarea` (ion-textarea needs inner target), added `.first()` for edit mode (shares data-cy with reason-for-change); **Save/Cancel**: `btn-save` → `btn-save-certification-v2`, `btn-cancel` → `btn-cancel-certification-v2`; **Edit menu**: `button:has-text("Edit")` → `ion-item:has-text("Edit")`; **Nav tab**: added `.last()` to handle qa2 duplicate nav-bar |
| `tests/ionic8/step04a-debug.spec.ts` | Added Step 10a (add verbal), 10b (add written), 10a-edit (edit verbal), 10b-edit (edit written — skipped, app bug) |

### Key Discoveries (Session 7)
1. **Physician fields exist as `ion-input`** — `data-cy` is on the wrapper, not the native `input`. Need `[data-cy="..."] input` pattern (same as other ion-inputs)
2. **No ng-selects in cert form** — physician search is custom `ion-input` + dropdown toggle pattern
3. **Save/Cancel use `-certification-v2` suffix** — `btn-save-certification-v2` / `btn-cancel-certification-v2` (NOT generic `btn-save`/`btn-cancel`)
4. **Narrative is `ion-textarea`** — needs inner `textarea` target for `fill()` to work
5. **Edit mode has 2 textareas with same `data-cy`** — narrative statement + reason for change both use `input-narrative-statement`. Use `.first()` for narrative, `.last()` for reason
6. **Edit menu items are `ion-item`** — no `data-cy`, use `ion-item:has-text("Edit")`
7. **qa2 BUG: Written cert edit doesn't load saved narrative** — field appears empty in edit form, Save stays disabled. Re-verify after fix

---

## What Was Done (Session 5 — 2026-03-12)

### Files Modified

| File | Changes |
|------|---------|
| `pages_ionic8/benefits-add.page.ts` | **Payer Name**: removed `input-search-input`/`input-filtered-options` selectors, rewrote `selectPayerName` to ng-select type-ahead; **Plan Name**: `#planName` → `select-plan-name`, simplified `selectPlanNameByIndex`; **State**: `select-state` → `input-state`, simplified `selectSubscriberState`; **All ion-input fills**: `input[data-cy="..."]` → `[data-cy="..."] input`; **Edit flow**: added `showMoreOptions(N)`, `editBenefitOption`, `copyBenefitOption`, `holdBenefitOption` selectors, rewrote `clickMoreButtonByPayerLevel` and `clickEditButton`; **Date of Birth**: added `dateOfBirth` selector; **fillBenefitPeriodStartDate**: label-based → data-cy `button` click; **fillPolicyNumber**: simplified, removed `.click-block-active` wait |
| `workflows_ionic8/benefits.workflow.ts` | No changes needed — workflow logic correct, page object fixes sufficient |
| `pages_ionic8/consents.page.ts` | **clickEditButton**: `getByRole('button', { name: 'create' })` → `[data-cy="btn-edit-option"]` |
| `workflows_ionic8/consents.workflow.ts` | No changes needed — workflow logic correct |
| `tests/ionic8/addpatient-ionic8.spec.ts` | Skipped all checkmark verification steps (06b, 07d, 08b, 09b, 10c, 11) — qa2 duplicate nav-bars |
| `tests/ionic8/step04a-debug.spec.ts` | Added Step 08a (add benefit), 08a-edit (benefit period start date), 09a (add consents), 09a-edit (edit consents mixed values); skipped checkmarks |

### Key Discoveries (Session 5)
1. **Payer Name is ng-select** — not the custom `input-search-input` / `input-filtered-options` pattern from qa1
2. **Plan Name data-cy**: `select-plan-name` (not `#planName` ID selector)
3. **State data-cy**: `input-state` (not `select-state`)
4. **All ion-input fields** need `[data-cy="..."] input` to target inner native input (same pattern as caregiver modal)
5. **fillBenefitPeriodStartDate** silently failed — `getByRole('button', { name: 'custom calendar' })` didn't match; fixed to use `cur-date-picker button`
6. **Benefits list is a `<table>`** — not ion-rows; edit via `btn-show-more-options-{N}` → popover with `btn-edit-benefit`
7. **Checkmark selectors broken on qa2** — duplicate nav-bar components cause `[data-cy="icon-nav-bar-item-{section}"]` to resolve to 2 elements; all checkmark tests skipped
8. **Medicare # auto-populates** from subscriber ID when payer type is Medicare (field becomes disabled)
9. **Consents edit popover**: uses `btn-edit-option` (not `getByRole('button', { name: 'create' })`)
10. **Consents radio selectors all correct** — unique per consent type, no fixes needed

---

## What Was Done (Session 4 — 2026-03-12)

### Files Modified

| File | Changes |
|------|---------|
| `pages_ionic8/care-team.page.ts` | **Team selection**: `selectCareTeam` changed from custom `input-search-input` → ng-select inner input + `ng-dropdown-panel`; **Role member modal**: `select-person` → `select-person-0`, `btn-done` → `btn-done-care-team`; **Attending Physician**: `select-select-physician` → `select-physician`, `datetime-picker-start` → `input-start-date`, added `clickPhysicianSave` with `btn-save-physician`; **Caregiver**: all ion-input fields now target inner `input` element, relationship uses ng-select dropdown, added `clickCaregiverSave` with `btn-done-caregiver`; all other dropdowns (`selectAttendingPhysician`, `selectRelationship`, `selectCaregiverState`) converted to ng-select pattern |
| `workflows_ionic8/care-team.workflow.ts` | `fillAttendingPhysician` → `clickPhysicianSave()` (was `clickDone()`); `fillCaregiverDetails` → `clickCaregiverSave()` (was `clickDone()`) |
| `pages_ionic8/loc.page.ts` | No changes needed — selectors already verified |
| `tests/ionic8/step04a-debug.spec.ts` | Added Step 05 (LOC), Step 06 (diagnosis, skipped — qa2 bug), Step 07a-c (care team) |

### Key Discoveries (Session 4)
1. **LOC page selectors all correct** — no fixes needed, verified from prior session
2. **Diagnosis + button missing on qa2** — known qa2 bug, Step 06 skipped
3. **Care team dropdowns are all ng-selects** — team select, member select, relationship, state, physician
4. **Each modal has its own save button** — `btn-done-care-team`, `btn-save-physician`, `btn-done-caregiver` (NOT a shared `btn-done`)
5. **ion-input fields need `input` suffix** — `[data-cy="input-first-name"] input` to target the inner native input
6. **Role options flow**: icon click → popover with `btn-add-option` → modal opens (two-step, not direct)
7. **Attending physician selector**: `select-physician` (was `select-select-physician` — extra "select-" prefix was wrong)

---

## What Was Done (Session 3 — 2026-03-12)

### Files Modified

| File | Changes |
|------|---------|
| `pages_ionic8/patient-details.page.ts` | **Caller section**: removed complex `ion-content:has(...)` scoped selectors → clean `ion-modal [data-cy="..."]` pattern; `select-relation` → `select-relation-type`; **Referrer section**: same cleanup, relation → ng-select, search → ng-select; **Physician sections**: search from `.referring-physician-content` class → `[data-cy="select-search-physician"]` ng-select; save/cancel → `ion-modal [data-cy="btn-save/cancel"]`; added `referringPhysicianSearchInput` and `orderingPhysicianSearchInput` selectors |
| `workflows_ionic8/patient-profile/caller-info.workflow.ts` | Added `selectNgOption` import; referral type + relation selection changed from `ion-popover ion-item` → `selectNgOption`; all selectors reference page object; save uses `force: true` |
| `workflows_ionic8/patient-profile/referrer-info.workflow.ts` | Added `selectNgOption` import; relation selection → `selectNgOption`; timing fix: `networkidle` + 2s wait before "Same as Caller" checkbox click; save uses `force: true` |
| `workflows_ionic8/patient-profile/referring-physician.workflow.ts` | Physician search changed from `.fill()` on input → ng-select click + inner input fill + dropdown pick; save uses `force: true` |
| `workflows_ionic8/patient-profile/ordering-physician.workflow.ts` | Same ng-select search pattern as referring physician; save uses `force: true` |
| `tests/ionic8/step04a-debug.spec.ts` | **New** — fast iteration test, reuses existing patient (skips creation) |

### Key Discoveries (Session 3)
1. **All form dropdowns are ng-selects** — caller referral type, caller relation, referrer relation, physician search all use `selectNgOption` or ng-select type-ahead
2. **Caller relation data-cy**: `select-relation-type` (NOT `select-relation`)
3. **Physician search is ng-select type-ahead**: click to open → fill inner `input` → pick from `ng-dropdown-panel .ng-option-label`
4. **ion-modal footer intercepts clicks**: all save buttons need `{ force: true }`
5. **"Same as Caller" timing**: referrer form needs `networkidle` + wait before checkbox click, otherwise shows "Please select Caller first!"
6. **Add vs Edit buttons**: empty sections show `btn-add-{section}` (fab), filled sections show `btn-edit-{section}` (icon)

### Standards Applied
- **Single source of truth**: all selectors in `patient-details.page.ts`, no hardcoded data-cy in workflows
- **Consistent patterns**: all ng-select dropdowns use `selectNgOption` from `form-helpers`
- **ion-modal scoping**: form field selectors use `ion-modal [data-cy="..."]` (clean, one modal at a time)

---

## What Was Done (Session 2 — 2026-03-11)

### Files Modified

| File | Changes |
|------|---------|
| `pages_ionic8/patient.pagenew.ts` | **Complete rewrite of selectors** — care type/gender/veteran changed from ng-select to radio buttons; search bar, add button, patient row selectors all corrected; grid methods updated for new row structure; `selectNgOption` made robust with scroll + timeout + dropdown close |
| `workflows_ionic8/patient-profile/patient-creation.workflow.ts` | Fixed form wait selector; updated default ethnicity from 'Not Hispanic' to 'White' for HIS field |

### Key Discoveries
1. **Add Patient form opens as ion-modal** — not inline. Care type, gender, veteran are RADIO buttons (same as qa1!), NOT ng-selects as SELECTOR-DIFF.md claimed
2. **Patient list selectors** match qa1 pattern: `item-patient-{N}` (not `row-patient-{N}`), `btn-add-patient` (not `btn-add`)
3. **Ethnicity fixture mismatch** — HIS ethnicity has race options (White, Asian, etc.), not "Not Hispanic". HOPE has long-form options
4. **Pressing Escape in ng-select inside ion-modal closes the MODAL** — must use alternative close (click arrow wrapper or Tab)
5. **Caller/referrer forms** use `btn-edit-caller` etc. instead of `btn-add-caller`
6. **Referral type dropdown** is ng-select (not ion-popover) — `selectReferralType` in caller workflow needs update

---

## What Was Done (Session 1 — 2026-03-11)

### Goal
Fix 147 TypeScript compilation errors in the ionic8 test by adding missing methods to page objects.

### Files Modified (Session 1)

| File | Changes |
|------|---------|
| `pages_ionic8/patient.pagenew.ts` | Fixed `@utils/date-helper` import → `../utils/date-helper` |
| `pages_ionic8/login.page.ts` | Added `force: true` to Sign In button click |
| `pages_ionic8/patient-details.page.ts` | Added ~50 selectors + ~12 methods (sidebar, checkmarks, admit, caller/referrer/physician forms, getSelector) |
| `pages_ionic8/benefits-add.page.ts` | Added ~15 selectors + ~30+ methods (payer/subscriber/eligibility/R&B) |
| `pages_ionic8/care-team.page.ts` | Added ~25 methods (edit/delete roles, physician date, caregiver fields) |
| `pages_ionic8/certification.page.ts` | Added ~20 selectors + ~15 methods (benefit period, verbal/written cert) |
| `pages_ionic8/consents.page.ts` | Added 4 methods (add/more button visibility, add consents, complete form) |
| `pages_ionic8/diagnosis.page.ts` | Added 2 methods (add diagnosis, verify principal diagnosis) |
| `workflows_ionic8/patient-profile/patient-creation.workflow.ts` | Fixed care type wait selector |

### Compilation: 147 errors → 0 errors

---

## Verified qa2 Selectors — Certification Form (MCP-confirmed 2026-03-12)

### Verbal Form
| Element | qa2 data-cy | Tag | Notes |
|---------|-------------|-----|-------|
| Content | `content-certification-v2` | ion-content | |
| Verbal radio | `radio-certification-verbal` | ion-radio | |
| Written radio | `radio-certification-written` | ion-radio | |
| Benefit period dates | `input-benefits-period-dates` | ion-input | |
| Benefit period dropdown | `btn-show-benefits-periods` | ion-icon | |
| Benefit period close | `btn-show-benefits-periods-false` | div | |
| Benefit period option | `btn-set-benefits-period1` (no dash) | div | |
| Hospice Physician | `input-hospice-physician` | ion-input | Need `[data-cy] input` pattern |
| Hospice physician toggle | `btn-show-certifying-physician-options-true` | ion-icon | |
| Hospice physician option | `btn-show-certifying-physician-options-{N}` | div | |
| Obtained on (certifying) | `date-obtained-on-picker` | cur-date-picker | |
| Received by (certifying) | `input-recieved-by` (typo in app) | ion-input | |
| Attending Physician | `input-attending-physician` | ion-input | Need `[data-cy] input` pattern |
| Attending physician toggle | `btn-show-physician-options-true` | ion-icon | |
| Attending physician option | `btn-attending-physician-options{N}` | div | |
| Obtained on (attending) | `date-obtained-on` | cur-date-picker | |
| Received by (attending) | `input-received-by` | ion-input | |

### Written Form
| Element | qa2 data-cy | Tag | Notes |
|---------|-------------|-----|-------|
| Benefit period dates | `input-benefit-period-dates` | ion-input | |
| Benefit period dropdown | `btn-show-benefits-periods` | ion-icon | |
| Benefit period 2nd toggle | `btn-show-benefits-periods-2` | ion-icon | |
| Benefit period option | `btn-set-benefits-period-1` (with dash) | div | |
| Narrative statement | `input-narrative-statement` | ion-textarea | Need inner `textarea` target |
| Narrative on file | `checkbox-narrative-on-file` | ion-checkbox | |
| Hospice Physician | `input-hospice-physician` | ion-input | Same as verbal |
| Hospice physician toggle | `btn-show-certifying-true` | ion-icon | Different from verbal |
| Signed on (certifying) | `date-signed-on-picker` | cur-date-picker | |
| Attending Physician | `input-attending-physician` | ion-input | Same as verbal |
| Attending physician toggle | `btn-show-physician-options` | ion-icon | Different from verbal |
| Signed on (attending) | `date-signed-on-picker2` | cur-date-picker | |
| Signature received | `checkbox-signature-received` | ion-checkbox | |

### Footer (both forms)
| Element | qa2 data-cy | Tag |
|---------|-------------|-----|
| Save | `btn-save-certification-v2` | ion-button |
| Cancel | `btn-cancel-certification-v2` | ion-button |

### Edit popover
| Element | data-cy | Notes |
|---------|---------|-------|
| Edit | none | `ion-item:has-text("Edit")` |
| Print | none | `ion-item:has-text("Print")` |

### List view (verified)
| Element | qa2 data-cy |
|---------|-------------|
| Verbal options | `btn-certification-options-{N}` |
| Written options | `btn-certification-written-options-{N}` |
| Verbal row columns | `col-verbal-{field}-{N}` (no `-rm-` suffix) |
| Written row columns | `col-written-{field}` (no index, no `-rm-` suffix) |

### Known qa2 Bugs
- **Written cert edit doesn't load saved narrative** — field appears empty in edit form, Save stays disabled. Re-verify after app fix.
- **Void LOC submit crashes** — `this.spinner.present is not a function` on first Submit click; void only works on retry. After void, "Add Order → Proceed" hangs. Re-verify after app fix.

## Next Steps

1. **Step 05b: Void LOC** — re-enable after qa2 spinner/Proceed bug fix
2. **Step 10b-edit: Edit Written Cert** — re-enable after qa2 narrative bug fix
3. **Step 12: Admit Patient** — verify admit modal selectors
3. **Step 13: Verify Admission Success** — verify post-admit state
4. **Step 06: Diagnosis** — re-enable after qa2 bug fix (+ button missing)
5. **Checkmark verification** — re-enable after qa2 fixes duplicate nav-bar issue
6. **Clean up**: Remove `step04a-debug.spec.ts` when no longer needed for iteration

---

## Architecture Reminder

```
pages_ionic8/          → Page objects with ionic8 selectors
workflows_ionic8/      → Workflow orchestration (same logic, uses ionic8 page objects)
tests/ionic8/          → Test specs (same flow as original, uses ionic8 imports)
pages/base.page.ts     → Shared base (used by both qa1 and qa2 page objects)
utils/                 → Shared utilities (form-helpers, date-helper, etc.)
```

---

## Commands

```bash
# Compile check (should be 0 errors)
npx tsc --noEmit tests/ionic8/addpatient-ionic8.spec.ts

# Run test headed
npx playwright test tests/ionic8/addpatient-ionic8.spec.ts --headed

# Run specific steps only
npx playwright test tests/ionic8/addpatient-ionic8.spec.ts --headed -g "Step 01|Step 02|Step 03"

# Run from step 04a onwards
npx playwright test tests/ionic8/addpatient-ionic8.spec.ts --headed -g "Step 04a"
```
