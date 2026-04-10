import { Page } from '@playwright/test';

/**
 * Data interface for Skin module
 */
export interface SkinData {
  // ── Wound/Skin Conditions (multi-tab wizard) ──────────────────────
  /** Whether to add a wound entry */
  addWound?: boolean;
  /** Tab 1: Location Title (required) */
  locationTitle?: string;
  /** Tab 1: Wound Type (ion-select, required) */
  woundType?: string;
  /** Tab 1: Width in cm */
  width?: string;
  /** Tab 1: Length in cm */
  length?: string;
  /** Tab 1: Depth in cm */
  depth?: string;
  /** Tab 2: Pain score (0-10) */
  painScore?: number;
  /** Tab 3: Wound care treatment note */
  woundCareTreatment?: string;
  /** Wound status after save: healed/active */
  woundStatus?: string;

  // ── Skin and Ulcer/Injury Treatments ──────────────────────────────
  /** Treatment checkboxes: pressureReducingDeviceForChair, pressureReducingDeviceForBed,
   * turningRepositioningProgram, nutritionOrHydrationInterventionToManageSkinProblems,
   * pressureUlcerInjuryCare, surgicalWoundCare, applicationOfNonSurgicalDressings,
   * applicationOfOintmentsMedicationsOtherThanToFeet, applicationOfDressingsToFeet,
   * incontinenceManagement, noneOfTheAbove */
  injuryTreatments?: string[];
}

/**
 * Skin Module Page Object
 */
export class SkinModulePage {
  readonly page: Page;

  private readonly selectors = {
    declineToggle: '[data-cy="toggle-declineCard"]',

    // ── Wound Wizard Tab 1: Location ────────────────────────────────
    locationTitle: '#locationTitle input',
    locationType: '#locationType',
    woundType: '#woundType',
    widthInput: '#width',
    lengthInput: '#length',
    depthInput: '#depth',
    woundCanvas: 'new-wound-canvas canvas',

    // ── Wound Wizard Navigation ─────────────────────────────────────
    nextBtn: 'new-wound-site-tabs button:has-text("Next")',
    backBtn: 'new-wound-site-tabs button:has-text("Back")',
    saveBtn: 'new-wound-site-tabs button:has-text("Save")',

    // ── Wound Wizard Tab 2: Score ───────────────────────────────────
    scoringToolSelect: 'new-wound-score ion-select',
    scoreRange: '#numericToolRange',

    // ── Wound Wizard Tab 3: Notes ───────────────────────────────────
    woundNoteTextarea: 'new-wound-notes textarea',

    // ── Wound Status Alert ──────────────────────────────────────────
    statusAlertActive: 'button:has-text("active")',
    statusAlertHealed: 'button:has-text("healed")',

    // ── Skin and Ulcer/Injury Treatments ────────────────────────────
    treatmentCheckbox: (treatment: string) =>
      `[data-cy="checkbox-treatmentsCurrentlyInPlaceCheck-${treatment}"]`,
  };

  constructor(page: Page) {
    this.page = page;
  }

  private async clickElement(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      const selfDisabled = await el.getAttribute('aria-disabled').catch(() => null);
      if (selfDisabled === 'true') return;
      const btnDisabled = await el.locator('button[aria-disabled="true"]').count().catch(() => 0);
      if (btnDisabled > 0) return;
      await el.scrollIntoViewIfNeeded();
      await el.click({ force: true });
      await this.page.waitForTimeout(300);
    }
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

  async fillSkin(data: SkinData): Promise<void> {
    console.log('Filling Skin module...');

    if (data.addWound) {
      await this.addWoundEntry(data);
    }

    // Skin and Ulcer/Injury Treatments
    if (data.injuryTreatments) {
      for (const treatment of data.injuryTreatments) {
        await this.clickElement(this.selectors.treatmentCheckbox(treatment));
      }
      console.log(`  Injury Treatments: ${data.injuryTreatments.join(', ')}`);
    }

    console.log('Skin module filled');
  }

  async addWoundEntry(data: SkinData): Promise<void> {
    console.log('  Adding wound entry...');

    // ── Tab 1: Location of Wound ────────────────────────────────────
    // Location Title
    const titleInput = this.page.locator(this.selectors.locationTitle);
    await titleInput.waitFor({ state: 'visible', timeout: 5000 });
    await titleInput.fill(data.locationTitle || 'Wound Site 1');
    console.log(`    Location Title: ${data.locationTitle || 'Wound Site 1'}`);

    // Wound Type (required)
    await this.selectFirstIonOption(this.selectors.woundType);
    console.log('    Wound Type: first option');

    // Size measurements
    if (data.width) {
      await this.page.locator(this.selectors.widthInput).fill(data.width);
    }
    if (data.length) {
      await this.page.locator(this.selectors.lengthInput).fill(data.length);
    }
    if (data.depth) {
      await this.page.locator(this.selectors.depthInput).fill(data.depth);
    }
    console.log(`    Size: W=${data.width || '1'} L=${data.length || '1'} D=${data.depth || '1'}`);

    // Click on body canvas to place wound location
    const canvas = this.page.locator(this.selectors.woundCanvas);
    if (await canvas.isVisible({ timeout: 3000 }).catch(() => false)) {
      const box = await canvas.boundingBox();
      if (box) {
        await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 3);
        await this.page.waitForTimeout(1000);
        console.log('    Placed wound on body canvas');
      }
    }

