# Curantis Clinical — E2E Automation

## Architecture
- **Page Objects** (`pages/`): All selectors and element interactions. One class per page/module.
- **Workflows** (`workflows/`): Multi-step orchestration. Zero raw locators — delegates to page objects.
- **Specs** (`tests/`): Test steps. Zero raw locators — calls page objects and workflows only.
- **Types** (`types/`): Shared interfaces for data structures.
- **Utils** (`utils/`): Generic helpers (DateHelper, PdfHelper, CredentialManager).
- **Fixtures** (`fixtures/`): Page object factory, test data generators, auth setup.

## Golden Standard
1. **No raw locators in specs or workflows** — all `data-cy`, `getByText`, `getByRole`, `locator()` calls live in page objects only.
2. **No hardcoded patient/payer names** — capture at source during test flow.
3. **Dynamic dates** — use `DateHelper.getDateOfMonth()`, never inline date strings.
4. **Shared grid patterns** — use `BasePage.waitForGridStable()` for all grid polling.
5. **Single responsibility** — read methods return data, assert methods verify state.

## File-Specific Rules
See `.claude/rules/` for auto-loaded standards per file type:
- `page-objects.md` — selector storage, method naming, grid stability
- `specs.md` — no raw locators, no hardcoded values, test structure
- `workflows.md` — pure orchestration, navigation patterns, error context

## Key Patterns
- **Grid field reads**: `page.getRowFieldValue(rowIndex, 'fieldName')` — consistent across all page objects
- **Polling**: `expect(async () => { ... }).toPass({ timeout, intervals })` — never while+sleep
- **Date utility**: `DateHelper.getDateOfMonth(day, monthsAgo)` — generic relative month dates
- **POM fixture**: `fixtures/page-objects.fixture.ts` — all page objects registered centrally

## Credentials
- Environment URLs and credentials are in `.env.local` — never hardcode
- Access via `CredentialManager.getBaseUrl()` and `CredentialManager.getCredentials(env, role)`
- Roles: MD (billing access), RN, SW
