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
