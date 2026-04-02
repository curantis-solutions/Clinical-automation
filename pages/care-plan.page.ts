import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Care Plan Page Object
 * Handles the Care Plan module including:
 * - Navigation to Care Plan
 * - Visits section (grid, filters, add visit)
 * - Encounters/Flowsheet section
 * - IDG Meetings section
 * - Visit Frequency section
 * - Medication Administration Records (MAR) section
 *
 * Navigation: Patient Details → left sidebar "Careplan" button
 * URL pattern: /#/patient/{patientId}/carePlan/visits
 */
export class CarePlanPage extends BasePage {
  private readonly selectors = {
    // ============================================
    // Navigation
    // ============================================
    carePlanNavBtn: '[data-cy="btn-nav-bar-item-care-plan"]',
    planOfCareBtn: '.planOfCareBtn',
    orderEntryBtn: '[data-cy="btn-open-order-entry-page"]',
    exitPlanOfCareBtn: 'button:has-text("Exit Plan of Care")',

    // ============================================
    // Page Title / Breadcrumb
    // ============================================
    mainTitle: '[data-cy="label-navbar-main-title"]',
    sectionTitle: '[data-cy="label-navbar-section-title"]',

    // ============================================
    // Visits Section
    // ============================================
    visitsCard: 'ion-card:has(ion-card-header:has-text("Visit(s)"))',
    addVisitBtn: '[data-cy="btn-add-visit"], button[id="addVisit"]',

    // Visit Filters
    filterDiscipline: '[data-cy="filter-discipline"]',
    filterType: '[data-cy="filter-type"]',
    filterPerformedBy: '[data-cy="filter-performed-by"]',
    filterStartDateFrom: '[data-cy="filter-start-date-from"] input[id="date-value"]',
    filterStartDateTo: '[data-cy="filter-start-date-to"] input[id="date-value"]',
    clearFiltersBtn: '[data-cy="btn-clear-filters"]',

    // Visits Grid columns
    visitGridHeader: 'ion-col:has-text("ID")',
    visitRows: '.visit-row, ion-row.data-row',
    noVisitsMessage: 'text=No visits found matching the selected filters',

    // ============================================
    // Encounters/Flowsheet Section
    // ============================================
    encountersCard: 'ion-card:has(ion-card-header:has-text("Encounters/Flowsheet"))',
    addEncounterBtn: 'button[id="addEncounter"]',
    encountersFromDate: 'cur-date-picker[id="encountersFromDate"] input[id="date-value"]',
    encountersToDate: 'cur-date-picker[id="encountersToDate"] input[id="date-value"]',
    encounterResetBtn: 'button[id="encounterClearButton"]',
    encounterFilterBtn: 'button[id="encounterFilterButton"]',
    encounterPrintBtn: 'button[id="encounterPrintReportButton"]',

    // Encounters Grid columns
    encounterStartDateTime: '[aria-label="Start Date Time"]',
    encounterEndDateTime: '[aria-label="End Date Time"]',
    encounterAddedBy: '[aria-label="Added By"]',
    encounterType: '[aria-label="Type"]',
    encounterSubject: '[aria-label="Subject"]',

    // ============================================
    // IDG Meetings Section
    // ============================================
    idgMeetingsSection: 'text=IDG Meetings',
    noIdgMessage: 'text=No closed IDG Meetings Currently Exist',

    // ============================================
    // Visit Frequency Section
    // ============================================
    visitFrequencyCard: 'ion-card[id="visitFrequency"]',
    visitFrequencySegment: 'ion-segment[id="visitFrequencySeg"]',
    activeOrdersTab: 'ion-segment-button:has-text("Active Orders")',
    declineOrdersTab: 'ion-segment-button:has-text("Declined Orders")',
    noVFRecords: 'text=No records available',

    // ============================================
    // PRN Count
    // ============================================
    prnCountDropdown: 'button:has-text("PRN Count")',
    comprehensiveVisits: 'ion-col[id="comprehensivive-visits"]',
    comprehensiveCount: 'ion-col[id="comprehensivecount"]',
    medicalVisits: 'ion-col[id="medical"]',
    medicalCount: 'ion-col[id="medicalcount"]',
    nonMedicalVisits: 'ion-col[id="non-medical"]',
    nonMedicalCount: 'ion-col[id="nonmedicalcount"]',

    // ============================================
    // Medication Administration Records (MAR)
    // ============================================
    marCard: 'ion-card.care-plan-mar',
    marHeader: 'ion-card.care-plan-mar ion-card-header',
    marEllipsis: 'ion-card.care-plan-mar ion-icon[name="md-more"]',
    marDatePicker: 'mar-card cur-date-picker input[id="date-value"]',
    marFilterLabel: '.mar-date-label',

    // MAR Legend
    marLegendNotAdministered: '.legend-icon-square.not-administered',
    marLegendCompleted: '.legend-icon-square.completed',
    marLegendScheduled: '.legend-icon-time',
    marLegendLateMissed: '.legend-icon-dash',

    // MAR Tabs
    marMedicationsTab: '.tab-name:has-text("Medications")',
    marMedicationsBadge: 'ion-card.care-plan-mar ion-badge.count',

    // MAR Grid
    marGridTable: 'ion-card.care-plan-mar .mar-grid-table',
    marMedName: 'ion-card.care-plan-mar .med-name',
    marMedParams: 'ion-card.care-plan-mar .med-params',
    marGridCell: 'ion-card.care-plan-mar .cell',
    marEmptyCell: 'ion-card.care-plan-mar .cell.empty',
    marLateMissedCell: 'ion-card.care-plan-mar .cell.late-missed-slot',
    marTimeSlot: 'ion-card.care-plan-mar .sub-slot-2 .no-padding',
  };

