# Certification Automation Guide

## Overview

Automates the Certifications module for adding and editing patient certifications.

**Supported Operations:**
- Add new certifications (Verbal and Written)
- Edit existing certifications
- Dynamic physician name resolution via API interception

**Certification Types:**
- **Verbal** — Hospice + Attending physician, obtained-on dates, received-by names
- **Written** — Hospice + Attending physician, signed-on dates, narrative statement, checkboxes

---

## File Structure

```
pages_new/certification.page.ts        # Page object (all locators live here)
workflows/certification.workflow.ts     # Workflow orchestration (add/edit)
types/certification.types.ts           # TypeScript interfaces
utils/api-client.ts                    # API response interception for user info
utils/test-data-manager.ts             # interceptPhysicianName() convenience method
config/test-data.ts                    # Hardcoded fallback physician names per env/tenant
```

---

## Quick Start

### 1. Import the page objects fixture

```typescript
import { test, expect } from '@fixtures/page-objects.fixture';
// OR for serial tests with shared page:
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
```

### 2. Set up dynamic physician name (before login)

```typescript
import { TestDataManager } from '../../utils/test-data-manager';

// BEFORE login — set up API interception
const physicianPromise = TestDataManager.interceptPhysicianName(sharedPage);

// Login
await pages.login.login(username, password);
await page.waitForURL(/dashboard/);

// Resolve the intercepted physician name (stored automatically in TestDataManager)
await physicianPromise;
```

### 3. Add a Verbal certification

```typescript
await pages.certificationWorkflow.fillCertificationDetails('add', 'Verbal');
```

### 4. Add a Written certification with custom dates

```typescript
await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
  certType: 'Written',
  certifyingSignedOn: '01/01/2026',
  attendingSignedOn: '01/01/2026',
});
```

### 5. Edit a certification

```typescript
await pages.certificationWorkflow.fillCertificationDetails(
  'edit',
  'Written',
  ['certifyingSignedOn'],                                    // fields to update
  { certType: 'Written', certifyingSignedOn: '02/09/2026' }, // new values
  { reasonForChange: 'Updated signed on date' }              // required for edit
);
```

---

## Dynamic Physician Name

The physician name used in certification forms is resolved dynamically from the app's API.

### How It Works

After login, the app calls `GET /idg/company-resources/users/` which returns the logged-in user's profile. We intercept that response (no additional API calls) to determine the physician search term.

### Decision Logic

| Logged-in User | Physician Search Term | Source |
|---|---|---|
| MD (isPhysician: true) | User's `username` field (e.g. "medical directorcch") | API response |
| RN, SW, etc. (isPhysician: false) | Hardcoded config value (e.g. "Cypresslast") | `config/test-data.ts` |
| API interception fails | Hardcoded config value | `config/test-data.ts` |

### API Response Structure

```json
{
  "username": "medical directorcch",
  "persons": [{
    "firstName": "medical",
    "lastName": "directorcch",
    "displayName": "medical directorcch",
    "isPhysician": true
  }]
}
```

### Important: Timing

`interceptPhysicianName()` must be called **BEFORE** login. The `/users/` API call fires during the login-to-dashboard transition. If you call it after login, the response will have already been sent and the interception will time out (falling back to hardcoded config).

---

## Workflow Parameters

### `fillCertificationDetails(mode, certType, fieldsToEdit, customData, editData)`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | `'add' \| 'edit'` | — | Add new or edit existing |
| `certType` | `'Verbal' \| 'Written'` | — | Certification type |
| `fieldsToEdit` | `string[]` | `[]` | Fields to update (edit mode only) |
| `customData` | `Partial<CertificationFormData>` | `undefined` | Override default form values |
| `editData` | `CertificationEditData` | `undefined` | Edit-mode data (reason for change) |

---

## Form Fields Reference

### Verbal Certification Fields

| Field Name | Type | Default | Description |
|------------|------|---------|-------------|
| `benefitPeriodIndex` | `number` | `1` | Benefit period dropdown index |
| `hospicePhysician` | `string` | Dynamic / config | Hospice (certifying) physician search term |
| `hospicePhysicianOptionIndex` | `number` | `0` | Which result to select from dropdown |
| `certifyingObtainedOn` | `string` | Today's date | Date obtained (MM/DD/YYYY) |
| `certifyingReceivedBy` | `string` | Auto from hint | Received-by name (auto-captured from form hint text) |
| `attendingPhysician` | `string` | Same as hospice | Attending physician search term |
| `attendingPhysicianOptionIndex` | `number` | `0` | Which result to select from dropdown |
| `attendingObtainedOn` | `string` | Today's date | Date obtained (MM/DD/YYYY) |
| `attendingReceivedBy` | `string` | Auto from hint | Received-by name (auto-captured from form hint text) |

