# Ionic 4 vs Ionic 8 — Selector Differences

Verified via MCP Playwright on qa2 (2026-03-05).

## Login Page
| Element | Ionic 4 (qa1) | Ionic 8 (qa2) | Status |
|---------|---------------|---------------|--------|
| URL | `/#/login` or `/` | `/#/sign-in` | CHANGED |
| Username input | `input[placeholder="EMAIL"]` | Same | OK |
| Password input | `input[placeholder="PASSWORD"]` | Same | OK |
| Login button | `button:has-text("SIGN IN")` | `button:has-text("Sign In")` (mixed case) | CHANGED |

## Dashboard Page
| Element | Ionic 4 (qa1) | Ionic 8 (qa2) | Status |
|---------|---------------|---------------|--------|
| Rubik's cube | `[data-cy="btn-options-applications"]` | Same (still exists) | OK |
| Module menu | Popup menu after click | Persistent sidebar — no click needed | CHANGED |
| Module items | `[data-cy="ModuleName"]` | Sidebar `button:has-text("ModuleName")` | CHANGED |

## Patient Details Page
| Element | Ionic 4 (qa1) | Ionic 8 (qa2) | Status |
|---------|---------------|---------------|--------|
| Tab navigation | `[role="tab"]:has-text("...")` | `ion-tab-button[data-cy="tab-patient-details"]` etc. | CHANGED |
| Patient details btn | `[data-cy="btn-patient-details"]` | `ion-row[data-cy="section-patient-details"]` | CHANGED |
| Edit icons | Various `[data-cy="btn-edit-*"]` | `ion-icon[data-cy="btn-edit-*"]` | Tag changed |
| Toggle icons | N/A | `ion-icon[data-cy="btn-*-toggle"]` | NEW |
| Section containers | N/A | `ion-row[data-cy="section-*"]` | NEW |
| Content containers | N/A | `div[data-cy="content-*"]` | NEW |
| Display values | N/A | `span[data-cy="text-patient-*"]` | NEW |
| Add fab buttons | `[data-cy="btn-add-*"]` | `ion-fab-button[data-cy="btn-add-*"]` | Tag changed |

## Care Team Page
| Element | Ionic 4 (qa1) | Ionic 8 (qa2) | Status |
|---------|---------------|---------------|--------|
| Nav button | `[data-cy="btn-nav-bar-item-care-team"]` | Same | OK |
| Care team dropdown | `[data-cy="select-care-team"]` | `div[data-cy="select-care-team"]` | OK |
| Selected team | `.ng-value-label` | `span[data-cy="label-selected-team-name"]` | CHANGED |
| **Role options** | `btn-current-physician-options-{RoleName}` | `btn-team-role-options-{INDEX}` | **MAJOR** |
| Role name label | N/A | `span[data-cy="label-team-role-name-{index}"]` | NEW |
| Role containers | N/A | `div[data-cy="container-team-role-{index}"]` | NEW |
| Physician table | N/A | `table[data-cy="table-physicians"]` | NEW |
| Caregiver table | N/A | `table[data-cy="table-caregivers"]` | NEW |
| Physician row | `btn-current-physician-{index}` | `tr[data-cy="row-current-physician-{index}"]` | CHANGED |
| Caregiver row | `caregiver-row-{index}` | `tr[data-cy="row-primary-caregiver-{index}"]` | CHANGED |
| Add physician | `[data-cy="btn-add-physician"]` | Same + `ion-fab-button[data-cy="btn-add-physician-fab"]` | ADDED |
| Add caregiver | `[data-cy="btn-add-caregiver"]` | Same + `ion-fab-button[data-cy="btn-add-caregiver-fab"]` | ADDED |

## Diagnosis Page
| Element | Ionic 4 (qa1) | Ionic 8 (qa2) | Status |
|---------|---------------|---------------|--------|
| Tab | `[role="tab"]:has-text("Diagnosis")` | `[data-cy="tab-diagnosis"]` | CHANGED |
| Edit icon | `[data-cy="btn-edit-diagnosis"]` | Same (ion-icon tag) | OK |
| Edit option | `[data-cy="btn-edit-option"]` | `button:has-text("Edit")` in popover | CHANGED |
| Primary input | `[data-cy="input-primary-diagnosis"] input` | `ng-select[data-cy="input-primary-diagnosis"]` input | OK |
| Secondary input | `[data-cy="secondary-diagnosis"] input` | Same | OK |
| Date pickers | N/A | `cur-date-picker[data-cy="datetime-start-date-primary"]` etc. | NEW |
| **Save button** | `#inputModalSubmit` | `[data-cy="btn-save"]` | **MAJOR** |
| **Cancel button** | `#inputModalCancel` | `[data-cy="btn-cancel"]` | **MAJOR** |
| Form | N/A | `form[data-cy="form-diagnosis"]` | NEW |

