Update the agent knowledge base with new information from a test run or observation.

**Input:** $ARGUMENTS

Expected format: `<module> <description or test-results-path>`

Examples:
- `billing "NOE submission now requires 2-step confirmation dialog"`
- `billing test-results/billing-run.json`
- `facilities "archive button selector changed to data-cy=btn-archive"`

---

## Steps

### 1. Identify the Knowledge File
Path: `.claude/agents/knowledge/{module}.md`

- If the file exists, read it to understand current structure and content
- If the file does NOT exist, create it using `.claude/agents/knowledge/billing.md` as the template structure

### 2. Parse the Input
- **If a file path** was provided (`.json`, `.txt`, trace path): Read it and extract relevant findings
- **If a quoted description** was provided: Parse it as a direct observation

Extract these categories of information:
- **New selectors** discovered or changed
- **Timing/polling adjustments** that were needed (timeouts, intervals)
- **UI behaviors** not previously documented (modal flows, state transitions, async patterns)
- **Edge cases** encountered during testing
- **Test coverage** updates (new specs, step counts)

### 3. Update the Knowledge File

Follow these rules strictly:

| Rule | Detail |
|------|--------|
| **Preserve existing confirmed selectors** | Never remove unless explicitly told the selector is wrong |
| **Add date stamps** | New entries get `(confirmed YYYY-MM-DD)` with today's date |
| **Keep factual** | Only document observed behavior, no speculation |
| **Update, don't duplicate** | If an entry already exists for the same element/behavior, update it in place |
| **Maintain structure** | Follow the existing section organization (Navigation, Selectors, Behaviors, Test Coverage, File Map) |

### 4. Show the Diff
Present the changes before saving. Highlight what was added, updated, or (rarely) removed.

### 5. Also Update Global Knowledge (if applicable)
If the discovery is a **cross-module pattern** (CSS gotcha, Angular wait behavior, Ionic component quirk), also add it to `.claude/agents/generate-test-knowledge.md` if that file exists.
