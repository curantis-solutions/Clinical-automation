# Playwright Enterprise Automation Framework - Implementation Plan

## Overview
This document outlines the complete implementation plan for a Playwright automation framework supporting multiple environments (dev, qa, staging, prod) with secure credential management and fake data integration.

## Architecture Principles
- **No credentials in source code** - All credentials stored in `.env.local` (gitignored)
- **Environment flexibility** - Easy switching between dev, qa, staging, prod
- **Future-ready** - Designed to easily migrate to AWS SSM later
- **Fake data integration** - Using Faker.js and mock APIs for test data
- **Role-based testing** - Support for multiple user roles (admin, user, viewer)

## Phase 1: Project Foundation

### 1.1 Directory Structure
```
clinical-ui-automation/
├── .env.example                 # Template (safe to commit)
├── .env.local                   # Actual credentials (gitignored)
├── .gitignore                   # Exclude sensitive files
├── playwright.config.ts         # Main configuration
├── package.json
├── tsconfig.json
│
├── config/
│   ├── environments.ts          # Environment URLs and settings
│   ├── credentials.ts           # Credential manager
│   └── test-config.ts          # Test configuration
│
├── tests/
│   ├── smoke/                  # Critical path tests (5-10 min)
│   │   ├── login.spec.ts
│   │   └── health-check.spec.ts
│   ├── regression/             # Comprehensive tests (1-2 hours)
│   │   ├── user-management/
│   │   ├── billing/
│   │   └── reports/
│   └── e2e/                    # End-to-end workflows
│       └── complete-purchase.spec.ts
│
├── pages/                      # Page Object Model
│   ├── base.page.ts
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   └── components/
│       ├── navigation.component.ts
│       └── modal.component.ts
│
├── fixtures/
│   ├── auth.fixture.ts         # Pre-authenticated page fixtures
│   ├── page-objects.fixture.ts # Combined auth + page objects
│   └── shared-context.fixture.ts # Shared browser context
│
├── utils/
│   ├── credential-manager.ts   # Manage credentials from .env.local
│   ├── test-data-manager.ts    # Test data access
│   ├── auth.helper.ts          # Logout and session utilities
│   ├── wait-helper.ts          # Wait utilities
│   ├── date-helper.ts          # Date utilities
│   └── api-helper.ts           # API interceptors
│
├── data/
│   ├── test-users.json        # User role definitions (no passwords)
│   └── test-scenarios.json    # Test data templates
│
└── reports/                    # Test execution reports
    └── .gitkeep
```

### 1.2 Initial Setup Tasks
- [ ] Initialize npm project
- [ ] Install Playwright and TypeScript
- [ ] Install additional dependencies (faker, dotenv, cross-env)
- [ ] Create directory structure
- [ ] Configure TypeScript
- [ ] Set up ESLint and Prettier

## Phase 2: Configuration Management

### 2.1 Environment Configuration

#### File: `.env.example` (Safe to commit)
```env
# Environment Selection
TEST_ENV=dev

# Test Configuration
HEADLESS=true
WORKERS=4
TIMEOUT=30000
RETRIES=1
SLOWMO=0

# Reporting
SHOW_REPORT=false
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=false

# Fake Data Configuration
USE_FAKE_DATA=true
FAKER_SEED=12345
```

