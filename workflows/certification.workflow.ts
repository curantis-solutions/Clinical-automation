import { Page } from '@playwright/test';
import {
  CertificationType,
  CertificationFormData,
  CertificationEditData,
  VerbalCertificationFormData,
  WrittenCertificationFormData,
} from '../types/certification.types';
import { CertificationPage } from '../pages/certification.page';
import { DateHelper } from '../utils/date-helper';
import { TestDataManager } from '../utils/test-data-manager';

/**
 * Certification Workflow
 * Handles add/edit operations for patient certifications (Verbal and Written)
 * Follows the add/edit mode pattern from BenefitsWorkflow.
 *
 * @example
 * // Add a Verbal certification with defaults
 * await certificationWorkflow.fillCertificationDetails('add', 'Verbal');
 *
 * @example
 * // Add a Written certification with custom data
 * await certificationWorkflow.fillCertificationDetails('add', 'Written', [], {
 *   certType: 'Written',
 *   hospicePhysician: 'Cypresslast',
 *   briefNarrativeStatement: 'Patient meets criteria',
 * });
 *
 * @example
 * // Edit a certification (only update specific fields)
 * await certificationWorkflow.fillCertificationDetails(
 *   'edit', 'Written',
 *   ['briefNarrativeStatement'],
 *   { certType: 'Written', briefNarrativeStatement: 'Updated narrative' },
 *   { reasonForChange: 'Corrected narrative' }
 * );
 */
export class CertificationWorkflow {
  private readonly formPage: CertificationPage;

  constructor(private page: Page) {
    this.formPage = new CertificationPage(page);
  }

  /**
   * Add or edit a certification
   * @param mode - 'add' or 'edit'
   * @param certType - 'Verbal' or 'Written'
   * @param fieldsToEdit - Fields to update in edit mode
   * @param customData - Optional custom form data (merged with defaults)
   * @param editData - Edit-mode-only data (reason for change)
   */
  async fillCertificationDetails(
    mode: 'add' | 'edit',
    certType: CertificationType,
    fieldsToEdit: string[] = [],
    customData?: Partial<CertificationFormData>,
    editData?: CertificationEditData
  ): Promise<void> {
    console.log(`\n${mode === 'add' ? 'Adding' : 'Editing'} ${certType} certification...`);

    // Build default data based on cert type
    const defaults = this.getDefaults(certType);
    const data = { ...defaults, ...customData } as CertificationFormData;

    const shouldEdit = (field: string): boolean => {
      return (
        (mode !== 'edit' || fieldsToEdit.includes(field)) &&
        data[field as keyof CertificationFormData] !== undefined &&
        data[field as keyof CertificationFormData] !== null
      );
    };

    // === Navigation ===
    await this.navigateToCertificationsTab();

    // === Open Form ===
    if (mode === 'add') {
      await this.formPage.clickAddCertification();
    } else {
      // Edit mode: click more icon on the certification row, then Edit
      if (certType === 'Written') {
        await this.formPage.openWrittenCertificationEdit(0);
      } else {
        await this.formPage.openVerbalCertificationEdit(0);
      }
    }

    // === Select Cert Type (add mode only) ===
    if (mode === 'add') {
      if (certType === 'Verbal') {
        await this.formPage.selectVerbalCertification();
      } else {
        await this.formPage.selectWrittenCertification();
      }
    }

    // === Select Benefit Period (add mode only — disabled in edit) ===
    if (mode === 'add' && shouldEdit('benefitPeriodIndex')) {
      await this.formPage.selectBenefitPeriod(data.benefitPeriodIndex!, certType);
    }

    // === Fill Form Fields ===
    if (certType === 'Verbal') {
      await this.fillVerbalForm(data as VerbalCertificationFormData, shouldEdit);
    } else {
      await this.fillWrittenForm(data as WrittenCertificationFormData, shouldEdit);
    }

    // === Edit Mode: Reason for Change ===
    if (mode === 'edit' && editData?.reasonForChange) {
      await this.formPage.fillReasonForChange(editData.reasonForChange);
    }

    // === Save ===
    await this.formPage.clickSave();

    console.log(`✅ ${mode === 'add' ? 'Added' : 'Edited'} ${certType} certification successfully`);
  }

  /**
   * Navigate to the Certifications tab
   */
  async navigateToCertificationsTab(): Promise<void> {
    await this.formPage.navigateToCertificationsTab();
  }

  // ============================================
  // Private: Form Fill Methods
  // ============================================

