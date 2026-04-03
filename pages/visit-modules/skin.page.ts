import { Page } from '@playwright/test';

/**
 * Skin Module Page Object
 *
 * Primarily uses decline toggle. When not declined, has wound assessment fields.
 */
export class SkinModulePage {
  readonly page: Page;

  private readonly selectors = {
    declineToggle: '[data-cy="toggle-declineCard"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async fillAllSkin(): Promise<void> {
    console.log('Filling Skin module...');
    // Default state is acceptable — no wounds
    console.log('  Skin: defaults accepted');
    console.log('Skin module filled');
  }
}
