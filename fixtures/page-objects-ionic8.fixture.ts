/**
 * Ionic 8 Page Objects fixture for Playwright tests
 * Mirrors the qa1 page-objects.fixture.ts pattern for ionic8 (qa2) page objects.
 *
 * Usage (standalone — serial tests with shared page):
 *   import { createIonic8PageObjects, Ionic8PageObjects } from '@fixtures/page-objects-ionic8.fixture';
 *
 *   let po: Ionic8PageObjects;
 *   test.beforeAll(async ({ browser }) => {
 *     const page = await context.newPage();
 *     po = createIonic8PageObjects(page);
 *   });
 *
 *   test('My test', async () => {
 *     await po.dashboard.navigateToModule('Patient');
 *     await po.diagnosisWorkflow.fillDiagnosisDetails('add', { ... });
 *   });
 */
import { Page } from '@playwright/test';

// ── Ionic 8 Page Objects ────────────────────────────────────────────────────
import { LoginPage } from '../pages_ionic8/login.page';
import { DashboardPage } from '../pages_ionic8/dashboard.page';
import { PatientPagenew } from '../pages_ionic8/patient.pagenew';
import { PatientDetailsPage } from '../pages_ionic8/patient-details.page';
import { CareTeamPage } from '../pages_ionic8/care-team.page';
import { DiagnosisPage } from '../pages_ionic8/diagnosis.page';
import { BenefitsAddPage } from '../pages_ionic8/benefits-add.page';
import { ConsentsPage } from '../pages_ionic8/consents.page';
import { CertificationPage } from '../pages_ionic8/certification.page';
import { LOCPage } from '../pages_ionic8/loc.page';

// ── Ionic 8 Workflows ──────────────────────────────────────────────────────
import { PatientWorkflow } from '../workflows_ionic8/patient-profile';
import { CareTeamWorkflow } from '../workflows_ionic8/care-team.workflow';
import { BenefitsWorkflow } from '../workflows_ionic8/benefits.workflow';
import { ConsentsWorkflow } from '../workflows_ionic8/consents.workflow';
import { CertificationWorkflow } from '../workflows_ionic8/certification.workflow';
import { DiagnosisWorkflow } from '../workflows_ionic8/diagnosis.workflow';
import { LOCWorkflow } from '../workflows_ionic8/loc.workflow';
import { AdmitPatientWorkflow } from '../workflows_ionic8/admit-patient.workflow';

/**
 * Collection of all Ionic 8 page objects and workflows
 */
export interface Ionic8PageObjects {
  // Page objects
  login: LoginPage;
  dashboard: DashboardPage;
  patient: PatientPagenew;
  patientDetails: PatientDetailsPage;
  careTeam: CareTeamPage;
  diagnosis: DiagnosisPage;
  benefits: BenefitsAddPage;
  consents: ConsentsPage;
  certification: CertificationPage;
  loc: LOCPage;

  // Workflows
  patientWorkflow: PatientWorkflow;
  careTeamWorkflow: CareTeamWorkflow;
  benefitsWorkflow: BenefitsWorkflow;
  consentsWorkflow: ConsentsWorkflow;
  certificationWorkflow: CertificationWorkflow;
  diagnosisWorkflow: DiagnosisWorkflow;
  locWorkflow: LOCWorkflow;
  admitPatientWorkflow: AdmitPatientWorkflow;
}

/**
 * Factory function to create all Ionic 8 page objects for a given page
 */
export function createIonic8PageObjects(page: Page): Ionic8PageObjects {
  return {
    // Page objects
    login: new LoginPage(page),
    dashboard: new DashboardPage(page),
    patient: new PatientPagenew(page),
    patientDetails: new PatientDetailsPage(page),
    careTeam: new CareTeamPage(page),
    diagnosis: new DiagnosisPage(page),
    benefits: new BenefitsAddPage(page),
    consents: new ConsentsPage(page),
    certification: new CertificationPage(page),
    loc: new LOCPage(page),

    // Workflows
    patientWorkflow: new PatientWorkflow(page),
    careTeamWorkflow: new CareTeamWorkflow(page),
    benefitsWorkflow: new BenefitsWorkflow(page),
    consentsWorkflow: new ConsentsWorkflow(page),
    certificationWorkflow: new CertificationWorkflow(page),
    diagnosisWorkflow: new DiagnosisWorkflow(page),
    locWorkflow: new LOCWorkflow(page),
    admitPatientWorkflow: new AdmitPatientWorkflow(page),
  };
}
