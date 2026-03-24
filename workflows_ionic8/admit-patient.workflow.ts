import { Page } from '@playwright/test';
import { PatientDetailsPage } from '../pages_ionic8/patient-details.page';

const ADMIT_SECTIONS = ['profile', 'care-team', 'benefits', 'certifications', 'consents'] as const;
type AdmitSection = typeof ADMIT_SECTIONS[number];

/**
 * Admit Patient Workflow (Ionic 8)
 * Orchestrates sidebar checkmark verification and admission confirmation.
 */
export class AdmitPatientWorkflow {
  private readonly patientDetails: PatientDetailsPage;

  constructor(private page: Page) {
    this.patientDetails = new PatientDetailsPage(page);
  }

  async verifySectionCheckmark(section: AdmitSection, timeout: number = 15000): Promise<void> {
    await this.patientDetails.waitForSectionCheckmark(section, timeout);
    console.log(`✅ Section "${section}" checkmark verified`);
  }

  async verifyAllSectionsComplete(): Promise<void> {
    const completed = await this.patientDetails.getCompletedSections();
    const missing = ADMIT_SECTIONS.filter(s => !completed.includes(s));

    if (missing.length > 0) {
      throw new Error(`Sections missing checkmarks: ${missing.join(', ')}. Completed: ${completed.join(', ')}`);
    }

    console.log('✅ All 5 sections complete — ready for admission');
  }

  async admitPatient(admitDate?: string): Promise<void> {
    console.log('🏥 Starting patient admission...');

    await this.navigateToSection('profile');
    await this.page.waitForTimeout(1000);

    await this.patientDetails.clickAdmitPatient();

    await this.page.waitForTimeout(1000);
    await this.patientDetails.confirmAdmission(admitDate);

    console.log(`✅ Patient admission confirmed${admitDate ? ` (date: ${admitDate})` : ''}`);
  }

  async verifyAdmissionSuccess(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    const admitButtonVisible = await this.patientDetails.isAdmitPatientButtonVisible();
    if (admitButtonVisible) {
      throw new Error('Admit Patient button is still visible after admission — admission may have failed');
    }

    console.log('✅ Post-admission verified — Admit Patient button is gone');
  }

  async navigateToSection(section: AdmitSection): Promise<void> {
    await this.patientDetails.clickSidebarTab(section);
  }
}
