import { Page } from '@playwright/test';

/**
 * Visit Add Dialog Page Object
 *
 * Handles the "Create Visit" modal dialog on the Care Plan page.
 * Role and Type are ion-select dropdowns that open as radio groups.
 */
export class VisitAddDialogPage {
  readonly page: Page;

  private readonly selectors = {
    // ── Add Visit button (fab on Care Plan page) ────────────────────────
    addVisitBtn: '[data-cy="btn-add-visit"]',

    // ── Role & Type are ion-select with popover interface ───────────────
    roleSelect: '[data-cy="input-visit-role"]',
    typeSelect: '[data-cy="input-visit-type"]',

    // ── PRN Visit checkbox ──────────────────────────────────────────────
    prnCheckbox: 'ion-checkbox',

    // ── Comments ────────────────────────────────────────────────────────
    commentsInput: 'textarea',

    // ── Actions ─────────────────────────────────────────────────────────
    submitBtn: 'button:has-text("Submit")',
    cancelBtn: 'button:has-text("Cancel")',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async clickAddVisit(): Promise<void> {
    await this.page.locator(this.selectors.addVisitBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Add Visit');
  }

  async selectRole(role: string): Promise<void> {
    // ion-select with popover interface — click to open, then select radio option
    await this.page.locator(this.selectors.roleSelect).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('radio', { name: role }).click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected role: ${role}`);
  }

  async selectType(type: string): Promise<void> {
    await this.page.locator(this.selectors.typeSelect).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('radio', { name: type }).click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected type: ${type}`);
  }

  async checkPRN(): Promise<void> {
    await this.page.locator(this.selectors.prnCheckbox).click();
    await this.page.waitForTimeout(500);
    console.log('Checked PRN Visit');
  }

  async fillComments(text: string): Promise<void> {
    await this.page.locator(this.selectors.commentsInput).fill(text);
    console.log(`Filled comments: ${text}`);
  }

  async submit(): Promise<void> {
    await this.page.locator(this.selectors.submitBtn).click();
    await this.page.waitForURL(/assessment/, { timeout: 30000 });
    await this.page.waitForTimeout(3000);
    console.log('Visit created — navigated to assessment');
  }

  async cancel(): Promise<void> {
    await this.page.locator(this.selectors.cancelBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('Cancelled visit creation');
  }

  /**
   * Full flow: open dialog, select role/type, submit
   */
  async createVisit(role: string, type: string): Promise<void> {
    await this.clickAddVisit();
    await this.selectRole(role);
    await this.selectType(type);
    await this.submit();
  }
}