#### File: `.env.local` (NEVER commit - add to .gitignore)
```env
# Environment URLs
DEV_URL=https://dev.yourapp.com
QA_URL=https://qa.yourapp.com
STAGING_URL=https://staging.yourapp.com
PROD_URL=https://prod.yourapp.com

# Dev Environment Credentials
DEV_ADMIN_USERNAME=admin@dev.com
DEV_ADMIN_PASSWORD=DevAdmin123!
DEV_USER_USERNAME=user@dev.com
DEV_USER_PASSWORD=DevUser123!
DEV_VIEWER_USERNAME=viewer@dev.com
DEV_VIEWER_PASSWORD=DevViewer123!

# QA Environment Credentials
QA_ADMIN_USERNAME=admin@qa.com
QA_ADMIN_PASSWORD=QAAdmin123!
QA_USER_USERNAME=user@qa.com
QA_USER_PASSWORD=QAUser123!
QA_VIEWER_USERNAME=viewer@qa.com
QA_VIEWER_PASSWORD=QAViewer123!

# Staging Environment Credentials
STAGING_ADMIN_USERNAME=admin@staging.com
STAGING_ADMIN_PASSWORD=StagingAdmin123!
STAGING_USER_USERNAME=user@staging.com
STAGING_USER_PASSWORD=StagingUser123!

# Production Environment Credentials (Read-only tests)
PROD_VIEWER_USERNAME=viewer@prod.com
PROD_VIEWER_PASSWORD=ProdViewer123!

# API Keys for Fake Data Services
MOCKAROO_API_KEY=your_api_key_here
```

### 2.2 GitIgnore Configuration
```gitignore
# Environment files with credentials
.env.local
.env.*.local
*.env.local

# Test artifacts
test-results/
playwright-report*/
reports/*.html
reports/*.json

# Screenshots and videos
screenshots/
videos/
*.png
*.mp4

# IDE
.vscode/
.idea/
*.swp
*.swo

# Dependencies
node_modules/

# OS files
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
.cache/

# Logs
*.log
npm-debug.log*
```

## Phase 3: Core Implementation

### 3.1 Credential Management

#### Credential Manager Service
```typescript
// utils/credential-manager.ts
export class CredentialManager {
  static getCredentials(environment: string, role: string) {
    const envKey = `${environment.toUpperCase()}_${role.toUpperCase()}`;

    return {
      username: process.env[`${envKey}_USERNAME`],
      password: process.env[`${envKey}_PASSWORD`],
    };
  }

  // Future: Easy migration to AWS SSM
  static async getCredentialsAsync(environment: string, role: string) {
    // For now, return from env
    return this.getCredentials(environment, role);

    // Future: Return from AWS SSM
    // return await SSMService.getCredentials(environment, role);
  }
}
```

### 3.2 Environment Management

#### Environment Configuration
```typescript
// config/environments.ts
export const environments = {
  dev: {
    name: 'Development',
    url: process.env.DEV_URL,
    apiUrl: process.env.DEV_API_URL,
    timeout: 60000,
    retries: 2
  },
  qa: {
    name: 'QA',
    url: process.env.QA_URL,
    apiUrl: process.env.QA_API_URL,
    timeout: 30000,
    retries: 1
  },
  staging: {
    name: 'Staging',
    url: process.env.STAGING_URL,
    apiUrl: process.env.STAGING_API_URL,
    timeout: 30000,
    retries: 0
  },
  prod: {
    name: 'Production',
    url: process.env.PROD_URL,
    apiUrl: process.env.PROD_API_URL,
    timeout: 20000,
    retries: 0
  }
};
```

### 3.3 Test Data Management

#### Faker Integration
```typescript
// utils/fake-data.ts
import { faker } from '@faker-js/faker';

export class FakeDataGenerator {
  static generateUser() {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode()
      }
    };
  }

  static generateProduct() {
    return {
      name: faker.commerce.productName(),
      price: faker.commerce.price(),
      description: faker.commerce.productDescription(),
      category: faker.commerce.department()
    };
  }

  static generateCreditCard() {
    return {
      number: faker.finance.creditCardNumber(),
      cvv: faker.finance.creditCardCVV(),
      expiry: faker.date.future()
    };
  }
}
```

## Phase 4: Test Framework

### 4.1 Page Object Model

#### Base Page
```typescript
// pages/base.page.ts
export class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string) {
    await this.page.goto(path);
  }

  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
```

### 4.2 Authentication Fixture

