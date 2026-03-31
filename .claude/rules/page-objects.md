---
globs:
  - "pages/**/*.ts"
---

# Page Object Standards

## Selectors
- ALL selectors MUST be in the private `selectors` object at the top of the class
- Use `data-cy` attributes first, text/role selectors only when no data-cy exists
- Indexed selectors use function pattern: `(i: number) => \`[data-cy="label-name-${i}"]\``
- Modal/dialog selectors belong in the page object that triggers them

## Method Naming (consistent across all page objects)
- `getRowFieldValue(rowIndex, field)` — read a single grid cell
- `getVisibleRowCount()` — count grid rows
- `readRowData(rowIndex)` / `readBatchRowData()` / `readNoticeRowData()` — read full row
- `findRowBy*(value)` — search rows, return index or -1
- `assertClaimCount()` / `assertRowCount()` — assert grid state
- `navigateToTab()` / `switchSecondaryTab()` — tab navigation
- `searchByPatient()` / `searchBatch()` — search input

## Grid Stability
- Use `this.waitForGridStable(this.selectors.gridRowCounter)` from BasePage
- NEVER implement waitForGridStable inline — it's in BasePage

## Single Responsibility
- Read methods: return data, no assertions
- Assert methods: verify state, throw on mismatch
- Never combine read + assert + expand + verify in one method
