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
- Trigger: select batch checkbox → wait for "Batch Options" `toBeEnabled()` → click
- Modal renders duplicate ion-items (Download Files + Send Electronic sections) — scope to `ion-list.first()`
- Format select: `ion-list.first().locator('ion-item').filter({ hasText: format }).click()` — NO `force:true` (Ionic needs full event dispatch)
- Proceed: `getByRole('button', { name: 'Proceed' }).first()` (duplicates exist)
- **"File downloaded successfully" dialog** appears after download — dismiss via `dismissDownloadDialog()`

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
- Two-step: first ion-list = Payer, second ion-list = Forms
- Payer: `ion-list.first().locator('ion-item').filter({ hasText: payerName }).click({ force: true })` — must click first, format radios are disabled until payer selected
- Formats: `ion-list.nth(1).locator('ion-item').filter({ hasText: format }).click({ force: true })`
- Proceed: `ion-modal getByRole('button', { name: 'Proceed' }).click({ force: true })`
- **"File downloaded successfully" dialog** appears after download — dismiss via `dismissDownloadDialog()`
- **Claims download formats**: PDF + 837 only (no CSV)
- **Notices download formats**: UB-04 + 837 + CSV

### Occurrence Code 77 / Non-Covered Details (CR-2992)
| Element | Selector | Notes |
|---------|----------|-------|
| Code 77 info icon | `btn-show-modal-days-since-admit-{i}` | `img alt="Unfunded Days"`, inside `label-patient-name-{i}` |
| Popover (on click) | `div.statuspopover` | Text: "Claim has Occurrence Code 77 for non-covered". Dismiss: **Escape key** (backdrop click unreliable) |
| Non-Covered Details tab | `label-reason-for-nonCoveredDetails` | Span element, in expanded claim detail |
| Reason column | `label-claimUF.reason-{i}` | "Late Certification" or "Late Notice" |
| Date range column | `label-change.startEndDate-{i}` | Single combined field: "MM/DD/YYYY - MM/DD/YYYY" |

### Expanded Claim Detail Tabs
| Tab | Selector |
|-----|----------|
| Claim Details | `btn-label-claim-details` |
| Reason For Adjustments | `btn-label-reason-for-adjusments` (note typo in data-cy) |
| Non-Covered Details | `label-reason-for-nonCoveredDetails` |
| Claim Edits Log | `btn-label-claim-edits-log` |
| Claim Notes | `btn-label-claim-details` (reuses same data-cy — use text selector) |

## Key Behaviors
- **Tab switching resets filters** — re-apply Hospice filter after every tab switch
- **Single search result auto-expands** — no need to click expand arrow in 837 Batch or AR
- **Payer name shortened in 837 batch** — e.g., "Medicare A" vs "DEV Medicare A". Search by patient ID instead.
- **AR renders names with newlines** — normalize whitespace before comparing
- **Batch modal ion-item click** — must use `.click()` without `force:true` (Ionic needs full event dispatch). AR modal works with `force:true`
- **Baby steps** — backend is async; after any update, poll for readiness in a separate step before acting. Keep downloads outside retry loops. Never download the same file in two consecutive steps.
- **Batch Options checkbox timing** — `selectBatchRow()` must wait for Batch Options button `toBeEnabled()` before returning
- **"File downloaded successfully" dialog** — appears after batch/AR/PDF downloads, blocks page. All download methods call `dismissDownloadDialog()` from BasePage
- **Backend is async** — always poll after any billing event (cert edit, NOE submit, reprocess). PDFs, claims, icons, grid data are NOT immediately available
- **Download button (`btn-download-pdf-{i}`)** — is `ion-icon name="md-copy"`, triggers API download (not a direct link). Shows "PDF" text for claims, "UB04" for notices
- **ion-popover dismiss** — use `Escape` key, not backdrop click (backdrop click is unreliable for `ion-popover.toolTip`)
- **Non-Covered Details** — visible in both Review and Ready tabs. Verify in Review first (before clearing NOE errors), then in Ready after claim moves
- **837 files are plain text** — download as `.txt`, read with `fs.readFileSync()` (not pdf-parse). EDI code 77 segment: `HI*BI:77:RD8:YYYYMMDD-YYYYMMDD~`
- **UB-04 Box 35** — occurrence span code 77 appears as `77` followed by MMDDYY from/through dates in PDF text

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
| 811 | Discharge same month as admission |
| 812 | Admission month (first claim) |
| 813 | Subsequent months |
| 814 | Discharge different month |
| 817 | Reserved (future) |
| 818 | Reserved (future) |
| 81A | Notice of Election (NOE) |

