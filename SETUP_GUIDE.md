# Playwright Automation - Developer Setup Guide

## Prerequisites

Before setting up this project, ensure you have the following installed on your machine:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for version control)
- **VS Code** (recommended) or any code editor

To verify installations:
```bash
node --version  # Should show v16.x.x or higher
npm --version   # Should show 8.x.x or higher
git --version   # Should show git version
```

## Quick Start (5 Minutes)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd claude-qa-automation
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Install Playwright Browsers
```bash
npx playwright install
```

### Step 4: Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env.local
```

### Step 5: Configure Credentials
Open `.env.local` in your editor and add your credentials (see detailed instructions below).

### Step 6: Verify Setup
```bash
# Run a simple test to verify everything works
npx playwright test tests/smoke/health-check.spec.ts --headed
```

## Detailed Setup Instructions

### 1. Understanding the Environment Files

This project uses two environment files:

#### `.env.example` (Template - Committed to Git)
- Contains all environment variable names with example/default values
- Safe to commit - NO real credentials
- Serves as documentation for required variables
- Every developer can see what variables are needed

#### `.env.local` (Your Actual Credentials - NEVER Commit)
- Contains your actual credentials and sensitive data
- Automatically loaded when running tests
- **MUST be added to .gitignore**
- Each developer maintains their own copy
- **NEVER commit this file to Git**

### 2. Creating Your `.env.local` File

#### Step 1: Copy the Template
```bash
cp .env.example .env.local
```

#### Step 2: Edit `.env.local` with Your Credentials

Open `.env.local` in your editor and update with actual values:

```env
# ============================================
# ENVIRONMENT CONFIGURATION
# ============================================
# Which environment to test (qa, staging, prod, dev)
TEST_ENV=qa

# ============================================
# ENVIRONMENT URLs
# ============================================
QA_URL=https://clinical.qa1.curantissolutions.com
PROD_URL=https://clinical.curantissolutions.com/

# ============================================
# TENANT CONFIGURATION
# ============================================
# Which tenant to use for tests (cth, integrum)
TENANT=cth

# ============================================
# QA ENVIRONMENT CREDENTIALS
# ============================================
# CTH Tenant - QA Environment
QA_CTH_MD_USERNAME=test+MDCyqa@curantissolutions.com
QA_CTH_MD_PASSWORD=Csqa123!!
QA_CTH_RN_USERNAME=test+cynurse@curantissolutions.com
QA_CTH_RN_PASSWORD=Csqa123!!
QA_CTH_SW_USERNAME=test+cysocial@curantissolutions.com
QA_CTH_SW_PASSWORD=Csqa123!!
QA_CTH_HA_USERNAME=test+cyha@curantissolutions.com
QA_CTH_HA_PASSWORD=Csqa123!!

# Integrum Tenant - QA Environment
QA_INTEGRUM_MD_USERNAME=test+MDcypress@curantissolutions.com
QA_INTEGRUM_MD_PASSWORD=Csqa123!!
QA_INTEGRUM_RN_USERNAME=test+rnnancy@curantissolutions.com
QA_INTEGRUM_RN_PASSWORD=Csqa123!!

# ============================================
# PRODUCTION ENVIRONMENT CREDENTIALS
# ============================================
# CTH Tenant - Prod Environment
PROD_CTH_MD_USERNAME=test+mdnancyprod@curantissolutions.com
PROD_CTH_MD_PASSWORD=Csprod123!!
PROD_CTH_RN_USERNAME=test+rnnancyprod@curantissolutions.com
PROD_CTH_RN_PASSWORD=Csprod123!!

# ============================================
# TEST CONFIGURATION
# ============================================
HEADLESS=false          # Run tests without browser UI
WORKERS=1               # Number of parallel workers
TIMEOUT=30000          # Test timeout in milliseconds
RETRIES=0              # Number of retries for failed tests
SLOWMO=0               # Slow down actions by X milliseconds (0 = disabled)

