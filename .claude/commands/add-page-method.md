Add a new method to an existing page object following the project's POM standards.

**Input:** $ARGUMENTS

Expected format: `<page-object-file> — <description of what the method should do>`

Example: `pages/billing/claims.page.ts — read the denial reason column for a given row`

---

## Steps

### 1. Read Standards
Read `.claude/rules/page-objects.md` to refresh the golden rules.

### 2. Read the Target Page Object
Read the specified page object file completely. Understand:
- The existing `private readonly selectors` object — naming patterns, grouping
- The `fieldSelectors` map if present (used by `getRowFieldValue()`)
- Existing method signatures and patterns
- Current imports

### 3. Determine Method Type
Based on the description, classify the method:

| Prefix | Type | Rules |
|--------|------|-------|
| `get*` / `read*` | **Read** | Returns data. No assertions. No side effects. |
| `find*` | **Search** | Searches rows, returns index or -1. No assertions. |
| `assert*` | **Assert** | Verifies state. Throws descriptive error on mismatch. No return value. |
| `click*` / `select*` / `search*` | **Action** | Performs one UI action. May wait for result. |
| `navigateTo*` / `switchTab*` | **Navigation** | Navigates to a page/tab. |

**Never combine read + assert in one method.**

### 4. Add Selectors
If new selectors are needed:
- Add them to the `private readonly selectors` object, in the correct section group
- Prefer `data-cy` attributes: `'[data-cy="field-name"]'`
- For indexed/grid selectors, use function pattern: `(i: number) => \`[data-cy="label-fieldName-${i}"]\``
- If Playwright MCP is available, use `browser_snapshot` to verify the selector exists on the live UI
- If MCP is not available, add a `// TODO: verify selector against live UI` comment

### 5. Implement the Method
- Use `this.selectors.*` for all locator references — never inline strings
- For grid reads, use `this.waitForGridStable(this.selectors.gridRowCounter)` from BasePage
- Use `TIMEOUTS` constants from `config/timeouts.ts` for any timeout values
- Add explicit return type annotation

### 6. Update `fieldSelectors` (if applicable)
If the new method reads a grid column field, also add the field to the `fieldSelectors` map so `getRowFieldValue(rowIndex, fieldName)` can access it generically.

### 7. Show the Diff
Present the complete diff of changes before applying. Wait for confirmation if the change is non-trivial.
