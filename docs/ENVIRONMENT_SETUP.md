# Environment Configuration Guide

This guide explains how to manage multiple environments (QA, Staging, Production) and multiple tenants (CTH, Integrum) in the test automation framework.

## Quick Start

### Single `.env.local` File (Recommended)

Configure `.env.local` with all environments and tenants:

```bash
# Set which environment and tenant to use
TEST_ENV=qa          # Options: qa, staging, prod, dev
TENANT=cth           # Options: cth, integrum

# Environment URLs
QA_URL=https://clinical.qa1.curantissolutions.com
PROD_URL=https://clinical.curantissolutions.com/

# CTH Tenant - QA Credentials
QA_CTH_MD_USERNAME=test+MDCyqa@curantissolutions.com
QA_CTH_MD_PASSWORD=Csqa123!!
QA_CTH_RN_USERNAME=test+cynurse@curantissolutions.com
QA_CTH_RN_PASSWORD=Csqa123!!

# Integrum Tenant - QA Credentials
QA_INTEGRUM_MD_USERNAME=test+MDcypress@curantissolutions.com
QA_INTEGRUM_MD_PASSWORD=Csqa123!!
QA_INTEGRUM_RN_USERNAME=test+rnnancy@curantissolutions.com
QA_INTEGRUM_RN_PASSWORD=Csqa123!!

# CTH Tenant - Prod Credentials
PROD_CTH_MD_USERNAME=test+mdnancyprod@curantissolutions.com
PROD_CTH_MD_PASSWORD=Csprod123!!
PROD_CTH_RN_USERNAME=test+rnnancyprod@curantissolutions.com
PROD_CTH_RN_PASSWORD=Csprod123!!
```

### Run Tests

```bash
# Uses TEST_ENV and TENANT from .env.local
npx playwright test

# Override environment
TEST_ENV=prod npx playwright test

# Override tenant
TENANT=integrum npx playwright test

# Override both
TEST_ENV=prod TENANT=cth npx playwright test
```

## Multi-Tenant Architecture

### Overview

The framework supports multiple tenants, each with:
- **Separate credentials** per environment and role
- **Isolated test data** (physicians, care teams, facilities)
- **Independent configuration**

### Supported Tenants

| Tenant | Environments | Description |
|--------|--------------|-------------|
| **CTH** | QA, Staging, Prod, Dev | Default tenant |
| **Integrum** | QA | Additional tenant |

### Credential Naming Convention

Credentials follow a hierarchical pattern:

```
{ENVIRONMENT}_{TENANT}_{ROLE}_USERNAME
{ENVIRONMENT}_{TENANT}_{ROLE}_PASSWORD
```

**Examples:**
- `QA_CTH_MD_USERNAME` - CTH MD user in QA
- `QA_INTEGRUM_RN_PASSWORD` - Integrum RN password in QA
- `PROD_CTH_RN_USERNAME` - CTH RN user in Production

**Available Roles:**
- `MD` - Medical Doctor
- `RN` - Registered Nurse
- `SW` - Social Worker
- `HA` - Hospice Aide
- `NP` - Nurse Practitioner

### Credential Lookup Priority

The `CredentialManager` uses hierarchical resolution:

1. **Tenant + Role specific**: `QA_CTH_MD_USERNAME`
2. **Environment + Role**: `QA_MD_USERNAME` (fallback)
3. **Environment only**: `QA_USERNAME` (fallback)

This allows for flexible configuration where you can specify credentials at different levels of granularity.

## Using Environment & Tenant in Tests

### Method 1: Fixture-Based Auth (Recommended)

The framework provides pre-authenticated page fixtures that handle login automatically:

```typescript
import { test } from '../fixtures/auth.fixture';

test('My test', async ({ loginAsRN }) => {
  // Already logged in as RN - page is ready to use
  await loginAsRN.goto('/patients');
});

// Available fixtures: loginAsRN, loginAsMD, loginAsSW, loginAsHA
```

### Method 2: Page Objects Fixture (Auth + Page Objects)

```typescript
import { test } from '../fixtures/page-objects.fixture';

test('My test', async ({ loginAsRN, pages }) => {
  // Both auth AND page objects provided
  await pages.dashboard.isDashboardDisplayed();
  await pages.patient.searchPatient('12345');
});
```