    // Click Next → Tab 2
    await this.page.locator(this.selectors.nextBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('    → Next to Tab 2: Score');

    // ── Tab 2: Score ────────────────────────────────────────────────
    // Select scoring tool (ion-select in sidebar)
    const scoringSelect = this.page.locator('new-wound-sidebar[type="score"] ion-select');
    if (await scoringSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
      await scoringSelect.click();
      await this.page.waitForTimeout(1000);
      // Select Numeric from popover
      const numericOption = this.page.locator('ion-popover.select-popover ion-item').filter({ hasText: 'Numeric' });
      if (await numericOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await numericOption.click({ force: true });
      } else {
        await this.page.locator('ion-popover.select-popover ion-item').first().click({ force: true });
      }
      await this.page.waitForTimeout(1000);
      console.log('    Scoring Tool: Numeric');
    }

    // Set pain score on range (click the nth tick)
    if (data.painScore !== undefined) {
      const tick = this.page.locator(`${this.selectors.scoreRange} .range-tick`).nth(data.painScore);
      if (await tick.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tick.click({ force: true });
        await this.page.waitForTimeout(500);
        console.log(`    Pain Score: ${data.painScore}`);
      }
    }

    // Click Next → Tab 3
    await this.page.locator(this.selectors.nextBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('    → Next to Tab 3: Notes');

    // ── Tab 3: Notes ────────────────────────────────────────────────
    // Wound Care Treatment is the first textbox in the Notes tab (required)
    // Must type slowly to trigger Angular change detection
    const noteTextbox = this.page.locator('ion-tab[aria-hidden="false"] textarea').first();
    await noteTextbox.waitFor({ state: 'visible', timeout: 5000 });
    await noteTextbox.click();
    await noteTextbox.pressSequentially(data.woundCareTreatment || 'Wound care treatment applied', { delay: 50 });
    await this.page.waitForTimeout(500);
    console.log(`    Wound Care Treatment: ${data.woundCareTreatment || 'Wound care treatment applied'}`);

    // Click Next → Tab 4: Summary
    await this.page.locator(this.selectors.nextBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('    → Next to Tab 4: Summary');

    // ── Tab 4: Summary → Save (uses Next button on last tab) ──────
    const saveBtn = this.page.locator(this.selectors.saveBtn);
    if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await saveBtn.click();
    } else {
      await this.page.locator(this.selectors.nextBtn).click();
    }
    await this.page.waitForTimeout(2000);
    console.log('    Saved wound entry');

    // Handle wound status alert
    const status = data.woundStatus || 'active';
    const statusBtn = this.page.locator(
      status === 'healed' ? this.selectors.statusAlertHealed : this.selectors.statusAlertActive
    );
    await statusBtn.waitFor({ state: 'visible', timeout: 5000 });
    await statusBtn.click();
    await this.page.waitForTimeout(2000);
    console.log(`    Wound Status: ${status}`);

    console.log('  Wound entry added');
  }

  // ══════════════════════════════════════════════════════════════════════
  // Validation
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Verify the wound entry appears in Wound Site History.
   */
  async verifyWoundHistory(data: {
    locationTitle?: string;
    status?: string;
    dimensions?: string;
  }): Promise<boolean> {
    const historyCard = this.page.locator('wound-history-card');
    if (!await historyCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('  Wound Site History card not visible');
      return false;
    }

    const cardText = await historyCard.textContent() || '';
    let passed = true;

    if (data.locationTitle) {
      const hasLocation = cardText.includes(data.locationTitle);
      console.log(`  Verify Location "${data.locationTitle}": ${hasLocation ? 'PASS' : 'FAIL'}`);
      if (!hasLocation) passed = false;
    }

    if (data.status) {
      const hasStatus = cardText.toLowerCase().includes(data.status.toLowerCase());
      console.log(`  Verify Status "${data.status}": ${hasStatus ? 'PASS' : 'FAIL'}`);
      if (!hasStatus) passed = false;
    }

    if (data.dimensions) {
      const hasDimensions = cardText.includes(data.dimensions);
      console.log(`  Verify Dimensions "${data.dimensions}": ${hasDimensions ? 'PASS' : 'FAIL'}`);
      if (!hasDimensions) passed = false;
    }

    return passed;
  }

  /** Convenience: fill with defaults (no wound, just defaults) */
  async fillAllSkin(): Promise<void> {
    await this.fillSkin({});
    console.log('  Skin: defaults accepted');
  }
}
