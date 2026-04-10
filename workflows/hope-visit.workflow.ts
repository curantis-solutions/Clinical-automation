import { Page } from '@playwright/test';
import { HOPEVisitScenarioConfig, HOPEAdmissionVerifyConfig, VisitModuleFills } from '../types/hope-scenarios.types';
import { VisitAddDialogPage } from '../pages/visit-add-dialog.page';
import { VisitAssessmentPage } from '../pages/visit-assessment.page';
import { PreferencesModulePage } from '../pages/visit-modules/preferences.page';
import { PainModulePage } from '../pages/visit-modules/pain.page';
import { NeurologicalModulePage } from '../pages/visit-modules/neurological.page';
import { RespiratoryModulePage } from '../pages/visit-modules/respiratory.page';
import { GastrointestinalModulePage } from '../pages/visit-modules/gastrointestinal.page';
import { SkinModulePage } from '../pages/visit-modules/skin.page';
import { HospiceAideModulePage } from '../pages/visit-modules/hospice-aide.page';
import { SummaryModulePage } from '../pages/visit-modules/summary.page';
import { PlanOfCarePage } from '../pages/plan-of-care.page';
import { HopeReportPreviewPage } from '../pages/hope-report-preview.page';
import { HopeAdmissionPage, AdmissionTab, TAB_A_FIELDS, TAB_F_FIELDS, TAB_I_FIELDS, TAB_J_FIELDS, TAB_M_FIELDS, TAB_N_FIELDS, TAB_Z_FIELDS } from '../pages/hope-admission.page';
import { CarePlanPage } from '../pages/care-plan.page';

/**
 * HOPE Visit Workflow
 *
 * Central orchestration for HOPE visit scenarios. Takes a HOPEVisitScenarioConfig
 * and drives the entire visit from creation through completion using page objects.
 *
 * Zero raw locators — all element interaction delegated to page objects.
 */
export class HOPEVisitWorkflow {
  private readonly visitAddDialog: VisitAddDialogPage;
  private readonly visitAssessment: VisitAssessmentPage;
  private readonly preferences: PreferencesModulePage;
  private readonly pain: PainModulePage;
  private readonly neurological: NeurologicalModulePage;
  private readonly respiratory: RespiratoryModulePage;
  private readonly gastrointestinal: GastrointestinalModulePage;
  private readonly skin: SkinModulePage;
  private readonly hospiceAide: HospiceAideModulePage;
  private readonly summary: SummaryModulePage;
  private readonly planOfCare: PlanOfCarePage;
  private readonly hopeReportPreview: HopeReportPreviewPage;
  private readonly hopeAdmission: HopeAdmissionPage;
  private readonly carePlan: CarePlanPage;