### Method 3: Manual Login (For Workflow Tests)

```typescript
import { test } from '@playwright/test';
import { CredentialManager } from '../utils/credential-manager';
import { LoginPage } from '../pages/login.page';

test('Workflow test', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Automatically uses TEST_ENV and TENANT from .env.local
  const credentials = CredentialManager.getCredentials(undefined, 'RN');
  await loginPage.login(credentials.username, credentials.password);
});
```

### Force Specific Environment/Tenant

```typescript
test('Cross-environment test', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Force specific environment and tenant
  const qaCredentials = CredentialManager.getCredentials('qa', 'MD', 'cth');
  const prodCredentials = CredentialManager.getCredentials('prod', 'RN', 'cth');

  // Test on QA
  await loginPage.goto();
  await loginPage.login(qaCredentials.username, qaCredentials.password);

  // ... test logic
});
```

### Get Test Data

```typescript
test('Patient admission', async ({ page }) => {
  // Get tenant-specific test data (respects TENANT from .env.local)
  const physician = TestDataManager.getPhysician();
  const careTeam = TestDataManager.getCareTeam();
  const facility = TestDataManager.getFacility();

  console.log(`Using physician: ${physician}`);
  console.log(`Using care team: ${careTeam}`);
  console.log(`Using facility: ${facility}`);
});
```

### Check Current Configuration

```typescript
test('Configuration check', async ({ page }) => {
  const env = CredentialManager.getEnvironment();    // 'qa', 'prod', etc.
  const tenant = CredentialManager.getTenant();       // 'cth', 'integrum'
  const url = CredentialManager.getBaseUrl();         // Full URL

  console.log(`Environment: ${env}`);
  console.log(`Tenant: ${tenant}`);
  console.log(`URL: ${url}`);
});
```

## Test Data Configuration

Test data is managed in `config/test-data.ts` per tenant and environment:

```typescript
export const testData: Record<string, EnvironmentTestData> = {
  qa: {
    cth: {
      physician: 'Cypresslast',
      physicianFullName: 'MDcypress cypresslast',
      careTeam: 'ACypressIDG',
      facility: 'Home',
      facilitySNF: 'papa pig nurse care',
      rnSign: 'RNCypress cypresslast',
    },
    integrum: {
      physician: 'Cypresslast',
      physicianFullName: 'MDcypress cypresslast',
      careTeam: 'acyIDGQA',
      facility: 'Home',
      rnSign: 'RNCypress cypresslast',
    }
  },
  prod: {
    cth: {
      physician: 'directorcth',
      physicianFullName: 'MDcypress cypresslast',
      careTeam: 'A Team',
      facility: 'Home',
    }
  }
};
```

### Accessing Test Data

```typescript
// Get specific data
const physician = TestDataManager.getPhysician();
const careTeam = TestDataManager.getCareTeam();
const facility = TestDataManager.getFacility();
const rnSign = TestDataManager.getRNSign();

// Get all data for current tenant
const allData = TestDataManager.getData();
console.log(allData);
```

## Switching Environments and Tenants

### Method 1: Edit `.env.local` (Recommended)

```env
# Change these lines in .env.local
TEST_ENV=qa       # Change to: qa, staging, prod, dev
TENANT=cth        # Change to: cth, integrum
```

Then run tests normally:
```bash
npx playwright test
```

### Method 2: Command Line Override

**Windows (CMD):**
```bash
set TEST_ENV=prod && set TENANT=cth && npx playwright test
```

**Windows (PowerShell):**
```powershell
$env:TEST_ENV="prod"; $env:TENANT="cth"; npx playwright test
```

**Mac/Linux:**
```bash
TEST_ENV=prod TENANT=cth npx playwright test
```

### Method 3: Per-Test Override

Create test-specific environment setup:

```typescript
test.describe('CTH Tenant Tests', () => {
  test.beforeAll(async () => {
    process.env.TENANT = 'cth';
  });

  test('Test 1', async ({ page }) => {
    // Will use CTH tenant
  });
});

test.describe('Integrum Tenant Tests', () => {
  test.beforeAll(async () => {
    process.env.TENANT = 'integrum';
  });

  test('Test 1', async ({ page }) => {
    // Will use Integrum tenant
  });
});
```

