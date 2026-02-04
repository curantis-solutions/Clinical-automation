# Benefits Automation Guide

## Overview

Automates the Benefits module for adding and editing patient benefits.

**Supported Operations:**
- Add new benefits (Primary, Secondary, Room And Board)
- Edit existing benefits

**Benefit Types:**
- **Hospice** - Full hospice eligibility fields
- **Palliative** - Skips hospice-specific fields

## File Structure

```
pages_new/benefits-add.page.ts      # Page object
workflows/benefits.workflow.ts      # Workflow orchestration
fixtures/benefit-fixtures.ts        # Test data & payer name lookup
types/benefit.types.ts              # TypeScript interfaces
```

## Quick Start

### 1. Import the page objects fixture

```typescript
import { test, expect } from '@fixtures/page-objects.fixture';
```

### 2. Add a benefit

```typescript
test('Add benefit', async ({ pages }) => {
  // Uses data from BENEFIT_FORM_DATA fixture
  await pages.benefitsWorkflow.fillBenefitDetails('add');
});
```

### 3. Edit a benefit

```typescript
test('Edit benefit', async ({ pages }) => {
  // Specify which fields to update
  await pages.benefitsWorkflow.fillBenefitDetails(
    'edit',
    ['groupNumber', 'subscriberId'],  // Fields to edit
    'Hospice',
    'Primary'  // Payer level to edit
  );
});
```

## Workflow Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `mode` | `'add' \| 'edit'` | Add new or edit existing |
| `fieldsToEdit` | `string[]` | Fields to update (edit mode only) |
| `benefitType` | `'Hospice' \| 'Palliative'` | Benefit type |
| `editPayerLevel` | `'Primary' \| 'Secondary' \| 'Room And Board'` | Which benefit to edit |

## Fixture Configuration

Edit `fixtures/benefit-fixtures.ts` to set test data:

```typescript
export const BENEFIT_FORM_DATA = {
  // Required
  payerLevel: 'Primary',           // 'Primary' | 'Secondary' | 'Room And Board'
  payerType: 'Medicare',           // 'Medicare' | 'Medicaid' | 'Commercial'
  payerName: '',                   // Leave empty for auto-lookup

  // Subscriber
  groupNumber: '9AA9AA9AA99',
  subscriberId: '9AA9AA9AA99',
  subscriberState: 'TX',

  // Hospice Eligibility
  admitBenefitPeriod: '1',
  benefitPeriodStartDate: '01/01/2026',

  // Room And Board (when payerLevel = 'Room And Board')
  billingEffectiveDate: '01/15/2026',
  billRate: 'Bill at Facility Rate',
  patientLiability: 'Yes',
};
```

## Environment-Aware Payer Names

Leave `payerName` empty - the workflow automatically selects the correct payer based on:
- `TEST_ENV` (qa, staging, prod)
- `TENANT` (cth, integrum)
- `payerType` (Medicare, Medicaid, Commercial)

```typescript
// .env
TEST_ENV=qa
TENANT=cth

// Fixture
payerType: 'Medicare',
payerName: '',  // Auto-resolves to 'Medicare A'
```

## Common Operations

```typescript
// Add Primary benefit
await pages.benefitsWorkflow.fillBenefitDetails('add');

// Edit Primary benefit
await pages.benefitsWorkflow.fillBenefitDetails('edit', ['groupNumber'], 'Hospice', 'Primary');

// Edit Secondary benefit
await pages.benefitsWorkflow.fillBenefitDetails('edit', ['subscriberId'], 'Hospice', 'Secondary');

// Add Room And Board (set payerLevel: 'Room And Board' in fixture)
await pages.benefitsWorkflow.fillBenefitDetails('add', [], 'Hospice');
```

## Room And Board Configuration

Room And Board benefits require additional fixture settings:

```typescript
payerLevel: 'Room And Board',
payerType: 'Medicaid',              // Medicare NOT supported for R&B
billingEffectiveDate: '01/01/2026',
billRate: 'Bill at Facility Rate',  // or 'Bill at Payer Room and Board Rate'
careLevel: 'Regular - GeneralRoom', // Required when billRate = 'Bill at Facility Rate'
patientLiability: 'Yes',
```

## Running Tests

```bash
# Run the test suite
npx playwright test tests/tobeD/addpatient-with-fixtures.spec.ts

# Debug mode
PWDEBUG=1 npx playwright test tests/tobeD/addpatient-with-fixtures.spec.ts --headed
```

---

*Last updated: February 4, 2026*
