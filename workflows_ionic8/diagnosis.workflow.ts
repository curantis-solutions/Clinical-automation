import { Page } from '@playwright/test';
import { DiagnosisPage } from '../pages_ionic8/diagnosis.page';
import { DiagnosisFormData } from '../types/diagnosis.types';

/**
 * Diagnosis Workflow (Ionic 8)
 * Orchestrates add/edit operations for patient diagnosis (ICD-10 codes).
 */
export class DiagnosisWorkflow {
  private readonly formPage: DiagnosisPage;

  constructor(private page: Page) {
    this.formPage = new DiagnosisPage(page);
  }

  /**
   * Add or edit a diagnosis
   * @param mode - 'add' or 'edit'
   * @param customData - Optional custom form data (merged with defaults)
   * @param fieldsToEdit - Fields to update in edit mode (ignored in add mode)
   */
  async fillDiagnosisDetails(
    mode: 'add' | 'edit',
    customData?: Partial<DiagnosisFormData>,
    fieldsToEdit: string[] = []
  ): Promise<void> {
    console.log(`\n${mode === 'add' ? 'Adding' : 'Editing'} diagnosis...`);

    const defaults = this.getDefaults();
    const data: DiagnosisFormData = { ...defaults, ...customData };

    const shouldEdit = (field: string): boolean => {
      return (
        (mode !== 'edit' || fieldsToEdit.includes(field)) &&
        data[field as keyof DiagnosisFormData] !== undefined &&
        data[field as keyof DiagnosisFormData] !== null
      );
    };

    // === Navigate to Diagnosis tab ===
    await this.formPage.navigateToDiagnosisTab();

    // === Open Form ===
    if (mode === 'add') {
      await this.formPage.clickAddDiagnosis();
    } else {
      await this.formPage.clickEditDiagnosis();
    }

    // === Fill Primary Diagnosis (required in add mode) ===
    if (shouldEdit('primaryDiagnosis')) {
      await this.formPage.fillPrimaryDiagnosis(
        data.primaryDiagnosis.searchText,
        data.primaryDiagnosis.optionIndex ?? 0
      );
    }

    // === Fill Secondary Diagnosis (optional) ===
    if (shouldEdit('secondaryDiagnosis') && data.secondaryDiagnosis) {
      await this.formPage.fillSecondaryDiagnosis(
        data.secondaryDiagnosis.searchText,
        data.secondaryDiagnosis.optionIndex ?? 0
      );
    }

    // === Add Related/Unrelated Diagnoses (optional) ===
    if (shouldEdit('relatedDiagnoses') && data.relatedDiagnoses) {
      for (let i = 0; i < data.relatedDiagnoses.length; i++) {
        const related = data.relatedDiagnoses[i];
        await this.formPage.addRelatedDiagnosis(
          i,
          related.type,
          related.diagnosis.searchText,
          related.diagnosis.optionIndex ?? 0
        );
      }
    }

    // === Save ===
    await this.formPage.clickSave();

    // === Wait for form to close + loading to settle ===
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);

    // === Handle Principle Diagnosis Options (contextual — appears after save) ===
    if (data.principleDiagnosisOption) {
      const isVisible = await this.formPage.isPrincipleDiagnosisVisible();
      if (isVisible) {
        await this.formPage.selectPrincipleDiagnosisOption(data.principleDiagnosisOption);
        await this.formPage.clickSave();
        await this.page.waitForTimeout(2000);
      } else {
        console.log('Principle diagnosis options not visible — skipping');
      }
    }

    console.log(`${mode === 'add' ? 'Added' : 'Edited'} diagnosis successfully`);
  }

  // ---------------------------------------------------------------------------
  // Defaults
  // ---------------------------------------------------------------------------

  private getDefaults(): DiagnosisFormData {
    return {
      primaryDiagnosis: { searchText: 'C801', optionIndex: 0 },
      // Malignant (primary) neoplasm, unspecified
    };
  }
}