## Environment Variables Reference

### Core Variables

| Variable | Values | Description |
|----------|--------|-------------|
| `TEST_ENV` | qa, staging, prod, dev | Current environment |
| `TENANT` | cth, integrum | Current tenant |
| `HEADLESS` | true, false | Run browser in headless mode |
| `WORKERS` | number | Parallel test execution |
| `SLOWMO` | milliseconds | Slow down actions |

### Per-Environment Variables

Each environment requires:
- `{ENV}_URL` - Application URL
- `{ENV}_{TENANT}_{ROLE}_USERNAME` - User credentials
- `{ENV}_{TENANT}_{ROLE}_PASSWORD` - User password

### Test Configuration

- `TIMEOUT=30000` - Test timeout in milliseconds
- `RETRIES=0` - Number of retries for failed tests
- `SCREENSHOT_ON_FAILURE=true` - Capture screenshots
- `VIDEO_ON_FAILURE=false` - Record videos

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Multi-Environment Tests
on: [push]

jobs:
  test-qa-cth:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run QA CTH Tests
        env:
          TEST_ENV: qa
          TENANT: cth
          QA_CTH_RN_USERNAME: ${{ secrets.QA_CTH_RN_USERNAME }}
          QA_CTH_RN_PASSWORD: ${{ secrets.QA_CTH_RN_PASSWORD }}
          QA_URL: ${{ secrets.QA_URL }}
        run: npx playwright test tests/smoke/

  test-qa-integrum:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run QA Integrum Tests
        env:
          TEST_ENV: qa
          TENANT: integrum
          QA_INTEGRUM_RN_USERNAME: ${{ secrets.QA_INTEGRUM_RN_USERNAME }}
          QA_INTEGRUM_RN_PASSWORD: ${{ secrets.QA_INTEGRUM_RN_PASSWORD }}
          QA_URL: ${{ secrets.QA_URL }}
        run: npx playwright test tests/smoke/

  test-prod-cth:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run Prod CTH Tests
        env:
          TEST_ENV: prod
          TENANT: cth
          PROD_CTH_RN_USERNAME: ${{ secrets.PROD_CTH_RN_USERNAME }}
          PROD_CTH_RN_PASSWORD: ${{ secrets.PROD_CTH_RN_PASSWORD }}
          PROD_URL: ${{ secrets.PROD_URL }}
        run: npx playwright test tests/smoke/
```

## Best Practices

### 1. Never Commit `.env.local`
```bash
# Verify it's in .gitignore
cat .gitignore | grep .env.local

# Check it won't be committed
git status
```

### 2. Use Environment Prefixes
Keep credentials organized with clear prefixes:
- `QA_CTH_*`
- `QA_INTEGRUM_*`
- `PROD_CTH_*`

### 3. Validate Configurations
The framework automatically validates:
- ✅ Required credentials exist
- ✅ Test data exists for tenant
- ✅ Environment URLs are configured

### 4. Use Secrets in CI
Store all credentials as GitHub/GitLab secrets, never in code or config files.

### 5. Test Environment Switching
Before CI integration, verify all environments work:
```bash
TEST_ENV=qa TENANT=cth npx playwright test tests/smoke/
TEST_ENV=qa TENANT=integrum npx playwright test tests/smoke/
TEST_ENV=prod TENANT=cth npx playwright test tests/smoke/
```

### 6. Document Requirements
Keep test data and credentials documented in:
- `.env.example` - Template with all required variables
- `config/test-data.ts` - Test data structure
- This guide - Usage instructions

## Troubleshooting

### Error: "Credentials not found"

**Problem:**
```
Credentials not found for environment: qa, tenant: cth, role: RN
```

**Solutions:**
1. Check `.env.local` has `QA_CTH_RN_USERNAME` and `QA_CTH_RN_PASSWORD`
2. Verify `TEST_ENV=qa` and `TENANT=cth` are set
3. Check for typos (variable names are case-sensitive)
4. Ensure no extra spaces in `.env.local`

### Error: "No test data found"

**Problem:**
```
No test data found for environment: prod, tenant: cth
```

**Solutions:**
1. Check `config/test-data.ts` has data for the environment
2. Environment names are case-insensitive (PROD = prod = Prod)
3. Tenant names are case-insensitive (CTH = cth = Cth)
4. Add test data if missing

### Tests Using Wrong Environment

**Solutions:**
1. Check `TEST_ENV` value in `.env.local`
2. Look at console: "🎭 Running tests against: PROD environment"
3. Command line overrides take precedence
4. Clear any env vars: `unset TEST_ENV` (Mac/Linux)

### Tests Using Wrong Tenant

**Solutions:**
1. Check `TENANT` value in `.env.local`
2. Look for console output showing credentials used
3. Verify tenant exists for environment (Integrum only in QA)
4. Check test data exists in `config/test-data.ts`

### Command Line Override Not Working

**Windows CMD:**
```bash
set TEST_ENV=prod && npx playwright test
```

**Windows PowerShell:**
```powershell
$env:TEST_ENV="prod"; npx playwright test
```

**Mac/Linux:**
```bash
TEST_ENV=prod npx playwright test
```

## Examples

### Run Same Test Across Environments

```bash
# QA with CTH tenant
TEST_ENV=qa TENANT=cth npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts

# QA with Integrum tenant
TEST_ENV=qa TENANT=integrum npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts

# Production with CTH tenant
TEST_ENV=prod TENANT=cth npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts
```

### Cross-Environment Comparison

```typescript
test('Compare environments', async ({ page }) => {
  // Get QA data
  const qaCredentials = CredentialManager.getCredentials('qa', 'RN', 'cth');
  const qaPhysician = TestDataManager.getPhysician(); // Will error if not set correctly

  // Get Prod data
  const prodCredentials = CredentialManager.getCredentials('prod', 'RN', 'cth');

  console.log('QA RN:', qaCredentials.username);
  console.log('Prod RN:', prodCredentials.username);
});
```

### Multi-Tenant Test Suite

**Using Fixtures (Recommended):**
```typescript
import { test } from '../fixtures/auth.fixture';
import { TestDataManager } from '../utils/test-data-manager';

const tenants = ['cth', 'integrum'];

for (const tenant of tenants) {
  test.describe(`Tests for ${tenant} tenant`, () => {
    test.beforeEach(async () => {
      process.env.TENANT = tenant;
    });

    test('Dashboard test', async ({ loginAsRN }) => {
      // Already logged in as RN for current tenant
      const physician = TestDataManager.getPhysician();
      console.log(`Testing ${tenant} with physician: ${physician}`);
    });
  });
}
```

**Using Manual Login:**
```typescript
const tenants = ['cth', 'integrum'];

for (const tenant of tenants) {
  test.describe(`Tests for ${tenant} tenant`, () => {
    test.beforeEach(async () => {
      process.env.TENANT = tenant;
    });

    test('Login test', async ({ page }) => {
      const credentials = CredentialManager.getCredentials(undefined, 'RN');
      const physician = TestDataManager.getPhysician();

      console.log(`Testing ${tenant}: ${credentials.username}`);
      console.log(`Using physician: ${physician}`);
    });
  });
}
```

## Adding a New Tenant

### Step 1: Add Credentials to `.env.local`

```env
# NewTenant - QA Environment
QA_NEWTENANT_MD_USERNAME=user@example.com
QA_NEWTENANT_MD_PASSWORD=password
QA_NEWTENANT_RN_USERNAME=nurse@example.com
QA_NEWTENANT_RN_PASSWORD=password
```

### Step 2: Add Test Data to `config/test-data.ts`

```typescript
export const testData = {
  qa: {
    newtenant: {
      physician: 'DrSmith',
      physicianFullName: 'Dr. John Smith',
      careTeam: 'TeamA',
      facility: 'Home',
      rnSign: 'RN Smith',
    }
  }
};
```

### Step 3: Update `.env.local` TENANT Variable

```env
TENANT=newtenant
```

### Step 4: Run Tests

```bash
npx playwright test
```

---

**For more information:**
- [Setup Guide](../SETUP_GUIDE.md) - Detailed setup instructions
- [README](../README.md) - Project overview
- [Quick Reference](./ENV_QUICK_REFERENCE.md) - Command cheat sheet
