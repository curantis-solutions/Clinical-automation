---
globs:
  - "workflows/**/*.ts"
---

# Workflow Standards

## Pure Orchestration
- Workflows coordinate page objects — they contain ZERO raw locators
- No `data-cy`, `getByText`, `getByRole`, `locator()`, or CSS selectors
- No `this.page.locator()` — always delegate to page object methods
- If you need a new selector, add it to the relevant page object first

## Navigation
- Use `dashboardPage.navigateToModule('Billing')` to reach the billing module from anywhere
- Use page object nav methods: `claimsPage.navigateTo()`, `batchPage.clickMainTab()`, `arPage.clickSidebarNav()`
- Never assume the current page — always navigate explicitly

## Error Context
- Include patient ID and current context (tab, page) in error messages
- Example: `No 837 batch found for patient ${patientId} in Notices tab`

## Polling
- Use `expect.toPass({ timeout, intervals })` for async waits
- Default: 60s timeout, 5s intervals for batch/AR appearance
- Default: 90s timeout, 5s intervals for claim reprocessing