# ============================================
# REPORTING
# ============================================
SHOW_REPORT=false               # Automatically open HTML report after test run
SCREENSHOT_ON_FAILURE=true      # Capture screenshot when test fails
VIDEO_ON_FAILURE=false         # Record video for failed tests
```

### 3. Understanding the Multi-Tenant Architecture

This framework supports **multiple tenants**, each with their own:
- **Separate credentials** per environment and role
- **Isolated test data** (physicians, care teams, facilities)
- **Environment-specific configuration**

#### Supported Tenants:
- **CTH** (default) - Available in QA, Staging, Prod, Dev
- **Integrum** - Available in QA

#### Credential Naming Convention:

```
{ENVIRONMENT}_{TENANT}_{ROLE}_USERNAME
{ENVIRONMENT}_{TENANT}_{ROLE}_PASSWORD
```

**Examples:**
- `QA_CTH_MD_USERNAME` - CTH MD user in QA
- `QA_INTEGRUM_RN_PASSWORD` - Integrum RN password in QA
- `PROD_CTH_RN_USERNAME` - CTH RN user in Production

#### Lookup Priority (Hierarchical Resolution):
1. **Tenant + Role specific**: `QA_CTH_MD_USERNAME`
2. **Environment + Role**: `QA_MD_USERNAME` (fallback)
3. **Environment only**: `QA_USERNAME` (fallback)

### 4. Configuring Test Data

Test data (physicians, care teams, facilities) is managed in `config/test-data.ts`:

```typescript
export const testData = {
  qa: {
    cth: {
      physician: 'Cypresslast',
      careTeam: 'ACypressIDG',
      facility: 'Home',
      // ... more data
    },
    integrum: {
      physician: 'Cypresslast',
      careTeam: 'acyIDGQA',
      facility: 'Home',
      // ... more data
    }
  },
  prod: {
    cth: {
      physician: 'directorcth',
      careTeam: 'A Team',
      facility: 'Home',
      // ... more data
    }
  }
};
```

**No need to edit this file** unless adding new tenants or updating test data.

### 5. Getting Credentials

#### Where to Get Test Credentials:

1. **From Team Lead/Manager**
   - Request access to test environments
   - Get credentials for your required role(s)
   - Specify which tenant you need access to (CTH, Integrum)

2. **From Password Manager**
   - Check team's password manager (1Password, LastPass, etc.)
   - Look for "QA Test Accounts" or "Clinical Test Credentials"

3. **From Internal Wiki/Documentation**
   - Check Confluence, Notion, or internal docs
   - Look for "Test Environment Setup" pages

#### Security Best Practices:
- **NEVER use production credentials for testing**
- **NEVER use your personal credentials**
- **NEVER share credentials via email or chat**
- **ALWAYS use dedicated test accounts**
- **Store credentials in password manager**

### 6. Verifying Your Setup

#### Test Credential Resolution:
```bash
# This will show which credentials are being loaded
node -e "require('dotenv').config({path:'.env.local'}); console.log('TEST_ENV:', process.env.TEST_ENV); console.log('TENANT:', process.env.TENANT);"
```

#### Run a Simple Health Check Test:
```bash
# Run health check test in QA with CTH tenant (headed mode to see browser)
npx playwright test tests/smoke/health-check.spec.ts --headed

# Run with Integrum tenant
TENANT=integrum npx playwright test tests/smoke/health-check.spec.ts --headed

# Run in PROD
TEST_ENV=prod npx playwright test tests/smoke/health-check.spec.ts --headed
```

## Running Tests

### Basic Test Execution

#### Run All Tests in Default Environment:
```bash
# Uses TEST_ENV and TENANT from .env.local
npx playwright test
```

#### Run Tests in Specific Environment:
```bash
# Using environment variable override
TEST_ENV=prod npx playwright test

# On Windows
set TEST_ENV=prod && npx playwright test
```

#### Run Tests with Specific Tenant:
```bash
# Run with Integrum tenant in QA
TENANT=integrum npx playwright test

# Run with CTH tenant in PROD
TEST_ENV=prod TENANT=cth npx playwright test

# On Windows
set TENANT=integrum && npx playwright test
```

### Running Specific Test Suites

#### Smoke Tests (Quick Validation):
```bash
# Run smoke tests
npx playwright test tests/smoke/

# With specific tenant
TENANT=integrum npx playwright test tests/smoke/
```

#### HOPE Visit Tests:
```bash
# Run all HOPE tests
npx playwright test tests/Hope/

# Run specific HOPE test
npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts
```

### Development and Debugging

#### Run Tests in Headed Mode (See Browser):
```bash
npx playwright test --headed

# For specific test
npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts --headed
```

#### Debug Mode (Step Through Tests):
```bash
# Open Playwright Inspector
npx playwright test --debug

# Debug specific test
npx playwright test tests/Hope/admit-hospice-inv-mild.spec.ts --debug
```

#### Run with UI Mode (Interactive):
```bash
npx playwright test --ui
```

#### Run Specific Test File:
```bash
npx playwright test tests/smoke/health-check.spec.ts
```

#### Run Tests Matching Pattern:
```bash
# Run all tests with "login" in the name
npx playwright test -g "login"

