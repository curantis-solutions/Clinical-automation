import { Page } from '@playwright/test';
import {
  CertificationType,
  CertificationFormData,
  CertificationEditData,
  VerbalCertificationFormData,
  WrittenCertificationFormData,
} from '../types/certification.types';
import { CertificationPage } from '../pages_ionic8/certification.page';
import { DateHelper } from '../utils/date-helper';
import { TestDataManager } from '../utils/test-data-manager';

/**
 * Certification Workflow (Ionic 8)
 * Handles add/edit operations for patient certifications (Verbal and Written)
 */
export class CertificationWorkflow {
  private readonly formPage: CertificationPage;

  constructor(private page: Page) {
    this.formPage = new CertificationPage(page);
  }

  async fillCertificationDetails(
    mode: 'add' | 'edit',
    certType: CertificationType,
    fieldsToEdit: string[] = [],
    customData?: Partial<CertificationFormData>,
    editData?: CertificationEditData
  ): Promise<void> {
    console.log(`\n${mode === 'add' ? 'Adding' : 'Editing'} ${certType} certification...`);

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

    // === Select Benefit Period (add mode only) ===
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

  async navigateToCertificationsTab(): Promise<void> {
    await this.formPage.navigateToCertificationsTab();
  }

  // ============================================
  // Private: Form Fill Methods
  // ============================================

  private async fillVerbalForm(
    data: VerbalCertificationFormData,
    shouldEdit: (field: string) => boolean
  ): Promise<void> {
    if (shouldEdit('hospicePhysician')) {
      await this.formPage.fillHospicePhysicianVerbal(
        data.hospicePhysician!,
        data.hospicePhysicianOptionIndex ?? 0
      );
    }

    if (shouldEdit('certifyingObtainedOn')) {
      await this.formPage.fillCertifyingObtainedOn(data.certifyingObtainedOn!);
    }

    if (shouldEdit('certifyingReceivedBy')) {
      let receivedByName = data.certifyingReceivedBy!;
      if (!receivedByName || receivedByName === '') {
        receivedByName = await this.getReceivedByName();
      }
      await this.formPage.fillCertifyingReceivedBy(receivedByName);
    }

    if (shouldEdit('attendingPhysician')) {
      await this.formPage.fillAttendingPhysicianVerbal(
        data.attendingPhysician!,
        data.attendingPhysicianOptionIndex ?? 0
      );
    }

    if (shouldEdit('attendingObtainedOn')) {
      await this.formPage.fillAttendingObtainedOn(data.attendingObtainedOn!);
    }

    if (shouldEdit('attendingReceivedBy')) {
      let receivedByName = data.attendingReceivedBy!;
      if (!receivedByName || receivedByName === '') {
        receivedByName = await this.getReceivedByName();
      }
      await this.formPage.fillAttendingReceivedBy(receivedByName);
    }
  }

  private async fillWrittenForm(
    data: WrittenCertificationFormData,
    shouldEdit: (field: string) => boolean
  ): Promise<void> {
    if (shouldEdit('hospicePhysician')) {
      await this.formPage.fillHospicePhysicianWritten(
        data.hospicePhysician!,
        data.hospicePhysicianOptionIndex ?? 0
      );
    }

    if (shouldEdit('certifyingSignedOn')) {
      await this.formPage.fillCertifyingSignedOn(data.certifyingSignedOn!);
    }

    if (shouldEdit('attendingPhysician')) {
      await this.formPage.fillAttendingPhysicianWritten(
        data.attendingPhysician!,
        data.attendingPhysicianOptionIndex ?? 0
      );
    }

    if (shouldEdit('attendingSignedOn')) {
      await this.formPage.fillAttendingSignedOn(data.attendingSignedOn!);
    }

    if (shouldEdit('briefNarrativeStatement')) {
      await this.formPage.fillBriefNarrativeStatement(data.briefNarrativeStatement!);
    }

    if (shouldEdit('narrativeOnFile') && data.narrativeOnFile) {
      await this.formPage.toggleNarrativeOnFile();
    }

    if (shouldEdit('signatureReceivedFromAttending') && data.signatureReceivedFromAttending) {
      await this.formPage.toggleSignatureReceived();
    }
  }

  // ============================================
  // Private: Defaults & Helpers
  // ============================================

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
        certifyingReceivedBy: '',
        attendingPhysician: physician,
        attendingPhysicianOptionIndex: 0,
        attendingObtainedOn: today,
        attendingReceivedBy: '',
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

  private async getReceivedByName(): Promise<string> {
    const hintName = await this.formPage.getReceivedByHintName();
    if (hintName) {
      return hintName;
    }

    const fallback = TestDataManager.getReceivedBy();
    if (fallback) {
      console.log(`Using fallback received-by from TestDataManager: ${fallback}`);
      return fallback;
    }

    throw new Error('Could not determine "Received by" name from hint text or test data');
  }
}