  constructor(page: Page) {
    super(page);
  }

  // ============================================
  // Navigation
  // ============================================

  async navigateToCarePlan(): Promise<void> {
    // Check if already on Care Plan page (e.g. after exitOrderEntry)
    const carePlanNav = this.page.locator(this.selectors.carePlanNavBtn);
    if (await carePlanNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await carePlanNav.click();
      await this.page.waitForTimeout(3000);
    } else {
      // Already on Care Plan — just wait for content to load
      await this.page.waitForTimeout(2000);
    }
    console.log('Navigated to Care Plan');
  }

  async clickPlanOfCare(): Promise<void> {
    await this.page.locator(this.selectors.planOfCareBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Clicked Plan of Care');
  }

  async clickOrderEntry(): Promise<void> {
    await this.page.locator(this.selectors.orderEntryBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('Clicked Order Entry from Care Plan');
  }

  async exitPlanOfCare(): Promise<void> {
    const exitBtn = this.page.locator(this.selectors.exitPlanOfCareBtn);
    if (await exitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await exitBtn.click();
      await this.page.waitForTimeout(2000);
      console.log('Exited Plan of Care');
    }
  }

  // ============================================
  // Visits
  // ============================================

  async clickAddVisit(): Promise<void> {
    await this.page.locator(this.selectors.addVisitBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Add Visit');
  }

  async clearVisitFilters(): Promise<void> {
    await this.page.locator(this.selectors.clearFiltersBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('Cleared visit filters');
  }

  // ============================================
  // Encounters/Flowsheet
  // ============================================

  async clickAddEncounter(): Promise<void> {
    await this.page.locator(this.selectors.addEncounterBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Add Encounter');
  }

  async filterEncounters(fromDate?: string, toDate?: string): Promise<void> {
    if (fromDate) {
      await this.page.locator(this.selectors.encountersFromDate).fill(fromDate);
    }
    if (toDate) {
      await this.page.locator(this.selectors.encountersToDate).fill(toDate);
    }
    await this.page.locator(this.selectors.encounterFilterBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Filtered encounters');
  }

  async resetEncounterFilters(): Promise<void> {
    await this.page.locator(this.selectors.encounterResetBtn).click();
    await this.page.waitForTimeout(1000);
    console.log('Reset encounter filters');
  }

  async printEncounters(): Promise<void> {
    await this.page.locator(this.selectors.encounterPrintBtn).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Print encounters');
  }

  // ============================================
  // Visit Frequency
  // ============================================

  async getVisitFrequencyCount(): Promise<{ comprehensive: string; medical: string; nonMedical: string }> {
    const comprehensive = await this.page.locator(this.selectors.comprehensiveCount).textContent() || '0';
    const medical = await this.page.locator(this.selectors.medicalCount).textContent() || '0';
    const nonMedical = await this.page.locator(this.selectors.nonMedicalCount).textContent() || '0';
    return {
      comprehensive: comprehensive.trim(),
      medical: medical.trim(),
      nonMedical: nonMedical.trim(),
    };
  }

  async isVisitFrequencyCardVisible(): Promise<boolean> {
    return await this.page.locator(this.selectors.visitFrequencyCard).isVisible({ timeout: 5000 }).catch(() => false);
  }

  async clickActiveOrdersTab(): Promise<void> {
    await this.page.locator(this.selectors.activeOrdersTab).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Active Orders tab');
  }

  async clickDeclinedOrdersTab(): Promise<void> {
    await this.page.locator(this.selectors.declineOrdersTab).click();
    await this.page.waitForTimeout(2000);
    console.log('Clicked Declined Orders tab');
  }

  /**
   * Get all visit frequency rows from the active/declined tab.
   * Each row contains discipline, description, etc.
   */
  async getVisitFrequencyRows(): Promise<string[]> {
    const vfCard = this.page.locator(this.selectors.visitFrequencyCard);
    const rows = vfCard.locator('ion-row.data-row, ion-row[class*="vf-row"], ion-row[class*="order-row"]');
    const count = await rows.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      texts.push(text?.trim() || '');
    }
    return texts;
  }

  /**
   * Get the count of visit frequency rows visible in the current tab
   */
  async getVisitFrequencyRowCount(): Promise<number> {
    const vfCard = this.page.locator(this.selectors.visitFrequencyCard);
    // Count rows that have actual order data (not header rows)
    const rows = vfCard.locator('ion-row.data-row, ion-row[class*="vf-row"], ion-row[class*="order-row"]');
    return await rows.count();
  }

  /**
   * Check if a discipline name appears in the Visit Frequency section
   */
  async verifyDisciplineInVisitFrequency(discipline: string): Promise<boolean> {
    // Try id-based card selector first
    const vfCard = this.page.locator(this.selectors.visitFrequencyCard);
    if (await vfCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      const match = vfCard.getByText(discipline, { exact: false });
      if (await match.first().isVisible({ timeout: 5000 }).catch(() => false)) return true;
    }
    // Fallback: page-wide search — the discipline text should be visible on the Care Plan page
    const pageMatch = this.page.getByText(discipline, { exact: true });
    return await pageMatch.first().isVisible({ timeout: 5000 }).catch(() => false);
  }

  /**
   * Check if "No records available" message is shown in Visit Frequency
   */
  async isVisitFrequencyEmpty(): Promise<boolean> {
    const vfCard = this.page.locator(this.selectors.visitFrequencyCard);
    return await vfCard.locator('text=No records available').isVisible({ timeout: 3000 }).catch(() => false);
  }

  /**
   * Get the full text content of the Visit Frequency card for assertions
   */
  async getVisitFrequencyCardText(): Promise<string> {
    const vfCard = this.page.locator(this.selectors.visitFrequencyCard);
    return (await vfCard.textContent()) || '';
  }

  // ============================================
  // MAR (Medication Administration Records)
  // ============================================

  async isMarCardVisible(): Promise<boolean> {
    return await this.page.locator(this.selectors.marCard).isVisible({ timeout: 5000 }).catch(() => false);
  }

  async getMarMedicationCount(): Promise<number> {
    const badge = this.page.locator(this.selectors.marMedicationsBadge);
    if (await badge.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = await badge.textContent();
      return Number(text?.trim()) || 0;
    }
    return 0;
  }

  async getMarMedicationNames(): Promise<string[]> {
    const names: string[] = [];
    const elements = this.page.locator(this.selectors.marMedName);
    const count = await elements.count();
    for (let i = 0; i < count; i++) {
      const text = await elements.nth(i).textContent();
      names.push(text?.trim() || '');
    }
    return names;
  }

  async getMarMedicationParams(): Promise<string[]> {
    const params: string[] = [];
    const elements = this.page.locator(this.selectors.marMedParams);
    const count = await elements.count();
    for (let i = 0; i < count; i++) {
      const text = await elements.nth(i).textContent();
      params.push(text?.trim() || '');
    }
    return params;
  }

  async getMarGridTableCount(): Promise<number> {
    return await this.page.locator(this.selectors.marGridTable).count();
  }

  /**
   * Verify that a specific medication appears in the MAR grid
   */
  async verifyMedicationInMarGrid(medicationName: string): Promise<boolean> {
    const names = await this.getMarMedicationNames();
    return names.some(name => name.toLowerCase().includes(medicationName.toLowerCase()));
  }

  /**
   * Get all time slots displayed in the MAR grid
   */
  async getMarTimeSlots(): Promise<string[]> {
    const slots: string[] = [];
    const elements = this.page.locator(this.selectors.marTimeSlot);
    const count = await elements.count();
    for (let i = 0; i < count; i++) {
      const text = await elements.nth(i).textContent();
      if (text?.trim().match(/^\d{4}$/)) {
        slots.push(text.trim());
      }
    }
    return Array.from(new Set(slots)); // unique
  }

  async clickMarEllipsis(): Promise<void> {
    await this.page.locator(this.selectors.marEllipsis).click();
    await this.page.waitForTimeout(1000);
    console.log('Clicked MAR ellipsis menu');
  }

  /**
   * Set the MAR date filter
   */
  async setMarDateFilter(date: string): Promise<void> {
    const datePicker = this.page.locator(this.selectors.marDatePicker);
    await datePicker.clear();
    await datePicker.fill(date);
    await datePicker.press('Enter');
    await this.page.waitForTimeout(2000);
    console.log(`Set MAR date filter: ${date}`);
  }
}
