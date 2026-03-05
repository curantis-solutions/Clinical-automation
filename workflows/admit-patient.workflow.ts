import { Page } from '@playwright/test';
import { PatientDetailsPage } from '../pages/patient-details.page';

const ADMIT_SECTIONS = ['profile', 'care-team', 'benefits', 'certifications', 'consents'] as const;
type AdmitSection = typeof ADMIT_SECTIONS[number];

/**
 * Admit Patient Workflow
 * Orchestrates sidebar checkmark verification and admission confirmation.
 * Does NOT duplicate section-filling logic — delegates to existing workflows.
 */
export class AdmitPatientWorkflow {
  private readonly patientDetails: PatientDetailsPage;

  constructor(private page: Page) {
    this.patientDetails = new PatientDetailsPage(page);
  }

  /**
   * Verify a single section's checkmark is visible on the sidebar
   * @param section - Section name (e.g. 'profile', 'care-team')
   * @param timeout - How long to wait for the checkmark (default 15000ms)
   */
  async verifySectionCheckmark(section: AdmitSection, timeout: number = 15000): Promise<void> {
    await this.patientDetails.waitForSectionCheckmark(section, timeout);
    console.log(`✅ Section "${section}" checkmark verified`);
  }

  /**
   * Verify all 5 required sections have checkmarks
   */
  async verifyAllSectionsComplete(): Promise<void> {
    const completed = await this.patientDetails.getCompletedSections();
    const missing = ADMIT_SECTIONS.filter(s => !completed.includes(s));

    if (missing.length > 0) {
      throw new Error(`Sections missing checkmarks: ${missing.join(', ')}. Completed: ${completed.join(', ')}`);
    }

    console.log('✅ All 5 sections complete — ready for admission');
  }

  /**
   * Full admit flow: click Admit Patient button → confirm modal
   * @param admitDate - Optional date in MM/DD/YYYY format. If not provided, keeps the modal default (today).
   */
  async admitPatient(admitDate?: string): Promise<void> {
    console.log('🏥 Starting patient admission...');

    // Navigate to Profile section where the Admit Patient button lives
    await this.navigateToSection('profile');
    await this.page.waitForTimeout(1000);

    // Click Admit Patient
    await this.patientDetails.clickAdmitPatient();

    // Wait for and confirm the Admission Complete modal
    await this.page.waitForTimeout(1000);
    await this.patientDetails.confirmAdmission(admitDate);

    console.log(`✅ Patient admission confirmed${admitDate ? ` (date: ${admitDate})` : ''}`);
  }

  /**
   * Verify post-admission state: Admit Patient button should no longer be visible
   */
  async verifyAdmissionSuccess(): Promise<void> {
    // Wait for page to settle after admission
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    const admitButtonVisible = await this.patientDetails.isAdmitPatientButtonVisible();
    if (admitButtonVisible) {
      throw new Error('Admit Patient button is still visible after admission — admission may have failed');
    }

    console.log('✅ Post-admission verified — Admit Patient button is gone');
  }

  /**
   * Navigate to a sidebar section tab
   */
  async navigateToSection(section: AdmitSection): Promise<void> {
    await this.patientDetails.clickSidebarTab(section);
  }
}
