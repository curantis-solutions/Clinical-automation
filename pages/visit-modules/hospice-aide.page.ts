import { Page } from '@playwright/test';

/**
 * Hospice Aide Module Page Object
 *
 * Minimal fields — aide-specific assessment.
 */
export class HospiceAideModulePage {
  readonly page: Page;

  private readonly selectors = {};

  constructor(page: Page) {
    this.page = page;
  }

  async fillAllHospiceAide(): Promise<void> {
    console.log('Filling Hospice Aide module...');
    console.log('  Hospice Aide: defaults accepted');
    console.log('Hospice Aide module filled');
  }
}
