# Generate Test Agent — Progress & Architecture

## What It Does
A Claude Code custom agent (`@generate-test`) that takes a Jira/Zephyr test case key, reads the test steps, explores the app UI, and generates production-quality Playwright test code following the framework's golden standard.

## Current Status

### Completed
- Agent definition created at `.claude/agents/generate-test.md`
- Agent workflow defined (8 phases + Phase 5.5 Selector Validation Gate + Phase 7.5 Execute & Self-Fix Loop)
- Self-learning knowledge base at `.claude/agents/generate-test-knowledge.md`
- MCP tool permissions configured in `.claude/settings.local.json` (includes `browser_evaluate`)
- Agent hardened with: wait strategy rules, dropdown/grid patterns, security rules, 10-point validation, 5 user checkpoints, self-healing test patterns
- First test generated and passing: **CR-5977** (Validate filters on new facility page)
- Second test generated and passing: **CR-5976** (Validate Archive facility functionality) — tested on QA (Integrum) + PROD (CTH)

### Generated Files for CR-5977
| File | Type | Purpose |
|------|------|---------|
| `pages/facilities.page.ts` | Page Object | Extends BasePage, `data-cy` selectors, filter/search/grid methods |
| `workflows/facilities.workflow.ts` | Workflow | Composes FacilitiesPage + DashboardPage for navigation + filter flows |
| `fixtures/page-objects.fixture.ts` | Fixture (updated) | Registered `facilities` and `facilitiesWorkflow` |
| `tests/facility/cr-5977-validate-facility-filters.spec.ts` | Spec | 6 steps, zero raw locators, maps to 5 Zephyr steps |
| `docs/test-cases/CR-5977.md` | Test Case Doc | Markdown version of the Zephyr test case with UI discovery notes |

### Generated Files for CR-5976
| File | Type | Purpose |
|------|------|---------|
| `pages/facilities.page.ts` | Page Object (extended) | Added archive/activate/history methods, `findActiveFacilityWithName()` |
| `workflows/facilities.workflow.ts` | Workflow (extended) | Added `archiveFacility()`, `activateFacility()`, `verifyArchivedRowControls()`, `getLatestHistory()` |
| `tests/facility/cr-5976-validate-archive-facility.spec.ts` | Spec | 6 steps, zero raw locators, self-healing, tenant-agnostic |
| `docs/test-cases/CR-5976.md` | Test Case Doc | Markdown with Jira link + spec link |

### Test Results — CR-5977 (All Passing)
```
Step 01: Login as MD                                    ✓ 10.6s
Step 02: Navigate to Facilities, verify filters         ✓  5.9s
Step 03: Verify Facility Type options (9 Q-codes)       ✓  0.7s
Step 04: Verify Status options (Active, Archived)       ✓  0.6s
Step 05: Search bar functionality (dynamic term)        ✓ 10.6s
Step 06: Combined filters (type + search)               ✓ 13.2s
Total: 6 passed (46.4s)
```

### Test Results — CR-5976 (All Passing on QA + PROD)
```
QA (Integrum) — "A test edit facility":
Step 01: Login as MD                                    ✓ 10.5s
Step 02: Navigate, find Active facility                 ✓  7.1s
Step 03: Archive facility, verify via search            ✓ 10.4s
Step 04: Verify change history (Active → Archived)      ✓  0.1s
Step 05: Verify no ellipsis, Activate button visible    ✓  0.0s
Step 06: Re-activate, verify via search                 ✓  7.6s
Total: 6 passed (40.7s)

PROD (CTH) — "2.1Q Facility":
Step 01: Login as MD                                    ✓ 10.9s
Step 02: Navigate, find Active facility                 ✓  7.9s
Step 03: Archive facility, verify via search            ✓ 14.4s
Step 04: Verify change history (Active → Archived)      ✓  0.1s
Step 05: Verify no ellipsis, Activate button visible    ✓  0.0s
Step 06: Re-activate, verify via search                 ✓  7.7s
Total: 6 passed (45.8s)
```

---

## Agent Workflow (8 Phases)

### Phase 1: Fetch Jira Metadata
- Use `mcp__claude_ai_Atlassian__getJiraIssue` to get summary, module, test type, priority, linked stories
- Extract issue ID for Zephyr URL

### Phase 2: Read Zephyr Test Steps (via Browser)
- **Critical**: Zephyr test steps are stored separately from Jira issue fields — Atlassian MCP can't access them directly
- Use Playwright MCP to navigate to `https://curantissolutions.atlassian.net/browse/{KEY}`
- Click "Test Details" section to expand
- Read test steps from the Zephyr iframe: Test Step | Test Data | Test Result
- **Do this BEFORE looking at linked stories**

