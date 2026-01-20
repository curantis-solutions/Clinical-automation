# Environment & Tenant Configuration - Quick Reference

## 🚀 Quick Switch: Environment & Tenant

### Option 1: Edit `.env.local` (Recommended)
```bash
# Open .env.local and change these lines:
TEST_ENV=qa       # For QA (also: staging, prod, dev)
TENANT=cth        # For CTH (also: integrum)

# Then run tests normally:
npx playwright test
```

### Option 2: Command Line Override

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

## 📝 In Your Test Files

### Fixture-Based Auth (Recommended)

```typescript
import { test } from '../fixtures/auth.fixture';

test('My test', async ({ loginAsRN }) => {
  // Already logged in as RN - page is ready to use
  await loginAsRN.goto('/patients');
});

// Available fixtures: loginAsRN, loginAsMD, loginAsSW, loginAsHA
```

### Page Objects Fixture (Auth + Page Objects)

```typescript
import { test } from '../fixtures/page-objects.fixture';

test('My test', async ({ loginAsRN, pages }) => {
  // Both auth AND page objects provided
  await pages.dashboard.isDashboardDisplayed();
  await pages.patient.searchPatient('12345');
});
```

### Manual Login (For Workflow Tests)

```typescript
import { test } from '@playwright/test';
import { CredentialManager } from '../utils/credential-manager';
import { LoginPage } from '../pages/login.page';

test('Workflow test', async ({ page }) => {
  const credentials = CredentialManager.getCredentials(undefined, 'RN');
  const loginPage = new LoginPage(page);
  await loginPage.login(credentials.username, credentials.password);
});
```

### Get Test Data

```typescript
import { TestDataManager } from '../utils/test-data-manager';

test('Patient admission', async ({ loginAsRN }) => {
  // Get tenant-specific test data
  const physician = TestDataManager.getPhysician();
  const careTeam = TestDataManager.getCareTeam();
  const facility = TestDataManager.getFacility();

  console.log(`Using physician: ${physician}`);
  console.log(`Using care team: ${careTeam}`);
});
```

### Force Specific Environment/Tenant

```typescript
test('Cross-environment test', async ({ page }) => {
  // Override auto-detection for manual login
  const qaCredentials = CredentialManager.getCredentials('qa', 'MD', 'cth');
  const prodCredentials = CredentialManager.getCredentials('prod', 'RN', 'cth');

  console.log('QA MD:', qaCredentials.username);
  console.log('Prod RN:', prodCredentials.username);
});
```

## 🔑 CredentialManager API

### Methods

```typescript
// Get credentials
CredentialManager.getCredentials(environment?, role?, tenant?)
// Example: getCredentials('qa', 'RN', 'cth')
// Omit params to use .env.local values

// Get current environment
CredentialManager.getEnvironment()  // Returns: 'qa', 'prod', etc.

// Get current tenant
CredentialManager.getTenant()  // Returns: 'cth', 'integrum'

// Get base URL
CredentialManager.getBaseUrl()  // Returns: 'https://...'

// Check if headless
CredentialManager.isHeadless()  // Returns: boolean
```

### Available Roles

- `MD` - Medical Doctor
- `RN` - Registered Nurse
- `SW` - Social Worker
- `HA` - Hospice Aide
- `NP` - Nurse Practitioner

## 📊 TestDataManager API

### Methods

```typescript
// Get physician data
TestDataManager.getPhysician()           // Short name: "Cypresslast"
TestDataManager.getPhysicianFullName()   // Full: "MDcypress cypresslast"
TestDataManager.getPhysicianWithCredentials()  // "cypresslast, MDcypress (MD)"

// Get care team
TestDataManager.getCareTeam()  // Returns: "ACypressIDG" or "acyIDGQA"

// Get facility
TestDataManager.getFacility()     // Returns: "Home"
TestDataManager.getFacilitySNF()  // Returns: SNF facility (optional)
TestDataManager.getFacilityALF()  // Returns: ALF facility (optional)

// Get signatures
TestDataManager.getRNSign()  // Returns: "RNCypress cypresslast"

// Get all data
TestDataManager.getData()  // Returns: Complete tenant data object

// Utility methods
TestDataManager.getTenant()  // Returns: Current tenant name
TestDataManager.getAvailableTenants()  // Returns: Array of available tenants
TestDataManager.printConfig()  // Prints current configuration to console
```

## 🗂️ Configuration Structure

### .env.local Structure

```env
# Core Settings
TEST_ENV=qa              # Which environment
TENANT=cth               # Which tenant

# URLs
QA_URL=https://...
PROD_URL=https://...

# Credentials Pattern
{ENV}_{TENANT}_{ROLE}_USERNAME
{ENV}_{TENANT}_{ROLE}_PASSWORD

# Examples:
QA_CTH_RN_USERNAME=...
QA_CTH_RN_PASSWORD=...
QA_INTEGRUM_MD_USERNAME=...
PROD_CTH_RN_USERNAME=...
```

