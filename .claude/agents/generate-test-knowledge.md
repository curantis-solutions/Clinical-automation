# Generate Test Agent — Knowledge Base

The agent MUST read this file + the relevant module file before Phase 5, and update them after every run.

**Structure:**
- This file → global patterns (apply to ALL modules)
- `knowledge/facilities.md` → Facilities module specifics
- `knowledge/{module}.md` → future modules get their own file

---

## Tenant & Login

- **ALWAYS check `TENANT` in `.env.local`** before MCP exploration. Use the matching tenant's credentials (e.g., `TENANT=integrum` → use `QA_INTEGRUM_MD_USERNAME`). Different tenants have completely different data.
- After login, verify the tenant name in the header dropdown.

## CSS Selectors

- **IDs starting with a number** (`#0showDetailsBtn`) → INVALID CSS. Use `[id="0showDetailsBtn"]`.
- **`getByText()` can be ambiguous** — prefer `getByTestId` or `data-cy` when text appears multiple times on page.
- Always validate with `browser_evaluate` + `document.querySelector()`.

## Angular Ionic Wait Patterns

- **`waitForPageLoad()` is NOT reliable for API-driven updates.** Only use after full page navigation (URL change).
- **`page.reload()` cancels in-flight API requests.** Always `waitForResponse` BEFORE reload.
- **Proven combo for state-changing actions**: `waitForResponse` (API) + `waitForLoadState('networkidle')` + `waitForTimeout(TIMEOUTS.MEDIUM)` for Angular settle.
- **After clicking any tab**, wait for grid row to be attached: `locator(firstRow).waitFor({ state: 'attached', timeout: TIMEOUTS.API })`.

## Test Robustness

- **Self-healing start**: Check if target entity is in expected state. If not (leftover from failed run), restore it first.
- **Find entity with name**: Some tenants have entities with empty names. Scan grid for one with a non-empty name.
- **Verify via search after state change**: Search by name → if not found, add status filter as fallback.
- **Reset filters between steps**: Re-click the module tab to clear all filters cleanly.

## Golden Standard Reminders

- `VIEWPORTS.desktop` — never hardcode `{ width: 1280, height: 720 }`
- `TIMEOUTS.*` / `TEST_TIMEOUTS.*` — never hardcode raw numbers
- Zero raw locators in spec — everything through page objects
- `page.evaluate()` for complex DOM extraction — Playwright locator chaining is unreliable for sibling navigation

## Common Failures

| Failure | Fix |
|---------|-----|
| `not a valid selector` (numeric ID) | Use `[id="..."]` format |
| Status unchanged after action | Use `waitForResponse` + `TIMEOUTS.MEDIUM` settle |
| `getByText` strict mode violation | Use `getByTestId` or `data-cy` |
| Grid rows empty after tab click | Wait for first row `attached` |
| `page.reload()` lost the action | `waitForResponse` before reload |
| Filter persists between steps | Re-click module tab to reset |
| Comment/tooltip field empty | Make assertion soft (check if non-empty) |

---

*Last updated: 2026-03-25*
