# Level of Care (LOC) Automation Guide

## Overview

Automates the Level of Care module for adding, voiding, and recreating LOC orders.

**Supported Operations:**
- Add new LOC orders
- Void existing LOC orders and create replacements
- Dynamic care location resolution per environment/tenant
- Smart active order detection (skips voided rows in the grid)
- Auto-detect approval type based on login role (MD → e-sign, RN/other → Verbal + provider search)

**LOC Types:**
- **Routine Home Care** — Care location type (default: Home)
- **Respite Care** — Reason for respite, care location type (default: Q5004-Skilled Nursing)
- **General In-Patient (GIP)** — GIP reasons (checkboxes), care location type (default: Q5009-Not Otherwise Specified)
- **Continuous Care** — Symptoms (multi-select), care location type (default: Q5002-Assisted Living)

---

## File Structure

```
pages_new/loc.page.ts              # Page object (all locators and grid helpers)
workflows/loc.workflow.ts          # Workflow orchestration (add/void-and-recreate)
types/loc.types.ts                 # TypeScript interfaces (discriminated union per LOC type)
fixtures/loc-fixtures.ts           # Care location data (Q-code → env → tenant → facility)
fixtures/page-objects.fixture.ts   # Factory that wires LOCPage + LOCWorkflow into test fixtures
```

---

## Quick Start

### 1. Set the role before login

```typescript
import { TestDataManager } from '../../utils/test-data-manager';

// In beforeAll, before login:
TestDataManager.setRole('RN');  // or 'MD'
```

This sets `isPhysician` automatically — the LOC workflow uses it to choose e-sign (MD) or Verbal approval (RN/other).

### 2. Add a Routine Home Care order with defaults

```typescript
await pages.locWorkflow.addLOCOrder('Routine Home Care');
```

### 3. Add a Respite Care order with custom data

```typescript
await pages.locWorkflow.addLOCOrder('Respite Care', {
  careLocationType: 'Q5004',
  startDate: '02/01/2026',
});
```

### 4. Void existing LOC and create a replacement

```typescript
await pages.locWorkflow.voidAndRecreateLOCOrder(
  { voidReason: 'Switching to General In-Patient' },
  'General In-Patient',
  { startDate: '02/01/2026' }
);
```

---

## Role-Based Approval (Auto-Detection)

The workflow automatically determines the approval method based on `TestDataManager.setRole()`:

| Role | Approval Type | Behavior |
|------|--------------|----------|
| `MD` | E-Sign | Provider auto-filled, checks e-sign verification checkbox |
| `RN`, `SW`, etc. | Verbal | Searches and selects ordering provider, then selects Verbal radio |

You can override this per-call by passing `approvalType` in `customData`:

```typescript
await pages.locWorkflow.addLOCOrder('Routine Home Care', {
  approvalType: 'Written',  // override auto-detection
});
```

---

## Navigation

The LOC workflow automatically navigates to the **Profile tab** before clicking **Order Entry**. This is required because Order Entry is only accessible from the Profile view. Both `addLOCOrder` and `voidAndRecreateLOCOrder` handle this internally.

---

## How LOC Orders Work

LOC orders have **no edit/amend mode**. To change an LOC, you:

1. Void the existing order
2. The app auto-opens the Add Order modal (Order Type pre-selected and disabled)
3. Fill and submit the replacement order

The `voidAndRecreateLOCOrder` method handles this entire flow. It automatically finds the active (non-voided) LOC order in the grid, regardless of how many voided orders exist.

---

## Care Location Resolution

When an LOC type requires a facility (any care location type other than "Home"), the workflow resolves the facility name automatically.

### Resolution Logic (`LOCWorkflow.getCareLocation`)

| Priority | Source | Example |
|----------|--------|---------|
| 1. Fixtures map | `CARE_LOCATIONS[qCode][env][tenant]` | `'Addison Facility'` |
| 2. TestDataManager fallback (Q5004) | `TestDataManager.getFacilitySNF()` | SNF from config |
| 3. TestDataManager fallback (Q5002) | `TestDataManager.getFacilityALF()` | ALF from config |
| 4. undefined | Caller skips facility selection | — |

### Care Location Fixtures (`fixtures/loc-fixtures.ts`)

```typescript
CARE_LOCATIONS = {
  'Q5004': {  // Skilled Nursing
    qa: { cth: 'Bear Creek SNF', integrum: 'Addison Facility' },
  },
  'Q5002': {  // Assisted Living
    qa: { cth: 'Allen Assisted Facility', integrum: 'AssistedTestFacility' },
  },
  'Q5009': {  // Not Otherwise Specified
    qa: { cth: '', integrum: 'Unspecified facility' },
  },
};
```

### Override Care Location in Test

Pass `careLocation` in `customData` to bypass automatic resolution:

```typescript
await pages.locWorkflow.addLOCOrder('Respite Care', {
  careLocationType: 'Q5004',
  careLocation: 'My Custom Facility',
});
```

---

## Workflow Parameters

### `addLOCOrder(locType, customData?)`

