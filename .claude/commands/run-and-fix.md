Run a Playwright test spec, diagnose any failures, fix them, and re-run until passing.

**Target:** $ARGUMENTS

Example usage:
- `/run-and-fix tests/billing/hospice-medicare-sia-visits.spec.ts`
- `/run-and-fix tests/billing/hospice-medicare-sia-visits.spec.ts --grep "Step 14"`

---

## Step 1: Run the test

```bash
npx playwright test <spec-path> --headed --workers=1 [extra-args] 2>&1
```

Use `--timeout 600000` for long E2E specs.

If `--grep` is provided in arguments, pass it through to filter specific steps.

## Step 2: Analyze the result

If **all tests pass** → report success and stop.

If **any test fails**, for each failure:

### 2a. Read the error
- Extract the error message, file path, and line number from the output
- Identify the error type:
  - `TimeoutError: locator.*Timeout` → **Selector/timing issue**
  - `expect(received).toBe(expected)` → **Assertion failure** (data mismatch)
  - `expect(locator).toBeEnabled` → **UI state issue** (button disabled, form not ready)
  - `strict mode violation: resolved to N elements` → **Ambiguous selector**
  - `Error: element is outside of the viewport` → **Scroll/visibility issue**

### 2b. Read the error context
- Check if `error-context.md` exists in `test-results/` for the failed test
- Read it to see the page snapshot at failure time
- Key things to look for:
  - What page/URL is the browser on?
  - Is a modal/dialog open that blocks interaction?
  - Is the expected element present in the snapshot?
  - Has a selector or button text changed?

### 2c. Read the trace (if needed)
- If error context isn't sufficient, note the trace path for manual inspection
- DO NOT try to parse .zip trace files

## Step 3: Diagnose and fix

Based on the error type, apply the appropriate fix:

### Selector changed
- Use Playwright MCP (`browser_snapshot`, `browser_take_screenshot`) to inspect the current live UI
- Compare the expected selector with what's actually on the page
- Update the selector in the **page object** (never in spec/workflow)
- Update the knowledge base if a `data-cy` attribute changed

### Timing issue
- If element wasn't found within timeout: increase wait or add polling with `toPass()`
- If Ionic ion-select didn't register: increase wait between click → radio select (1000-1500ms)
- If page didn't navigate after action: add explicit navigation (sidebar profile → careplan pattern)
- **NEVER** add `page.waitForTimeout()` in specs — encapsulate in page object methods

### Assertion failure
- Read the actual vs expected values
- Check if the test data assumptions are still valid (dates, patient state, claim status)
- If data changed: update test expectations or use dynamic capture instead of hardcoded values

### UI state issue (button disabled)
- Check if a required field wasn't filled (modal snapshot shows empty fields)
- Check if an acknowledgement checkbox appeared (overlap, disclaimer)
- Check if form validation failed (Angular change detection — try click + fill + Tab pattern)

### Ionic-specific fixes
- **getByRole works, CSS doesn't**: If a CSS selector like `ion-modal button:has-text("X")` fails, switch to `modal.getByRole('button', { name: 'X' })`
- **Radio popover outside modal**: ion-select radio popovers render at document root, use `page.getByRole('radio')` not `modal.getByRole('radio')`
- **ion-picker constraints**: When selecting past-year dates, select month 01 first to reset constraints

## Step 4: Re-run

After applying fixes:
1. Run `npx tsc --noEmit` to verify no compilation errors
2. Re-run the test
3. If it passes → report success
4. If it fails again → go back to Step 2 (max 3 attempts)

## Step 5: Update knowledge base

If the fix involved:
- A **selector change**: update `.claude/agents/knowledge/{module}.md`
- A **new behavior discovered**: add to Key Behaviors section
- A **timing pattern**: document the required wait times

Use `/update-knowledge` to save findings.

---

## Rules

- **NEVER modify test expectations to make a failing test pass** — fix the root cause
- **NEVER add raw locators to specs or workflows** — all fixes go in page objects
- **NEVER use `page.goto()` with constructed URLs** — navigate via UI
- **NEVER convert `getByRole` to CSS for Ionic components** — it will break
- **Baby steps**: fix ONE issue per iteration, then re-run
- **Max 3 retry attempts** — if still failing after 3 fixes, report the issue and ask the user