## Certifications Page
| Element | Ionic 4 (qa1) | Ionic 8 (qa2) | Status |
|---------|---------------|---------------|--------|
| Nav button | `[data-cy="btn-nav-bar-item-certifications"]` | Same | OK |
| **Add button** | `[data-cy="btn-add-certifications"]` | `[data-cy="btn-add-certification"]` (no 's') | **CHANGED** |
| Verbal options | `btn-certification-options-{index}` | Same | OK |
| Written options | `btn-certification-written-options-{index}` | Same | OK |
| Verbal row | N/A | `ion-row[data-cy="row-verbal-certificate-{index}"]` | NEW |
| Written row | N/A | `ion-row[data-cy="row-written-certificate-{index}"]` | NEW |
| Verbal/Written sections | N/A | `container-verbal-title`, `content-verbal-certificates` | NEW |
| Column data | N/A | `col-verbal-benefit-period-{i}`, `col-written-from-date`, etc. | NEW |

## Consents Page
| Element | Ionic 4 (qa1) | Ionic 8 (qa2) | Status |
|---------|---------------|---------------|--------|
| Nav button | `[data-cy="btn-nav-bar-item-consents"]` | Same | OK |
| More button | `[data-cy="btn-consents-page-more"]` | Same | OK |
| All Records | `radio-all-records-yes/no` | Same | OK |
| ROI Consent | `radio-roi-consent-yes/no` | Same | OK |
| **CAHPS** | `radio-allow-data-publication-yes/no` nth(0) | `radio-allow-data-publication-yes/no` (unique!) | **SIMPLIFIED** |
| **Hospice Election** | `radio-allow-data-publication-yes/no` nth(1) | `radio-hospice-election-form-yes/no` | **CHANGED** |
| **Health Care Proxy** | `radio-allow-data-publication-yes/no` nth(2) | `radio-health-care-proxy-yes/no` | **CHANGED** |
| **Acknowledgment** | `radio-allow-data-publication-yes/no` nth(3) | `radio-acknowledgment-of-care-yes/no` | **CHANGED** |
| **Financial POA** | `radio-allow-data-publication-yes/no` nth(4) | `radio-financial-power-of-attorney-yes/no` | **CHANGED** |
| **Durable POA** | `radio-allow-data-publication-yes/no` nth(5) | `radio-durable-power-of-attorney-yes/no` | **CHANGED** |
| **Provider Referral** | `radio-allow-data-publication-yes/no` nth(6) | `radio-provider-referral-orders-yes/no` | **CHANGED** |

## Benefits Page
| Element | Ionic 4 (qa1) | Ionic 8 (qa2) | Status |
|---------|---------------|---------------|--------|
| Nav button | `[data-cy="btn-nav-bar-item-benefits"]` | Same | OK |
| **Add button** | `[data-cy="btn-add-payer"]` | `[data-cy="btn-add-benefit"]` | **CHANGED** |
| Benefits card | N/A | `ion-card[data-cy="card-patient-benefits"]` | NEW |
| Benefits grid | N/A | `ion-grid[data-cy="grid-patient-benefits"]` | NEW |
| Active row | N/A | `ion-row[data-cy="row-active-benefit-{index}"]` | NEW |
| Sub-tabs | N/A | `tab-payers`, `tab-eligibility` | NEW |
| Disenroll | N/A | `ion-button[data-cy="btn-disenroll"]` | NEW |
| Column headers | N/A | `col-header-payer-level`, `col-header-payer-name`, etc. | NEW |

