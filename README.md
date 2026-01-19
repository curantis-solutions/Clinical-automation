# Clinical QA Automation

Playwright-based test automation framework for Clinical application with multi-tenant and multi-environment support.

## Features

- **Multi-Tenant Architecture**: Support for multiple tenants (CTH, Integrum) with isolated credentials and test data
- **Multi-Environment Support**: Run tests across QA, Staging, and Production environments
- **Page Object Model**: Maintainable and reusable page objects
- **Hierarchical Credential Management**: Environment → Tenant → Role credential resolution
- **Dynamic Test Data**: Per-tenant test data configuration
- **Comprehensive Reporting**: HTML reports, traces, screenshots, and videos
- **TypeScript**: Fully typed for better IDE support and fewer runtime errors

## Quick Start

### Prerequisites

- Node.js v16 or higher
- npm 8.x or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd claude-qa-automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your credentials:
```env
# Which environment to test
TEST_ENV=qa

# Which tenant to use
TENANT=cth

# URLs
QA_URL=https://clinical.qa1.curantissolutions.com
PROD_URL=https://clinical.curantissolutions.com/

# CTH Tenant - QA Credentials
QA_CTH_MD_USERNAME=your_md_username
QA_CTH_MD_PASSWORD=your_password
QA_CTH_RN_USERNAME=your_rn_username
QA_CTH_RN_PASSWORD=your_password

# Integrum Tenant - QA Credentials
QA_INTEGRUM_MD_USERNAME=your_md_username
QA_INTEGRUM_MD_PASSWORD=your_password
QA_INTEGRUM_RN_USERNAME=your_rn_username
QA_INTEGRUM_RN_PASSWORD=your_password
```

3. Configure test data in `config/test-data.ts` (already set up for CTH and Integrum)

### Run Tests

```bash
# Run all tests (uses TEST_ENV and TENANT from .env.local)
npx playwright test

# Run specific test file
npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts

# Run with UI mode
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific environment/tenant (override .env.local)
TEST_ENV=prod TENANT=cth npx playwright test
```

## Architecture

### Multi-Tenant Structure

The framework supports multiple tenants, each with:
- **Separate credentials** per environment and role
- **Isolated test data** (physicians, care teams, facilities)
- **Environment-specific configuration**

**Supported Tenants:**
- **CTH** (default) - Available in QA, Staging, Prod, Dev
- **Integrum** - Available in QA

### Credential Hierarchy

Credentials follow a hierarchical naming convention:

```
{ENVIRONMENT}_{TENANT}_{ROLE}_USERNAME
{ENVIRONMENT}_{TENANT}_{ROLE}_PASSWORD
```

**Examples:**
- `QA_CTH_MD_USERNAME` - CTH MD user in QA
- `QA_INTEGRUM_RN_PASSWORD` - Integrum RN password in QA
- `PROD_CTH_RN_USERNAME` - CTH RN user in Production

**Lookup Priority:**
1. Tenant + Role specific: `QA_CTH_MD_USERNAME`
2. Environment + Role: `QA_MD_USERNAME`
3. Environment only: `QA_USERNAME`

### Project Structure

```
claude-qa-automation/
├── .env.example              # Template (safe to commit)
├── .env.local               # Your credentials (NEVER commit)
├── config/
│   ├── test-data.ts        # Per-tenant test data
│   └── timeouts.ts         # Timeout configurations
├── fixtures/               # Playwright test fixtures
│   ├── auth.fixture.ts     # Pre-authenticated page fixtures
│   ├── page-objects.fixture.ts  # Combined auth + page objects
│   └── shared-context.fixture.ts # Shared browser context
├── pages/                  # Page Object Model
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   ├── patient.page.ts
│   └── ...
├── tests/
│   ├── Hope/              # HOPE visit tests
│   ├── smoke/             # Smoke tests
│   └── tobeD/             # Work in progress
├── types/
│   └── patient.types.ts   # TypeScript type definitions
└── utils/
    ├── credential-manager.ts  # Credential resolution
    ├── test-data-manager.ts   # Test data access
    ├── auth.helper.ts         # Logout and session utilities
    ├── wait-helper.ts         # Wait utilities
    ├── date-helper.ts         # Date utilities
    └── api-helper.ts          # API interceptors
```

## Usage Examples

### Switching Environments

**Method 1: Edit `.env.local`**
```env
TEST_ENV=qa     # For QA
TEST_ENV=prod   # For Production
```

**Method 2: Command line override**
```bash
# Windows
set TEST_ENV=prod && npx playwright test

# Mac/Linux
TEST_ENV=prod npx playwright test
```

### Switching Tenants

**Method 1: Edit `.env.local`**
```env
TENANT=cth       # For CTH tenant
TENANT=integrum  # For Integrum tenant
```

**Method 2: Command line override**
```bash
TENANT=integrum npx playwright test
```

### In Test Files

**Method 1: Fixture-Based Auth (Recommended)**

```typescript
import { test } from '../fixtures/auth.fixture';

test('My test', async ({ loginAsRN }) => {
  // Already logged in as RN - page is ready to use
  await loginAsRN.goto('/patients');

  // Get tenant-specific test data
  const physician = TestDataManager.getPhysician();
  console.log(`Using physician: ${physician}`);
});

// Other available fixtures: loginAsMD, loginAsSW, loginAsHA
```