# Run all tests tagged with @smoke
npx playwright test --grep "@smoke"
```

### Viewing Test Results

#### Open HTML Report:
```bash
npx playwright show-report
```

#### View Trace Files:
```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

## Using the Framework in Your Tests

### Method 1: Fixture-Based Auth (Recommended)

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
  const credentials = CredentialManager.getCredentials(undefined, 'RN');
  await loginPage.login(credentials.username, credentials.password);

  // Force specific environment/tenant/role
  const prodCreds = CredentialManager.getCredentials('prod', 'MD', 'cth');
});
```

### Get Test Data

```typescript
test('Add patient', async ({ page }) => {
  // Get tenant-specific test data
  const physician = TestDataManager.getPhysician();
  const careTeam = TestDataManager.getCareTeam();
  const facility = TestDataManager.getFacility();

  console.log(`Using physician: ${physician}`);
  console.log(`Using care team: ${careTeam}`);
});
```

### Check Current Configuration

```typescript
test('Check config', async ({ page }) => {
  const env = CredentialManager.getEnvironment();  // 'qa', 'prod', etc.
  const tenant = CredentialManager.getTenant();     // 'cth', 'integrum'
  const url = CredentialManager.getBaseUrl();       // 'https://...'

  console.log(`Testing ${tenant} tenant in ${env} environment at ${url}`);
});
```

## Common Issues and Solutions

### Issue 1: "Credentials not found" Error
**Error:** `Credentials not found for environment: qa, tenant: cth, role: RN`

**Solution:**
- Check `.env.local` exists and has correct values
- Verify environment variable names match exactly (case-sensitive for var names)
- Check credential key: `QA_CTH_RN_USERNAME` and `QA_CTH_RN_PASSWORD`
- Verify `TEST_ENV=qa` and `TENANT=cth` are set correctly

### Issue 2: "No test data found" Error
**Error:** `No test data found for environment: prod, tenant: cth`

**Solution:**
- Check `config/test-data.ts` has data for the environment
- Environment and tenant names are case-insensitive
- Ensure the tenant exists in that environment

### Issue 3: "Login failed" Error
**Solution:**
- Verify credentials are correct for the environment
- Check if the test account is active
- Try logging in manually with the same credentials
- Check if the environment URL is correct
- Verify you're using the correct tenant credentials

### Issue 4: Tests Running Against Wrong Environment
**Solution:**
- Check `TEST_ENV` value in `.env.local`
- Check console output: "🎭 Running tests against: QA environment"
- Command line overrides take precedence over `.env.local`
- Ensure you're not accidentally overriding with env vars

### Issue 5: Wrong Tenant Being Used
**Solution:**
- Check `TENANT` value in `.env.local`
- Look for console output showing which credentials are used
- Verify tenant exists for the environment (Integrum only in QA)
- Check test data exists for the tenant in `config/test-data.ts`

### Issue 6: "Browser not installed" Error
**Solution:**
```bash
# Install all browsers
npx playwright install

