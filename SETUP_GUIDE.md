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
cd clinical-ui-automation
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
npm run test:dev -- --grep "@smoke"
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
# Which environment to test (dev, qa, staging, prod)
TEST_ENV=dev

# ============================================
# ENVIRONMENT URLs
# ============================================
DEV_URL=https://dev.yourapp.com
QA_URL=https://qa.yourapp.com
STAGING_URL=https://staging.yourapp.com
PROD_URL=https://www.yourapp.com

# ============================================
# DEV ENVIRONMENT CREDENTIALS
# ============================================
DEV_ADMIN_USERNAME=admin@dev.yourapp.com
DEV_ADMIN_PASSWORD=YourActualDevAdminPassword123!
DEV_USER_USERNAME=user@dev.yourapp.com
DEV_USER_PASSWORD=YourActualDevUserPassword123!
DEV_VIEWER_USERNAME=viewer@dev.yourapp.com
DEV_VIEWER_PASSWORD=YourActualDevViewerPassword123!

# ============================================
# QA ENVIRONMENT CREDENTIALS
# ============================================
QA_ADMIN_USERNAME=admin@qa.yourapp.com
QA_ADMIN_PASSWORD=YourActualQAAdminPassword123!
QA_USER_USERNAME=user@qa.yourapp.com
QA_USER_PASSWORD=YourActualQAUserPassword123!
QA_VIEWER_USERNAME=viewer@qa.yourapp.com
QA_VIEWER_PASSWORD=YourActualQAViewerPassword123!

# ============================================
# STAGING ENVIRONMENT CREDENTIALS
# ============================================
STAGING_ADMIN_USERNAME=admin@staging.yourapp.com
STAGING_ADMIN_PASSWORD=YourActualStagingAdminPassword123!
STAGING_USER_USERNAME=user@staging.yourapp.com
STAGING_USER_PASSWORD=YourActualStagingUserPassword123!
STAGING_VIEWER_USERNAME=viewer@staging.yourapp.com
STAGING_VIEWER_PASSWORD=YourActualStagingViewerPassword123!

# ============================================
# PRODUCTION CREDENTIALS (Usually Read-Only)
# ============================================
PROD_VIEWER_USERNAME=readonly@prod.yourapp.com
PROD_VIEWER_PASSWORD=YourActualProdViewerPassword123!

# ============================================
# TEST CONFIGURATION
# ============================================
HEADLESS=true           # Run tests without browser UI (faster)
WORKERS=4               # Number of parallel workers
TIMEOUT=30000          # Test timeout in milliseconds
RETRIES=1              # Number of retries for failed tests
SLOWMO=0               # Slow down actions by X milliseconds (0 = disabled)

# ============================================
# REPORTING
# ============================================
SHOW_REPORT=false               # Automatically open HTML report after test run
SCREENSHOT_ON_FAILURE=true      # Capture screenshot when test fails
VIDEO_ON_FAILURE=false         # Record video for failed tests

# ============================================
# FAKE DATA CONFIGURATION (Optional)
# ============================================
USE_FAKE_DATA=true
FAKER_SEED=12345              # Seed for consistent fake data generation
MOCKAROO_API_KEY=             # Optional: Add if using Mockaroo API
```

### 3. Getting Credentials

#### Where to Get Test Credentials:

1. **From Team Lead/Manager**
   - Request access to test environments
   - Get credentials for your required role(s)

2. **From Password Manager**
   - Check team's password manager (1Password, LastPass, etc.)
   - Look for "QA Test Accounts" or similar

3. **From Internal Wiki/Documentation**
   - Check Confluence, Notion, or internal docs
   - Look for "Test Environment Setup" pages

4. **Create Test Accounts**
   - Some environments allow self-registration
   - Use a consistent naming pattern (e.g., yourname.test@company.com)

#### Security Best Practices:
- **NEVER use production credentials for testing**
- **NEVER use your personal credentials**
- **NEVER share credentials via email or chat**
- **ALWAYS use dedicated test accounts**

### 4. Verifying Your Setup

#### Check Environment Variables are Loaded:
```bash
# This script will verify your .env.local is properly configured
npm run validate:env
```

#### Test Connection to Each Environment:
```bash
# Test DEV environment
TEST_ENV=dev npm run test:connection

# Test QA environment
TEST_ENV=qa npm run test:connection

# Test STAGING environment
TEST_ENV=staging npm run test:connection
```

#### Run a Simple Login Test:
```bash
# Run login test in DEV
TEST_ENV=dev npx playwright test tests/smoke/login.spec.ts --headed

# Run login test in QA
TEST_ENV=qa npx playwright test tests/smoke/login.spec.ts --headed
```

## Running Tests

### Basic Test Execution

#### Run All Tests in Default Environment (dev):
```bash
npm run test
```

#### Run Tests in Specific Environment:
```bash
# Using TEST_ENV environment variable
TEST_ENV=qa npm run test

# Or using npm scripts
npm run test:qa
npm run test:staging
```

### Running Specific Test Suites

#### Smoke Tests (Quick Validation - 5-10 minutes):
```bash
# Run smoke tests in QA
TEST_ENV=qa npm run test:smoke

# Or using the shorthand
npm run qa:smoke
```

#### Regression Tests (Comprehensive - 1-2 hours):
```bash
# Run regression tests in QA
TEST_ENV=qa npm run test:regression

