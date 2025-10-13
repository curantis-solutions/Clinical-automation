# Environment Configuration Guide

This guide explains how to manage multiple environments (QA, Staging, Production) in your test automation framework.

## Quick Start

### Method 1: Using Single `.env.local` File (Recommended)

1. **Configure `.env.local`** with all environments:
```bash
# Set which environment to use
TEST_ENV=qa  # Options: qa, staging, prod

# QA Environment
QA_URL=https://clinical.qa1.curantissolutions.com
QA_USERNAME=test+qa@example.com
QA_PASSWORD=password123
QA_USER_RN=test+qanurse@example.com
QA_USER_RN_PWD=password123

# Staging Environment
STAGING_URL=https://clinical.staging.curantissolutions.com
STAGING_USERNAME=test+staging@example.com
STAGING_PASSWORD=password123

# Production Environment
PROD_URL=https://clinical.curantissolutions.com
PROD_USERNAME=test+prod@example.com
PROD_PASSWORD=password123
```

2. **Run tests** by changing `TEST_ENV` in `.env.local`:
```bash
# Edit .env.local and set TEST_ENV=qa
npx playwright test

# Or override via command line
TEST_ENV=staging npx playwright test
TEST_ENV=prod npx playwright test
```

### Method 2: Multiple Environment Files

Create separate files for each environment:

```
.env.qa
.env.staging
.env.prod
```

Run with specific file:
```bash
# Load .env.qa
npx playwright test

# Load .env.staging
cp .env.staging .env.local && npx playwright test

# Or use dotenv-cli
npx dotenv -e .env.staging -- npx playwright test
```

### Method 3: Command Line Override

Override individual variables:
```bash
TEST_ENV=prod QA_USER_RN=prod@example.com npx playwright test
```

## Using Environment Helper in Tests

### Import the helper

```typescript
import { getEnvConfig, logEnvironmentInfo } from '../../utils/env-helper';
```

### Get environment configuration

```typescript
test('My test', async ({ page }) => {
  // Get config for current environment (based on TEST_ENV)
  const envConfig = getEnvConfig();

  // Log environment info
  logEnvironmentInfo();

  // Use config
  await loginPage.login(envConfig.userRN, envConfig.userRNPwd);

  console.log(`Testing on: ${envConfig.url}`);
});
```

### Get specific environment config

```typescript
// Force specific environment regardless of TEST_ENV
const qaConfig = getEnvConfig('qa');
const prodConfig = getEnvConfig('prod');
```

## Available Configuration Properties

The `EnvConfig` type includes:

- `url` - Base URL for the environment
- `username` - Default user credentials
- `password` - Default user password
- `userRN` - Registered Nurse user email
- `userRNPwd` - RN user password
- `physician` - Physician name for tests
- `careTeam` - Care team name
- `rnSign` - RN signature name

## Environment Variables Reference

### Core Variables
- `TEST_ENV` - Current environment (qa, staging, prod)
- `HEADLESS` - Run browser in headless mode (true/false)
- `SLOWMO` - Slow down operations by milliseconds
- `TIMEOUT` - Test timeout in milliseconds
- `WORKERS` - Number of parallel workers

### Per-Environment Variables
Each environment should have:
- `{ENV}_URL` - Application URL
- `{ENV}_USERNAME` - Default username
- `{ENV}_PASSWORD` - Default password
- `{ENV}_USER_RN` - RN user email
- `{ENV}_USER_RN_PWD` - RN password
- `{ENV}_PHYSICIAN` - Physician name
- `{ENV}_CARE_TEAM` - Care team name
- `{ENV}_RN_SIGN` - RN signature

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push]

jobs:
  test-qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run QA Tests
        env:
          TEST_ENV: qa
          QA_URL: ${{ secrets.QA_URL }}
          QA_USERNAME: ${{ secrets.QA_USERNAME }}
          QA_PASSWORD: ${{ secrets.QA_PASSWORD }}
        run: npx playwright test

  test-prod:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Production Smoke Tests
        env:
          TEST_ENV: prod
          PROD_URL: ${{ secrets.PROD_URL }}
          PROD_USERNAME: ${{ secrets.PROD_USERNAME }}
          PROD_PASSWORD: ${{ secrets.PROD_PASSWORD }}
        run: npx playwright test tests/smoke/
```

## Best Practices

1. **Never commit `.env.local`** - Add it to `.gitignore`
2. **Use environment prefixes** - Keep credentials organized (QA_*, PROD_*)
3. **Validate configs** - The helper will throw errors for missing variables
4. **Use secrets in CI** - Store credentials as GitHub/GitLab secrets
5. **Test env switching** - Verify all environments work before CI integration
6. **Document requirements** - Keep this file updated with new variables

## Troubleshooting

### Error: "Missing required environment variables"
- Check `.env.local` exists and has correct format
- Verify `TEST_ENV` value is qa/staging/prod
- Ensure required variables for that env are defined

### Tests using wrong environment
- Check `TEST_ENV` value in `.env.local`
- Verify you're not overriding with command line args
- Check `playwright.config.ts` is loading dotenv correctly

### Command line override not working
- On Windows, use: `set TEST_ENV=prod && npx playwright test`
- On Mac/Linux, use: `TEST_ENV=prod npx playwright test`
- Or use cross-env: `npx cross-env TEST_ENV=prod npx playwright test`

## Examples

### Switch environments quickly

```bash
# Test on QA
sed -i 's/TEST_ENV=.*/TEST_ENV=qa/' .env.local && npx playwright test

# Test on Staging
sed -i 's/TEST_ENV=.*/TEST_ENV=staging/' .env.local && npx playwright test

# Test on Prod
sed -i 's/TEST_ENV=.*/TEST_ENV=prod/' .env.local && npx playwright test
```

### Run specific test on different environments

```bash
TEST_ENV=qa npx playwright test hope-no-sym.spec.ts
TEST_ENV=staging npx playwright test hope-no-sym.spec.ts
TEST_ENV=prod npx playwright test hope-no-sym.spec.ts
```

### Cross-environment test (advanced)

```typescript
test('Compare environments', async ({ page }) => {
  const qaConfig = getEnvConfig('qa');
  const prodConfig = getEnvConfig('prod');

  // Test on QA
  await page.goto(qaConfig.url);
  const qaData = await page.textContent('.version');

  // Test on Prod
  await page.goto(prodConfig.url);
  const prodData = await page.textContent('.version');

  console.log(`QA Version: ${qaData}, Prod Version: ${prodData}`);
});
```
