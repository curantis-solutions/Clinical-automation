# Add/Edit Mode Pattern Guide

## Overview

This guide documents the add/edit mode pattern used in workflow functions throughout this test automation framework. The pattern enables a single workflow function to handle both creating new records and editing existing ones.

**When to Use This Pattern:**
- Forms that can be opened in both "add new" and "edit existing" modes
- Entities with an "add" button (FAB/plus icon) and a "more" menu for editing
- When you need selective field updates in edit mode

**Reference Implementations:**
- `workflows/benefits.workflow.ts` - Most comprehensive example (lines 53-246)
- `workflows/patient-profile/referring-physician.workflow.ts` - Referring Physician
- `workflows/consents.workflow.ts` - Auto-detect mode example (lines 20-56)

---

## Function Signature Pattern

The standard signature for add/edit workflow functions:

```typescript
export async function workflowFunction(
  page: Page,
  mode: 'add' | 'edit',
  config: ConfigInterface,
  fieldsToEdit: string[] = []
): Promise<ResultInterface>
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | `Page` | Playwright Page object |
| `mode` | `'add' \| 'edit'` | Operation mode |
| `config` | `ConfigInterface` | Data/configuration object |
| `fieldsToEdit` | `string[]` | Fields to update in edit mode (empty = all fields in add mode) |

**Example from Referring Physician:**
```typescript
// workflows/patient-profile/referring-physician.workflow.ts
export async function addReferringPhysicianInformation(
  page: Page,
  mode: 'add' | 'edit',
  physicianInfo: ReferringPhysicianInfoConfig,
  fieldsToEdit: string[] = []
): Promise<ReferringPhysicianInfoResult>
```

---

## The `shouldEdit` Helper Pattern

This helper function determines whether a field should be filled/updated based on the current mode:

```typescript
// Basic pattern
const shouldEdit = (field: string): boolean => {
  return mode !== 'edit' || fieldsToEdit.includes(field);
};
```

**How it works:**
- **Add mode** (`mode !== 'edit'`): Returns `true` for all fields - fill everything
- **Edit mode**: Returns `true` only if the field is in `fieldsToEdit` array

**Extended pattern with additional conditions (from Benefits workflow):**

```typescript
// workflows/benefits.workflow.ts:73-85
const shouldEdit = (field: string): boolean => {
  const isSkippedForPalliative = benefitType === 'Palliative' && palliativeSkipFields.includes(field);
  const isSkippedForRoomAndBoard = data.payerLevel === 'Room And Board' && roomAndBoardSkipFields.includes(field);

  return (
    !isSkippedForPalliative &&
    !isSkippedForRoomAndBoard &&
    (mode !== 'edit' || fieldsToEdit.includes(field)) &&
    data[field as keyof BenefitFormData] !== undefined &&
    data[field as keyof BenefitFormData] !== null &&
    data[field as keyof BenefitFormData] !== ''
  );
};
```

**Usage in form filling:**
```typescript
if (shouldEdit('groupNumber')) {
  await this.benefitsPage.fillGroupNumber(data.groupNumber!);
}

if (shouldEdit('searchName')) {
  await handleReferringPhysicianData(page, patientDetailsPage, searchName);
}
```

---

## Form Opening Pattern

### Add Mode - Click FAB/Plus Button

```typescript
// workflows/benefits.workflow.ts:90-91
if (mode === 'add') {
  await this.benefitsPage.clickAddPayer();
}

// workflows/patient-profile/referring-physician.workflow.ts
if (mode === 'add') {
  await page.locator(patientDetailsPage.getSelector('addReferringPhysician')).click();
}
```

### Edit Mode - Click More Icon → Edit Button

Edit mode requires a two-step process:
1. Click the 3-dot "more" icon to open the action menu
2. Click the "Edit" (create) button

```typescript
// workflows/benefits.workflow.ts:92-96
} else if (mode === 'edit') {
  await this.benefitsPage.clickMoreButtonByPayerLevel(editPayerLevel);
  await this.benefitsPage.clickEditButton();
}

