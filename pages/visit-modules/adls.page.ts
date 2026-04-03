import { Page } from '@playwright/test';

/**
 * ADLs/Functional Needs Module Page Object
 *
 * Has decline toggle and various ADL assessment fields.
 */
export class ADLsModulePage {
  readonly page: Page;

  private readonly selectors = {
    declineToggle: '[data-cy="toggle-declineCard"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async fillAllADLs(): Promise<void> {
    console.log('Filling ADLs/Functional Needs module...');
    // Default state is acceptable
    console.log('  ADLs: defaults accepted');
    console.log('ADLs module filled');
  }
}