```typescript
// fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';
import { CredentialManager } from '../utils/credential-manager';
import { LoginPage } from '../pages/login.page';

// Create login fixture for any role
async function createLoginFixture(page: Page, role: string): Promise<Page> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  const credentials = CredentialManager.getCredentials(undefined, role);
  await loginPage.login(credentials.username, credentials.password);
  return page;
}

// Extend base test with pre-authenticated fixtures
export const test = base.extend<{
  loginAsRN: Page;
  loginAsMD: Page;
  loginAsSW: Page;
  loginAsHA: Page;
}>({
  loginAsRN: async ({ page }, use) => {
    await createLoginFixture(page, 'RN');
    await use(page);
  },
  loginAsMD: async ({ page }, use) => {
    await createLoginFixture(page, 'MD');
    await use(page);
  },
  loginAsSW: async ({ page }, use) => {
    await createLoginFixture(page, 'SW');
    await use(page);
  },
  loginAsHA: async ({ page }, use) => {
    await createLoginFixture(page, 'HA');
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

**Usage:**
```typescript
import { test } from '../fixtures/auth.fixture';

test('My test', async ({ loginAsRN }) => {
  // Already logged in as RN
  await loginAsRN.goto('/patients');
});
```

### 4.3 Test Organization

#### Smoke Test Example
```typescript
// tests/smoke/login.spec.ts
test.describe('Login Smoke Tests', () => {
  test('@smoke Login with valid credentials', async ({ page }) => {
    // Test implementation
  });
});
```

#### Regression Test Example
```typescript
// tests/regression/user-management.spec.ts
test.describe('User Management', () => {
  test('@regression Create new user', async ({ authenticatedPage }) => {
    // Test implementation
  });
});
```

## Phase 5: Execution Strategy

### 5.1 NPM Scripts

```json
{
  "scripts": {
    // Basic test execution
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "PWDEBUG=1 playwright test",

    // Environment-specific execution
    "test:dev": "cross-env TEST_ENV=dev playwright test",
    "test:qa": "cross-env TEST_ENV=qa playwright test",
    "test:staging": "cross-env TEST_ENV=staging playwright test",
    "test:prod": "cross-env TEST_ENV=prod playwright test --grep @readonly",

    // Test categories
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression",
    "test:e2e": "playwright test tests/e2e",

    // QA environment combinations
    "qa:smoke": "cross-env TEST_ENV=qa playwright test --grep @smoke",
    "qa:regression": "cross-env TEST_ENV=qa playwright test --grep @regression",
    "qa:headed": "cross-env TEST_ENV=qa playwright test --headed",
    "qa:debug": "cross-env TEST_ENV=qa PWDEBUG=1 playwright test",

    // Reports
    "report": "playwright show-report",
    "report:open": "npx playwright show-report",

    // Utilities
    "codegen": "playwright codegen",
    "trace": "playwright show-trace",

    // Setup
    "setup:local": "cp .env.example .env.local && echo 'Please update .env.local with your credentials'",
    "validate:env": "node scripts/validate-env.js"
  }
}
```

### 5.2 Running Tests

```bash
# Setup (first time only)
npm run setup:local
# Edit .env.local with actual credentials

# Run all tests in QA environment
TEST_ENV=qa npm run test

# Run smoke tests in QA
npm run qa:smoke

# Run specific test file in QA
TEST_ENV=qa npx playwright test tests/smoke/login.spec.ts

# Run with specific user role
TEST_ENV=qa TEST_ROLE=admin npm run test

# Debug mode
npm run qa:debug