### Written Certification Fields

| Field Name | Type | Default | Description |
|------------|------|---------|-------------|
| `benefitPeriodIndex` | `number` | `1` | Benefit period dropdown index |
| `hospicePhysician` | `string` | Dynamic / config | Hospice (certifying) physician search term |
| `hospicePhysicianOptionIndex` | `number` | `0` | Which result to select from dropdown |
| `certifyingSignedOn` | `string` | Today's date | Date signed (MM/DD/YYYY) |
| `attendingPhysician` | `string` | Same as hospice | Attending physician search term |
| `attendingPhysicianOptionIndex` | `number` | `0` | Which result to select from dropdown |
| `attendingSignedOn` | `string` | Today's date | Date signed (MM/DD/YYYY) |
| `briefNarrativeStatement` | `string` | Test narrative | Narrative text |
| `narrativeOnFile` | `boolean` | `undefined` | Toggle "Narrative on File" checkbox |
| `signatureReceivedFromAttending` | `boolean` | `undefined` | Toggle "Signature Received" checkbox |

### Edit-Mode Fields

| Field Name | Type | Description |
|------------|------|-------------|
| `reasonForChange` | `string` | Required when editing — reason for the change |

---

## Common Operations

```typescript
// Add Verbal certification with all defaults
await pages.certificationWorkflow.fillCertificationDetails('add', 'Verbal');

// Add Written certification with custom dates
await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
  certType: 'Written',
  certifyingSignedOn: '01/01/2026',
  attendingSignedOn: '01/01/2026',
});

// Add Written certification with custom narrative
await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
  certType: 'Written',
  briefNarrativeStatement: 'Patient meets hospice criteria',
});

// Edit Written certification — update signed-on date only
await pages.certificationWorkflow.fillCertificationDetails(
  'edit', 'Written',
  ['certifyingSignedOn'],
  { certType: 'Written', certifyingSignedOn: '02/09/2026' },
  { reasonForChange: 'Corrected date' }
);

// Edit Written certification — toggle checkboxes
await pages.certificationWorkflow.fillCertificationDetails(
  'edit', 'Written',
  ['narrativeOnFile'],
  { certType: 'Written', narrativeOnFile: true },
  { reasonForChange: 'Marking narrative on file' }
);

// Navigate to certifications tab without adding/editing
await pages.certificationWorkflow.navigateToCertificationsTab();
```

---

## Verification After Add/Edit

```typescript
// Verify form closed (save button gone)
const saveVisible = await pages.certification.isSaveButtonVisible();
expect(saveVisible).toBeFalsy();

// Verify Verbal certification exists in grid
const verbalExists = await pages.certification.isVerbalCertificationVisible(0);
expect(verbalExists).toBeTruthy();

// Verify Written certification exists in grid
const writtenExists = await pages.certification.isWrittenCertificationVisible(0);
expect(writtenExists).toBeTruthy();
```

---

## Full Test Example

```typescript
import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TestDataManager } from '../../utils/test-data-manager';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

test.describe.serial('Certification Tests @smoke', () => {

  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });
    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(30000);
    pages = createPageObjectsForPage(sharedPage);
  });

  test.afterAll(async () => {
    if (sharedContext) await sharedContext.close();
  });

  test('Login and capture physician name', async () => {
    await pages.login.goto();

    // BEFORE login
    const physicianPromise = TestDataManager.interceptPhysicianName(sharedPage);

    const credentials = CredentialManager.getCredentials(undefined, 'MD');
    await pages.login.login(credentials.username, credentials.password);
    await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });

    // Resolve the intercepted physician name (stored automatically in TestDataManager)
    await physicianPromise;
  });

  test('Navigate to patient', async () => {
    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.searchPatient('123456');
    await pages.patient.getPatientFromGrid(0);
  });

  test('Add Verbal Certification', async () => {
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Verbal');

    const verbalExists = await pages.certification.isVerbalCertificationVisible(0);
    expect(verbalExists).toBeTruthy();
  });

  test('Add Written Certification', async () => {
    await pages.certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
      certType: 'Written',
      certifyingSignedOn: '01/01/2026',
      attendingSignedOn: '01/01/2026',
    });

    const writtenExists = await pages.certification.isWrittenCertificationVisible(0);
    expect(writtenExists).toBeTruthy();
  });
});
```

---

## Running Tests

```bash
# Smoke test (add certifications to existing patient)
npx playwright test tests/smoke/add-certification.spec.ts --headed

# Full workflow (create patient + benefits + consents + certifications)
npx playwright test tests/tobeD/addpatient-with-fixtures.spec.ts --headed

# Specific environment
TEST_ENV=prod TENANT=cch npx playwright test tests/smoke/add-certification.spec.ts --headed
```

---

*Last updated: February 9, 2026*