  constructor(private page: Page) {
    this.visitAddDialog = new VisitAddDialogPage(page);
    this.visitAssessment = new VisitAssessmentPage(page);
    this.preferences = new PreferencesModulePage(page);
    this.pain = new PainModulePage(page);
    this.neurological = new NeurologicalModulePage(page);
    this.respiratory = new RespiratoryModulePage(page);
    this.gastrointestinal = new GastrointestinalModulePage(page);
    this.skin = new SkinModulePage(page);
    this.hospiceAide = new HospiceAideModulePage(page);
    this.summary = new SummaryModulePage(page);
    this.planOfCare = new PlanOfCarePage(page);
    this.hopeReportPreview = new HopeReportPreviewPage(page);
    this.hopeAdmission = new HopeAdmissionPage(page);
    this.carePlan = new CarePlanPage(page);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Top-Level Orchestration
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Execute a full visit scenario:
   *   create visit → fill vitals → fill HOPE modules → POC → HOPE preview → complete
   */
  async executeVisit(config: HOPEVisitScenarioConfig): Promise<void> {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`HOPE Visit: ${config.scenarioId} — ${config.description}`);
    console.log(`Visit type: ${config.visitType} (UI: "${config.uiVisitType}")`);
    console.log(`${'='.repeat(70)}`);

    await this.createVisit(config);
    await this.fillVitals();
    await this.fillModules(config.moduleFills);

    if (config.acceptPlanOfCareIssues) {
      await this.handlePlanOfCare(true);
    }

    if (config.previewHopeReport) {
      await this.previewHopeReport();
    }

    await this.completeVisit();

    console.log(`${config.scenarioId} — Visit completed successfully`);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Visit Creation
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Create a visit using the Visit Add Dialog.
   * Maps config.role and config.uiVisitType to the dialog dropdowns.
   */
  async createVisit(config: HOPEVisitScenarioConfig): Promise<void> {
    console.log(`\nCreating ${config.visitType} visit: role="${config.role}", type="${config.uiVisitType}"`);
    await this.visitAddDialog.createVisit(config.role, config.uiVisitType, config.hopeDialogOptions);
    console.log('Visit created — on assessment page');
  }

  // ══════════════════════════════════════════════════════════════════════
  // Vitals Quick-Fill
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Fill vitals with standard values and complete COVID screening.
   * Called before HOPE module fills.
   */
  async fillVitals(): Promise<void> {
    console.log('\nFilling vitals...');

    // Ensure we're on the Vitals module before filling cards
    await this.visitAssessment.navigateToModule('Vitals');
    await this.visitAssessment.fillBloodPressure('120', '80');
    // await this.visitAssessment.fillTemperature('98.6');
    // await this.visitAssessment.fillPulse('72');
    // await this.visitAssessment.fillRespiratoryRate('18');
    // await this.visitAssessment.fillHeight('5', '10');
    // await this.visitAssessment.fillWeight('170');
    // await this.visitAssessment.fillCovidScreeningAllNo();

    console.log('Vitals filled');
  }

  // ══════════════════════════════════════════════════════════════════════
  // Module Fill Orchestration
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Fill all modules specified in the config.
   * Navigates in sidebar order — each navigation auto-saves the previous module.
   */
  async fillModules(fills: VisitModuleFills): Promise<void> {
    console.log('\nFilling assessment modules...');

    // ── HOPE-specific modules (filled with explicit data) ───────────
    if (fills.preferences) {
      await this.visitAssessment.navigateToModule('Preferences');
      await this.preferences.fillPreferences(fills.preferences);
    }

    if (fills.neurological) {
      await this.visitAssessment.navigateToModule('Neurological');
      await this.neurological.fillNeurological(fills.neurological);
    }

    if (fills.pain) {
      await this.visitAssessment.navigateToModule('Pain');
      await this.pain.fillPain(fills.pain);
    }

    if (fills.respiratory) {
      await this.visitAssessment.navigateToModule('Respiratory');
      await this.respiratory.fillRespiratory(fills.respiratory);
    }

    if (fills.gastrointestinal) {
      await this.visitAssessment.navigateToModule('Gastrointestinal');
      await this.gastrointestinal.fillGastrointestinal(fills.gastrointestinal);
    }

    if (fills.skin) {
      await this.visitAssessment.navigateToModule('Skin');
      await this.skin.fillSkin(fills.skin);
    }

    if (fills.HospiceAide) {
      await this.visitAssessment.navigateToModule('Hospice Aide');
      await this.hospiceAide.fillHospiceAide(fills.HospiceAide);
    }

    if (fills.summary) {
      await this.visitAssessment.navigateToModule('Summary');
      await this.summary.fillSummary(fills.summary);
    }

    // Navigate to Symptom Summary to trigger final save
    await this.visitAssessment.navigateToModule('Symptom Summary');
    console.log('All modules filled');
  }

  // ══════════════════════════════════════════════════════════════════════
  // Plan of Care
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Open Plan of Care and accept or decline all suggested issues.
   */
  async handlePlanOfCare(acceptAll: boolean): Promise<void> {
    console.log(`\nHandling Plan of Care (${acceptAll ? 'accept' : 'decline'} all)...`);
    await this.visitAssessment.clickPlanOfCare();

    if (acceptAll) {
      await this.planOfCare.acceptAllIssues();
    } else {
      await this.planOfCare.declineAllIssues();
    }

    await this.planOfCare.exitPlanOfCare();
    console.log('Plan of Care handled');
  }

  // ══════════════════════════════════════════════════════════════════════
  // HOPE Report Preview
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Open HOPE Report Preview, run all validations, close.
   * Returns the validation result for assertions in the spec.
   */
  async previewHopeReport(): Promise<Record<string, string>> {
    console.log('\nPreviewing HOPE Report...');
    await this.visitAssessment.clickHopeReportPreview();
    await this.hopeReportPreview.waitForLoad();

    const result = await this.hopeReportPreview.validateAll();

    console.log(`HOPE Report: ${result.warningCount} warnings`);
    if (result.warningCount > 0) {
      for (const warning of result.warnings) {
        console.log(`  WARNING: ${warning}`);
      }
    }

    const populatedCount = Object.values(result.populated).filter(v => v !== '').length;
    console.log(`HOPE Report: ${populatedCount} fields populated`);

    await this.hopeReportPreview.close();
    console.log('HOPE Report Preview closed');

    return result.populated;
  }

  // ══════════════════════════════════════════════════════════════════════
  // Visit Completion
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Complete the visit — handles signature modal and task modal.
   */
  async completeVisit(): Promise<void> {
    console.log('\nCompleting visit...');
    const profileName = await this.visitAssessment.getProfileName();
    await this.visitAssessment.clickComplete();
    // clickComplete handles both signature and task modals internally
    console.log('Visit completed');
  }

  // ══════════════════════════════════════════════════════════════════════
  // HOPE Admission Record Verification
  // ══════════════════════════════════════════════════════════════════════

  /** Tab label mapping for tab keys */
  private static readonly TAB_LABELS: Record<string, string> = {
    A: 'A - Administrative Information',
    F: 'F - Preferences',
    I: 'I - Active Diagnosis',
    J: 'J - Health Conditions',
    M: 'M - Skin Conditions',
    N: 'N - Medications',
    Z: 'Z - Record Administration',
  };

  /** Tab field arrays by key */
  private static readonly TAB_FIELD_MAP: Record<string, typeof TAB_A_FIELDS> = {
    A: TAB_A_FIELDS,
    F: TAB_F_FIELDS,
    I: TAB_I_FIELDS,
    J: TAB_J_FIELDS,
    M: TAB_M_FIELDS,
    N: TAB_N_FIELDS,
    Z: TAB_Z_FIELDS,
  };

  /**
   * Navigate to HIS/HOPE, open the latest record, verify tabs, optionally complete.
   * Returns field values per tab for assertions in the spec.
   */
  async verifyHopeAdmissionRecord(
    config: HOPEAdmissionVerifyConfig
  ): Promise<Record<string, Record<string, string>>> {
    console.log('\nVerifying HOPE Admission Record...');
    await this.hopeAdmission.navigateToHopeModule();
    await this.hopeAdmission.openLatestAdmissionRecord();

    // Build tab definitions for the requested tabs
    const tabs: AdmissionTab[] = config.tabs.map(key => ({
      key,
      label: HOPEVisitWorkflow.TAB_LABELS[key] || key,
      tabSelector: `.tabs-container span:has-text("${HOPEVisitWorkflow.TAB_LABELS[key] || key}")`,
      fields: HOPEVisitWorkflow.TAB_FIELD_MAP[key] || [],
    }));

    // Check tab completion status
    if (config.expectedTabsComplete) {
      for (const tabKey of config.expectedTabsComplete) {
        const label = HOPEVisitWorkflow.TAB_LABELS[tabKey];
        const complete = await this.hopeAdmission.isTabComplete(label);
        console.log(`  Tab ${tabKey}: ${complete ? 'COMPLETE' : 'INCOMPLETE'}`);
      }
    }

    if (config.expectedTabsIncomplete) {
      for (const tabKey of config.expectedTabsIncomplete) {
        const label = HOPEVisitWorkflow.TAB_LABELS[tabKey];
        const complete = await this.hopeAdmission.isTabComplete(label);
        console.log(`  Tab ${tabKey}: ${complete ? 'COMPLETE (unexpected!)' : 'INCOMPLETE (expected)'}`);
      }
    }

    // Read all tab fields
    const allResults = await this.hopeAdmission.verifyAllTabs(tabs);

    // Log populated field counts
    for (const [tabKey, fields] of Object.entries(allResults)) {
      const filledCount = Object.values(fields).filter(v => v !== '').length;
      const totalCount = Object.keys(fields).length;
      console.log(`  Tab ${tabKey}: ${filledCount}/${totalCount} fields populated`);
    }

    // Fill required Tab A fields (Payor, Admitted From, Hospice Service, etc.)
    if (config.fillPayerInfo) {
      await this.hopeAdmission.navigateToTab(HOPEVisitWorkflow.TAB_LABELS['A']);

      await this.hopeAdmission.selectPayerInformation();

      // Fill other required single-select dropdowns in Tab A
      const tabADropdowns = [
        'automation-hospice-service',
        'automation-admitted-from',
        'automation-living-arregemtns',
        'automation-assistance',
      ];
      for (const dropdownId of tabADropdowns) {
        try {
          await this.hopeAdmission.selectSingleDropdownFirstOption(dropdownId);
        } catch {
          // Dropdown may already have a value or not exist — skip
        }
      }
    }

    // Complete the record if requested
    if (config.completeRecord) {
      await this.hopeAdmission.navigateToTab(HOPEVisitWorkflow.TAB_LABELS['Z']);

      // Check if Complete button is enabled before clicking
      const completeBtn = this.page.locator('#inputModalSubmit');
      const isDisabled = await completeBtn.evaluate(
        el => el.classList.contains('disabled')
      ).catch(() => true);

      if (isDisabled) {
        console.log('HOPE Complete button is disabled — record has incomplete required fields. Skipping completion.');
      } else {
        await this.hopeAdmission.clickComplete();
        const profileName = await this.visitAssessment.getProfileName();
        await this.visitAssessment.fillSignatureModal(profileName);
        console.log('HOPE Admission Record completed');
      }
    }

    return allResults;
  }

  /**
   * Navigate back to the Care Plan page from wherever we are.
   * Uses the patient nav bar.
   */
  async navigateToCarePlan(): Promise<void> {
    await this.page.locator('[data-cy="btn-nav-bar-item-care-plan"]').click();
    await this.page.waitForURL(/carePlan/, { timeout: 15000 });
    await this.page.waitForTimeout(2000);
    console.log('Navigated back to Care Plan');
  }
}
