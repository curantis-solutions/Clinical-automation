Audit the following files against the project's golden standards.

**Target:** $ARGUMENTS

If no files/paths specified, scan ALL files in `tests/`, `workflows/`, and `pages/`.

---

## How to Audit

Use the **Grep** tool to scan for violation patterns, then **Read** flagged files to verify context and eliminate false positives.

---

## Spec Files (`tests/**/*.spec.ts`)

Scan for these violations:

### 1. Raw Locators (CRITICAL)
Any occurrence of these patterns means a locator leaked into the spec:
- `data-cy` — selectors belong in page objects
- `getByText(` — use page object methods instead
- `getByRole(` — use page object methods instead
- `getByTestId(` — use page object methods instead
- `locator(` — use page object methods instead
- `.locator(` — direct Playwright locator call

**Exception:** References inside comments or string descriptions are OK.

### 2. Hardcoded Dates
- Date-like strings: `'01/15/2026'`, `"2026-01-15"`, `'1/15/2026'`
- Should use `DateHelper.getDateOfMonth()` instead

### 3. Hardcoded Patient/Payer Names
- String literals assigned to variables like `patientName`, `payerName` that are not captured from the UI
- Should capture dynamically via page object methods

### 4. Direct `page.*` Calls
- `page.locator(`, `page.click(`, `page.fill(`, `page.getByText(`, `page.getByRole(`
- Specs must go through page objects or workflows, NEVER call `page.*` directly

---

## Workflow Files (`workflows/**/*.ts`)

### 1. Raw Locators (CRITICAL)
Same patterns as specs — `data-cy`, `getByText(`, `getByRole(`, `locator(`, `getByTestId(`
Workflows must delegate ALL selectors to page objects.

### 2. Error Messages Missing Context
- `throw new Error(` or `catch` blocks that don't include `patientId` or patient context
- Error messages should include patient ID and current page/tab context

---

## Page Object Files (`pages/**/*.ts`)

### 1. Selectors Outside `selectors` Object
- Any `data-cy` string or locator string used directly in a method body instead of `this.selectors.*`
- All selectors MUST be in the `private readonly selectors` object at the top of the class

### 2. Inline `waitForGridStable`
- Any custom grid-waiting logic (while loop with count comparison) instead of calling `this.waitForGridStable()` from BasePage
- The ONLY place `waitForGridStable` should be implemented is in `pages/base.page.ts`

### 3. Method Naming Violations
Check method names follow the conventions:
- `getRowFieldValue()`, `getVisibleRowCount()` — grid reads
- `readRowData()`, `readBatchRowData()` — full row reads
- `findRowBy*()` — search rows
- `assert*()` — assertions
- `navigateTo*()`, `switchSecondaryTab()` — navigation
- `searchBy*()` — search input

### 4. Mixed Responsibility
Methods that contain BOTH data reads (`return`, `textContent()`) AND assertions (`expect(`) — these should be split into separate methods.

---

## Output Format

For each violation found, report:

```
FILE: <path>:<line>
TYPE: <violation category>
CODE: <offending line>
FIX:  <suggested fix>
```

Group violations by file. End with:

```
Summary: X violation(s) in Y file(s)
```

If no violations found: **"All files pass golden standards."**
