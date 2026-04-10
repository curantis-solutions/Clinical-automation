import { Page } from '@playwright/test';

/**
 * Data interface for Military History module
 */
export interface MilitaryHistoryData {
  /** Did the patient serve? yes/no */
  patientServed?: string;
  /** Patient branch checkboxes (army, navy, airForce, etc.) */
  patientBranches?: string[];
  /** Did the spouse serve? yes/no */
  spouseServed?: string;
  /** Spouse branch checkboxes */
  spouseBranches?: string[];
  /** Did family serve? yes/no */
  familyServed?: string;
  /** Family relationship checkboxes (son, daughter, brother, etc.) */
  familyRelationships?: string[];
  /** Traumatic assignment? yes/no/na */
  traumaticAssignment?: string;
  /** Traumatic assignment explanation text */
  traumaticExplanation?: string;
  /** Discharge papers? yes/no/na */
  dischargePapers?: string;
  /** War era checkboxes (wwi, wwii, korea, vietnam, desertStorm) */
  warEras?: string[];
  /** Overall military experience text */
  overallExperience?: string;
  /** Prefer not to answer overall experience */
  preferNotToAnswer?: boolean;
  /** Enrolled in VA? yes/no/na/preferNotToAnswer */
  enrolledInVa?: string;
  /** Receives VA benefits? yes/no */
  receivesVaBenefits?: string;
  /** Medication? yes/no */
  medication?: string;
  /** Wants benefit briefing? yes/no */
  wantsBenefitBriefing?: string;
  /** Veteran recognition checkboxes (yes/no) */
  veteranRecognition?: string[];
}

/**
 * Military History Module Page Object
 *
 * Fields:
 *   - Patient served (radio) → branch checkboxes
 *   - Spouse served (radio) → branch checkboxes
 *   - Family served (radio) → branch checkboxes + relationship checkboxes
 *   - Traumatic assignment (radio) + explanation textarea
 *   - Discharge papers (radio)
 *   - War era (checkboxes)
 *   - Overall military experience (textarea) + prefer not to answer
 *   - Enrolled in VA (radio)
 *   - Receives VA benefits (radio)
 *   - Medication (radio)
 *   - VA Clinic details (text inputs + select)
 *   - Wants benefit briefing (radio)
 *   - Veteran recognition (checkboxes)
 */
export class MilitaryHistoryModulePage {
  readonly page: Page;

