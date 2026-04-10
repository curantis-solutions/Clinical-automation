import { test, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TIMEOUTS } from '../../config/timeouts';

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

test.describe.serial('Discover: Respiratory (SOB=Yes)', () => {
  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
    });
    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(TIMEOUTS.PAGE_DEFAULT);
    sharedPage.setDefaultNavigationTimeout(TIMEOUTS.PAGE_NAVIGATION);
    pages = createPageObjectsForPage(sharedPage);

    await pages.login.goto();
    const creds = CredentialManager.getCredentials(undefined, 'RN');
    await pages.login.login(creds.username, creds.password);
    await pages.dashboard.goto();
    await pages.dashboard.navigateToModule('Patient');
    await pages.patient.searchPatient('214157');
    await pages.patient.getPatientFromGrid(0);
    await sharedPage.waitForTimeout(2000);
    await sharedPage.locator('[data-cy="btn-nav-bar-item-care-plan"]').click();
    await sharedPage.waitForURL(/carePlan/, { timeout: 15000 });
    await sharedPage.waitForTimeout(3000);

    // Create new Initial Nursing Assessment visit
    await pages.visitAddDialog.createVisit('Registered Nurse (RN)', 'Initial Nursing Assessment');
  });

  test.afterAll(async () => {
    if (sharedContext) await sharedContext.close();
  });

  test('Discover Respiratory — all elements', async () => {
    test.setTimeout(120000);
    await pages.visitAssessment.navigateToModule('Respiratory');
    await sharedPage.waitForTimeout(3000);

    // Dump ALL data-cy elements grouped by card
    const elements = await sharedPage.evaluate(() => {
      const all = Array.from(document.querySelectorAll('ion-card [data-cy], .sectionContent [data-cy]'));
      return all.map(el => ({
        dataCy: el.getAttribute('data-cy'),
        tag: el.tagName,
        type: el.getAttribute('type'),
        id: el.id,
        text: el.textContent?.trim().substring(0, 50),
        parentCard: el.closest('ion-card')?.querySelector('[data-cy*="card-header"]')?.getAttribute('data-cy') || 'no-card',
        disabled: el.getAttribute('aria-disabled') || el.closest('[aria-disabled]')?.getAttribute('aria-disabled') || 'false',
      })).filter(el =>
        el.dataCy?.startsWith('radio-') ||
        el.dataCy?.startsWith('select-') ||
        el.dataCy?.startsWith('checkbox-') ||
        el.dataCy?.startsWith('toggle-') ||
        el.dataCy?.startsWith('number-') ||
        el.dataCy?.startsWith('input-') ||
        el.dataCy?.startsWith('button-') ||
        el.dataCy?.startsWith('card-header')
      );
    });

    // Group by parentCard
    const grouped: Record<string, any[]> = {};
    for (const el of elements) {
      if (!grouped[el.parentCard]) grouped[el.parentCard] = [];
      grouped[el.parentCard].push({ dataCy: el.dataCy, tag: el.tag, id: el.id, disabled: el.disabled });
    }
    console.log('\n=== RESPIRATORY — ALL ELEMENTS BY CARD ===');
    console.log(JSON.stringify(grouped, null, 2));

    // Now click SOB screening = Yes and discover revealed fields
    console.log('\n=== Clicking SOB Screening = Yes ===');
    const sobYes = sharedPage.locator('[data-cy="radio-shortnessOfBreathScreening-yes"]');
    if (await sobYes.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sobYes.click({ force: true });
      await sharedPage.waitForTimeout(2000);

      // Find new elements that appeared after selecting Yes
      const sobElements = await sharedPage.evaluate(() => {
        const sobCard = document.querySelector('[data-cy="card-header-shortnessOfBreath"]')?.closest('ion-card');
        if (!sobCard) return [];
        return Array.from(sobCard.querySelectorAll('[data-cy]')).map(el => ({
          dataCy: el.getAttribute('data-cy'),
          tag: el.tagName,
          id: el.id,
          type: el.getAttribute('type'),
          text: el.textContent?.trim().substring(0, 50),
        })).filter(el =>
          el.dataCy?.startsWith('radio-') ||
          el.dataCy?.startsWith('select-') ||
          el.dataCy?.startsWith('checkbox-') ||
          el.dataCy?.startsWith('toggle-') ||
          el.dataCy?.startsWith('number-') ||
          el.dataCy?.startsWith('input-')
        );
      });
      console.log('\n=== SOB CARD (after Yes) ===');
      console.log(JSON.stringify(sobElements, null, 2));
    }

    // Also check O2 saturation section
    const o2Elements = await sharedPage.evaluate(() => {
      const o2Card = document.querySelector('[data-cy="card-header-o2saturationHeader"]')?.closest('ion-card');
      if (!o2Card) return [];
      return Array.from(o2Card.querySelectorAll('[data-cy]')).map(el => ({
        dataCy: el.getAttribute('data-cy'),
        tag: el.tagName,
        id: el.id,
      })).filter(el =>
        el.dataCy?.startsWith('radio-') ||
        el.dataCy?.startsWith('select-') ||
        el.dataCy?.startsWith('number-') ||
        el.dataCy?.startsWith('checkbox-')
      );
    });
    console.log('\n=== O2 SATURATION CARD ===');
    console.log(JSON.stringify(o2Elements, null, 2));

    console.log('\n=== RESPIRATORY DISCOVERY COMPLETE ===');
  });
});