# Or install specific browser
npx playwright install chromium
```

### Issue 7: Permission/Access Denied
**Solution:**
- Verify test account has required permissions
- Check if IP whitelisting is required
- Confirm VPN connection if required
- Ensure account hasn't been locked/disabled

## Project Structure Overview

```
claude-qa-automation/
├── .env.example              # Template with variable names (safe to commit)
├── .env.local               # Your actual credentials (NEVER commit)
├── .gitignore               # Ensures .env.local is not committed
├── playwright.config.ts     # Playwright configuration
├── package.json             # Dependencies and scripts
├── config/
│   ├── test-data.ts        # Per-tenant test data configuration
│   └── timeouts.ts         # Timeout configurations
├── fixtures/               # Playwright test fixtures
│   ├── auth.fixture.ts     # Pre-authenticated page fixtures
│   ├── page-objects.fixture.ts  # Combined auth + page objects
│   └── shared-context.fixture.ts # Shared browser context
├── pages/                  # Page Object Model classes
│   ├── base.page.ts        # Base page with common methods
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   ├── patient.page.ts
│   ├── patient-profile.page.ts
│   ├── care-team.page.ts
│   ├── benefits.page.ts
│   └── ...
├── tests/
│   ├── Hope/               # HOPE visit tests
│   ├── smoke/              # Quick validation tests
│   └── tobeD/              # Work in progress
├── types/
│   └── patient.types.ts    # TypeScript type definitions
├── utils/
│   ├── credential-manager.ts    # Credential resolution logic
│   ├── test-data-manager.ts     # Test data access
│   ├── auth.helper.ts           # Logout and session utilities
│   ├── wait-helper.ts           # Wait utilities
│   ├── date-helper.ts           # Date utilities
│   ├── api-helper.ts            # API interceptors
│   └── hope-helpers.ts          # HOPE-specific helpers
├── docs/
│   ├── ENVIRONMENT_SETUP.md     # Multi-environment setup guide
│   └── ENV_QUICK_REFERENCE.md   # Quick reference
└── reports/                # Test reports (gitignored)
```

## Daily Workflow

### Morning Setup:
1. Pull latest changes: `git pull`
2. Install any new dependencies: `npm install`
3. Update Playwright if needed: `npx playwright install`

### Before Writing Tests:
1. Run existing tests to ensure they pass
2. Check which environment and tenant you should use
3. Verify your credentials are working
4. Review existing page objects for reusable methods

### Writing New Tests:
1. Create test in appropriate folder (smoke/Hope/regression)
2. Use Page Object Model patterns (extend existing pages)
3. Use `CredentialManager` for credentials
4. Use `TestDataManager` for test data
5. Use `@faker-js/faker` for generating random patient data
6. Tag tests appropriately (@smoke, @regression)
7. Test locally before committing

### Before Committing:
1. Run tests locally: `npx playwright test`
2. Ensure no credentials in code
3. Check `.gitignore` is working: `git status`
4. Commit only test code, not `.env.local`
5. Write clear commit messages

## Security Reminders

### ⚠️ NEVER DO:
- ❌ Commit `.env.local` file
- ❌ Hardcode credentials in test files
- ❌ Share credentials via email/Slack
- ❌ Use production credentials for testing
- ❌ Push credentials to GitHub
- ❌ Use personal accounts for testing

### ✅ ALWAYS DO:
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use environment variables for credentials
- ✅ Use `CredentialManager` for credential access
- ✅ Rotate test credentials periodically
- ✅ Use dedicated test accounts
- ✅ Report compromised credentials immediately
- ✅ Store credentials in password manager

## Getting Help

### Resources:
1. **Playwright Documentation**: https://playwright.dev/docs/intro
2. **Project README**: [README.md](./README.md)
3. **Environment Setup**: [docs/ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md)
4. **Quick Reference**: [docs/ENV_QUICK_REFERENCE.md](./docs/ENV_QUICK_REFERENCE.md)
5. **Test Examples**: Look at existing tests in `tests/` folder

### Contact:
- **Technical Issues**: Contact DevOps team
- **Credentials/Access**: Contact your manager or security team
- **Framework Questions**: Contact QA team lead
- **Tenant-Specific Issues**: Contact tenant administrators

## Advanced Topics

### Adding a New Tenant

1. **Add credentials to `.env.local`:**
```env
QA_NEWTENANT_MD_USERNAME=user@example.com
QA_NEWTENANT_MD_PASSWORD=password
```

2. **Add test data to `config/test-data.ts`:**
```typescript
export const testData = {
  qa: {
    newtenant: {
      physician: 'DrSmith',
      careTeam: 'TeamA',
      facility: 'Home',
    }
  }
};
```

3. **Update `.env.local` TENANT variable:**
```env
TENANT=newtenant
```

### Running Tests in CI/CD

Example GitHub Actions workflow:

```yaml
name: Tests
on: [push]

jobs:
  test-qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run QA Tests
        env:
          TEST_ENV: qa
          TENANT: cth
          QA_CTH_RN_USERNAME: ${{ secrets.QA_CTH_RN_USERNAME }}
          QA_CTH_RN_PASSWORD: ${{ secrets.QA_CTH_RN_PASSWORD }}
          QA_URL: ${{ secrets.QA_URL }}
        run: npx playwright test tests/smoke/
```

## Next Steps

After successful setup:
1. ✅ Run smoke tests in all environments
2. ✅ Familiarize yourself with Page Object Model structure
3. ✅ Review existing test examples in `tests/Hope/`
4. ✅ Try writing a simple test
5. ✅ Set up your IDE with Playwright extension
6. ✅ Join the QA/Testing team channel
7. ✅ Review multi-tenant architecture in README.md

---

**Remember**: The `.env.local` file is your personal configuration. Never commit it to Git, and keep your credentials secure!
