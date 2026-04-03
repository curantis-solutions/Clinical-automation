import { Page } from '@playwright/test';

/**
 * Precautions, Safety & Teachings Module Page Object
 *
 * Has decline toggle and safety/teaching assessment fields.
 */
export class PrecautionsModulePage {
  readonly page: Page;

  private readonly selectors = {
    declineToggle: '[data-cy="toggle-declineCard"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async fillAllPrecautions(): Promise<void> {
    console.log('Filling Precautions, Safety & Teachings module...');
    // Default state is acceptable
    console.log('  Precautions: defaults accepted');
    console.log('Precautions module filled');
  }
}