  private readonly selectors = {
    // ── Radio questions ────────────────────────────────────────────────
    patientServedRadio: (answer: string) => `[data-cy="radio-patientHasServed-${answer}"]`,
    spouseServedRadio: (answer: string) => `[data-cy="radio-spouseHasServed-${answer}"]`,
    familyServedRadio: (answer: string) => `[data-cy="radio-familyHasServed-${answer}"]`,
    traumaticAssignmentRadio: (answer: string) => `[data-cy="radio-patientHadTraumaticAssignment-${answer}"]`,
    dischargePapersRadio: (answer: string) => `[data-cy="radio-patientHasDischargePapers-${answer}"]`,
    enrolledInVaRadio: (answer: string) => `[data-cy="radio-patientEnrolledInVa-${answer}"]`,
    receivesVaBenefitsRadio: (answer: string) => `[data-cy="radio-patientReceivesVaBenefits-${answer}"]`,
    medicationRadio: (answer: string) => `[data-cy="radio-medication-${answer}"]`,
    wantsBenefitBriefingRadio: (answer: string) => `[data-cy="radio-patientWantsBenefitBriefing-${answer}"]`,

    // ── Checkbox groups ────────────────────────────────────────────────
    patientBranchCheckbox: (branch: string) => `[data-cy="checkbox-patientMilitaryCheck-${branch}"]`,
    spouseBranchCheckbox: (branch: string) => `[data-cy="checkbox-spouseMilitaryCheck-${branch}"]`,
    familyRelationshipCheckbox: (rel: string) => `[data-cy="checkbox-familyRelationshipCheck-${rel}"]`,
    warEraCheckbox: (era: string) => `[data-cy="checkbox-warEraPeriodCheck-${era}"]`,
    veteranRecognitionCheckbox: (val: string) => `[data-cy="checkbox-veteranRecognitionCheck-${val}"]`,
    preferNotToAnswerCheckbox: '[data-cy="checkbox-preferNotToAnswerOverallMilitaryExperienceCheck-preferNotToAnswer"]',

    // ── Textareas ──────────────────────────────────────────────────────
    traumaticExplanation: '[data-cy="input-patientHadTraumaticAssignmentExplanation"]',
    overallExperience: '[data-cy="input-patientOverallMilitaryExperience"]',

    // ── VA Clinic fields ───────────────────────────────────────────────
    vaClinicName: '[data-cy="input-vaClinicName"]',
    vaClinicAddress: '[data-cy="input-vaClinicPhysician"]', // note: address shares data-cy with physician in HTML
    vaClinicCity: '[data-cy="input-vaClinicCity"]',
    vaClinicState: '[data-cy="select-vaClinicCity"]',
    vaClinicPhysician: '[data-cy="input-vaClinicPhysician"]',
    vaClinicPhone: '[data-cy="number-input-vaClinicPhoneNumber"]',
    vaClinicEmail: '[data-cy="input-vaClinicEmail"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Click a radio button by its data-cy selector, using force click for disabled-looking elements
   */
  private async clickRadio(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click the parent ion-item to ensure Angular registers the change
      const item = el.locator('xpath=ancestor::ion-item');
      await item.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Click a checkbox by its data-cy selector
   */
  private async clickCheckbox(selector: string): Promise<void> {
    const el = this.page.locator(selector);
    if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
      const item = el.locator('xpath=ancestor::ion-item');
      await item.click({ force: true });
      await this.page.waitForTimeout(300);
    }
  }

  async fillMilitaryHistory(data: MilitaryHistoryData): Promise<void> {
    console.log('Filling Military History module...');

    // Patient served
    if (data.patientServed) {
      await this.clickRadio(this.selectors.patientServedRadio(data.patientServed));
      console.log(`  Patient served: ${data.patientServed}`);
      await this.page.waitForTimeout(500);

      // Patient branches (only if yes)
      if (data.patientServed === 'yes' && data.patientBranches) {
        for (const branch of data.patientBranches) {
          await this.clickCheckbox(this.selectors.patientBranchCheckbox(branch));
          console.log(`  Patient branch: ${branch}`);
        }
      }
    }

    // Spouse served
    if (data.spouseServed) {
      await this.clickRadio(this.selectors.spouseServedRadio(data.spouseServed));
      console.log(`  Spouse served: ${data.spouseServed}`);
      await this.page.waitForTimeout(500);

      if (data.spouseServed === 'yes' && data.spouseBranches) {
        for (const branch of data.spouseBranches) {
          await this.clickCheckbox(this.selectors.spouseBranchCheckbox(branch));
          console.log(`  Spouse branch: ${branch}`);
        }
      }
    }

    // Family served
    if (data.familyServed) {
      await this.clickRadio(this.selectors.familyServedRadio(data.familyServed));
      console.log(`  Family served: ${data.familyServed}`);
      await this.page.waitForTimeout(500);

      if (data.familyServed === 'yes' && data.familyRelationships) {
        for (const rel of data.familyRelationships) {
          await this.clickCheckbox(this.selectors.familyRelationshipCheckbox(rel));
          console.log(`  Family relationship: ${rel}`);
        }
      }
    }

    // Traumatic assignment
    if (data.traumaticAssignment) {
      await this.clickRadio(this.selectors.traumaticAssignmentRadio(data.traumaticAssignment));
      console.log(`  Traumatic assignment: ${data.traumaticAssignment}`);

      if (data.traumaticAssignment === 'yes' && data.traumaticExplanation) {
        const textarea = this.page.locator(this.selectors.traumaticExplanation);
        if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
          await textarea.click();
          await textarea.pressSequentially(data.traumaticExplanation, { delay: 30 });
          console.log(`  Traumatic explanation: ${data.traumaticExplanation}`);
        }
      }
    }

    // Discharge papers
    if (data.dischargePapers) {
      await this.clickRadio(this.selectors.dischargePapersRadio(data.dischargePapers));
      console.log(`  Discharge papers: ${data.dischargePapers}`);
    }

    // War era
    if (data.warEras) {
      for (const era of data.warEras) {
        await this.clickCheckbox(this.selectors.warEraCheckbox(era));
        console.log(`  War era: ${era}`);
      }
    }

    // Overall experience
    if (data.overallExperience) {
      const textarea = this.page.locator(this.selectors.overallExperience);
      if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await textarea.click();
        await textarea.pressSequentially(data.overallExperience, { delay: 30 });
        console.log(`  Overall experience: ${data.overallExperience.substring(0, 50)}`);
      }
    }

    // Prefer not to answer
    if (data.preferNotToAnswer) {
      await this.clickCheckbox(this.selectors.preferNotToAnswerCheckbox);
      console.log('  Prefer not to answer: checked');
    }

    // Enrolled in VA
    if (data.enrolledInVa) {
      await this.clickRadio(this.selectors.enrolledInVaRadio(data.enrolledInVa));
      console.log(`  Enrolled in VA: ${data.enrolledInVa}`);
    }

    // Receives VA benefits
    if (data.receivesVaBenefits) {
      await this.clickRadio(this.selectors.receivesVaBenefitsRadio(data.receivesVaBenefits));
      console.log(`  Receives VA benefits: ${data.receivesVaBenefits}`);
    }

    // Medication
    if (data.medication) {
      await this.clickRadio(this.selectors.medicationRadio(data.medication));
      console.log(`  Medication: ${data.medication}`);
    }

    // Wants benefit briefing
    if (data.wantsBenefitBriefing) {
      await this.clickRadio(this.selectors.wantsBenefitBriefingRadio(data.wantsBenefitBriefing));
      console.log(`  Wants benefit briefing: ${data.wantsBenefitBriefing}`);
    }

    // Veteran recognition
    if (data.veteranRecognition) {
      for (const val of data.veteranRecognition) {
        await this.clickCheckbox(this.selectors.veteranRecognitionCheckbox(val));
        console.log(`  Veteran recognition: ${val}`);
      }
    }

    console.log('Military History module filled');
  }

  /** Convenience: fill with "No" for all service questions — minimal path */
  async fillAllMilitaryHistory(): Promise<void> {
    await this.fillMilitaryHistory({
      patientServed: 'no',
      spouseServed: 'no',
      familyServed: 'no',
      wantsBenefitBriefing: 'no',
    });
  }
}