  /**
   * Fill Verbal certification form fields in dependency order:
   * 1. Hospice physician → 2. Obtained on date → 3. Received by
   * 4. Attending physician → 5. Obtained on date → 6. Received by
   */
  private async fillVerbalForm(
    data: VerbalCertificationFormData,
    shouldEdit: (field: string) => boolean
  ): Promise<void> {
    // Hospice (Certifying) Physician
    if (shouldEdit('hospicePhysician')) {
      await this.formPage.fillHospicePhysicianVerbal(
        data.hospicePhysician!,
        data.hospicePhysicianOptionIndex ?? 0
      );
    }

    // Certifying Obtained On date
    if (shouldEdit('certifyingObtainedOn')) {
      await this.formPage.fillCertifyingObtainedOn(data.certifyingObtainedOn!);
    }

    // Certifying Received By — dynamically captured from hint text
    if (shouldEdit('certifyingReceivedBy')) {
      let receivedByName = data.certifyingReceivedBy!;
      if (!receivedByName || receivedByName === '') {
        receivedByName = await this.getReceivedByName();
      }
      await this.formPage.fillCertifyingReceivedBy(receivedByName);
    }

    // Attending Physician
    if (shouldEdit('attendingPhysician')) {
      await this.formPage.fillAttendingPhysicianVerbal(
        data.attendingPhysician!,
        data.attendingPhysicianOptionIndex ?? 0
      );
    }

    // Attending Obtained On date
    if (shouldEdit('attendingObtainedOn')) {
      await this.formPage.fillAttendingObtainedOn(data.attendingObtainedOn!);
    }

    // Attending Received By — dynamically captured from hint text
    if (shouldEdit('attendingReceivedBy')) {
      let receivedByName = data.attendingReceivedBy!;
      if (!receivedByName || receivedByName === '') {
        receivedByName = await this.getReceivedByName();
      }
      await this.formPage.fillAttendingReceivedBy(receivedByName);
    }
  }

  /**
   * Fill Written certification form fields in dependency order:
   * 1. Hospice physician → 2. Signed on date
   * 3. Attending physician → 4. Signed on date
   * 5. Narrative / checkboxes
   */
  private async fillWrittenForm(
    data: WrittenCertificationFormData,
    shouldEdit: (field: string) => boolean
  ): Promise<void> {
    // Hospice (Certifying) Physician
    if (shouldEdit('hospicePhysician')) {
      await this.formPage.fillHospicePhysicianWritten(
        data.hospicePhysician!,
        data.hospicePhysicianOptionIndex ?? 0
      );
    }

    // Certifying Signed On date
    if (shouldEdit('certifyingSignedOn')) {
      await this.formPage.fillCertifyingSignedOn(data.certifyingSignedOn!);
    }

    // Attending Physician
    if (shouldEdit('attendingPhysician')) {
      await this.formPage.fillAttendingPhysicianWritten(
        data.attendingPhysician!,
        data.attendingPhysicianOptionIndex ?? 0
      );
    }

    // Attending Signed On date
    if (shouldEdit('attendingSignedOn')) {
      await this.formPage.fillAttendingSignedOn(data.attendingSignedOn!);
    }

    // Brief Narrative Statement
    if (shouldEdit('briefNarrativeStatement')) {
      await this.formPage.fillBriefNarrativeStatement(data.briefNarrativeStatement!);
    }

    // Narrative on File checkbox
    if (shouldEdit('narrativeOnFile') && data.narrativeOnFile) {
      await this.formPage.toggleNarrativeOnFile();
    }

    // Signature Received from Attending checkbox
    if (shouldEdit('signatureReceivedFromAttending') && data.signatureReceivedFromAttending) {
      await this.formPage.toggleSignatureReceived();
    }
  }

  // ============================================
  // Private: Defaults & Helpers
  // ============================================

  /**
   * Build default form data based on cert type
   */
  private getDefaults(certType: CertificationType): CertificationFormData {
    const physician = TestDataManager.getPhysician();
    const today = DateHelper.getTodaysDate();

    if (certType === 'Verbal') {
      return {
        certType: 'Verbal',
        benefitPeriodIndex: 1,
        hospicePhysician: physician,
        hospicePhysicianOptionIndex: 0,
        certifyingObtainedOn: today,
        certifyingReceivedBy: '',   // Will be dynamically captured
        attendingPhysician: physician,
        attendingPhysicianOptionIndex: 0,
        attendingObtainedOn: today,
        attendingReceivedBy: '',    // Will be dynamically captured
      };
    }

    return {
      certType: 'Written',
      benefitPeriodIndex: 1,
      hospicePhysician: physician,
      hospicePhysicianOptionIndex: 0,
      certifyingSignedOn: today,
      attendingPhysician: physician,
      attendingPhysicianOptionIndex: 0,
      attendingSignedOn: today,
      briefNarrativeStatement: 'Test narrative statement for certification',
    };
  }

  /**
   * Get the expected "Received by" name from the red hint text on the form.
   * Falls back to TestDataManager.getReceivedBy() if hint text is not found.
   */
  private async getReceivedByName(): Promise<string> {
    const hintName = await this.formPage.getReceivedByHintName();
    if (hintName) {
      return hintName;
    }

    // Fallback to configured test data
    const fallback = TestDataManager.getReceivedBy();
    if (fallback) {
      console.log(`Using fallback received-by from TestDataManager: ${fallback}`);
      return fallback;
    }

    throw new Error('Could not determine "Received by" name from hint text or test data');
  }
}
