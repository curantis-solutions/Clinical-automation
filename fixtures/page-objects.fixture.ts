/**
 * Page Objects fixture for Playwright tests
 * Provides pre-instantiated page objects for use in tests
 *
 * Usage:
 *   import { test, expect } from '@fixtures/page-objects.fixture';
 *
 *   test('My test', async ({ loginAsRN, pages }) => {
 *     // pages.patient, pages.dashboard, etc. are ready to use
 *     await pages.dashboard.navigateToModule('Patient');
 *     await pages.patient.searchPatient('12345');
 *   });
 *
 * This fixture extends auth.fixture.ts, so all auth fixtures are available.
 */
import { test as authTest } from './auth.fixture';
import { Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { PatientPagenew } from '../pages/patient.pagenew';
import { PatientDetailsPage } from '../pages/patient-details.page';
import { CertificationPage } from '../pages/certification.page';
import { LOCPage } from '../pages/loc.page';
import { PatientWorkflow } from '../workflows/patient-profile';
import { BenefitsWorkflow } from '../workflows/benefits.workflow';
import { ConsentsWorkflow } from '../workflows/consents.workflow';
import { CertificationWorkflow } from '../workflows/certification.workflow';
import { CareTeamWorkflow } from '../workflows/care-team.workflow';
import { LOCWorkflow } from '../workflows/loc.workflow';
import { DiagnosisPage } from '../pages/diagnosis.page';
import { DiagnosisWorkflow } from '../workflows/diagnosis.workflow';
import { AdmitPatientWorkflow } from '../workflows/admit-patient.workflow';
import { OrderEntryPage } from '../pages/order-entry.page';
import { ProviderPanelPage } from '../pages/provider-panel.page';
import { CarePlanPage } from '../pages/care-plan.page';
import { ClaimsPage } from '../pages/billing/claims.page';
import { BatchManagementPage } from '../pages/billing/batch-management.page';
import { AccountsReceivablePage } from '../pages/billing/accounts-receivable.page';
import { BillingWorkflow } from '../workflows/billing.workflow';
import { FacilitiesPage } from '../pages/facilities.page';
import { FacilitiesWorkflow } from '../workflows/facilities.workflow';
import { VisitAddDialogPage } from '../pages/visit-add-dialog.page';
import { VisitAssessmentPage } from '../pages/visit-assessment.page';
import { PreferencesModulePage } from '../pages/visit-modules/preferences.page';
import { PainModulePage } from '../pages/visit-modules/pain.page';
import { NeurologicalModulePage } from '../pages/visit-modules/neurological.page';
import { RespiratoryModulePage } from '../pages/visit-modules/respiratory.page';
import { CardiovascularModulePage } from '../pages/visit-modules/cardiovascular.page';
import { GastrointestinalModulePage } from '../pages/visit-modules/gastrointestinal.page';
import { GenitourinaryModulePage } from '../pages/visit-modules/genitourinary.page';
import { NutritionalMetabolicModulePage } from '../pages/visit-modules/nutritional-metabolic.page';
import { SkinModulePage } from '../pages/visit-modules/skin.page';
import { MusculoskeletalModulePage } from '../pages/visit-modules/musculoskeletal.page';
import { ADLsModulePage } from '../pages/visit-modules/adls.page';
import { PrecautionsModulePage } from '../pages/visit-modules/precautions.page';
import { HospiceAideModulePage } from '../pages/visit-modules/hospice-aide.page';
import { MilitaryHistoryModulePage } from '../pages/visit-modules/military-history.page';
import { SummaryModulePage } from '../pages/visit-modules/summary.page';
import { SymptomSummaryModulePage } from '../pages/visit-modules/symptom-summary.page';
import { PlanOfCarePage } from '../pages/plan-of-care.page';
import { HopeReportPreviewPage } from '../pages/hope-report-preview.page';
import { HopeAdmissionPage } from '../pages/hope-admission.page';

/**
 * Collection of all page objects
 */
export interface PageObjects {
  login: LoginPage;
  dashboard: DashboardPage;
  patient: PatientPagenew;
  patientDetails: PatientDetailsPage;
  patientWorkflow: PatientWorkflow;
  benefitsWorkflow: BenefitsWorkflow;
  consentsWorkflow: ConsentsWorkflow;
  certification: CertificationPage;
  certificationWorkflow: CertificationWorkflow;
  careTeamWorkflow: CareTeamWorkflow;
  loc: LOCPage;
  locWorkflow: LOCWorkflow;
  diagnosis: DiagnosisPage;
  diagnosisWorkflow: DiagnosisWorkflow;
  admitPatientWorkflow: AdmitPatientWorkflow;
  orderEntry: OrderEntryPage;
  providerPanel: ProviderPanelPage;
  carePlan: CarePlanPage;
  claims: ClaimsPage;
  batchManagement: BatchManagementPage;
  accountsReceivable: AccountsReceivablePage;
  billingWorkflow: BillingWorkflow;
  facilities: FacilitiesPage;
  facilitiesWorkflow: FacilitiesWorkflow;
  visitAddDialog: VisitAddDialogPage;
  visitAssessment: VisitAssessmentPage;
  preferencesModule: PreferencesModulePage;
  painModule: PainModulePage;
  neurologicalModule: NeurologicalModulePage;
  respiratoryModule: RespiratoryModulePage;
  cardiovascularModule: CardiovascularModulePage;
  gastrointestinalModule: GastrointestinalModulePage;
  genitourinaryModule: GenitourinaryModulePage;
  nutritionalMetabolicModule: NutritionalMetabolicModulePage;
  skinModule: SkinModulePage;
  musculoskeletalModule: MusculoskeletalModulePage;
  adlsModule: ADLsModulePage;
  precautionsModule: PrecautionsModulePage;
  hospiceAideModule: HospiceAideModulePage;
  militaryHistoryModule: MilitaryHistoryModulePage;
  summaryModule: SummaryModulePage;
  symptomSummaryModule: SymptomSummaryModulePage;
  planOfCare: PlanOfCarePage;
  hopeReportPreview: HopeReportPreviewPage;
  hopeAdmission: HopeAdmissionPage;
}

// Define fixture types
type PageObjectFixtures = {
  /** All page objects instantiated for the current page */
  pages: PageObjects;

  /** Factory function to create page objects for a specific page */
  createPageObjects: (page: Page) => PageObjects;
};

/**
 * Factory function to create all page objects for a given page
 * @param page - Playwright Page object
 * @returns Object containing all instantiated page objects
 */
function createPageObjectsForPage(page: Page): PageObjects {
  return {
    login: new LoginPage(page),
    dashboard: new DashboardPage(page),
    patient: new PatientPagenew(page),
    patientDetails: new PatientDetailsPage(page),
    patientWorkflow: new PatientWorkflow(page),
    benefitsWorkflow: new BenefitsWorkflow(page),
    consentsWorkflow: new ConsentsWorkflow(page),
    certification: new CertificationPage(page),
    certificationWorkflow: new CertificationWorkflow(page),
    careTeamWorkflow: new CareTeamWorkflow(page),
    loc: new LOCPage(page),
    locWorkflow: new LOCWorkflow(page),
    diagnosis: new DiagnosisPage(page),
    diagnosisWorkflow: new DiagnosisWorkflow(page),
    admitPatientWorkflow: new AdmitPatientWorkflow(page),
    orderEntry: new OrderEntryPage(page),
    providerPanel: new ProviderPanelPage(page),
    carePlan: new CarePlanPage(page),
    claims: new ClaimsPage(page),
    batchManagement: new BatchManagementPage(page),
    accountsReceivable: new AccountsReceivablePage(page),
    billingWorkflow: new BillingWorkflow(page),
    facilities: new FacilitiesPage(page),
    facilitiesWorkflow: new FacilitiesWorkflow(page),
    visitAddDialog: new VisitAddDialogPage(page),
    visitAssessment: new VisitAssessmentPage(page),
    preferencesModule: new PreferencesModulePage(page),
    painModule: new PainModulePage(page),
    neurologicalModule: new NeurologicalModulePage(page),
    respiratoryModule: new RespiratoryModulePage(page),
    cardiovascularModule: new CardiovascularModulePage(page),
    gastrointestinalModule: new GastrointestinalModulePage(page),
    genitourinaryModule: new GenitourinaryModulePage(page),
    nutritionalMetabolicModule: new NutritionalMetabolicModulePage(page),
    skinModule: new SkinModulePage(page),
    musculoskeletalModule: new MusculoskeletalModulePage(page),
    adlsModule: new ADLsModulePage(page),
    precautionsModule: new PrecautionsModulePage(page),
    hospiceAideModule: new HospiceAideModulePage(page),
    militaryHistoryModule: new MilitaryHistoryModulePage(page),
    summaryModule: new SummaryModulePage(page),
    symptomSummaryModule: new SymptomSummaryModulePage(page),
    planOfCare: new PlanOfCarePage(page),
    hopeReportPreview: new HopeReportPreviewPage(page),
    hopeAdmission: new HopeAdmissionPage(page),
  };
}

/**
 * Extended test with page object fixtures
 *
 * @example
 * // Using with RN login and page objects
 * test('Create patient', async ({ loginAsRN, pages }) => {
 *   await pages.dashboard.navigateToModule('Patient');
 *   await pages.patient.clickAddPatient();
 *   await pages.patient.fillDemographics(patientData);
 * });
 *
 * @example
 * // Using factory for custom page
 * test('Custom page objects', async ({ page, createPageObjects }) => {
 *   const myPages = createPageObjects(page);
 *   await myPages.login.goto();
 * });
 */
export const test = authTest.extend<PageObjectFixtures>({
  // Pre-instantiated page objects for the default page
  pages: async ({ page }, use) => {
    const pageObjects = createPageObjectsForPage(page);
    await use(pageObjects);
  },

  // Factory function for creating page objects on demand
  createPageObjects: async ({}, use) => {
    await use(createPageObjectsForPage);
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';

// Export factory for external use
export { createPageObjectsForPage };
export type { PageObjectFixtures };
