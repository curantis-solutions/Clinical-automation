# Facilities Module — Knowledge

## Navigation
- Rubik's cube → Location → Facilities tab
- Tab selector: `getByTestId('tab-Facilities')` (NOT `getByText('Facilities')` — ambiguous)
- URL: `/#/company/company-management/location-group`

## Grid
- Rows use `data-cy` indexed selectors: `label-facilityName-{i}`, `label-facilityType-{i}`, `label-status-{i}`
- Some tenants have empty facility names (Integrum QA) — use `findActiveFacilityWithName()`
- Search only returns Active facilities by default — Archived facilities need the Archived filter

## Archive Flow
- 3-dots: `#optionsButtonFacility{index}` → menu: Edit, Archive, Delete
- Archive dialog: required comment textbox + Proceed/Cancel
- After Proceed: `waitForResponse(url includes 'active-toggle')` + `networkidle` + `TIMEOUTS.MEDIUM`

## Activate Flow
- Button: `#optionsButtonActivate{index}` — NO confirmation popup, immediate
- After click: `waitForResponse(url includes 'active-toggle')` + `networkidle` + `TIMEOUTS.MEDIUM`

## Row Controls
- **Active rows**: 3-dots menu + expand arrow
- **Archived rows**: Activate button + expand arrow (NO 3-dots)

## Expand Row / History
- Expand button: `[id="{index}showDetailsBtn"]`
- Shows: Contact info + History table
- History headers: Changes Made To | Previous Value | New Value | Change Made By | Date of Change | Comment
- Extract with `page.evaluate()` — navigate: cell → parent → check if at row level → nextSibling = data row
- Comment may be truncated/in tooltip — assert softly

## Tests Generated
- CR-5977: Validate filters (read-only, 6 steps)
- CR-5976: Validate archive/activate (data-mutating, 6 steps, self-healing)

---

*Last updated: 2026-03-25*
