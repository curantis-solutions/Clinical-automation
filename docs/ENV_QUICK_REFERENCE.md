# Environment Configuration - Quick Reference

## 🚀 How to Switch Environments

### Option 1: Edit `.env.local` (Recommended)
```bash
# Open .env.local and change line 5:
TEST_ENV=qa       # For QA
TEST_ENV=staging  # For Staging
TEST_ENV=prod     # For Production

# Then run tests normally:
npx playwright test
```

### Option 2: Command Line Override
```bash
# Windows (CMD)
set TEST_ENV=prod && npx playwright test

# Windows (PowerShell)
$env:TEST_ENV="prod"; npx playwright test

# Mac/Linux
TEST_ENV=prod npx playwright test
```

## 📝 In Your Test Files

```typescript
import { getEnvConfig, logEnvironmentInfo } from '../../utils/env-helper';

test('My test', async ({ page }) => {
  const envConfig = getEnvConfig();
  logEnvironmentInfo(); // Shows which env you're using

  await loginPage.login(envConfig.userRN, envConfig.userRNPwd);
});
```

## 🔑 Environment Config Properties

```typescript
envConfig.url          // Base URL
envConfig.username     // Default username
envConfig.password     // Default password
envConfig.userRN       // RN user email
envConfig.userRNPwd    // RN password
envConfig.physician    // Physician name
envConfig.careTeam     // Care team name
envConfig.rnSign       // RN signature
```

## 📂 Do You Need Separate Files?

**No! Use single `.env.local` file** with environment prefixes:

```bash
TEST_ENV=qa

QA_URL=https://...
QA_USERNAME=...
QA_PASSWORD=...

STAGING_URL=https://...
STAGING_USERNAME=...
STAGING_PASSWORD=...

PROD_URL=https://...
PROD_USERNAME=...
PROD_PASSWORD=...
```

Just change `TEST_ENV` to switch!

## ✅ Your Current Setup

Your `.env.local` is already configured! Just change line 5:
- `TEST_ENV=qa` ← Current (QA environment)
- `TEST_ENV=staging` ← For staging
- `TEST_ENV=prod` ← For production

## 🎯 Common Commands

```bash
# Run all tests on QA
TEST_ENV=qa npx playwright test

# Run specific test on staging
TEST_ENV=staging npx playwright test hope-no-sym.spec.ts

# Run with UI mode on prod
TEST_ENV=prod npx playwright test --ui

# Run in headless mode
HEADLESS=true TEST_ENV=prod npx playwright test
```

## 🛡️ Security Note

- **Never commit `.env.local`** (already in `.gitignore`)
- Use real credentials only in `.env.local`
- Use GitHub Secrets for CI/CD

## 💡 Tips

1. The helper auto-validates configs (throws error if credentials missing)
2. Console shows which environment you're testing (via `logEnvironmentInfo()`)
3. You can force specific env: `getEnvConfig('prod')`
4. All your tests automatically use the right credentials!
