# 🏥 CarePlan Visit — Complete End-to-End Automation Plan
## Entry · Validation · Plan of Care · Hope Preview · Visit Completion · Admission Record

---

## Table of Contents
1. [Complete E2E Flow Map](#complete-e2e-flow-map)
2. [Phase Breakdown](#phase-breakdown)
3. [Element Discovery Plan](#element-discovery-plan)
4. [Project Structure](#project-structure)
5. [Core Engine](#core-engine) *(existing — unchanged)*
6. [Phase 4 — Plan of Care Page Object](#phase-4--plan-of-care-page-object)
7. [Phase 5 — Hope Report Preview Page Object](#phase-5--hope-report-preview-page-object)
8. [Phase 6 — Visit Completion Page Objects](#phase-6--visit-completion-page-objects)
9. [Phase 7 — Hope Module & Admission Record Page Objects](#phase-7--hope-module--admission-record-page-objects)
10. [Mapping Configs — Modules → Hope Preview & Admission Tabs](#mapping-configs)
11. [Factory Update](#factory-update)
12. [Full E2E Test Script](#full-e2e-test-script)
13. [Selector & Ionic Quick Reference](#selector--ionic-quick-reference)

---

## Complete E2E Flow Map

```
LOGIN (RN)
    │
    ▼
PATIENT SEARCH  ──►  CAREPLAN PAGE
                          │
                          ▼
                    ADD VISIT DIALOG
                    (Role + Type + Acknowledge + Submit)
                          │
                          ▼
          ┌───────────────────────────────────────┐
          │   VISIT MODULES  (Phase 1 + 2)        │
          │                                       │
          │  SymptomSummary → Vitals → LevelOfCare│
          │  Preferences → Pain → Neurological    │
          │  Respiratory → Cardiovascular → GI    │
          │  NutritionalMetabolic → Skin          │
          │  Musculoskeletal → ADLs               │
          │  Precautions → HospiceAide → Military │
          │  Summary                              │
          │                                       │
          │  ► fillAll()  → save()                │
          │  ► assertSavedValues()  [Phase 2]      │
          └───────────────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────────────┐
          │   PLAN OF CARE  (Phase 4)             │
          │                                       │
          │  Click [class*="planOfCareBtn"]       │
          │  Review generated plan items          │
          │  Accept / Reject each item            │
          │  Exit plan of care                    │
          └───────────────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────────────┐
          │   HOPE REPORT PREVIEW  (Phase 5)      │
          │                                       │
          │  Click [data-cy="btn-hope-report"]    │
          │  Verify data mapping from all modules │
          │  to Hope preview sections             │
          └───────────────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────────────┐
          │   VISIT COMPLETION  (Phase 6)         │
          │                                       │
          │  Click Complete button                │
          │  Signature pop-up → capture + submit  │
          │  Task pop-up → start / end date+time  │
          │  Verify visit status = "Complete"     │
          │  on CarePlan visit grid               │
          └───────────────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────────────┐
          │   HOPE MODULE  (Phase 7)              │
          │                                       │
          │  Navigate [data-cy="btn-nav-bar-item-his"]
          │  Verify admission record generated    │
          │  Click admission record               │
          │  Walk each tab                        │
          │  Verify data mapping per tab          │
          │  Complete the admission record        │
          └───────────────────────────────────────┘
```

---

## Phase Breakdown

| Phase | What happens | Key actions | Pass criteria |
|---|---|---|---|
| **1 – Entry** | Fill all visit modules | `fillAll()` per module, `save()` | No errors, fields accept values |
| **2 – Save Validation** | Re-read saved values | `assertSavedValues()` per card | Displayed values match input (with transform) |
| **3 – Cross-Module Mapping** | Verify fields appear in Summary / Care Plan | `DataVerifier.verifyMappings()` | All mapped values match session |
| **4 – Plan of Care** | Open PoC, accept items, exit | `planOfCare.acceptAll()` | All items accepted, exit succeeds |
| **5 – Hope Preview** | Open report, verify all sections | `hopePreview.verifySection()` | All mapped data present and correct |
| **6 – Visit Completion** | Sign, submit tasks, verify grid | `visitCompletion.complete()` | Grid shows "Complete" status |
| **7 – Hope Admission** | Open record, verify all tabs, complete | `hopeAdmission.verifyTab()` | All tab data matches session, record completed |

---

## Element Discovery Plan

> Follow this process for **every new page** before writing selectors.
> Document findings in the config files — never hard-code in test scripts.

### Step-by-Step Discovery Process

```
STEP 1 — OPEN THE PAGE IN CHROME (headed mode)
  npx playwright test --headed --slowmo=1000

STEP 2 — INSPECT THE PAGE CONTAINER
  Right-click the page root → Inspect
  Look for: id, data-cy, class, role attributes on the wrapper div
  This becomes your page's rootSelector / loadedSelector

STEP 3 — FOR EACH CARD / SECTION
  a. Find the card container  →  id or data-cy becomes CardConfig.rootSelector
  b. For each input field:
       DevTools Console: document.querySelectorAll('#fieldId').length
       → 1 result: use #fieldId directly
       → 2 results: Ionic dupe — use [data-cy="x"] input as primary + input[id*="x"] as fallback
  c. For each dropdown:      note the ion-select id/data-cy
  d. For each checkbox:      note id/data-cy, confirm aria-checked behaviour
  e. For each radio group:   note the group container + each option value
  f. For each display label: note the span/div id/data-cy (used for assertSelector)

STEP 4 — CHECK AFTER-SAVE DISPLAY FORMAT
  Fill a field → save → inspect the element again
  Does the value stay in <input>?  → assertSelector same as selector
  Does it move to a <span>?        → add assertSelector pointing to the span
  Does it add units? (°F, mmHg)   → add assertTransform

STEP 5 — CHECK DATA MAPPING TARGETS
  Note every other page/tab where this value appears
  Inspect that target element's selector
  Add to MappingConfig with targetTransform if format changes

STEP 6 — RECORD IN CONFIG FILE
  Never put selectors in test scripts
  Always put them in the relevant *.config.ts or *.mapping.ts
```

### Element Discovery Checklist per Page

```
□ Page/dialog root selector (for waitFor)
□ All card container selectors
□ All input fields (id, data-cy, type)
□ All select/dropdown fields (ion-select id/data-cy)
□ All checkbox fields (id, data-cy, aria-checked)
□ All radio groups (container + option values)
□ All date/time pickers
□ All display-only fields (span/div with computed values)
□ All action buttons (save, submit, accept, reject, complete, exit)
□ Any pop-up/dialog containers triggered from this page
□ After-save display format for each field (units? capitalisation? date format?)
□ Where does each key field appear on other pages? (for MappingConfig)
```

---

## Project Structure

```
pageobjects/
├── core/
│   ├── types.ts                          ← FieldConfig, MappingConfig, TestSession
│   ├── CardInteractor.ts                 ← Ionic-safe fill + read + assert
│   ├── BaseModulePage.ts                 ← fillCard/fillAll/assertSavedValues
│   ├── DataVerifier.ts                   ← cross-page mapping assertions
│   └── TestSession.ts                    ← session factory + helpers
│
├── configs/                              ← one per module (unchanged)
│   └── vitals.config.ts  ... etc.
│
├── mappings/
│   ├── vitals.mapping.ts                 ← vitals → summary, hope preview, admission tabs
│   ├── pain.mapping.ts
│   ├── hopePreview.mapping.ts            ← all modules → Hope preview sections  ← NEW
│   └── hopeAdmission.mapping.ts         ← all modules → admission record tabs  ← NEW
│
├── visits/
│   └── VitalsPage.ts ... etc.           ← unchanged 8-line wrappers
│
├── planofcare/
│   └── PlanOfCarePage.ts                ← NEW  Phase 4
│
├── hope/
│   ├── HopeReportPreviewPage.ts         ← NEW  Phase 5
│   ├── VisitCompletionDialog.ts         ← NEW  Phase 6
│   ├── TaskCompletionDialog.ts          ← NEW  Phase 6
│   └── HopeAdmissionPage.ts            ← NEW  Phase 7
│
├── CarePlanPage.ts
├── VisitAddDialog.ts
└── createPageObjects.ts
```

---

## Core Engine

> **Unchanged** — `types.ts`, `CardInteractor.ts`, `BaseModulePage.ts`,
> `DataVerifier.ts`, `TestSession.ts` remain exactly as designed in the
> previous architecture document.

---

## Phase 4 — Plan of Care Page Object

### Element Discovery Notes for Plan of Care

```
Key elements to find during discovery:
□ Plan of Care button on visit toolbar  →  class*="planOfCareBtn"
□ Plan of care page root container      →  id or data-cy on the main wrapper
□ List of plan items                    →  repeating rows/cards
□ Each item's: label, status, accept button, reject button
□ "Accept All" button (if exists)       →  data-cy or id
□ "Reject All" button (if exists)
□ Individual item accept                →  data-cy="poc-accept-btn" or similar
□ Individual item reject                →  data-cy="poc-reject-btn" or similar
□ Item status indicator after action    →  class or aria-label change
□ Exit / Back / Done button             →  data-cy="poc-exit-btn" or similar
□ Confirmation dialog on exit (if any)
```

```typescript
// pageobjects/planofcare/PlanOfCarePage.ts
import { Page, Locator, expect } from '@playwright/test';

export interface PlanOfCareItem {
  label:  string;
  status: 'pending' | 'accepted' | 'rejected';
}

export class PlanOfCarePage {
  readonly page: Page;

  // ── Entry point (on the visit toolbar) ─────────────────────────────────
  readonly planOfCareButton:   Locator;

  // ── Page container ──────────────────────────────────────────────────────
  readonly pageRoot:           Locator;
  readonly pageTitle:          Locator;

  // ── Item list ────────────────────────────────────────────────────────────
  /**
   * Each plan item row — scoped so we can find
   * accept/reject buttons relative to each row
   */
  readonly allItemRows:        Locator;

  // ── Bulk action buttons ─────────────────────────────────────────────────
  readonly acceptAllButton:    Locator;
  readonly rejectAllButton:    Locator;

  // ── Exit ─────────────────────────────────────────────────────────────────
  readonly exitButton:         Locator;
  readonly exitConfirmButton:  Locator;  // confirmation pop-up "Yes, exit"

  constructor(page: Page) {
    this.page = page;

    // Plan of care entry button on the visit toolbar
    this.planOfCareButton  = page.locator('[class*="planOfCareBtn"]').first();

    // Page root — update selector after discovery
    this.pageRoot          = page.locator('[data-cy="plan-of-care-page"], #planOfCareContainer').first();
    this.pageTitle         = page.locator('[data-cy="poc-title"], .plan-of-care-title').first();

    // Each row in the plan of care list
    this.allItemRows       = page.locator('[data-cy="poc-item-row"], .poc-item-row, [id*="pocItem"]');

    // Bulk actions
    this.acceptAllButton   = page.locator('[data-cy="poc-accept-all-btn"], #acceptAllPocBtn').first();
    this.rejectAllButton   = page.locator('[data-cy="poc-reject-all-btn"], #rejectAllPocBtn').first();

    // Exit
    this.exitButton        = page.locator('[data-cy="poc-exit-btn"], #exitPocBtn, button:has-text("Exit")').first();
    this.exitConfirmButton = page.locator('[data-cy="poc-exit-confirm-btn"], button:has-text("Yes")').first();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async openPlanOfCare(): Promise<void> {
    await this.planOfCareButton.waitFor({ state: 'visible' });
    await this.planOfCareButton.click();
    await this.pageRoot.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
    console.log('  → Plan of Care opened');
  }

  async assertLoaded(): Promise<void> {
    await this.pageRoot.waitFor({ state: 'visible' });
  }

  // ── Item Actions ──────────────────────────────────────────────────────────

  /**
   * Accept ALL plan of care items using the bulk Accept All button.
   * Falls back to accepting each item individually if no bulk button exists.
   */
  async acceptAll(): Promise<void> {
    await this.assertLoaded();

    const bulkVisible = await this.acceptAllButton.isVisible();
    if (bulkVisible) {
      await this.acceptAllButton.click();
      await this.page.waitForLoadState('networkidle');
      console.log('  → Accepted all plan of care items (bulk)');
    } else {
      await this.acceptEachItem();
    }
    await this.assertAllItemsAccepted();
  }

  /**
   * Accept each item row individually.
   * Use when no bulk accept button exists.
   */
  async acceptEachItem(): Promise<void> {
    const rows = await this.allItemRows.all();
    console.log(`  → Accepting ${rows.length} plan of care items individually`);

    for (let i = 0; i < rows.length; i++) {
      const row        = rows[i];
      const acceptBtn  = row.locator('[data-cy="poc-accept-btn"], button:has-text("Accept"), [id*="acceptPoc"]').first();
      const isAccepted = await row.locator('[data-cy="poc-accepted-indicator"], .accepted, [aria-label="Accepted"]')
        .isVisible().catch(() => false);

      if (!isAccepted) {
        await acceptBtn.waitFor({ state: 'visible' });
        await acceptBtn.click();
        await this.page.waitForTimeout(300); // allow state update
        console.log(`    ✓ Accepted item ${i + 1}/${rows.length}`);
      }
    }
  }

  /**
   * Reject a specific plan of care item by its label text.
   */
  async rejectItem(itemLabel: string): Promise<void> {
    const row = this.allItemRows.filter({ hasText: itemLabel }).first();
    const rejectBtn = row.locator('[data-cy="poc-reject-btn"], button:has-text("Reject"), [id*="rejectPoc"]').first();
    await rejectBtn.click();
    await this.page.waitForTimeout(300);
    console.log(`  → Rejected plan of care item: "${itemLabel}"`);
  }

  /**
   * Accept a specific plan of care item by its label text.
   */
  async acceptItem(itemLabel: string): Promise<void> {
    const row = this.allItemRows.filter({ hasText: itemLabel }).first();
    const acceptBtn = row.locator('[data-cy="poc-accept-btn"], button:has-text("Accept"), [id*="acceptPoc"]').first();
    await acceptBtn.click();
    await this.page.waitForTimeout(300);
    console.log(`  → Accepted plan of care item: "${itemLabel}"`);
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  /**
   * Asserts that every item in the list has been accepted.
   * Checks for accepted status indicator on each row.
   */
  async assertAllItemsAccepted(): Promise<void> {
    const rows = await this.allItemRows.all();
    for (let i = 0; i < rows.length; i++) {
      const accepted = rows[i].locator(
        '[data-cy="poc-accepted-indicator"], .accepted, [aria-label*="Accepted"], ion-icon[name*="checkmark"]'
      ).first();
      await expect(accepted, `Plan of care item ${i + 1} should be accepted`).toBeVisible();
    }
    console.log(`  ✓ All ${rows.length} plan of care items confirmed accepted`);
  }

  /**
   * Reads all plan item labels and statuses — useful for session tracking.
   */
  async getAllItems(): Promise<PlanOfCareItem[]> {
    const rows  = await this.allItemRows.all();
    const items: PlanOfCareItem[] = [];
    for (const row of rows) {
      const label    = (await row.locator('[data-cy="poc-item-label"], .poc-item-label').textContent()) ?? '';
      const accepted = await row.locator('[data-cy="poc-accepted-indicator"]').isVisible().catch(() => false);
      const rejected = await row.locator('[data-cy="poc-rejected-indicator"]').isVisible().catch(() => false);
      items.push({ label: label.trim(), status: accepted ? 'accepted' : rejected ? 'rejected' : 'pending' });
    }
    return items;
  }

  // ── Exit ──────────────────────────────────────────────────────────────────

  async exitPlanOfCare(): Promise<void> {
    await this.exitButton.waitFor({ state: 'visible' });
    await this.exitButton.click();

    // Handle confirmation dialog if it appears
    const confirmVisible = await this.exitConfirmButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (confirmVisible) {
      await this.exitConfirmButton.click();
    }
    await this.page.waitForLoadState('networkidle');
    console.log('  → Exited Plan of Care');
  }
}
```

---

## Phase 5 — Hope Report Preview Page Object

### Element Discovery Notes for Hope Preview

```
Key elements to find during discovery:
□ Hope report button on visit toolbar   →  data-cy="btn-hope-report"
□ Preview page root container           →  id or data-cy on main wrapper
□ Each section heading                  →  for navigation between sections
□ Section containers (one per module)   →  data-cy or id per section wrapper
□ Individual field display elements     →  span/div showing mapped values
  Examples:
    - Patient name, DOB, diagnosis
    - Vitals: BP, temp, weight, O2 sat
    - Pain: score, location, characteristics
    - Each module's key summary fields
□ Print / Download button (if any)
□ Close / Back button                   →  data-cy="hope-preview-close-btn"
□ Section tab or accordion headers      →  for navigating to each section
```

```typescript
// pageobjects/hope/HopeReportPreviewPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { TestSession } from '../core/types';
import { DataVerifier } from '../core/DataVerifier';

/** Describes one verifiable field in the Hope preview */
export interface HopePreviewField {
  label:    string;   // human label for logging
  selector: string;   // element showing the value
  /** How to get expected value from session */
  getValue: (session: TestSession) => string | undefined;
}

/** One section in the Hope report */
export interface HopePreviewSection {
  name:      string;
  selector:  string;              // section container
  fields:    HopePreviewField[];
}

export class HopeReportPreviewPage {
  readonly page:           Page;
  readonly dataVerifier:   DataVerifier;

  // ── Entry point ────────────────────────────────────────────────────────
  readonly hopeReportButton:  Locator;

  // ── Page structure ─────────────────────────────────────────────────────
  readonly pageRoot:          Locator;
  readonly closeButton:       Locator;

  constructor(page: Page) {
    this.page           = page;
    this.dataVerifier   = new DataVerifier(page);
    this.hopeReportButton = page.locator('[data-cy="btn-hope-report"]').first();
    this.pageRoot         = page.locator('[data-cy="hope-report-preview"], #hopeReportContainer').first();
    this.closeButton      = page.locator('[data-cy="hope-preview-close-btn"], button:has-text("Close")').first();
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  async openPreview(): Promise<void> {
    await this.hopeReportButton.waitFor({ state: 'visible' });
    await this.hopeReportButton.click();
    await this.pageRoot.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
    console.log('  → Hope Report Preview opened');
  }

  async closePreview(): Promise<void> {
    await this.closeButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Section Navigation ──────────────────────────────────────────────────

  /**
   * Scrolls to / expands a named section in the preview.
   * Update selector pattern after discovery.
   */
  async navigateToSection(sectionName: string): Promise<void> {
    const section = this.page.locator(
      `[data-cy*="${sectionName.toLowerCase().replace(/\s/g,'-')}"]` +
      `, [id*="${sectionName}"]` +
      `, .hope-section:has-text("${sectionName}")`
    ).first();
    await section.scrollIntoViewIfNeeded();
    // If accordion — click to expand
    const expanded = await section.getAttribute('aria-expanded');
    if (expanded === 'false') await section.click();
    await this.page.waitForTimeout(300);
  }

  // ── Field Verification ──────────────────────────────────────────────────

  /**
   * Verifies a single field in the preview against a session value.
   * @param sectionRoot  Scoping locator for the section container
   * @param fieldSelector Selector of the display element within the section
   * @param expectedValue What the session says the value should be
   * @param label         Human-readable name for logging
   */
  async assertField(
    sectionRoot:    Locator,
    fieldSelector:  string,
    expectedValue:  string,
    label:          string
  ): Promise<void> {
    const el     = sectionRoot.locator(fieldSelector).first();
    await el.waitFor({ state: 'visible' });
    const actual = (await el.textContent())?.trim() ?? '';
    expect(actual, `Hope Preview [${label}]: expected "${expectedValue}" got "${actual}"`).toBe(expectedValue);
    console.log(`    ✓ ${label}: "${expectedValue}"`);
  }

  /**
   * Verifies an entire section using its HopePreviewSection config.
   * Skips fields whose session value is undefined (not entered in this run).
   */
  async verifySection(
    section: HopePreviewSection,
    session: TestSession
  ): Promise<void> {
    console.log(`  → Verifying Hope Preview section: ${section.name}`);
    await this.navigateToSection(section.name);
    const sectionRoot = this.page.locator(section.selector).first();

    for (const field of section.fields) {
      const expected = field.getValue(session);
      if (expected === undefined) {
        console.warn(`    ⚠ No session value for "${field.label}" — skipping`);
        continue;
      }
      await this.assertField(sectionRoot, field.selector, expected, field.label);
    }
  }

  /**
   * Verifies ALL sections in one call.
   */
  async verifyAllSections(
    sections: HopePreviewSection[],
    session:  TestSession
  ): Promise<void> {
    for (const section of sections) {
      await this.verifySection(section, session);
    }
    console.log('  ✓ All Hope Preview sections verified');
  }
}
```

### Hope Preview Section Definitions
*(Filled in after element discovery)*

```typescript
// pageobjects/mappings/hopePreview.mapping.ts
import { HopePreviewSection } from '../hope/HopeReportPreviewPage';
import { TestSession } from '../core/types';

/** Helper to safely read a session value */
const s = (session: TestSession, mod: string, card: string, field: string) =>
  session[mod]?.[card]?.[field] as string | undefined;

export const HopePreviewSections: HopePreviewSection[] = [
  {
    name:     'Vitals',
    selector: '[data-cy="hope-section-vitals"], #hopeSectionVitals',
    fields: [
      {
        label:    'Blood Pressure',
        selector: '[data-cy="hope-bp"], #hopeBP',
        getValue: (sess) => {
          const sys = s(sess, 'vitalsNavButton', 'bloodPressure', 'systolic');
          const dia = s(sess, 'vitalsNavButton', 'bloodPressure', 'diastolic');
          return sys && dia ? `${sys}/${dia} mmHg` : undefined;
        },
      },
      {
        label:    'Temperature',
        selector: '[data-cy="hope-temp"], #hopeTemp',
        getValue: (sess) => {
          const v = s(sess, 'vitalsNavButton', 'temperature', 'value');
          const u = s(sess, 'vitalsNavButton', 'temperature', 'unit') ?? 'F';
          return v ? `${v}°${u}` : undefined;
        },
      },
      {
        label:    'O2 Saturation',
        selector: '[data-cy="hope-o2"], #hopeO2',
        getValue: (sess) => {
          const v = s(sess, 'vitalsNavButton', 'oxygenSaturation', 'spo2');
          return v ? `${v}%` : undefined;
        },
      },
      {
        label:    'Weight',
        selector: '[data-cy="hope-weight"], #hopeWeight',
        getValue: (sess) => {
          const v = s(sess, 'vitalsNavButton', 'heightWeight', 'weightLbs');
          return v ? `${v} lbs` : undefined;
        },
      },
    ],
  },
  {
    name:     'Pain',
    selector: '[data-cy="hope-section-pain"], #hopeSectionPain',
    fields: [
      {
        label:    'Pain Score',
        selector: '[data-cy="hope-pain-score"], #hopePainScore',
        getValue: (sess) => s(sess, 'painNavButton', 'painAssessment', 'score'),
      },
      {
        label:    'Pain Location',
        selector: '[data-cy="hope-pain-location"], #hopePainLocation',
        getValue: (sess) => s(sess, 'painNavButton', 'painAssessment', 'location'),
      },
    ],
  },
  // Add one block per module — pattern is always the same
  // { name: 'Neurological', selector: '...', fields: [...] }
];
```

---

## Phase 6 — Visit Completion Page Objects

### Element Discovery Notes for Completion

```
□ Complete Visit button on visit toolbar   →  data-cy="complete-visit-btn" or similar
□ Signature pop-up root                    →  data-cy="signature-dialog" or id
□ Signature canvas / input                 →  canvas[id*="signature"] or data-cy
□ Signature clear button                   →  data-cy="signature-clear-btn"
□ Signature submit button                  →  data-cy="signature-submit-btn"
□ Task pop-up root                         →  data-cy="task-completion-dialog"
□ Visit start date input                   →  data-cy/id for start date
□ Visit start time input                   →  data-cy/id for start time
□ Visit end date input                     →  data-cy/id for end date
□ Visit end time input                     →  data-cy/id for end time
□ Task submit / confirm button             →  data-cy="task-confirm-btn"
□ Success toast / confirmation message     →  data-cy="visit-complete-toast"
□ Visit grid on CarePlan page             →  data-cy="visit-grid" or table selector
□ Visit status cell in the grid           →  data-cy="visit-status-cell" or td
```

```typescript
// pageobjects/hope/VisitCompletionDialog.ts
import { Page, Locator, expect } from '@playwright/test';

export class VisitCompletionDialog {
  readonly page: Page;

  // ── Complete button (on visit toolbar) ─────────────────────────────────
  readonly completeVisitButton:  Locator;

  // ── Signature dialog ────────────────────────────────────────────────────
  readonly signatureDialog:      Locator;
  readonly signatureCanvas:      Locator;   // drawn signature
  readonly signatureInput:       Locator;   // typed signature (if text-based)
  readonly signatureClearButton: Locator;
  readonly signatureSubmitButton:Locator;

  constructor(page: Page) {
    this.page = page;

    this.completeVisitButton   = page.locator('[data-cy="complete-visit-btn"], button:has-text("Complete Visit")').first();

    // Signature dialog
    this.signatureDialog       = page.locator('[data-cy="signature-dialog"], #signatureModal').first();
    this.signatureCanvas       = page.locator('canvas[id*="signature"], [data-cy="signature-canvas"]').first();
    this.signatureInput        = page.locator('input[id*="signature"], [data-cy="signature-input"] input').first();
    this.signatureClearButton  = page.locator('[data-cy="signature-clear-btn"], button:has-text("Clear")').first();
    this.signatureSubmitButton = page.locator('[data-cy="signature-submit-btn"], button:has-text("Submit")').first();
  }

  async clickComplete(): Promise<void> {
    await this.completeVisitButton.waitFor({ state: 'visible' });
    await this.completeVisitButton.click();
    await this.signatureDialog.waitFor({ state: 'visible' });
    console.log('  → Signature dialog opened');
  }

  /**
   * Captures the signature.
   * If the app uses a canvas: draws a simple line across it.
   * If text-based: types the clinician name.
   */
  async captureSignature(signatoryName?: string): Promise<void> {
    await this.signatureDialog.waitFor({ state: 'visible' });

    const isCanvas = await this.signatureCanvas.isVisible().catch(() => false);
    if (isCanvas) {
      // Draw a simple signature line on canvas
      const box = await this.signatureCanvas.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x + 20, box.y + box.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(box.x + box.width - 20, box.y + box.height / 2);
        await this.page.mouse.up();
        console.log('  → Canvas signature drawn');
      }
    } else {
      // Text-based signature
      await this.signatureInput.waitFor({ state: 'visible' });
      await this.signatureInput.fill(signatoryName ?? 'RN Test User');
      console.log('  → Text signature entered');
    }
  }

  async submitSignature(): Promise<void> {
    await this.signatureSubmitButton.click();
    // Dialog closes — task pop-up should appear next
    await this.signatureDialog.waitFor({ state: 'hidden' });
    await this.page.waitForLoadState('networkidle');
    console.log('  → Signature submitted');
  }
}
```

```typescript
// pageobjects/hope/TaskCompletionDialog.ts
import { Page, Locator, expect } from '@playwright/test';

export interface TaskCompletionData {
  startDate:  string;   // format: 'YYYY-MM-DD'
  startTime:  string;   // format: 'HH:MM'
  endDate:    string;
  endTime:    string;
}

export class TaskCompletionDialog {
  readonly page: Page;

  // ── Task dialog ─────────────────────────────────────────────────────────
  readonly taskDialog:        Locator;

  // ── Date / Time inputs ──────────────────────────────────────────────────
  readonly startDateInput:    Locator;
  readonly startTimeInput:    Locator;
  readonly endDateInput:      Locator;
  readonly endTimeInput:      Locator;

  // ── Actions ─────────────────────────────────────────────────────────────
  readonly confirmButton:     Locator;
  readonly cancelButton:      Locator;

  // ── Success feedback ────────────────────────────────────────────────────
  readonly successToast:      Locator;

  constructor(page: Page) {
    this.page = page;

    this.taskDialog     = page.locator('[data-cy="task-completion-dialog"], #taskCompletionModal').first();

    this.startDateInput = page.locator(
      '[data-cy="task-start-date"] input, input[id*="taskStartDate"]'
    ).first();
    this.startTimeInput = page.locator(
      '[data-cy="task-start-time"] input, input[type="time"][id*="startTime"]'
    ).first();
    this.endDateInput   = page.locator(
      '[data-cy="task-end-date"] input, input[id*="taskEndDate"]'
    ).first();
    this.endTimeInput   = page.locator(
      '[data-cy="task-end-time"] input, input[type="time"][id*="endTime"]'
    ).first();

    this.confirmButton  = page.locator('[data-cy="task-confirm-btn"], button:has-text("Confirm"), button:has-text("Submit")').first();
    this.cancelButton   = page.locator('[data-cy="task-cancel-btn"], button:has-text("Cancel")').first();
    this.successToast   = page.locator('[data-cy="visit-complete-toast"], .success-toast, ion-toast').first();
  }

  async waitForDialog(): Promise<void> {
    await this.taskDialog.waitFor({ state: 'visible' });
    console.log('  → Task completion dialog opened');
  }

  async fillTaskDates(data: TaskCompletionData): Promise<void> {
    await this.startDateInput.fill(data.startDate);
    await this.startTimeInput.fill(data.startTime);
    await this.endDateInput.fill(data.endDate);
    await this.endTimeInput.fill(data.endTime);
    console.log(`  → Task dates: ${data.startDate} ${data.startTime} → ${data.endDate} ${data.endTime}`);
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
    // Wait for success feedback
    await this.successToast.waitFor({ state: 'visible', timeout: 10_000 });
    console.log('  ✓ Visit completion confirmed');
  }

  /**
   * Full task completion sequence — fills dates and confirms.
   */
  async complete(data: TaskCompletionData): Promise<void> {
    await this.waitForDialog();
    await this.fillTaskDates(data);
    await this.confirm();
  }
}
```

### Visit Grid — Completion Status Verification

```typescript
// pageobjects/CarePlanPage.ts  — add these members to existing class

// In constructor:
this.visitGrid         = page.locator('[data-cy="visit-grid"], #visitGrid, table[id*="visit"]').first();
this.visitStatusCells  = page.locator('[data-cy="visit-status-cell"], td[id*="visitStatus"], .visit-status');

// New methods:

/**
 * Finds the status cell for the most recently created visit
 * and asserts it matches expectedStatus (e.g. "Complete", "Pending")
 */
async assertVisitStatus(expectedStatus: string): Promise<void> {
  await this.visitGrid.waitFor({ state: 'visible' });
  // Most recent visit is usually the first row
  const statusCell = this.visitStatusCells.first();
  await statusCell.waitFor({ state: 'visible' });
  const actual = (await statusCell.textContent())?.trim() ?? '';
  expect(actual, `Visit status: expected "${expectedStatus}" got "${actual}"`).toBe(expectedStatus);
  console.log(`  ✓ Visit status confirmed: "${expectedStatus}"`);
}

/**
 * Returns the status of the most recent visit in the grid.
 */
async getLatestVisitStatus(): Promise<string> {
  await this.visitGrid.waitFor({ state: 'visible' });
  return (await this.visitStatusCells.first().textContent())?.trim() ?? '';
}
```

---

## Phase 7 — Hope Module & Admission Record Page Objects

### Element Discovery Notes for Hope Module

```
□ Hope nav bar button        →  data-cy="btn-nav-bar-item-his"
□ Hope module root           →  data-cy or id on main container
□ Admission records list     →  table/list containing admission entries
□ Record row identifier      →  how to find the latest record (date? patient name?)
□ Record click target        →  the row or button to open the record

For Admission Record detail:
□ Tab container              →  data-cy or id on tab bar
□ Each tab button            →  data-cy per tab or role="tab"
□ Each tab content area      →  data-cy or id per tab panel
□ Field display elements     →  span/div per data point within each tab
□ Complete / Sign button     →  data-cy="hope-complete-btn" or similar
□ Status indicator           →  shows "Complete" / "Draft" etc.
```

```typescript
// pageobjects/hope/HopeAdmissionPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { TestSession } from '../core/types';

export interface AdmissionTab {
  key:      string;   // e.g. 'demographics', 'clinicalInfo', 'medications'
  label:    string;   // display name
  selector: string;   // tab button selector
  fields:   AdmissionTabField[];
}

export interface AdmissionTabField {
  label:    string;
  selector: string;
  getValue: (session: TestSession) => string | undefined;
}

export class HopeAdmissionPage {
  readonly page: Page;

  // ── Hope module entry ────────────────────────────────────────────────────
  readonly hopeNavButton:        Locator;
  readonly hopeModuleRoot:       Locator;

  // ── Admission record list ─────────────────────────────────────────────
  readonly admissionRecordList:  Locator;
  readonly latestAdmissionRow:   Locator;

  // ── Record detail ─────────────────────────────────────────────────────
  readonly recordDetailRoot:     Locator;
  readonly tabBar:               Locator;

  // ── Complete action ───────────────────────────────────────────────────
  readonly completeButton:       Locator;
  readonly completeConfirmBtn:   Locator;
  readonly recordStatusLabel:    Locator;

  constructor(page: Page) {
    this.page = page;

    // Nav
    this.hopeNavButton       = page.locator('[data-cy="btn-nav-bar-item-his"]').first();
    this.hopeModuleRoot      = page.locator('[data-cy="hope-module-root"], #hopeModuleContainer').first();

    // Admission list
    this.admissionRecordList = page.locator('[data-cy="admission-record-list"], #admissionRecordList, table[id*="admissionGrid"]').first();
    this.latestAdmissionRow  = page.locator('[data-cy="admission-record-row"], tr[id*="admissionRow"], .admission-row').first();

    // Record detail
    this.recordDetailRoot    = page.locator('[data-cy="admission-record-detail"], #admissionRecordDetail').first();
    this.tabBar              = page.locator('[data-cy="admission-tab-bar"], ion-tab-bar, .admission-tabs').first();

    // Complete
    this.completeButton      = page.locator('[data-cy="hope-complete-btn"], button:has-text("Complete")').first();
    this.completeConfirmBtn  = page.locator('[data-cy="hope-complete-confirm"], button:has-text("Yes")').first();
    this.recordStatusLabel   = page.locator('[data-cy="hope-record-status"], #hopeRecordStatus, .record-status').first();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigateToHopeModule(): Promise<void> {
    await this.hopeNavButton.waitFor({ state: 'visible' });
    await this.hopeNavButton.click();
    await this.hopeModuleRoot.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
    console.log('  → Navigated to Hope module');
  }

  // ── Admission Record List ────────────────────────────────────────────────

  /**
   * Asserts that at least one admission record is present in the list.
   * Verifies the record was generated after visit completion.
   */
  async assertAdmissionRecordGenerated(): Promise<void> {
    await this.admissionRecordList.waitFor({ state: 'visible' });
    const rowCount = await this.latestAdmissionRow.count();
    expect(rowCount, 'At least one admission record should be generated').toBeGreaterThan(0);
    console.log(`  ✓ Admission record(s) found: ${rowCount}`);
  }

  async openLatestAdmissionRecord(): Promise<void> {
    await this.latestAdmissionRow.waitFor({ state: 'visible' });
    await this.latestAdmissionRow.click();
    await this.recordDetailRoot.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
    console.log('  → Admission record opened');
  }

  // ── Tab Navigation ───────────────────────────────────────────────────────

  /**
   * Clicks a tab by its label or data-cy key.
   */
  async navigateToTab(tabKey: string): Promise<void> {
    const tab = this.page.locator(
      `[data-cy="tab-${tabKey}"], ion-tab-button[tab="${tabKey}"], button[aria-label*="${tabKey}"]`
    ).first();
    await tab.waitFor({ state: 'visible' });
    await tab.click();
    await this.page.waitForTimeout(500); // allow tab content to render
    console.log(`  → Navigated to admission tab: ${tabKey}`);
  }

  // ── Tab Field Verification ───────────────────────────────────────────────

  /**
   * Verifies all fields in a single admission tab against the session.
   */
  async verifyTab(tab: AdmissionTab, session: TestSession): Promise<void> {
    console.log(`  → Verifying admission tab: ${tab.label}`);
    await this.navigateToTab(tab.key);

    // Scope to the active tab's content panel
    const panel = this.page.locator(
      `[data-cy="tab-panel-${tab.key}"], #tabPanel-${tab.key}, ion-tab[tab="${tab.key}"]`
    ).first();

    for (const field of tab.fields) {
      const expected = field.getValue(session);
      if (expected === undefined) {
        console.warn(`    ⚠ No session value for "${field.label}" in tab "${tab.label}" — skipping`);
        continue;
      }
      const el     = panel.locator(field.selector).first();
      await el.waitFor({ state: 'visible' });
      const actual = (await el.textContent())?.trim() ?? '';
      expect(actual, `[${tab.label}] "${field.label}": expected "${expected}" got "${actual}"`).toBe(expected);
      console.log(`    ✓ ${field.label}: "${expected}"`);
    }
  }

  /**
   * Walks through ALL tabs and verifies data mapping for each.
   */
  async verifyAllTabs(tabs: AdmissionTab[], session: TestSession): Promise<void> {
    for (const tab of tabs) {
      await this.verifyTab(tab, session);
    }
    console.log('  ✓ All admission record tabs verified');
  }

  // ── Complete Admission Record ─────────────────────────────────────────────

  async completeAdmissionRecord(): Promise<void> {
    await this.completeButton.waitFor({ state: 'visible' });
    await this.completeButton.click();

    const confirmVisible = await this.completeConfirmBtn.isVisible({ timeout: 2000 }).catch(() => false);
    if (confirmVisible) await this.completeConfirmBtn.click();

    await this.page.waitForLoadState('networkidle');
    console.log('  → Admission record completion submitted');
  }

  async assertRecordStatus(expectedStatus: string): Promise<void> {
    await this.recordStatusLabel.waitFor({ state: 'visible' });
    const actual = (await this.recordStatusLabel.textContent())?.trim() ?? '';
    expect(actual, `Admission record status: expected "${expectedStatus}" got "${actual}"`).toBe(expectedStatus);
    console.log(`  ✓ Admission record status: "${expectedStatus}"`);
  }
}
```

### Admission Tabs Definition

```typescript
// pageobjects/mappings/hopeAdmission.mapping.ts
import { AdmissionTab } from '../hope/HopeAdmissionPage';
import { TestSession } from '../core/types';

const s = (sess: TestSession, mod: string, card: string, field: string) =>
  sess[mod]?.[card]?.[field] as string | undefined;

export const HopeAdmissionTabs: AdmissionTab[] = [
  {
    key:      'demographics',
    label:    'Demographics',
    selector: '[data-cy="tab-demographics"]',
    fields: [
      // These map from patient search / preferences data
      {
        label:    'Preferred Name',
        selector: '[data-cy="adm-preferred-name"], #admPreferredName',
        getValue: (sess) => s(sess, 'preferencesNavButton', 'patientInfo', 'preferredName'),
      },
      {
        label:    'Language',
        selector: '[data-cy="adm-language"], #admLanguage',
        getValue: (sess) => s(sess, 'preferencesNavButton', 'patientInfo', 'language'),
      },
    ],
  },
  {
    key:      'clinicalInfo',
    label:    'Clinical Information',
    selector: '[data-cy="tab-clinical-info"]',
    fields: [
      {
        label:    'Level of Care',
        selector: '[data-cy="adm-loc"], #admLOC',
        getValue: (sess) => s(sess, 'levelOfCareNavButton', 'levelOfCare', 'levelOfCare'),
      },
      {
        label:    'Primary Diagnosis',
        selector: '[data-cy="adm-diagnosis"], #admDiagnosis',
        getValue: (sess) => s(sess, 'levelOfCareNavButton', 'levelOfCare', 'diagnosis'),
      },
    ],
  },
  {
    key:      'vitals',
    label:    'Vitals',
    selector: '[data-cy="tab-vitals"]',
    fields: [
      {
        label:    'Blood Pressure',
        selector: '[data-cy="adm-bp"], #admBP',
        getValue: (sess) => {
          const sys = s(sess, 'vitalsNavButton', 'bloodPressure', 'systolic');
          const dia = s(sess, 'vitalsNavButton', 'bloodPressure', 'diastolic');
          return sys && dia ? `${sys}/${dia}` : undefined;
        },
      },
      {
        label:    'Temperature',
        selector: '[data-cy="adm-temp"], #admTemp',
        getValue: (sess) => {
          const v = s(sess, 'vitalsNavButton', 'temperature', 'value');
          return v ? `${v}°F` : undefined;
        },
      },
      {
        label:    'Weight',
        selector: '[data-cy="adm-weight"], #admWeight',
        getValue: (sess) => {
          const v = s(sess, 'vitalsNavButton', 'heightWeight', 'weightLbs');
          return v ? `${v} lbs` : undefined;
        },
      },
    ],
  },
  {
    key:      'pain',
    label:    'Pain',
    selector: '[data-cy="tab-pain"]',
    fields: [
      {
        label:    'Pain Score',
        selector: '[data-cy="adm-pain-score"], #admPainScore',
        getValue: (sess) => s(sess, 'painNavButton', 'painAssessment', 'score'),
      },
      {
        label:    'Pain Location',
        selector: '[data-cy="adm-pain-location"], #admPainLocation',
        getValue: (sess) => s(sess, 'painNavButton', 'painAssessment', 'location'),
      },
    ],
  },
  // Add one block per admission tab — same pattern every time
];
```

---

## Factory Update

```typescript
// pageobjects/createPageObjects.ts  — add to existing factory

import { PlanOfCarePage }        from './planofcare/PlanOfCarePage';
import { HopeReportPreviewPage } from './hope/HopeReportPreviewPage';
import { VisitCompletionDialog } from './hope/VisitCompletionDialog';
import { TaskCompletionDialog }  from './hope/TaskCompletionDialog';
import { HopeAdmissionPage }    from './hope/HopeAdmissionPage';

export function createPageObjectsForPage(page: Page) {
  return {
    // ... existing entries unchanged ...

    // Phase 4
    planOfCare:          new PlanOfCarePage(page),

    // Phase 5
    hopePreview:         new HopeReportPreviewPage(page),

    // Phase 6
    visitCompletion:     new VisitCompletionDialog(page),
    taskCompletion:      new TaskCompletionDialog(page),

    // Phase 7
    hopeAdmission:       new HopeAdmissionPage(page),
  };
}
```

---

## Full E2E Test Script

```typescript
import { test, expect }                from '@playwright/test';
import { CredentialManager }           from '../utils/CredentialManager';
import { TestDataManager }             from '../utils/TestDataManager';
import { createPageObjectsForPage }    from '../pageobjects/createPageObjects';
import { createSession }               from '../pageobjects/core/TestSession';
import { HopePreviewSections }         from '../pageobjects/mappings/hopePreview.mapping';
import { HopeAdmissionTabs }           from '../pageobjects/mappings/hopeAdmission.mapping';
import { TIMEOUTS }                    from '../utils/constants';
import type { BrowserContext, Page }   from '@playwright/test';

let sharedContext: BrowserContext;
let sharedPage:    Page;
let pages:         ReturnType<typeof createPageObjectsForPage>;

/** Single session travels through all 7 phases */
const session = createSession();

// ─────────────────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────────────────
test.beforeAll(async ({ browser }) => {
  sharedContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    baseURL: CredentialManager.getBaseUrl(),
  });
  sharedPage = await sharedContext.newPage();
  sharedPage.setDefaultTimeout(TIMEOUTS.PAGE_DEFAULT);
  sharedPage.setDefaultNavigationTimeout(TIMEOUTS.PAGE_NAVIGATION);
  pages = createPageObjectsForPage(sharedPage);
  await pages.login.goto();
  const creds = CredentialManager.getCredentials(undefined, 'RN');
  await pages.login.login(creds.username, creds.password);
  console.log('Logged in as RN');
});

test.afterAll(async () => { if (sharedContext) await sharedContext.close(); });

// ─────────────────────────────────────────────────────────────────────────
//  PHASE 1+2 — MODULE ENTRY & SAVE VALIDATION
// ─────────────────────────────────────────────────────────────────────────
test('Phase 1-2: Setup visit and fill all modules', async () => {
  test.setTimeout(300_000);

  await test.step('Navigate to patient and create visit', async () => {
    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.searchPatient(TestDataManager.getOrdersPatientId());
    await pages.carePlan.navigateToCarePlan();
    await pages.carePlan.clickAddVisit();
    await pages.visitAddDialog.selectRole('Registered Nurse');
    await pages.visitAddDialog.selectVisitType('Initial Nursing Assessment');
    await pages.visitAddDialog.checkAcknowledge();
    await pages.visitAddDialog.submit();
  });

  await test.step('Fill Vitals', async () => {
    await pages.vitals.navigate();
    await pages.vitals.assertLoaded();
    await pages.vitals.fillAll({
      bloodPressure:    { systolic: '120', diastolic: '80', position: 'Sitting', site: 'Left Arm' },
      temperature:      { value: '98.6', unit: 'F', route: 'Oral' },
      heightWeight:     { heightFt: '5', heightIn: '8', weightLbs: '160' },
      muac:             { value: '28', unit: 'cm', arm: 'Left' },
      triceps:          { value: '12', unit: 'mm', side: 'Right' },
      oxygenSaturation: { spo2: '98', pulseRate: '72', deliveryMethod: 'Room Air' },
      painScore:        { score: '2', scale: 'Numeric' },
    }, session);
    await pages.vitals.save();
  });

  await test.step('Validate Vitals saved', async () => {
    await pages.vitals.navigate();
    await pages.vitals.assertSavedValues('bloodPressure', { systolic: '120', diastolic: '80' });
    await pages.vitals.assertSavedValues('temperature', { value: '98.6' });
    const bmi = await pages.vitals.readField('heightWeight', 'bmi');
    session['vitalsNavButton']['heightWeight']['bmi'] = bmi;
  });

  await test.step('Fill Pain', async () => {
    await pages.pain.navigate();
    await pages.pain.fillAll({
      painPresent:          { present: 'yes' },
      painAssessment:       { score: '4', scale: 'Numeric', location: 'Lower Back', duration: '2 days' },
      painCharacteristics:  { type: 'Chronic', quality: 'Aching', frequency: 'Constant' },
      aggravatingRelieving: { aggravating: ['Movement', 'Sitting'], relieving: ['Rest', 'Heat'] },
    }, session);
    await pages.pain.save();
  });

  await test.step('Validate Pain saved', async () => {
    await pages.pain.navigate();
    await pages.pain.assertSavedValues('painAssessment', { score: '4', location: 'Lower Back' });
  });

  // ── Repeat fill + validate for every remaining module ────────────────────
  // await pages.neurological.navigate(); await pages.neurological.fillAll({...}, session); ...
  // Pattern is identical for all 17 modules
});

// ─────────────────────────────────────────────────────────────────────────
//  PHASE 3 — CROSS-MODULE MAPPING (existing DataVerifier)
// ─────────────────────────────────────────────────────────────────────────
// (unchanged from previous architecture — omitted here for brevity)

// ─────────────────────────────────────────────────────────────────────────
//  PHASE 4 — PLAN OF CARE
// ─────────────────────────────────────────────────────────────────────────
test('Phase 4: Plan of Care — accept all items', async () => {
  test.setTimeout(120_000);

  await test.step('Open Plan of Care', async () => {
    await pages.planOfCare.openPlanOfCare();
    await pages.planOfCare.assertLoaded();
  });

  await test.step('Read all plan items into session', async () => {
    const items = await pages.planOfCare.getAllItems();
    session['planOfCare'] = { items: items as any };
    console.log(`  → ${items.length} plan items loaded`);
  });

  await test.step('Accept all plan of care items', async () => {
    await pages.planOfCare.acceptAll();
  });

  await test.step('Exit Plan of Care', async () => {
    await pages.planOfCare.exitPlanOfCare();
  });
});

// ─────────────────────────────────────────────────────────────────────────
//  PHASE 5 — HOPE REPORT PREVIEW & DATA MAPPING
// ─────────────────────────────────────────────────────────────────────────
test('Phase 5: Hope Report Preview — verify data mapping', async () => {
  test.setTimeout(120_000);

  await test.step('Open Hope Report Preview', async () => {
    await pages.hopePreview.openPreview();
  });

  await test.step('Verify all sections map correctly from session', async () => {
    await pages.hopePreview.verifyAllSections(HopePreviewSections, session);
  });

  await test.step('Close preview', async () => {
    await pages.hopePreview.closePreview();
  });
});

// ─────────────────────────────────────────────────────────────────────────
//  PHASE 6 — VISIT COMPLETION
// ─────────────────────────────────────────────────────────────────────────
test('Phase 6: Complete visit — sign, tasks, verify grid', async () => {
  test.setTimeout(120_000);

  await test.step('Click Complete and capture signature', async () => {
    await pages.visitCompletion.clickComplete();
    await pages.visitCompletion.captureSignature('Jane RN');
    await pages.visitCompletion.submitSignature();
  });

  await test.step('Fill task completion dates/times', async () => {
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    await pages.taskCompletion.complete({
      startDate: today,
      startTime: '09:00',
      endDate:   today,
      endTime:   '10:30',
    });
  });

  await test.step('Verify visit status on Care Plan visit grid', async () => {
    await pages.carePlan.navigateToCarePlan();
    await pages.carePlan.assertVisitStatus('Complete');
  });
});

// ─────────────────────────────────────────────────────────────────────────
//  PHASE 7 — HOPE MODULE & ADMISSION RECORD
// ─────────────────────────────────────────────────────────────────────────
test('Phase 7: Hope module — admission record verification', async () => {
  test.setTimeout(180_000);

  await test.step('Navigate to Hope module', async () => {
    await pages.hopeAdmission.navigateToHopeModule();
  });

  await test.step('Verify admission record was generated', async () => {
    await pages.hopeAdmission.assertAdmissionRecordGenerated();
  });

  await test.step('Open the admission record', async () => {
    await pages.hopeAdmission.openLatestAdmissionRecord();
  });

  await test.step('Verify data mapping across all admission tabs', async () => {
    await pages.hopeAdmission.verifyAllTabs(HopeAdmissionTabs, session);
  });

  await test.step('Complete the admission record', async () => {
    await pages.hopeAdmission.completeAdmissionRecord();
    await pages.hopeAdmission.assertRecordStatus('Complete');
  });
});
```

---

## Selector & Ionic Quick Reference

### Fallback Selector Priority Order

```
1. data-cy attribute          →  [data-cy="field-name"]
2. Scoped id (native element) →  input[id*="fieldName"] inside root
3. Role-based                 →  page.getByRole('button', { name: 'Accept' })
4. Text-based (last resort)   →  button:has-text("Accept")
5. nth(0) for Ionic dupes     →  page.locator('#dupedId').nth(0)
```

### assertTransform Patterns

```typescript
(v) => `${v}°F`          // temp
(v) => `${v} mmHg`       // BP individual field
(v) => `${v}%`           // O2 sat
(v) => `${v} lbs`        // weight
(v) => v.charAt(0).toUpperCase() + v.slice(1)  // 'yes' → 'Yes'
(v) => new Date(v).toLocaleDateString('en-US') // date formatting
```

### targetTransform (MappingConfig — compound values)

```typescript
// Two fields combined into one display value
targetTransform: (session) => {
  const sys = session['vitalsNavButton']?.['bloodPressure']?.['systolic'];
  const dia = session['vitalsNavButton']?.['bloodPressure']?.['diastolic'];
  return `${sys}/${dia} mmHg`;
}
```

### Quick Checklist Before Every New Page Object

```
□ Opened page in headed Playwright session
□ Ran document.querySelectorAll() for every id → checked for Ionic dupes
□ Noted after-save display format for numeric fields
□ Noted which fields appear in Hope Preview sections
□ Noted which fields appear in Admission Record tabs
□ Added assertSelector where write selector ≠ read selector
□ Added assertTransform where display format ≠ input value
□ Added targetTransform for compound/formatted values in mappings
```