**Method 2: Page Objects Fixture (Auth + Page Objects)**

```typescript
import { test } from '../fixtures/page-objects.fixture';

test('My test', async ({ loginAsRN, pages }) => {
  // Both auth AND page objects provided
  const isDashboard = await pages.dashboard.isDashboardDisplayed();
  await pages.patient.searchPatient('12345');
});
```

**Method 3: Manual Login (For Workflow Tests)**

```typescript
import { test } from '@playwright/test';
import { CredentialManager } from '../utils/credential-manager';
import { LoginPage } from '../pages/login.page';

test('Workflow test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const credentials = CredentialManager.getCredentials(undefined, 'RN');
  await loginPage.login(credentials.username, credentials.password);
});
```

### Specific Environment + Tenant

```typescript
// Force specific environment and tenant in code
const credentials = CredentialManager.getCredentials('prod', 'MD', 'cth');
```

## Configuration Files

### `.env.local` (Your Credentials)

**Required Variables:**
- `TEST_ENV` - Environment to test (qa, staging, prod, dev)
- `TENANT` - Tenant to use (cth, integrum)
- `{ENV}_URL` - Base URL for each environment
- `{ENV}_{TENANT}_{ROLE}_USERNAME` - Credentials per tenant/role

**Optional Variables:**
- `HEADLESS=false` - Run with visible browser
- `WORKERS=1` - Parallel test execution
- `SLOWMO=0` - Slow down actions (milliseconds)

### `config/test-data.ts` (Test Data)

Defines per-tenant test data for each environment:

```typescript
export const testData = {
  qa: {
    cth: {
      physician: 'Cypresslast',
      careTeam: 'ACypressIDG',
      facility: 'Home',
      // ...
    },
    integrum: {
      physician: 'Cypresslast',
      careTeam: 'acyIDGQA',
      facility: 'Home',
      // ...
    }
  },
  prod: {
    cth: {
      physician: 'directorcth',
      careTeam: 'A Team',
      // ...
    }
  }
};
```

## Running Tests

### Smoke Tests

```bash
npx playwright test tests/smoke/ --project=chromium
```

### HOPE Visit Tests

```bash
npx playwright test tests/Hope/ --project=chromium
```

### Specific Test with Different Settings

```bash
# Run in QA with Integrum tenant
TEST_ENV=qa TENANT=integrum npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts

# Run in PROD with CTH tenant (headed mode)
TEST_ENV=prod TENANT=cth npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts --headed
```

### Debug Mode

```bash
# Open Playwright Inspector
npx playwright test --debug

# Step through specific test
npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts --debug
```

## Reports and Debugging

### View HTML Report

```bash
npx playwright show-report
```

### View Trace

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

### Screenshots and Videos

Located in `test-results/` directory after test execution.

## Best Practices

### Security

- ✅ **NEVER commit `.env.local`** - Contains real credentials
- ✅ Use dedicated test accounts, not personal accounts
- ✅ Rotate credentials periodically
- ✅ Store CI/CD credentials in GitHub Secrets

### Test Data

- ✅ Use `TestDataManager` for environment-specific data
- ✅ Use `@faker-js/faker` for generating random patient data
- ✅ Keep test data in `config/test-data.ts`, not in .env files

### Credentials

- ✅ Use `CredentialManager.getCredentials()` in tests
- ✅ Specify role (RN, MD, SW, HA) to get correct credentials
- ✅ Let framework resolve tenant automatically from TENANT env var
- ✅ Test credential changes locally before committing

### Test Organization

- ✅ Use Page Object Model for UI interactions
- ✅ Keep tests independent (no shared state)
- ✅ Use descriptive test names
- ✅ Tag tests with @smoke, @regression, etc.

## Troubleshooting

### Credentials Not Found

**Error:** `Credentials not found for environment: qa, tenant: cth, role: RN`

**Solution:**
1. Check `.env.local` has `QA_CTH_RN_USERNAME` and `QA_CTH_RN_PASSWORD`
2. Verify `TEST_ENV=qa` and `TENANT=cth` are set
3. Check for typos in variable names (case-sensitive)

### Test Data Not Found

**Error:** `No test data found for environment: prod, tenant: cth`

**Solution:**
1. Check `config/test-data.ts` has data for the environment
2. Environment names are case-insensitive (PROD = prod)
3. Tenant names are case-insensitive (CTH = cth)

### Wrong Environment/Tenant Used

**Solution:**
1. Check `TEST_ENV` in `.env.local`
2. Check `TENANT` in `.env.local`
3. Command line overrides take precedence
4. Look at console output: "🎭 Running tests against: PROD environment"

## Contributing

1. Pull latest changes: `git pull`
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and test locally
4. **Never commit `.env.local`** or credentials
5. Create pull request

## Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Environment Configuration](./docs/ENVIRONMENT_SETUP.md) - Multi-environment setup
- [Quick Reference](./docs/ENV_QUICK_REFERENCE.md) - Command cheat sheet

## Support

- **Issues**: Create GitHub issue
- **Questions**: Contact QA team
- **Credentials**: Contact team lead or DevOps

---

**Remember:** This framework uses `.env.local` for local development. Never commit credentials to Git!