# Or using the shorthand
npm run qa:regression
```

#### E2E Tests (Complete Workflows):
```bash
# Run end-to-end tests
TEST_ENV=qa npm run test:e2e
```

### Running with Different User Roles

```bash
# Run as admin user
TEST_ENV=qa TEST_ROLE=admin npm run test

# Run as regular user
TEST_ENV=qa TEST_ROLE=user npm run test

# Run as viewer (read-only)
TEST_ENV=qa TEST_ROLE=viewer npm run test
```

### Development and Debugging

#### Run Tests in Headed Mode (See Browser):
```bash
TEST_ENV=qa npm run test:headed

# Or for specific test
TEST_ENV=qa npx playwright test tests/smoke/login.spec.ts --headed
```

#### Debug Mode (Step Through Tests):
```bash
TEST_ENV=qa npm run test:debug

# Or for specific test
TEST_ENV=qa PWDEBUG=1 npx playwright test tests/smoke/login.spec.ts
```

#### Generate Code with Playwright Codegen:
```bash
TEST_ENV=qa npm run codegen
```

#### Run Specific Test File:
```bash
TEST_ENV=qa npx playwright test tests/regression/user-management.spec.ts
```

#### Run Tests Matching Pattern:
```bash
# Run all tests with "login" in the name
TEST_ENV=qa npx playwright test -g "login"

# Run all tests tagged with @critical
TEST_ENV=qa npx playwright test --grep "@critical"
```

### Viewing Test Results

#### Open HTML Report:
```bash
npm run report
```

#### View Trace Files:
```bash
npm run trace trace.zip
```

## Common Issues and Solutions

### Issue 1: "Cannot find credentials" Error
**Solution:**
- Check `.env.local` exists and has correct values
- Verify environment name (TEST_ENV) is correct
- Run `npm run validate:env` to check configuration

### Issue 2: "Login failed" Error
**Solution:**
- Verify credentials are correct for the environment
- Check if the test account is active
- Try logging in manually with the same credentials
- Check if the environment URL is correct

### Issue 3: Tests Running Against Wrong Environment
**Solution:**
- Check TEST_ENV value: `echo $TEST_ENV`
- Ensure you're setting TEST_ENV correctly
- Check if .env.local has correct URLs

### Issue 4: "Browser not installed" Error
**Solution:**
```bash
# Install all browsers
npx playwright install

# Or install specific browser
npx playwright install chromium
```

### Issue 5: Permission/Access Denied
**Solution:**
- Verify test account has required permissions
- Check if IP whitelisting is required
- Confirm VPN connection if required

## Project Structure Overview

```
clinical-ui-automation/
├── .env.example         # Template with variable names (safe to commit)
├── .env.local          # Your actual credentials (NEVER commit)
├── .gitignore          # Ensures .env.local is not committed
├── tests/
│   ├── smoke/          # Quick validation tests (5-10 min)
│   ├── regression/     # Comprehensive tests (1-2 hours)
│   └── e2e/           # End-to-end workflows
├── pages/             # Page Object Model classes
├── fixtures/          # Test fixtures and setup
├── utils/            # Helper utilities
└── reports/          # Test reports (gitignored)
```

## Daily Workflow

### Morning Setup:
1. Pull latest changes: `git pull`
2. Install any new dependencies: `npm install`
3. Update Playwright if needed: `npx playwright install`

### Before Writing Tests:
1. Run existing tests to ensure they pass
2. Check which environment you should use
3. Verify your credentials are working

### Writing New Tests:
1. Create test in appropriate folder (smoke/regression/e2e)
2. Use Page Object Model patterns
3. Tag tests appropriately (@smoke, @regression)
4. Use fake data generators for test data
5. Test locally before committing

### Before Committing:
1. Run tests locally: `npm run test`
2. Ensure no credentials in code
3. Check `.gitignore` is working: `git status`
4. Commit only test code, not `.env.local`

## Security Reminders

### ⚠️ NEVER DO:
- ❌ Commit `.env.local` file
- ❌ Hardcode credentials in test files
- ❌ Share credentials via email/Slack
- ❌ Use production credentials for testing
- ❌ Push credentials to GitHub

### ✅ ALWAYS DO:
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use environment variables for credentials
- ✅ Rotate test credentials periodically
- ✅ Use dedicated test accounts
- ✅ Report compromised credentials immediately

## Getting Help

### Resources:
1. **Playwright Documentation**: https://playwright.dev/docs/intro
2. **Project README**: Check README.md for project-specific info
3. **Team Wiki**: Check internal documentation
4. **Test Examples**: Look at existing tests in `tests/` folder

### Contact:
- **Technical Issues**: Contact DevOps team
- **Credentials/Access**: Contact your manager or security team
- **Framework Questions**: Contact QA team lead

## Next Steps

After successful setup:
1. ✅ Run smoke tests in all environments
2. ✅ Familiarize yourself with Page Object Model structure
3. ✅ Review existing test examples
4. ✅ Try writing a simple test
5. ✅ Set up your IDE with Playwright extension
6. ✅ Join the QA/Testing Slack channel

---

**Remember**: The `.env.local` file is your personal configuration. Never commit it to Git, and keep your credentials secure!