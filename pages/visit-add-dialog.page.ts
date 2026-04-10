import { Page } from '@playwright/test';

/**
 * Options for HOPE-related questions that appear in the Create Visit dialog
 * after selecting a Routine/Comprehensive visit type post-INV.
 */
export interface HOPEVisitDialogOptions {
  /** Answer to "Is this a Symptom Follow Up Visit?" — true=Yes, false=No, undefined=skip */
  isSFV?: boolean;
  /** Answer to "Is this HOPE Update Visit #1?" — true=Yes, false=No, undefined=skip */
  isHUV1?: boolean;
  /** Answer to "Is this HOPE Update Visit #2?" — true=Yes, false=No, undefined=skip */
  isHUV2?: boolean;
}

/**
 * Visit Add Dialog Page Object
 *
 * Handles the "Create Visit" modal dialog on the Care Plan page.
 * Role and Type are ion-select dropdowns that open as radio groups.
 * After INV, HOPE questions (SFV, HUV1, HUV2) may appear as required radio buttons.
 */
export class VisitAddDialogPage {
  readonly page: Page;

  private readonly selectors = {
    // ── Add Visit button (fab on Care Plan page) ────────────────────────
    addVisitBtn: '[data-cy="btn-add-visit"]',

    // ── Role & Type are ion-select with popover interface ───────────────
    roleSelect: '[data-cy="input-visit-role"]',
    typeSelect: '[data-cy="input-visit-type"]',

    // ── HOPE Questions (radio groups in carry-over-eval-container) ──────
    sfvQuestion: 'ion-label:has-text("Symptom Follow Up Visit")',
    huv1Question: 'ion-label:has-text("HOPE Update Visit #1")',
    huv2Question: 'ion-label:has-text("HOPE Update Visit #2")',

    // ── PRN Visit checkbox ──────────────────────────────────────────────
    prnCheckbox: 'ion-checkbox',

    // ── Comments ────────────────────────────────────────────────────────
    commentsInput: 'textarea',

    // ── Actions ─────────────────────────────────────────────────────────
    submitBtn: '[data-cy="button-submit"], button:has-text("Submit")',
    cancelBtn: '[data-cy="button-cancel"], button:has-text("Cancel")',
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
    await this.page.locator(this.selectors.roleSelect).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('radio', { name: role }).click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected role: ${role}`);
  }

  async selectType(type: string): Promise<void> {
    await this.page.locator(this.selectors.typeSelect).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('radio', { name: type, exact: true }).click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected type: ${type}`);
  }

  /**
   * Answer HOPE-related questions if they appear in the dialog.
   * Questions are conditionally rendered based on patient state:
   * - SFV: "Is this a Symptom Follow Up Visit?" — appears when SFV is pending
   * - HUV1: "Is this HOPE Update Visit #1?" — appears when HUV1 is due
   * - HUV2: "Is this HOPE Update Visit #2?" — appears when HUV2 is due
   *
   * The HUV question is disabled until the SFV question is answered "No".
   * Answering SFV "Yes" auto-disables HUV (mutually exclusive).
   */
  /**
   * Answer a single HOPE radio question in the Create Visit dialog.
   * Each question is inside a .carry-over-eval-container with a label and Yes/No radios.
   */
  private async answerHOPEQuestion(labelText: string, answerYes: boolean): Promise<boolean> {
    // Find the container with the matching label text
    const containers = this.page.locator('.carry-over-eval-container');
    const count = await containers.count();

    for (let i = 0; i < count; i++) {
      const container = containers.nth(i);
      const label = await container.locator('ion-label').first().textContent().catch(() => '');
      if (label?.includes(labelText)) {
        const answer = answerYes ? 'yes' : 'no';
        const radio = container.locator(`ion-radio[value="${answer}"] button`);
        if (await radio.isVisible({ timeout: 2000 }).catch(() => false)) {
          await radio.click({ force: true });
          await this.page.waitForTimeout(1000);
          console.log(`  ${labelText}: ${answerYes ? 'Yes' : 'No'}`);
          return true;
        } else {
          // Radio might be disabled — try force click on ion-radio directly
          const ionRadio = container.locator(`ion-radio[value="${answer}"]`);
          await ionRadio.click({ force: true });
          await this.page.waitForTimeout(1000);
          console.log(`  ${labelText}: ${answerYes ? 'Yes' : 'No'} (force)`);
          return true;
        }
      }
    }
    console.log(`  ${labelText}: question not found`);
    return false;
  }

  async answerHOPEQuestions(options: HOPEVisitDialogOptions): Promise<void> {
    // Wait for HOPE questions to render after role/type selection
    await this.page.locator('.carry-over-eval-container').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      console.log('  No HOPE questions appeared — proceeding');
    });

    // Answer SFV question first — this may enable/disable HUV
    if (options.isSFV !== undefined) {
      await this.answerHOPEQuestion('Symptom Follow Up Visit', options.isSFV);
    }

    // Answer HUV1 question (enabled after SFV=No)
    if (options.isHUV1 !== undefined) {
      await this.answerHOPEQuestion('HOPE Update Visit #1', options.isHUV1);
    }

    // Answer HUV2 question
    if (options.isHUV2 !== undefined) {
      await this.answerHOPEQuestion('HOPE Update Visit #2', options.isHUV2);
    }
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
    const submitBtn = this.page.locator(this.selectors.submitBtn).first();

    // Wait for submit to become enabled (HOPE questions must be answered first)
    await this.page.waitForTimeout(1000);
    const isDisabled = await submitBtn.getAttribute('disabled');
    if (isDisabled !== null) {
      console.log('  Submit still disabled — waiting for HOPE questions to be answered...');
      // Poll for up to 5 seconds
      for (let i = 0; i < 10; i++) {
        await this.page.waitForTimeout(500);
        if (await submitBtn.getAttribute('disabled') === null) break;
      }
    }

    await submitBtn.click();
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
   * Full flow: open dialog, select role/type, answer HOPE questions, submit.
   * @param role - Role dropdown label (e.g., 'Registered Nurse (RN)')
   * @param type - Visit type dropdown label (e.g., 'Routine', 'Initial Nursing Assessment')
   * @param hopeOptions - Optional HOPE question answers (SFV, HUV1, HUV2)
   */
  async createVisit(role: string, type: string, hopeOptions?: HOPEVisitDialogOptions): Promise<void> {
    await this.clickAddVisit();
    await this.selectRole(role);
    await this.selectType(type);

    // Answer HOPE questions if options provided
    if (hopeOptions) {
      await this.answerHOPEQuestions(hopeOptions);
    }

    await this.submit();
  }
}