# Run tests and show report
npm run qa:smoke && npm run report
```

## Phase 6: CI/CD Integration

### 6.1 GitHub Actions Workflow

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run tests
        env:
          TEST_ENV: ${{ github.ref == 'refs/heads/main' && 'staging' || 'qa' }}
          # Credentials from GitHub Secrets
          QA_ADMIN_USERNAME: ${{ secrets.QA_ADMIN_USERNAME }}
          QA_ADMIN_PASSWORD: ${{ secrets.QA_ADMIN_PASSWORD }}
          QA_USER_USERNAME: ${{ secrets.QA_USER_USERNAME }}
          QA_USER_PASSWORD: ${{ secrets.QA_USER_PASSWORD }}
        run: npm run test:smoke

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Phase 7: Best Practices

### 7.1 Security Checklist
- ✅ Never commit `.env.local` file
- ✅ Use `.gitignore` to exclude sensitive files
- ✅ Store CI/CD credentials in platform secrets
- ✅ Use read-only accounts for production testing
- ✅ Implement secret scanning in pre-commit hooks
- ✅ Rotate test credentials regularly
- ✅ Use fake data for test scenarios
- ✅ Clear test data after execution

### 7.2 Test Writing Guidelines
1. Use Page Object Model for maintainability
2. Tag tests appropriately (@smoke, @regression, @e2e)
3. Keep tests independent and idempotent
4. Use meaningful test descriptions
5. Implement proper cleanup in afterEach hooks
6. Use fixtures for common setup
7. Leverage parallel execution where possible
8. Generate unique test data using Faker
9. Add retries for flaky tests
10. Capture screenshots and videos on failure

### 7.3 Team Onboarding Steps
1. Clone repository
2. Install Node.js and npm
3. Run `npm install`
4. Copy `.env.example` to `.env.local`
5. Update `.env.local` with credentials (get from team lead/vault)
6. Run `npm run validate:env` to check setup
7. Run `npm run test:dev` to verify installation
8. Read test writing guidelines
9. Review existing test examples
10. Start with simple smoke tests

## Phase 8: Future Enhancements

### 8.1 AWS SSM Migration Path
When ready to migrate to AWS SSM:
1. Update `CredentialManager` to use AWS SDK
2. Move credentials from `.env.local` to SSM Parameter Store
3. Update CI/CD to use IAM roles
4. Remove local credential storage
5. Update documentation

### 8.2 Additional Features to Consider
- [ ] Visual regression testing with Percy or Applitools
- [ ] Performance testing with Lighthouse
- [ ] Accessibility testing with Axe
- [ ] API testing integration
- [ ] Database seeding and cleanup
- [ ] Test data management service
- [ ] Custom reporting dashboard
- [ ] Slack/Teams notifications
- [ ] Test execution analytics
- [ ] Cross-browser testing in cloud (BrowserStack/Sauce Labs)

## Phase 9: Monitoring and Maintenance

### 9.1 Test Health Metrics
- Test execution time trends
- Pass/fail rates by environment
- Flaky test identification
- Code coverage metrics
- Test execution frequency

### 9.2 Maintenance Schedule
- Weekly: Review and fix flaky tests
- Bi-weekly: Update test data and scenarios
- Monthly: Review and update documentation
- Quarterly: Credential rotation
- Quarterly: Framework dependency updates

## Success Criteria
- ✅ Zero credentials in source code
- ✅ Tests executable across all environments
- ✅ 80% code coverage for critical paths
- ✅ < 30 min execution time for smoke tests
- ✅ < 2 hours for full regression suite
- ✅ Automated CI/CD integration
- ✅ Team adoption and self-service capability

## Timeline
- **Week 1-2**: Phase 1-3 (Foundation and Core Implementation)
- **Week 3-4**: Phase 4-5 (Test Framework and Execution)
- **Week 5**: Phase 6 (CI/CD Integration)
- **Week 6**: Phase 7-8 (Documentation and Training)
- **Ongoing**: Phase 9 (Monitoring and Maintenance)

## Appendix

### A. Troubleshooting Guide
Common issues and solutions will be documented here.

### B. Command Reference
Quick reference for all npm scripts and CLI commands.

### C. Environment Variables Reference
Complete list of all supported environment variables.

### D. Migration Guide
Step-by-step guide for migrating from .env.local to AWS SSM (future).