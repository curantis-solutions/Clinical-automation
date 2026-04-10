import { Page } from '@playwright/test';

/**
 * Plan of Care Page Object
 *
 * Handles suggested issues — accept or decline each.
 * Tabs: Suggested, Active, Resolved, Declined
 */
export class PlanOfCarePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Tabs ────────────────────────────────────────────────────────
    suggestedTab: '[data-cy="tab-plan-of-care-suggested"]',
    activeTab: '[data-cy="tab-plan-of-care-active"]',
    resolvedTab: '[data-cy="tab-plan-of-care-resolved"]',
    declinedTab: '[data-cy="tab-plan-of-care-declined"]',

    // ── Issues ──────────────────────────────────────────────────────
    issue: (index: number) => `[data-cy="issue-${index}"]`,
    issueTitle: '[data-cy="label-issue-title"]',
    acceptBtn: '[data-cy="button-issue-checkmark"]',
    declineBtn: '[data-cy="button-issue-close"]',

    // ── Accept Modal ────────────────────────────────────────────────
    goalTitle: '#goalTitle',
    interventionTitle: '#interventionTitle',
    administeredByHospice: '[data-cy="checkbox-poc-administered-by-section-hospice"] button',
    administeredByPatient: '[data-cy="checkbox-poc-administered-by-section-patient"] button',
    administeredByFacility: '[data-cy="checkbox-poc-administered-by-section-facility"] button',
    administeredByPcg: '[data-cy="checkbox-poc-administered-by-section-pcg"] button',
    pocSubmit: '[data-cy="button-poc-submit"]',

    // ── Decline Modal ───────────────────────────────────────────────
    declineCheckbox: 'page-update-status ion-checkbox',
    declineTextarea: 'page-update-status textarea',
    declineSubmit: 'page-update-status button:has-text("Submit")',

    // ── Exit ────────────────────────────────────────────────────────
    exitBtn: 'button:has-text("Exit Plan of Care")',
  };

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Select the Goal or Intervention title.
   * The modal can have either:
   *   A) ion-select (popover with options) — identified by tag name
   *   B) ion-list radio-group (radio buttons) — when options are predefined
   * If "Other" is selected/chosen, fill the description textarea.
   */
  private async selectTitleRadio(elementId: string, descriptionCy: string): Promise<void> {
    const el = this.page.locator(elementId);
    if (!await el.isVisible({ timeout: 3000 }).catch(() => false)) return;

    const tagName = await el.evaluate(e => e.tagName.toLowerCase()).catch(() => '');

    if (tagName === 'ion-select') {
      // ── Case A: ion-select with popover ──────────────────────────
      // Check current value first — might already have a selection
      const currentText = (await el.locator('.select-text').textContent())?.trim() || '';
      console.log(`      ${elementId} is ion-select, current: "${currentText}"`);

      if (currentText === 'Please Select' || !currentText) {
        // Click the button inside ion-select (not force) to properly trigger popover
        const selectBtn = el.locator('button');
        await selectBtn.click();
        await this.page.waitForTimeout(1000);
        // Select first option from popover
        const popoverItems = this.page.locator('ion-popover.select-popover ion-item');
        try {
          await popoverItems.first().waitFor({ state: 'visible', timeout: 5000 });
          await popoverItems.first().click({ force: true });
          await this.page.waitForTimeout(1000);
        } catch {
          console.log(`      WARNING: Popover did not appear for ${elementId}`);
        }
      }

      // Re-read selected text after selection
      const selectText = (await el.locator('.select-text').textContent())?.trim() || '';
      console.log(`      ${elementId} selected: "${selectText}"`);
      if (selectText.toLowerCase().includes('other')) {
        await this.fillDescriptionIfEmpty(descriptionCy);
      }
    } else {
      // ── Case B: ion-list radio-group or other container ──────────
      // Look for radio items within the same row/section
      const parentRow = el.locator('xpath=ancestor::ion-row');
      const radioItems = parentRow.locator('ion-list ion-item');
      const count = await radioItems.count();
      console.log(`      ${elementId} is ${tagName}, found ${count} radio items`);

      if (count === 0) {
        // Fallback — try finding radio items as siblings
        const allRadios = parentRow.locator('ion-item').filter({ has: this.page.locator('ion-radio') });
        const radioCount = await allRadios.count();
        console.log(`      Fallback: found ${radioCount} radio items`);
        if (radioCount > 0) {
          const firstChecked = await allRadios.first().locator('ion-radio').getAttribute('ng-reflect-checked').catch(() => 'false');
          if (firstChecked !== 'true') {
            await allRadios.first().locator('button').click({ force: true });
            await this.page.waitForTimeout(500);
          }
          const label = (await allRadios.first().locator('ion-label').textContent())?.trim() || '';
          if (label === 'Other') {
            await this.fillDescriptionIfEmpty(descriptionCy);
          }
        }
        return;
      }

      // Check if first radio is already checked
      const firstRadio = radioItems.first().locator('ion-radio');
      const isChecked = await firstRadio.getAttribute('ng-reflect-checked').catch(() => 'false');

      if (isChecked !== 'true') {
        await radioItems.first().locator('button').click({ force: true });
        await this.page.waitForTimeout(500);
      }

      const label = (await radioItems.first().locator('ion-label').textContent())?.trim() || '';
      if (label === 'Other') {
        await this.fillDescriptionIfEmpty(descriptionCy);
      }
    }
  }

  /**
   * Fill a description textarea if it's visible and empty.
   */
  private async fillDescriptionIfEmpty(dataCyTextarea: string): Promise<void> {
    const textarea = this.page.locator(`[data-cy="${dataCyTextarea}"] textarea`);
    if (await textarea.isVisible({ timeout: 1500 }).catch(() => false)) {
      const currentValue = await textarea.inputValue().catch(() => '');
      if (!currentValue.trim()) {
        await textarea.click();
        await textarea.pressSequentially('Per care plan', { delay: 30 });
        await this.page.waitForTimeout(300);
        console.log(`    Filled "Other" description for ${dataCyTextarea}`);
      }
    }
  }

  async getSuggestedIssueCount(): Promise<number> {
    const issues = this.page.locator('page-suggested issue');
    return await issues.count();
  }

  async getIssueTitle(index: number): Promise<string> {
    const issue = this.page.locator(this.selectors.issue(index));
    const title = issue.locator(this.selectors.issueTitle);
    return (await title.textContent())?.trim() || '';
  }

  /**
   * Accept an issue by index — fills Goal, Intervention, Administered By, Submit
   */
  async acceptIssue(index: number): Promise<void> {
    const issue = this.page.locator(this.selectors.issue(index));
    const title = await this.getIssueTitle(index);

    // Click accept (checkmark) button
    await issue.locator(this.selectors.acceptBtn).click();
    // Wait for the accept modal to appear with Goal select
    await this.page.locator(this.selectors.goalTitle).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    console.log(`  Accepting issue ${index}: ${title}`);

    // Goal Title — select first radio, fill "Other" textarea if needed
    await this.selectTitleRadio(this.selectors.goalTitle, 'input-poc-goal-section-description');
    console.log('    Goal: selected');

    // Intervention Title — select first radio, fill "Other" textarea if needed
    await this.selectTitleRadio(this.selectors.interventionTitle, 'input-poc-intervention-section-description');
    console.log('    Intervention: selected');

    // Administered By — check Hospice (click checkbox-icon div)
    const hospiceCheckboxIcon = this.page.locator('[data-cy="checkbox-poc-administered-by-section-hospice"] .checkbox-icon');
    if (await hospiceCheckboxIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
      await hospiceCheckboxIcon.click({ force: true });
      await this.page.waitForTimeout(500);
      console.log('    Administered By: Hospice');
    }

    // Submit
    await this.page.locator(this.selectors.pocSubmit).click();
    await this.page.waitForTimeout(2000);
    console.log(`  Issue "${title}" accepted`);
  }

  /**
   * Decline an issue by index — checks "normal reading" + Submit
   */
  async declineIssue(index: number): Promise<void> {
    const issue = this.page.locator(this.selectors.issue(index));
    const title = await this.getIssueTitle(index);

    // Click decline (close) button
    await issue.locator(this.selectors.declineBtn).click();
    await this.page.waitForTimeout(2000);
    console.log(`  Declining issue ${index}: ${title}`);

    // Check "normal reading" checkbox
    const checkbox = this.page.locator(this.selectors.declineCheckbox).first();
    if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkbox.click({ force: true });
      await this.page.waitForTimeout(500);
      console.log('    Checked: normal reading');
    }

    // Submit
    await this.page.locator(this.selectors.declineSubmit).click();
    await this.page.waitForTimeout(2000);
    console.log(`  Issue "${title}" declined`);
  }

  /**
   * Accept all suggested issues
   */
  async acceptAllIssues(): Promise<void> {
    const count = await this.getSuggestedIssueCount();
    console.log(`  Plan of Care: ${count} suggested issues`);
    for (let i = 0; i < count; i++) {
      // Check if there are still issues remaining before accepting
      const remaining = await this.getSuggestedIssueCount();
      if (remaining === 0) {
        console.log('  No more suggested issues');
        break;
      }
      await this.acceptIssue(0); // Always index 0 since accepted issues move to Active tab
    }
  }

  /**
   * Decline all suggested issues
   */
  async declineAllIssues(): Promise<void> {
    const count = await this.getSuggestedIssueCount();
    for (let i = 0; i < count; i++) {
      await this.declineIssue(0);
    }
  }

  async exitPlanOfCare(): Promise<void> {
    try {
      await this.page.locator(this.selectors.exitBtn).click();
      await this.page.waitForTimeout(3000).catch(() => {});
    } catch {
      // Page may navigate away after exit — that's expected
    }
    console.log('  Exited Plan of Care');
  }
}