### Test Data Structure (config/test-data.ts)

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
      facility: 'Home',
      // ...
    }
  }
};
```

## 📋 Supported Configurations

### Environments

| Environment | Description |
|-------------|-------------|
| `qa` | QA/Testing environment |
| `staging` | Staging environment |
| `prod` | Production environment |
| `dev` | Development environment |

### Tenants

| Tenant | Available In | Description |
|--------|--------------|-------------|
| `cth` | QA, Staging, Prod, Dev | Default tenant |
| `integrum` | QA | Additional tenant |

### Roles

| Role | Description |
|------|-------------|
| `MD` | Medical Doctor |
| `RN` | Registered Nurse |
| `SW` | Social Worker |
| `HA` | Hospice Aide |
| `NP` | Nurse Practitioner |

## 🎯 Common Commands

### Run Tests

```bash
# Use .env.local settings
npx playwright test

# Run specific test
npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts

# Run with UI mode
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Run with debug
npx playwright test --debug
```

### Environment Override

```bash
# QA with CTH
TEST_ENV=qa TENANT=cth npx playwright test

# QA with Integrum
TEST_ENV=qa TENANT=integrum npx playwright test

# Production with CTH
TEST_ENV=prod TENANT=cth npx playwright test

# Specific test in production
TEST_ENV=prod npx playwright test tests/smoke/login.spec.ts --headed
```

### Debug & Reports

```bash
# Open HTML report
npx playwright show-report

# View trace
npx playwright show-trace test-results/<folder>/trace.zip

# Run with trace always on
TRACE=on npx playwright test
```

## 💡 Pro Tips

### 1. Check Current Configuration

Add this to your test:
```typescript
test('Check config', async ({ page }) => {
  TestDataManager.printConfig();
  // Outputs:
  // Environment: qa
  // Tenant: cth
  // Physician: Cypresslast
  // Care Team: ACypressIDG
});
```

### 2. Quick Environment Check

```bash
# See what TEST_ENV and TENANT are set to
node -e "require('dotenv').config({path:'.env.local'}); console.log('ENV:', process.env.TEST_ENV, 'TENANT:', process.env.TENANT);"
```

### 3. Test Multiple Tenants

```typescript
import { test } from '../fixtures/auth.fixture';

const tenants = ['cth', 'integrum'];

for (const tenant of tenants) {
  test.describe(`${tenant} tenant tests`, () => {
    test.beforeEach(() => {
      process.env.TENANT = tenant;
    });

    test('Dashboard test', async ({ loginAsRN }) => {
      // Already logged in for current tenant
      console.log(`Testing ${tenant} tenant`);
    });
  });
}
```

### 4. Credential Lookup Priority

When you call `CredentialManager.getCredentials(undefined, 'RN')`:

1. Tries: `QA_CTH_RN_USERNAME` (tenant + role specific) ✅
2. Falls back to: `QA_RN_USERNAME` (role specific)
3. Falls back to: `QA_USERNAME` (environment default)

### 5. Case Insensitivity

Environment and tenant names are case-insensitive:
- `TEST_ENV=PROD` = `TEST_ENV=prod` = `TEST_ENV=Prod`
- `TENANT=CTH` = `TENANT=cth` = `TENANT=Cth`

Variable names ARE case-sensitive:
- `QA_CTH_RN_USERNAME` ✅
- `qa_cth_rn_username` ❌

## 🛡️ Security Reminders

### ⚠️ NEVER:
- ❌ Commit `.env.local` to Git
- ❌ Hardcode credentials in test files
- ❌ Share credentials via email/chat
- ❌ Use production credentials for testing

### ✅ ALWAYS:
- ✅ Use `CredentialManager.getCredentials()`
- ✅ Use `TestDataManager` for test data
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Store CI credentials in GitHub Secrets

## 🔍 Troubleshooting

### Error: "Credentials not found"

```bash
# Check .env.local has required variables
cat .env.local | grep "QA_CTH_RN"

# Verify TEST_ENV and TENANT are set
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.TEST_ENV, process.env.TENANT);"
```

### Error: "No test data found"

```bash
# Check test data exists in config/test-data.ts
# Make sure tenant exists for the environment
```

### Tests Using Wrong Environment

```bash
# Check console output:
# "🎭 Running tests against: QA environment..."

# Verify .env.local
cat .env.local | grep "TEST_ENV="
```

## 📚 Full Documentation

- [README](../README.md) - Project overview
- [Setup Guide](../SETUP_GUIDE.md) - Detailed setup
- [Environment Setup](./ENVIRONMENT_SETUP.md) - Complete guide

## 🚦 Quick Checklist

Before running tests:
- [ ] `.env.local` exists and has credentials
- [ ] `TEST_ENV` is set correctly
- [ ] `TENANT` is set correctly
- [ ] Credentials exist for the tenant/environment
- [ ] Test data exists in `config/test-data.ts`

Ready to test:
```bash
npx playwright test
```

---

**💡 Remember:** This framework automatically resolves credentials and test data based on `TEST_ENV` and `TENANT`. Just set them and run!