## LOC Page (Order Entry / Level of Care)
| Element | Ionic 4 (qa1) | Ionic 8 (qa2) | Status |
|---------|---------------|---------------|--------|
| Order Entry btn | `[class*="orderEntryBtn"]` | `[data-cy="btn-open-order-entry-page"]` | **CHANGED** |
| Exit Order Entry | `[data-cy="btn-exit-order-entry-page"]` | Same | OK |
| Add Order | `[data-cy="btn-create-new-order-for-patient"]` | Same | OK |
| Order type dropdown | `[data-cy="select-order-type-dropdown"]` | Same (ng-select) | OK |
| Level of Care select | `[data-cy="select-level-of-care"]` | Same (ng-select) | OK |
| Care Location Type | `[data-cy="select-care-location-type"]` | Same (ng-select) | OK |
| Care Location | `[data-cy="select-care-location"]` | Same (ng-select) | OK |
| Start Date | `[data-cy="date-order-start-date"]` | Same (cur-date-picker) | OK |
| Ordering Provider | `[data-cy="select-ordering-provider"]` | Same (ng-select) | OK |
| Provider Notes | `[data-cy="input-provider-notes"]` | Same (voice-ion-textarea) | OK |
| Reason for Respite | `.input > [data-cy="input-reason-for-respite"]` | `[data-cy="input-reason-for-respite"]` | SIMPLIFIED |
| E-Sign checkbox | `[data-cy="checkbox-e-sign-verification"]` | Same (ion-checkbox) | OK |
| Verbal radio | `[data-cy="radio-verbal"]` | Same | OK |
| Written radio | `[data-cy="radio-written"]` | Same | OK |
| **Submit btn** | `[data-cy="btn-submit-order"]` | Same (says "Proceed") | OK |
| Submit fallback | `.button-md-success > .button-inner` | REMOVED — not needed | **REMOVED** |
| Cancel btn | `[data-cy="btn-cancel-order"]` | Same | OK |
| **Order rows** | `ion-row[data-cy="order"]` (was broken) | `ion-row[data-cy="order"]` (WORKS!) | **FIXED** |
| Options btn | `[data-cy="order-created-row-btn-show-edit-view-options-popover"]` | Same | OK |
| Void menu item | `[data-cy="btn-void-loc"]` | Same | OK |
| **Void date** | `.cancel-modal-container cur-date-picker input` | `[data-cy="input-void-date"] input` | **CHANGED** |
| **Void reason** | `.cancel-modal-container input[placeholder="..."]` | `[data-cy="input-void-reason"]` | **CHANGED** |
| **Void submit** | `.cancel-footer button.save-button` | `[data-cy="btn-submit-void-order"]` | **CHANGED** |
| **Void cancel** | `.cancel-footer button.cancel-button` | `[data-cy="btn-cancel-void-order"]` | **CHANGED** |
| Confirm void | `ion-alert button:has-text("Yes")` | Same | OK |
| **Hide signed orders** | `[data-cy="toggle-hide-signed-orders"]` (checkbox) | Same data-cy (ion-toggle) | Tag changed |
| Hide discontinued | N/A | `[data-cy="toggle-hide-discontinued-canceled-rejected-orders"]` | **NEW** |
| Add Order modal | `ion-footer.add-order-modal-footer button` | `[data-cy="footer-add-order-modal"]` | **CHANGED** |
| LOC content | N/A | `[data-cy="content-level-of-care"]` | NEW |
| LOC history panel | N/A | `[data-cy="panel-level-of-care-history"]` | NEW |
| LOC history rows | `ion-row.order-row` | `ion-row.table-values.scroll_row` | **CHANGED** |
| Add Order form | N/A | `[data-cy="form-add-order"]` | NEW |
| Void form | N/A | `[data-cy="form-void-order"]` | NEW |
| Void header | N/A | `[data-cy="header-void-order"]` | NEW |
| Upload signed order | N/A | `[data-cy="btn-upload-signed-order"]` | NEW |
| Print order | N/A | `[data-cy="btn-print-order"]` | NEW |
| Order row type | N/A | `[data-cy="value-order-created-row-type-display-name"]` | NEW |
| Order row name | N/A | `[data-cy="value-order-created-row-name-description"]` | NEW |
| Order row signed | N/A | `[data-cy="value-order-created-row-signed-status"]` | NEW |

