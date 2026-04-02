---
globs:
  - "tests/**/*.spec.ts"
---

# Test Spec Standards

## Golden Rule: No Raw Locators
- NEVER use `data-cy`, `getByText`, `getByRole`, `locator()`, or CSS selectors in spec files
- ALL element interaction goes through page objects: `pages.claims.findRowByBillType('812')`
- If you need a new interaction, add a method to the page object first

## No Hardcoded Values
- Patient IDs: use `PatientFixtures.getPatientIdFromFixture()` or `const PATIENT_ID` at top
- Dates: use `DateHelper.getDateOfMonth()` — never inline date strings
- Patient/payer names: capture from the UI via page object methods (e.g., `getPatientBillingName()`)
- Bill types, amounts, statuses: pass as parameters or use type constants

## Test Structure
- Use `test.describe.serial()` for sequential flows
- Shared state via `let` variables declared in describe scope
- Capture names/IDs early (Steps 01-03), use throughout
- Each test step should be focused — one concern per test

## Assertions
- Use `expect()` from Playwright for simple checks
- Use page object assertion methods for domain logic (e.g., `assertClaimCount()`)
- Polling: use `expect.toPass({ timeout, intervals })` — never `while` loops with sleep

## Workflow Usage
- Specs call workflow methods for multi-step operations
- Specs call page object methods for single interactions
- Specs NEVER call `page.*` directly
