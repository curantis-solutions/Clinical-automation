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
import { PatientPage } from '../pages/patient.page';
import { PatientProfilePage } from '../pages/patient-profile.page';
import { CareTeamPage } from '../pages/care-team.page';
import { BenefitsPage } from '../pages/benefits.page';
import { CertificationsPage } from '../pages/certifications.page';
import { ConsentsPage } from '../pages/consents.page';
import { OrderManagementPage } from '../pages/order-management.page';
import { HopePreviewPage } from '../pages/hope-preview.page';
import { PatientPagenew } from 'pages_new/patient.pagenew';
import { PatientDetailsPage } from 'pages_new/patient-details.page';
import * as PatientWorkflow from '../workflows/addpatient-workflow';
import { BenefitsWorkflow } from '../workflows/benefits.workflow';

/**
 * Collection of all page objects
 */
export interface PageObjects {
  login: LoginPage;
  dashboard: DashboardPage;
  patient: PatientPage;
  patientProfile: PatientProfilePage;
  careTeam: CareTeamPage;
  benefits: BenefitsPage;
  certifications: CertificationsPage;
  consents: ConsentsPage;
  orderManagement: OrderManagementPage;
  hopePreview: HopePreviewPage;
  patientPageNew: PatientPagenew;
  patientDetails: PatientDetailsPage;
  workflow: {
    addPatientWorkflow: typeof PatientWorkflow.addPatientWorkflow;
    addPatientFromFixture: typeof PatientWorkflow.addPatientFromFixture;
    addCallerInformation: typeof PatientWorkflow.addCallerInformation;
    addReferrerInformation: typeof PatientWorkflow.addReferrerInformation;
    addReferringPhysicianInformation: typeof PatientWorkflow.addReferringPhysicianInformation;
    addOrderingPhysicianInformation: typeof PatientWorkflow.addOrderingPhysicianInformation;
  };
  benefitsWorkflow: BenefitsWorkflow;
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
    patient: new PatientPage(page),
    patientProfile: new PatientProfilePage(page),
    careTeam: new CareTeamPage(page),
    benefits: new BenefitsPage(page),
    certifications: new CertificationsPage(page),
    consents: new ConsentsPage(page),
    orderManagement: new OrderManagementPage(page),
    hopePreview: new HopePreviewPage(page),
    patientPageNew: new PatientPagenew(page),
    patientDetails: new PatientDetailsPage(page),
    workflow: {
      addPatientWorkflow: PatientWorkflow.addPatientWorkflow,
      addPatientFromFixture: PatientWorkflow.addPatientFromFixture,
      addCallerInformation: PatientWorkflow.addCallerInformation,
      addReferrerInformation: PatientWorkflow.addReferrerInformation,
      addReferringPhysicianInformation: PatientWorkflow.addReferringPhysicianInformation,
      addOrderingPhysicianInformation: PatientWorkflow.addOrderingPhysicianInformation,
    },
    benefitsWorkflow: new BenefitsWorkflow(page),
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
