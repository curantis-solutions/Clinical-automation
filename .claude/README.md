# .claude/ Directory Guide

This directory configures Claude Code's behavior for the Clinical-automation project. Below is what each folder and file does.

---

## Folder Structure

```
.claude/
├── agents/              # Agent definitions and their knowledge bases
│   ├── parallel-test.md           # @parallel-test agent — runs, diagnoses, and fixes test specs
│   └── knowledge/                 # Module-specific knowledge for agents
│       └── billing.md             # Billing module: selectors, behaviors, test coverage
│
├── commands/            # Custom slash commands (invoked via /command-name)
│   ├── validate-standards.md      # /validate-standards — audits files against golden rules
│   ├── add-page-method.md         # /add-page-method — adds a method to a page object
│   └── update-knowledge.md        # /update-knowledge — refreshes agent knowledge base
│
├── hooks/               # Scripts triggered automatically by Claude Code lifecycle events
│   └── check-spec-locators.sh     # Blocks writes to spec files containing raw locators
│
├── rules/               # Auto-loaded standards (applied by file glob pattern)
│   ├── page-objects.md            # Standards for pages/**/*.ts
│   ├── specs.md                   # Standards for tests/**/*.spec.ts
│   └── workflows.md               # Standards for workflows/**/*.ts
│
└── settings.local.json  # Project-level settings: permissions and hooks config
```

---

## Detailed Descriptions

### `agents/` — AI Agent Definitions

Agents are autonomous Claude Code workflows invoked with `@agent-name`. Each `.md` file defines an agent's purpose, phases, and rules.

| File | Invocation | Purpose |
|------|-----------|---------|
| `parallel-test.md` | `@parallel-test tests/billing/` | Discovers specs, runs them, diagnoses failures, fixes code (up to 2 retry cycles), and updates the knowledge base |

### `agents/knowledge/` — Agent Knowledge Base

Module-specific knowledge files that agents read before every run. Contains confirmed selectors, UI behaviors, timing patterns, and test coverage data.

| File | Module | Contents |
|------|--------|----------|
| `billing.md` | Billing | Navigation paths, data-cy selectors, async backend behaviors, tab/grid patterns, test file map |

To add knowledge for a new module, create `knowledge/{module-name}.md` following the billing.md structure, or use the `/update-knowledge` command.

### `commands/` — Custom Slash Commands

Slash commands are invoked in Claude Code by typing `/command-name`. Each `.md` file is a prompt template that accepts `$ARGUMENTS` from the user.

| Command | Usage Example | What It Does |
|---------|--------------|--------------|
| `/validate-standards` | `/validate-standards tests/billing/` | Scans files for golden standard violations: raw locators in specs, selectors outside POM, hardcoded dates, mixed-responsibility methods |
| `/add-page-method` | `/add-page-method pages/billing/claims.page.ts — read denial reason column` | Adds a new method to an existing page object following POM standards, with selector verification |
| `/update-knowledge` | `/update-knowledge billing "NOE modal selector changed"` | Updates the agent knowledge base with new selectors, behaviors, or timing adjustments |

### `hooks/` — Lifecycle Event Scripts

Hooks run automatically when specific Claude Code events occur. They are registered in `settings.local.json` under the `hooks` key.

| Script | Event | Trigger | What It Does |
|--------|-------|---------|--------------|
| `check-spec-locators.sh` | `PreToolUse` (Edit/Write) | Any write to a `tests/**/*.spec.ts` file | Blocks the write if raw locators are detected (`data-cy`, `getByText(`, `getByRole(`, `getByTestId(`, `.locator(`). Exit code 2 = blocked. |

> **Windows note:** The hook uses `tests[/\\]` in its path regex to match both forward and backslash path separators, since Claude Code sends full Windows paths (backslashes) to hooks.

Additionally, a **Stop hook** is configured directly in `settings.local.json` (no script file) that shows a Windows notification popup when Claude Code finishes a task.

### `rules/` — Auto-Loaded Standards

Rules are automatically loaded into Claude Code's context whenever you work on files matching their glob pattern. They enforce coding standards without manual invocation.

| File | Applies To | Key Rules |
|------|-----------|-----------|
| `page-objects.md` | `pages/**/*.ts` | Selectors in private `selectors` object, `data-cy` first, method naming conventions (`getRowFieldValue`, `findRowBy*`, `assert*`), use `waitForGridStable()` from BasePage |
| `specs.md` | `tests/**/*.spec.ts` | No raw locators, no hardcoded dates/names, use `test.describe.serial()`, call page objects and workflows only |
| `workflows.md` | `workflows/**/*.ts` | Zero raw locators, explicit navigation, error messages must include patient ID, use `expect.toPass()` for polling |

### `settings.local.json` — Project Settings

Contains two sections:
- **permissions** — Tool access rules (e.g., allowing Playwright MCP browser actions)
- **hooks** — Event-to-script mappings (PreToolUse for locator checking, Stop for notifications)

---

## How to Extend

| Want to... | Do this |
|-----------|---------|
| Add a new agent | Create `.claude/agents/{name}.md`, invoke with `@name` |
| Add module knowledge | Create `.claude/agents/knowledge/{module}.md` or use `/update-knowledge` |
| Add a slash command | Create `.claude/commands/{name}.md` with `$ARGUMENTS` placeholder |
| Add a hook | Write script in `.claude/hooks/`, register in `settings.local.json` under `hooks` |
| Add a coding standard | Create `.claude/rules/{name}.md` with `globs:` frontmatter |
