# Billing Module Knowledge Base

## Navigation
- Rubik's Cube: `page.getByRole('button', { name: 'apps Image' })` or `[data-cy="btn-options-applications"]`
- Billing menu item: `page.getByRole('button', { name: 'Billing' })` in apps overlay
- URL after navigation: `#/billing/claim-management`

## Page Structure
- Left sidebar nav: Eligibility, Claim Management, Payment Management, Reports Management, Month-End Close
- Main tabs within Claim Management: **REVIEW** | **READY** | 837 Batch Management
- Secondary tabs (shown after filter applied): **Claims** | **Notices** | R&B

## Page Objects
- `pages/billing/claims.page.ts` — Claim Management (REVIEW + READY tabs), Generate Claim modal
- `pages/billing/batch-management.page.ts` — 837 Batch Management grid, Batch Options modal
- `pages/billing/accounts-receivable.page.ts` — AR grid, Download Claim modal

## Confirmed Selectors

### Filter Panel
| Element | Selector |
|---------|----------|
| Care Type dropdown | `[data-cy="select-care-type"]` (click-cover overlay — use JS click) |
| Hospice option | `page.getByTestId('input-filtered-options-0').getByText('Hospice')` |
| Filter button | `[data-cy="btn-apply-filters-os"]` |
| Search input (Claims) | `[data-cy="searchbar-search-claim-management"] input` |

### Tabs
- REVIEW/READY: use `getByText('REVIEW'/'READY', { exact: true })` (data-cy is swapped)
- Secondary: use `getByText('Claims'/'Notices'/'R&B', { exact: true })`
- Tab switching resets filters — must re-apply Hospice filter each time

### Claims Grid (0-indexed)
| Element | Selector |
|---------|----------|
| Claim ID | `label-claim-id-{i}` |
| Patient Name | `label-patient-name-{i}` |
| Patient Chart ID | `label-patient-external-id-{i}` |
| Bill Type | `label-bill-type-{i}` |
| Payer Name | `label-payer-name-{i}` |
| Service Start/End | `label-service-start-date-{i}` / `label-service-end-date-{i}` |
| Row Checkbox | `checkbox-toggle-claim-{i}` |
| Expand Row | `btn-show-details-{i}` |
| Download PDF/UB04 | `btn-download-pdf-{i}` |
| Error Count | `label-claim-validation-dto-list-{i}` |
| Generate Claim | `button:has-text("Generate Claim")` |

### Generate Claim Modal
- Post Date input: `ion-modal #date-value` (readonly — click to open ngb-datepicker)
- Submit Batch: `getByRole('button', { name: 'Submit Batch' })`
- Success dialog: `getByRole('button', { name: 'Close', exact: true })`

### 837 Batch Management (0-indexed)
| Element | Selector |
|---------|----------|
| Main Tab | `btn-tab-eightthirtyseven-management` |
| Search | `searchbar-search-eight-thirty-seven` |
| Batch Name | `label-batch-name-{i}` |
| Payer Name | `label-payer-name-{i}` |
| Total Claims | `label-total-claims-{i}` |
| Post Date | `label-post-date-{i}` |
| Row Checkbox | `chk-toggle-payment-{i}` |
| Expand Img | `img-expand-batch-col-{i}` |
| Detail Patient ID | `label-patient-id-{i}` |
| Detail Claim ID | `label-claim-id-{i}` |

### Batch Options Modal (no data-cy)
- Trigger: select batch checkbox → click "Batch Options" button
- Formats: 837, CSV (detect via `ion-modal` text, click via `ion-item` filter + `force: true`)
- Proceed: `getByRole('button', { name: 'Proceed' })`

### Accounts Receivable
| Element | Selector |
|---------|----------|
| Sidebar Nav | `btn-nav-payment-management` |
| Search | `input-search` (needs `input` child) |
| Claim ID | `label-claim-id-col-{i}` |
| Status | `label-claim-status-col-{i}` |
| Billed Amount | `label-billed-amount-col-{i}` |
| Download Claim | `btn-download-claim-col-{i}` |

### AR Download Claim Modal (no data-cy)
- Trigger: click Download Claim button on row
- Payer: click `ion-item` filter by payer name + `force: true`
- Formats: UB-04, 837, CSV (click `ion-item` filter + `force: true`)
- Proceed: `getByRole('button', { name: 'Proceed' })`

## Key Behaviors
- **Tab switching resets filters** — re-apply Hospice filter after every tab switch
- **Single search result auto-expands** — no need to click expand arrow in 837 Batch or AR
- **Payer name shortened in 837 batch** — e.g., "Medicare A" vs "DEV Medicare A". Search by patient ID instead.
- **AR renders names with newlines** — normalize whitespace before comparing
- **ion-radio click intercepted** — use `ion-item` parent with `force: true`, not `getByRole('radio')`

## Data Capture Strategy (no hardcoding)
- **Patient name**: `patientDetails.getPatientBillingName()`
- **Payer name**: `benefitsWorkflow.getPayerNameByLevel('Primary')`
- **Attending physician**: `careTeamWorkflow.getAttendingPhysicianName()` (format: "FirstName LastName")
- **Certifying physician**: `certification.getWrittenCertifyingPhysicianName()` (format: "LastName, FirstName (Role)")
- **Admit date**: `DateHelper.getDateOfMonth()` — 1st of previous month
- **Claim ID**: read from billing grid `getRowFieldValue(0, 'claimId')` at verification time

## Claim Bill Types
| Type | Scenario |
|------|----------|
| 812 | Admission month (first claim) |
| 813 | Subsequent months |
| 811 | Discharge same month as admission |
| 814 | Discharge different month |
| 81A | Notice of Election (NOE) |

## Tests
- `tests/billing/e2e-hospice-medicare.spec.ts` — 23 steps: full E2E billing flow
- `tests/billing/reprocessing-hospice-medicare.spec.ts` — 20 steps: error fix + reprocessing

## File Map
```
pages/billing/
├── claims.page.ts              ← Claim Management grid + Generate Claim modal
├── batch-management.page.ts    ← 837 Batch grid + Batch Options modal
└── accounts-receivable.page.ts ← AR grid + Download Claim modal

workflows/
└── billing.workflow.ts         ← Pure orchestration (zero raw locators)

types/
├── billing.types.ts            ← All billing interfaces + download format types
└── ub04.types.ts               ← UB-04 field definitions + builder functions

utils/
├── date-helper.ts              ← getDateOfMonth(), calculateDaysSinceAdmit()
└── pdf-helper.ts               ← PDF download + text extraction

.claude/rules/
├── page-objects.md             ← Auto-loaded for pages/**/*.ts
├── specs.md                    ← Auto-loaded for tests/**/*.spec.ts
└── workflows.md                ← Auto-loaded for workflows/**/*.ts
```
