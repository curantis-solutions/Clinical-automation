import { Page } from '@playwright/test';

/**
 * Summary Module Page Object
 *
 * Contains a Coordination of Care section with an add button.
 * Card: Coordination of Care (button-coordinationOfCare-add)
 */
export class SummaryModulePage {
  readonly page: Page;

  private readonly selectors = {
    coordinationOfCareLabel: '[data-cy="label-coordinationOfCare"]',
    coordinationOfCareAddBtn: '[data-cy="button-coordinationOfCare-add"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async isCoordinationOfCareVisible(): Promise<boolean> {
    return this.page.locator(this.selectors.coordinationOfCareLabel)
      .isVisible({ timeout: 5000 }).catch(() => false);
  }

  async clickAddCoordinationOfCare(): Promise<void> {
    await this.page.locator(this.selectors.coordinationOfCareAddBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Add Coordination of Care');
  }
}