### Phase 3: Ask User Preferences
- Markdown doc needed? (optional)
- Confirm module and login role

### Phase 4: Map to Existing Framework
- Check what page objects/workflows already exist in `fixtures/page-objects.fixture.ts`
- Determine what needs to be created vs reused

### Phase 5: Explore UI via Playwright MCP
- Login to QA app, navigate to the module
- Use `browser_snapshot` / `browser_evaluate` to discover selectors
- **Verify each Zephyr test step against the live UI before generating code**
- Prefer `data-cy` attributes (e.g., `[data-cy="label-facilityName-0"]`)

### Phase 6: Generate Code (Golden Standard)
- **Page Object** under `pages/` — extends BasePage, private readonly selectors, one method per action
- **Workflow** under `workflows/` — composes page objects, never accesses selectors directly
- **Update Fixture** — register new classes in `fixtures/page-objects.fixture.ts`
- **Types** under `types/` if complex form data
- **Spec File** — THIN, zero raw locators, only calls `pages.{x}.{method}()`

### Phase 7: Validate
- Grep for raw `sharedPage.locator()` in spec — must be zero
- Verify all imports resolve
- Verify referenced methods exist

### Phase 8: Report
- List files created/modified
- How to run the test
- Optionally update Jira (automation flag, comment)

---

## Golden Standard Rules

### Page Objects (`pages/`)
- Always extend `BasePage`
- All selectors in `private readonly selectors` object, grouped by section
- Use `data-cy` attributes when available
- One public method per user action
- Return typed data, never raw locators
- NO test assertions inside page objects

### Workflows (`workflows/`)
- Instantiate page objects in constructor
- Compose page object methods — never access selectors directly
- Return meaningful data for assertions in spec

### Spec Files (`tests/`)
- **Zero raw locators** — every interaction through page objects/workflows
- `test.describe.serial` wrapping
- `test.setTimeout(TEST_TIMEOUTS.STANDARD)` in each test
- Emoji console.log: 🔐 🎯 📝 💾 🔍 ✅
- Use `CredentialManager` for credentials
- Use `TIMEOUTS` / `TEST_TIMEOUTS` from config
- Environment/tenant agnostic — read dynamic data from grid, never hardcode

### Fixture Registration
- Import new page object and workflow
- Add to `PageObjects` interface
- Add to `createPageObjectsForPage()` factory

---

## Lessons Learned During CR-5977

### Selector Issues
1. **`getByRole('option')` is too broad** — picks up options from other dropdowns (e.g., tenant selector). Fix: scope to the specific `listbox` container using `.filter({ hasText: 'Facility Type' })`.
2. **Grid rows don't have `facility_X_row` IDs** — the actual selectors use `data-cy` attributes: `label-facilityName-{i}`, `label-facilityType-{i}`, `label-status-{i}`. Always use `browser_evaluate` to inspect actual DOM before assuming selectors.
3. **Ionic `ion-select` dropdowns** — open as combobox with role `option` items. Close with `Escape` key.

### Search Behavior
- Search requires pressing **Enter** to initiate (per Zephyr step 4)
- Search terms must be **dynamic** — read from the grid, not hardcoded — to work across tenants/environments

### Zephyr Test Steps
- Stored in a separate iframe on the Jira issue page, under "Test Details" section
- Must click the section heading to expand it
- Format: Test Step | Test Data | Test Result (with optional Attachments column)
- The Jira issue `description` field is often null — test steps are ONLY in Zephyr

### Jira Authentication
- Playwright MCP browser needs manual Jira login (interactive auth)
- The Atlassian MCP tools work without browser auth (token-based)

---

## Hardening (Completed 2026-03-25)

- [x] Agent should handle Jira login flow gracefully (detect login page, prompt user) — Phase 2b
- [x] Agent should validate all discovered selectors before writing code — Phase 5.5 Selector Validation Gate
- [x] Agent should handle pagination in the facility grid — Grid Data Extraction Pattern with pagination
- [x] Agent should support different module types beyond Facilities — Phase 4c Module Generalization
- [x] Agent should detect when a page object already exists and extend it rather than create new — Phase 4b Reuse Protocol
- [x] Agent should handle test data cleanup / teardown — Phase 6e afterAll cleanup pattern
- [x] Improve Zephyr test step parsing — handle different formats, empty steps — Phase 2d multi-format parsing
- [x] Mandatory wait strategy rules — zero `waitForTimeout`, use named TIMEOUTS constants
- [x] Ionic dropdown interaction pattern — verify open AND close
- [x] 10-point validation checklist in Phase 7
- [x] Quality metrics in Phase 8 report
- [ ] Add support for test execution reporting back to Zephyr (future enhancement)