## Download Format Rules (Medicare Hospice Claims)
| Location | NOE (81A) | Claims (811-818) |
|----------|-----------|-------------------|
| 837 Batch | 837, CSV | 837 only |
| AR | UB-04, 837, CSV | UB-04, 837 |

## Non-Covered Days (CR-2992) — Occurrence Code 77
- **Trigger**: Late certification or late NOE (signed date > 2 days after BPSD)
- **UI indicators**: "Unfunded Days" icon next to patient name, popover on click, Non-Covered Details tab in expanded claim detail
- **UB-04 Box 35**: Occurrence span code 77 with from/through dates (MMDDYY)
- **837 segment**: `HI*BI:77:RD8:YYYYMMDD-YYYYMMDD~`
- **Non-Covered Details tab**: Reason ("Late Certification"/"Late Notice") + date range ("MM/DD/YYYY - MM/DD/YYYY" combined field)
- **Test flow (Late Cert)**: Admit with verbal cert → add on-time written cert (no code 77) → edit to late (code 77 appears in Review) → clear NOE errors → claim moves to Ready → verify UB-04 + submit + verify 837
- **Test flow (Late Notice)**: Admit with on-time written cert → add on-time notice accepted date (no code 77) → edit notice to late/admit date+7 (code 77 appears in Review) → submit NOE → claim moves to Ready → verify UB-04 + submit + verify 837
- **Late Notice dates**: Non-covered start = admit date, non-covered end = notice accepted date - 1

## Tests
- `tests/billing/e2e-hospice-medicare.spec.ts` — 26 steps: full E2E billing flow (submit 812 + 837 batch + AR)
- `tests/billing/non-covered-days-late-cert-hospice-medicare.spec.ts` — 22 steps: CR-2992 non-covered days (Late Certification) + code 77
- `tests/billing/non-covered-days-late-notice-hospice-medicare.spec.ts` — 20 steps: CR-2992 non-covered days (Late Notice) + code 77
- `tests/billing/reprocessing-hospice-medicare.spec.ts` — 20 steps: error fix + reprocessing

## File Map
```
pages/billing/
├── claims.page.ts              ← Claim Management grid + Generate Claim modal + code 77 methods
├── batch-management.page.ts    ← 837 Batch grid + Batch Options modal
└── accounts-receivable.page.ts ← AR grid + Download Claim modal + downloadClaimAsText()

workflows/
└── billing.workflow.ts         ← Pure orchestration: submit/verify claims + 837 text + UB-04 code 77

types/
├── billing.types.ts            ← BillType (811-818/81A) + NonCoveredDetail + download formats
└── ub04.types.ts               ← UB-04 fields + box35 occurrence span + builder functions

utils/
├── date-helper.ts              ← getDateOfMonth(), calculateDaysSinceAdmit(), toEdiDate()
└── pdf-helper.ts               ← PDF download + text extraction + downloadAndReadTextFile()

.claude/rules/
├── page-objects.md             ← Auto-loaded for pages/**/*.ts
├── specs.md                    ← Auto-loaded for tests/**/*.spec.ts
└── workflows.md                ← Auto-loaded for workflows/**/*.ts
```