// workflows/patient-profile/referring-physician.workflow.ts
} else {
  // For edit: Click the "more" icon (3-dot menu)
  const referringPhysicianSection = page.locator('text=Referring Physician')
    .locator('..').locator('img[alt="more"]');

  if (await referringPhysicianSection.isVisible()) {
    await referringPhysicianSection.click();
  } else {
    // Fallback: use generic more icon selector
    const moreIcons = page.getByRole('img', { name: 'more' });
    await moreIcons.nth(2).click();
  }
  await page.waitForTimeout(500);

  // Click the "create" button (edit/pencil icon)
  await page.getByRole('button', { name: 'create' }).click();
}
```

---

## Selector Organization

### Naming Conventions

Page objects should organize selectors with clear naming patterns:

```typescript
// pages_new/benefits-add.page.ts:12-105
private readonly selectors = {
  // Navigation
  benefitsNavBarItem: '[data-cy="btn-nav-bar-item-benefits"]',
  addPayerButton: '[data-cy="btn-add-payer"]',

  // Edit functionality
  moreButton: '[aria-label="Patient Details"] button:has(img[alt="more"])',
  moreButtonInGrid: 'button:has(img[alt="more"])',
  moreButtonInRow: (level: string) => `ion-row:has-text("${level}") button:has(img[alt="more"])`,
  editButton: 'button:has-text("create Edit"), button:has-text("Edit")',

  // Form fields...
};
```

### Common Selector Patterns

| Purpose | Pattern | Example |
|---------|---------|---------|
| Add button | `btn-add-{entity}` | `[data-cy="btn-add-payer"]` |
| More icon | `img[alt="more"]` or `button:has(img[alt="more"])` | See above |
| Edit button | `button:has-text("create Edit")` | Role-based: `getByRole('button', { name: 'create' })` |
| Save button | `btn-save` | `[data-cy="btn-save"]` |

---

## Logging Pattern

Consistent logging helps with debugging and test output:

```typescript
// Start of operation
console.log(`\n${mode === 'add' ? 'Adding' : 'Editing'} ${entityName}...`);

// During operation
console.log(`  → Using physician search name: ${searchName}`);
console.log(`  ✓ Clicked more icon in Referring Physician section`);

// Success
console.log(`${mode === 'add' ? 'ADDED' : 'UPDATED'} SUCCESSFULLY`);
```

**Example from Benefits workflow:**
```typescript
// workflows/benefits.workflow.ts:62
console.log(`\n${mode === 'add' ? 'Adding' : `Editing ${editPayerLevel}`} ${benefitType} benefit...`);

// workflows/benefits.workflow.ts:245
console.log(`${mode === 'add' ? 'Added' : 'Edited'} ${benefitType} benefit successfully`);
```

**Example from Referring Physician:**
```typescript
// workflows/patient-profile/referring-physician.workflow.ts
function logReferringPhysicianSuccess(
  physicianInfo: ReferringPhysicianInfoConfig,
  mode: 'add' | 'edit'
): void {
  console.log('\n' + '='.repeat(70));
  console.log(`✅ REFERRING PHYSICIAN ${mode === 'add' ? 'ADDED' : 'UPDATED'} SUCCESSFULLY`);
  console.log('='.repeat(70));
  if (physicianInfo.sameAsReferrer) {
    console.log('   Same as Referrer: Yes');
  } else if (physicianInfo.searchName) {
    console.log(`   Physician: ${physicianInfo.searchName}`);
  }
  console.log('='.repeat(70) + '\n');
}
```

---

## Complete Example Template

Here's a complete template based on the Referring Physician implementation:

```typescript
import { Page } from '@playwright/test';

/**
 * Configuration interface
 */
export interface EntityInfoConfig {
  fieldA?: string;
  fieldB?: string;
  useDefault?: boolean;
}

/**
 * Result interface
 */
export interface EntityInfoResult {
  success: boolean;
  error?: string;
}

/**
 * Add or edit entity information
 * @param page - Playwright Page object
 * @param mode - 'add' or 'edit' mode
 * @param config - Entity configuration
 * @param fieldsToEdit - Array of fields to edit in edit mode
 */
