import { Page } from '@playwright/test';

/**
 * Data interface for Hospice Aide module
 */
export interface HospiceAideData {
  /** Whether to add a task */
  addTask?: boolean;
  /** Level of Assistance: self/assist/total */
  assistance?: string;
  /** Frequency numerator (times per) */
  frequencyOccurrence?: string;
  /** Frequency denominator */
  frequencyDuration?: string;
}

/**
 * Hospice Aide Module Page Object
 */
export class HospiceAideModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Hospice Aide Tasks Card ─────────────────────────────────────
    tasksCardHeader: '[data-cy="card-header-hospiceAideTasks"]',
    addTaskBtn: '[data-cy="card-header-hospiceAideTasks"] + ion-card-content button, [data-cy="card-header-hospiceAideTasks"]',

    // ── Add Task Modal ──────────────────────────────────────────────
    categorySelect: '[data-cy="select-addTaskCategory"]',
    taskSelect: '[data-cy="select-addTaskTask"]',
    assistanceRadio: (level: string) => `[data-cy="radio-addTaskAssistance-${level}"]`,
    frequencyOccurrence: '[data-cy="number-input-frequencyNumerator"] input',
    frequencyDuration: '[data-cy="number-input-frequencyDenominator"] input',
    frequencyUnit: '[data-cy="select-frequencyUnit"]',
    modalSubmit: '[data-cy="btn-input-modal-submit"]',
    modalCancel: '[data-cy="btn-input-modal-cancel"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  private async selectFirstIonOption(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click();
      await this.page.waitForTimeout(1000);
      await this.page.locator('ion-popover.select-popover ion-item').first().click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  async fillHospiceAide(data: HospiceAideData): Promise<void> {
    console.log('Filling Hospice Aide module...');

    if (data.addTask) {
      await this.addTask(data);
    }

    console.log('Hospice Aide module filled');
  }

  async addTask(data: HospiceAideData): Promise<void> {
    // Click the add button on the Hospice Aide Tasks card
    // The add button is inside the card — look for the + fab button
    const addBtn = this.page.locator('[data-cy="card-header-hospiceAideTasks"]')
      .locator('xpath=ancestor::ion-card')
      .locator('button.addBtn, button[id*="add"], ion-fab-button');
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click({ force: true });
    } else {
      // Fallback — use the generic vital card modal pattern
      await this.page.locator('[data-cy="card-header-hospiceAideTasks"]').locator('..').locator('button').last().click({ force: true });
    }
    await this.page.waitForTimeout(2000);
    console.log('  Opened Add Task modal');

    // Category (required)
    await this.selectFirstIonOption(this.selectors.categorySelect);
    console.log('  Category: first option');

    // Task (required)
    await this.selectFirstIonOption(this.selectors.taskSelect);
    console.log('  Task: first option');

    // Level of Assistance (required) — click the ion-item containing the radio
    const assistance = data.assistance || 'self';
    const assistLabel = assistance.charAt(0).toUpperCase() + assistance.slice(1);
    const radioItem = this.page.locator(`ion-item`).filter({ hasText: new RegExp(`^\\s*${assistLabel}\\s*$`) }).first();
    await radioItem.scrollIntoViewIfNeeded();
    await radioItem.click();
    await this.page.waitForTimeout(500);
    console.log(`  Assistance: ${assistance}`);

    // Frequency (required) — clear existing value first, then type new value
    const numInput = this.page.locator(this.selectors.frequencyOccurrence);
    if (await numInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await numInput.click({ clickCount: 3 }); // triple-click to select all
      await this.page.keyboard.press('Backspace');
      await numInput.pressSequentially(data.frequencyOccurrence || '1', { delay: 50 });
    }
    const denInput = this.page.locator(this.selectors.frequencyDuration);
    if (await denInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await denInput.click({ clickCount: 3 });
      await this.page.keyboard.press('Backspace');
      await denInput.pressSequentially(data.frequencyDuration || '1', { delay: 50 });
    }
    await this.page.waitForTimeout(500);
    console.log(`  Frequency: ${data.frequencyOccurrence || '1'} time(s) per ${data.frequencyDuration || '1'}`);

    // Submit
    await this.page.locator(this.selectors.modalSubmit).click();
    await this.page.waitForTimeout(3000);
    console.log('  Task submitted');
  }

  /** Convenience: fill with defaults */
  async fillAllHospiceAide(): Promise<void> {
    await this.fillHospiceAide({});
    console.log('  Hospice Aide: defaults accepted');
  }
}