Navigates to Profile → Order Entry, opens the form, fills all fields, verifies the order in the grid, and exits.

| Parameter | Type | Description |
|-----------|------|-------------|
| `locType` | `LOCType` | `'Routine Home Care'` \| `'Respite Care'` \| `'General In-Patient'` \| `'Continuous Care'` |
| `customData` | `Partial<LOCOrderFormData>` | Override default form values |

### `voidAndRecreateLOCOrder(voidData, newLocType, customData?)`

Finds the active LOC order, voids it, then fills the auto-opened replacement form.

| Parameter | Type | Description |
|-----------|------|-------------|
| `voidData` | `LOCVoidData` | `{ voidReason: string, voidDate?: string }` |
| `newLocType` | `LOCType` | LOC type for the replacement order |
| `customData` | `Partial<LOCOrderFormData>` | Override default form values for the new order |

### `LOCWorkflow.getCareLocation(careLocationType)` (static)

Resolves a facility name from fixtures/config for the given Q-code.

| Parameter | Type | Description |
|-----------|------|-------------|
| `careLocationType` | `string` | Q-code, e.g. `'Q5004'` or `'Q5004-Skilled Nursing'` |
| **Returns** | `string \| undefined` | Facility name, or undefined if not available |

---

## Form Fields Reference

### Common Fields (all LOC types)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `locType` | `LOCType` | — | Level of Care type (required) |
| `careLocationType` | `string` | Per LOC type | Q-code or `'Home'` |
| `careLocation` | `string` | Auto-resolved | Facility name (overrides auto-resolution) |
| `startDate` | `string` | Today's date | Start date (MM/DD/YYYY) |
| `orderingProvider` | `string` | Dynamic / config | Provider search term (non-MD only) |
| `approvalType` | `OrderApprovalType` | Auto-detected | `'MD'` \| `'Verbal'` \| `'Written'` — defaults based on `setRole()` |
| `providerNotes` | `string` | — | Optional provider notes |

### Respite Care Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `reasonForRespite` | `string` | `'Caregiver respite'` | Reason for respite |

### General In-Patient Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `gipReasons` | `string[]` | `['Pain']` | GIP reason checkboxes |

### Continuous Care Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `symptoms` | `string[]` | `['Agitation']` | Symptom multi-select options |

### Void Fields

| Field | Type | Description |
|-------|------|-------------|
| `voidReason` | `string` | Required — reason for voiding |
| `voidDate` | `string` | Optional — override the pre-populated void date (MM/DD/YYYY) |

---

## Active Order Detection

The order grid can contain multiple order types (Level of Care, Medication, etc.) and multiple voided orders. The `findActiveLOCOrderIndex` method scans the grid to find the correct row:

- Row must contain **"Level of Care"** text (filters out Medication and other types)
- Row must **NOT** contain **"Voided"** text (filters out already-voided orders)

This is called automatically by `voidAndRecreateLOCOrder` — no manual index needed.

---

## Common Operations

```typescript
// Add Routine Home Care with all defaults (Home care location, today's date, auto approval)
await pages.locWorkflow.addLOCOrder('Routine Home Care');

// Add Routine Home Care with non-Home care location
await pages.locWorkflow.addLOCOrder('Routine Home Care', {
  careLocationType: 'Q5004',
  startDate: '02/01/2026',
});

// Add Respite Care with defaults (Q5004, auto-resolved facility)
await pages.locWorkflow.addLOCOrder('Respite Care');

// Add General In-Patient with custom reasons
await pages.locWorkflow.addLOCOrder('General In-Patient', {
  gipReasons: ['Pain', 'Nausea'],
  startDate: '02/01/2026',
});

// Add Continuous Care with custom symptoms
await pages.locWorkflow.addLOCOrder('Continuous Care', {
  symptoms: ['Agitation', 'Dyspnea'],
});

// Void and recreate as Respite Care
await pages.locWorkflow.voidAndRecreateLOCOrder(
  { voidReason: 'Switching to Respite Care' },
  'Respite Care',
  { startDate: '02/01/2026' }
);

// Void with a specific void date
await pages.locWorkflow.voidAndRecreateLOCOrder(
  { voidDate: '02/10/2026', voidReason: 'Patient condition changed' },
  'General In-Patient',
);

// Resolve care location manually
const facility = LOCWorkflow.getCareLocation('Q5004');
// → 'Addison Facility' (on qa/integrum)
```

---

## Full Test Reference

See `tests/tobeD/addpatient-with-fixtures.spec.ts` — LOC add and void are Steps 7a and 7b in the full patient workflow.

---

## Running LOC Tests

LOC steps are part of the full patient workflow:

```bash
# Run the full add patient workflow (includes LOC as Step 7)
npx playwright test tests/tobeD/addpatient-with-fixtures.spec.ts --headed

# Specific environment
TEST_ENV=prod TENANT=cch npx playwright test tests/tobeD/addpatient-with-fixtures.spec.ts --headed
```

---

*Last updated: February 23, 2026*