export async function addOrEditEntity(
  page: Page,
  mode: 'add' | 'edit',
  config: EntityInfoConfig,
  fieldsToEdit: string[] = []
): Promise<EntityInfoResult> {
  const entityPage = new EntityPage(page);

  try {
    console.log(`\n${mode === 'add' ? 'Adding' : 'Editing'} entity...`);

    // Open form based on mode
    await openEntityForm(page, entityPage, mode);

    // Helper to determine if field should be edited
    const shouldEdit = (field: string): boolean => {
      return mode !== 'edit' || fieldsToEdit.includes(field);
    };

    // Fill fields conditionally
    if (shouldEdit('fieldA') && config.fieldA) {
      await entityPage.fillFieldA(config.fieldA);
    }

    if (shouldEdit('fieldB') && config.fieldB) {
      await entityPage.fillFieldB(config.fieldB);
    }

    // Save form
    await saveEntityForm(page, entityPage);

    logEntitySuccess(config, mode);
    return { success: true };

  } catch (error) {
    console.error('❌ Entity operation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Open entity form based on mode
 */
async function openEntityForm(
  page: Page,
  entityPage: EntityPage,
  mode: 'add' | 'edit'
): Promise<void> {
  if (mode === 'add') {
    // Click the plus/FAB button
    await page.locator(entityPage.getSelector('addEntity')).click();
  } else {
    // Edit mode: Click more icon, then edit button
    const moreIcon = page.locator('text=Entity Section').locator('..').locator('img[alt="more"]');
    await moreIcon.click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'create' }).click();
  }
  await page.waitForTimeout(1500);
  console.log(`  ✓ Entity form opened (${mode} mode)`);
}

/**
 * Save entity form
 */
async function saveEntityForm(page: Page, entityPage: EntityPage): Promise<void> {
  console.log('  → Saving entity...');
  await page.locator(entityPage.getSelector('entityFormSave')).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

/**
 * Log success message
 */
function logEntitySuccess(config: EntityInfoConfig, mode: 'add' | 'edit'): void {
  console.log('\n' + '='.repeat(70));
  console.log(`✅ ENTITY ${mode === 'add' ? 'ADDED' : 'UPDATED'} SUCCESSFULLY`);
  console.log('='.repeat(70));
  console.log('='.repeat(70) + '\n');
}
```

---

## Auto-Detect Mode Pattern

For simpler forms, you can auto-detect the mode based on which button is visible:

```typescript
// workflows/consents.workflow.ts:28-39
const isAddMode = await this.consentsPage.isAddButtonVisible();
const isEditMode = await this.consentsPage.isMoreButtonVisible();

if (isAddMode) {
  console.log('No existing consents - adding new...');
  await this.consentsPage.clickAddConsents();
} else if (isEditMode) {
  console.log('Existing consents found - editing...');
  await this.consentsPage.openConsentsForm();
} else {
  throw new Error('Neither Add nor Edit button found for consents');
}
```

---

## Common Pitfalls & Solutions

### 1. More Button as `<img>` vs `<button>`

**Problem:** The "more" icon may be an `<img>` element inside a button, not a button itself.

**Solution:** Use the correct selector pattern:
```typescript
// Wrong - won't work if more is an img
page.locator('button[name="more"]')

// Correct - targets button containing img
page.locator('button:has(img[alt="more"])')

// Or use role-based
page.getByRole('img', { name: 'more' })
```

### 2. Multiple "More" Buttons on Page

**Problem:** Multiple records on the page each have their own "more" button.

**Solution:** Scope the selector to the specific row/section:
```typescript
// Benefits: Find by payer level text in the row
const moreButton = page.locator(`ion-row:has-text("${payerLevel}") button:has(img[alt="more"])`);

// Referring Physician: Navigate from section header
const moreIcon = page.locator('text=Referring Physician').locator('..').locator('img[alt="more"]');
```

### 3. Search Result Selectors Vary

**Problem:** Search results may use different DOM structures.

**Solution:** Try multiple selector strategies:
```typescript
// workflows/patient-profile/referring-physician.workflow.ts
// 1. First try the page object selector
let searchResults = page.locator(patientDetailsPage.getSelector('referringPhysicianSearchResults'));
let resultsCount = await searchResults.count();

// 2. If not found, try text-based locator
if (resultsCount === 0) {
  const searchResultByText = page.locator(`text=/${searchName}/i`).first();
  if (await searchResultByText.isVisible({ timeout: 2000 }).catch(() => false)) {
    await searchResultByText.click();
    return true;
  }
}
```

### 4. Edit Button Has Icon Prefix

**Problem:** The edit button's accessible name includes the icon: "create Edit" not just "Edit".

**Solution:** Use the full accessible name or a partial match:
```typescript
// Role-based with full name
page.getByRole('button', { name: 'create Edit' })

// Or text-based fallback
page.locator('button:has-text("Edit")')
```

---

## Test Usage Examples

### Add Mode
```typescript
test('Add referring physician', async ({ page }) => {
  await addReferringPhysicianInformation(page, 'add', {
    searchName: 'cypresslast'
  });
});
```

### Edit Mode - Update Specific Fields
```typescript
test('Edit referring physician', async ({ page }) => {
  await addReferringPhysicianInformation(page, 'edit', {
    searchName: 'Dr. Jones'
  }, ['searchName']);  // Only update searchName field
});
```

### Auto-Detect Mode
```typescript
test('Fill consents', async ({ pages }) => {
  // Workflow auto-detects add vs edit based on UI state
  await pages.consentsWorkflow.fillConsents('yes');
});
```

---

*Last updated: February 5, 2026*