## Patient Page (Add/Search/Grid)
| Element | Ionic 4 (qa1) | Ionic 8 (qa2) | Status |
|---------|---------------|---------------|--------|
| **Search bar** | `[data-cy="input-search-patients"]` | `[data-cy="input-search"]` | **CHANGED** |
| **Add patient** | `[data-cy="btn-add-patient"]` | `[data-cy="btn-add"]` | **CHANGED** |
| **Patient row** | `[data-cy="item-patient-{N}"]` | `[data-cy="row-patient-{N}"]` | **CHANGED** |
| Patient chart ID | `item-patient-0 div:nth-child(3)` | `[data-cy="col-patient-id-0"]` | **CHANGED** |
| Patient name | N/A | `[data-cy="label-patient-name-{N}"]` | NEW |
| Patient ID | N/A | `[data-cy="label-patient-id-{N}"]` | NEW |
| Profile link | N/A | `[data-cy="link-patient-profile-{N}"]` | NEW |
| **Care type** | Radio: `radio-type-of-care-hospice` etc. | `ng-select[data-cy="select-care-type"]` | **MAJOR** |
| First name | `input[data-cy="input-first-name"]` | `ion-input[data-cy="input-first-name"]` | Tag changed |
| Last name | `input[data-cy="input-last-name"]` | `ion-input[data-cy="input-last-name"]` | Tag changed |
| Middle initial | `input[data-cy="input-middle-initial"]` | `ion-input[data-cy="input-middle-initial"]` | Tag changed |
| Nickname | `input[data-cy="input-nickname"]` | `ion-input[data-cy="input-nickname"]` | Tag changed |
| SSN | `input[data-cy="input-ssn"]` | `ion-input[data-cy="input-ssn"]` | Tag changed |
| **SSN unknown** | `[data-cy="checkbox-unknow"]` | `[data-cy="checkbox-unknown-ssn"]` | **CHANGED** |
| Date of Birth | `[data-cy="date-of-birth"]` | `cur-date-picker[data-cy="date-of-birth"]` | Tag changed |
| **Gender** | Radio: `radio-gender-male/female` | `ng-select[data-cy="select-gender"]` | **MAJOR** |
| **Veteran** | Radio: `radio-veteran-yes/no` | `ng-select[data-cy="select-veteran"]` | **MAJOR** |
| Marital status | `[data-cy="select-marital-status"]` | Same (ng-select) | OK |
| First language | `[data-cy="select-first-language"]` | Same (ng-select) | OK |
| Religion | `[data-cy="select-religion"]` | Same (ng-select) | OK |
| **Ethnicity (HIS)** | `[data-cy="select-his-ethnicity"]` | `[data-cy="select-ethnicity"]` | **CHANGED** |
| Ethnicity (HOPE) | `[data-cy="select-hope-ethnicity"]` | Same (ng-select) | OK |
| Race (HOPE) | `[data-cy="select-hope-race"]` | Same (ng-select) | OK |
| **Phone** | `ion-input[data-cy="input-phone"]` | `ion-input[data-cy="input-phone-number"]` | **CHANGED** |
| **Email** | `ion-input[data-cy="input-email"]` | `ion-input[data-cy="input-email-address"]` | **CHANGED** |
| Street address | `ion-input[data-cy="input-street-address"]` | Same | OK |
| City | `ion-input[data-cy="input-city"]` | Same | OK |
| **State** | `[data-cy="select-state"]` (ion-select) | `ng-select[data-cy="select-state"]` | **CHANGED** |
| Zip | `ion-input[data-cy="input-zip"]` | Same | OK |
| **Zip ext** | `ion-input[data-cy="input-zip-code-ext"]` | `ion-input[data-cy="input-zip-extension"]` | **CHANGED** |
| County | `ion-input[data-cy="input-county"]` | Same | OK |
| **Same address** | `[data-cy="checkbox-same-address"]` | `[data-cy="checkbox-same-as-home-address"]` | **CHANGED** |
| Location type | `[data-cy="select-location-type"]` | Same (ng-select) | OK |
| Location value | `[data-cy="input-location-type"]` | `[data-cy="select-location-type-value"]` | **CHANGED** |
| Referral name | `[data-cy="input-referral-name"]` | Same | OK |
| Referral address | `[data-cy="input-address-1-referral"]` | Same | OK |
| Referral city | `[data-cy="input-referral-city"]` | Same | OK |
| **Referral state** | `[data-cy="select-state"]` (shared) | `[data-cy="select-referral-state"]` | **CHANGED** |
| Referral zip | `[data-cy="input-referral-zip"]` | Same | OK |
| **Referral zip ext** | `[data-cy="input-referral-zip-code-ext"]` | `[data-cy="input-referral-zip-extension"]` | **CHANGED** |
| **Referral county** | `[data-cy="input-country"]` | `[data-cy="input-referral-county"]` | **CHANGED** |
| Referral phone | `[data-cy="input-referral-phone"]` | Same | OK |
| Referral email | `[data-cy="input-referral-email-address"]` | Same | OK |
| **Save** | `[data-cy="btn-add-patient-save"]` | `[data-cy="btn-save-patient-details"]` | **CHANGED** |
| **Cancel** | `[data-cy="btn-add-patient-cancel"]` | `[data-cy="btn-cancel-patient-details"]` | **CHANGED** |
| Form | N/A | `[data-cy="form-patient-details"]` | NEW |
| Lead/Referral radio | N/A | `btn-select-type-lead` / `btn-select-type-referral` | NEW |
| Back button | N/A | `[data-cy="btn-back-intake-queue"]` | NEW |
