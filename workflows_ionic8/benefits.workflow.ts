import { Page } from '@playwright/test';
import { BenefitFormData } from '../types/benefit.types';
import { BenefitsAddPage } from '../pages_ionic8/benefits-add.page';
import { BENEFIT_FORM_DATA, PAYER_NAMES, PayerType, BenefitType, createBenefitData } from '../fixtures/benefit-fixtures';
import { DateHelper } from '../utils/date-helper';

/**
 * Benefits Workflow (Ionic 8)
 * Handles add/edit operations for patient benefits (Primary, Secondary, Room And Board)
 */
export class BenefitsWorkflow {
  private readonly benefitsPage: BenefitsAddPage;

  constructor(private page: Page) {
    this.benefitsPage = new BenefitsAddPage(page);
  }

  async fillBenefitDetails(
    mode: 'add' | 'edit',
    fieldsToEdit: string[] = [],
    benefitType: 'Hospice' | 'Palliative' = 'Hospice',
    editPayerLevel: 'Primary' | 'Secondary' | 'Room And Board' = 'Primary',
    customData?: Partial<BenefitFormData>
  ): Promise<void> {
    const data = customData || BENEFIT_FORM_DATA;

    console.log(`\n${mode === 'add' ? 'Adding' : `Editing ${editPayerLevel}`} ${benefitType} benefit...`);

    const palliativeSkipFields = ['benefitPeriodStartDate', 'admitBenefitPeriod', 'highDaysUsed'];
    const roomAndBoardSkipFields = ['highDaysUsed', 'benefitElectionDate'];

    const shouldEdit = (field: string): boolean => {
      const isSkippedForPalliative = benefitType === 'Palliative' && palliativeSkipFields.includes(field);
      const isSkippedForRoomAndBoard = data.payerLevel === 'Room And Board' && roomAndBoardSkipFields.includes(field);

      return (
        !isSkippedForPalliative &&
        !isSkippedForRoomAndBoard &&
        (mode !== 'edit' || fieldsToEdit.includes(field)) &&
        data[field as keyof BenefitFormData] !== undefined &&
        data[field as keyof BenefitFormData] !== null &&
        data[field as keyof BenefitFormData] !== ''
      );
    };

    // Navigation
    await this.benefitsPage.navigateToBenefits();

    if (mode === 'add') {
      await this.benefitsPage.clickAddPayer();
    } else if (mode === 'edit') {
      await this.benefitsPage.clickMoreButtonByPayerLevel(editPayerLevel);
      await this.benefitsPage.clickEditButton();
    }

    // === Payer Info Section ===
    if (shouldEdit('payerLevel')) {
      await this.benefitsPage.selectPayerLevel(data.payerLevel!);
    }
    if (shouldEdit('payerType')) {
      await this.benefitsPage.selectPayerType(data.payerType!);
    }
    if (shouldEdit('payerName')) {
      await this.benefitsPage.selectPayerName(data.payerName!);
    } else if (mode === 'add' && data.payerType) {
      const lookupBenefitType: BenefitType = data.payerLevel === 'Room And Board' ? 'Room And Board' : benefitType;
      const payerName = this.getPayerNameForEnv(data.payerType, lookupBenefitType);
      console.log(`Using dynamic payer name: ${payerName} (env: ${process.env.TEST_ENV || 'qa'}, tenant: ${process.env.TENANT || 'cth'}, benefitType: ${lookupBenefitType}, payerType: ${data.payerType})`);
      await this.benefitsPage.selectPayerName(payerName);
    }
    if (shouldEdit('vbid')) {
      await this.benefitsPage.toggleVbid();
    }

    // === Dates Section ===
    if (shouldEdit('payerEffectiveDate')) {
      await this.fillDateField('payerEffectiveDate', data.payerEffectiveDate || DateHelper.getTodaysDate());
    }
    if (shouldEdit('benefitElectionDate')) {
      await this.fillDateField('benefitElectionDate', data.benefitElectionDate || DateHelper.getTodaysDate());
    }
    if (shouldEdit('benefitPeriodStartDate')) {
      await this.benefitsPage.fillBenefitPeriodStartDate(data.benefitPeriodStartDate!);
    }

    // === Room And Board Specific Fields ===
    if (data.payerLevel === 'Room And Board') {
      if (shouldEdit('billingEffectiveDate')) {
        await this.benefitsPage.fillBillingEffectiveDate(data.billingEffectiveDate || DateHelper.getTodaysDate());
      }
      if (shouldEdit('billRate')) {
        await this.benefitsPage.selectBillRate(data.billRate!);
      }
      if (shouldEdit('careLevel') && data.billRate === 'Bill at Facility Rate') {
        await this.benefitsPage.selectCareLevel(data.careLevel!);
      }
      if (shouldEdit('patientLiability')) {
        await this.benefitsPage.selectPatientLiability(data.patientLiability!);
      }
      if (shouldEdit('liabilityAmount')) {
        await this.benefitsPage.fillLiabilityAmount(data.liabilityAmount!);
      }
      if (shouldEdit('liabilityFromDate') && shouldEdit('liabilityToDate')) {
        await this.benefitsPage.fillLiabilityDates(data.liabilityFromDate!, data.liabilityToDate!);
      }
    }

    // === HIS/HOPE Use Only Section ===
    if (shouldEdit('medicareNumber')) {
      await this.benefitsPage.fillMedicareNumber(data.medicareNumber!);
    }
    if (shouldEdit('medicaidNumber')) {
      await this.benefitsPage.fillMedicaidNumber(data.medicaidNumber!);
    }
    if (shouldEdit('medicaidPending')) {
      await this.benefitsPage.toggleMedicaidPending();
    }

    // === Plan Details Section ===
    if (shouldEdit('planNameIndex')) {
      await this.benefitsPage.selectPlanNameByIndex(data.planNameIndex!);
    } else if (shouldEdit('planName')) {
      await this.benefitsPage.selectPlanName(data.planName!);
    }
    if (shouldEdit('patientEligibilityVerified')) {
      await this.benefitsPage.togglePatientEligibilityVerified();
    }

    // === Subscriber Details Section ===
    if (shouldEdit('relationshipToPatient')) {
      await this.benefitsPage.selectRelationshipToPatient(data.relationshipToPatient!);
    }
    if (shouldEdit('groupNumber')) {
      await this.benefitsPage.fillGroupNumber(data.groupNumber!);
    }
    if (shouldEdit('subscriberDateOfBirth')) {
      await this.fillDateField('dateOfBirth', data.subscriberDateOfBirth!);
    }
    if (shouldEdit('subscriberFirstName')) {
      await this.benefitsPage.fillFirstName(data.subscriberFirstName!);
    }
    if (shouldEdit('subscriberLastName')) {
      await this.benefitsPage.fillLastName(data.subscriberLastName!);
    }
    if (shouldEdit('subscriberMiddleInitial')) {
      await this.benefitsPage.fillMiddleInitial(data.subscriberMiddleInitial!);
    }
    if (shouldEdit('subscriberAddress')) {
      await this.benefitsPage.fillAddress(data.subscriberAddress!);
    }
    if (shouldEdit('subscriberCity')) {
      await this.benefitsPage.fillCity(data.subscriberCity!);
    }
    if (shouldEdit('subscriberState')) {
      await this.benefitsPage.selectSubscriberState(data.subscriberState!);
    }
    if (shouldEdit('subscriberZipCode')) {
      await this.benefitsPage.fillZipCode(data.subscriberZipCode!);
    }
    if (shouldEdit('subscriberZipExtension')) {
      await this.benefitsPage.fillZipExtension(data.subscriberZipExtension!);
    }
    if (shouldEdit('subscriberPhone')) {
      await this.benefitsPage.fillPhone(data.subscriberPhone!);
    }
    if (shouldEdit('subscriberEmail')) {
      await this.benefitsPage.fillEmail(data.subscriberEmail!);
    }
    if (shouldEdit('additionalInfo')) {
      await this.benefitsPage.fillAdditionalInfo(data.additionalInfo!);
    }

    // === Subscriber ID Section ===
    if (shouldEdit('subscriberId')) {
      await this.benefitsPage.fillPolicyNumber(data.subscriberId!);
    }
    if (shouldEdit('subscriberEffectiveDate')) {
      await this.fillIndexedDateField('subscriberEffectiveDate', 0, data.subscriberEffectiveDate!);
    }
    if (shouldEdit('subscriberExpiredDate')) {
      await this.fillIndexedDateField('subscriberExpiredDate', 0, data.subscriberExpiredDate!);
    }

    // === Hospice Eligibility Section ===
    if (shouldEdit('admitBenefitPeriod')) {
      await this.benefitsPage.fillAdmitBenefitPeriod(String(data.admitBenefitPeriod));
    }
    if (shouldEdit('highDaysUsed')) {
      await this.benefitsPage.fillHighDaysUsed(String(data.highDaysUsed));
    }

    // Small wait before saving
    await this.page.waitForTimeout(1000);

    // Save
    await this.benefitsPage.clickSave();
    await this.page.waitForTimeout(2000);

    // Handle "Proceed" confirmation if it appears
    await this.handleProceedConfirmation();

    console.log(`${mode === 'add' ? 'Added' : 'Edited'} ${benefitType} benefit successfully`);
  }

  async navigateToBenefits(): Promise<void> {
    console.log('Navigating to Benefits section...');
    await this.benefitsPage.navigateToBenefits();
    console.log('Navigated to Benefits section');
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private getPayerNameForEnv(payerType: string, benefitType: BenefitType): string {
    const env = (process.env.TEST_ENV || 'qa').toLowerCase();
    const tenant = (process.env.TENANT || 'cth').toLowerCase();

    return PAYER_NAMES[benefitType]?.[env]?.[tenant]?.[payerType as PayerType]
      || PAYER_NAMES['Hospice']['qa']['cth']['Medicare']!;
  }

  private async fillDateField(selectorKey: string, date: string): Promise<void> {
    const selector = this.benefitsPage.getSelector(selectorKey as any);
    await this.page.locator(selector).click();
    await this.page.waitForTimeout(500);
    await this.selectDateFromPicker(date);
  }

  private async fillIndexedDateField(selectorKey: string, index: number, date: string): Promise<void> {
    const selectorMap: Record<string, (i: number) => string> = {
      subscriberEffectiveDate: (i) => `[data-cy="date-subscriber-effective-date-${i}"]`,
      subscriberExpiredDate: (i) => `[data-cy="date-subscriber-expired-date-${i}"]`,
    };
    const selector = selectorMap[selectorKey](index);
    await this.page.locator(selector).click();
    await this.page.waitForTimeout(500);
    await this.selectDateFromPicker(date);
  }

  private async selectDateFromPicker(dateString: string): Promise<void> {
    if (!dateString || !dateString.includes('/')) {
      console.log(`Skipping invalid date: ${dateString}`);
      return;
    }

    const [month, day, year] = dateString.split('/');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[parseInt(month, 10) - 1];
    const dayWithoutZero = parseInt(day, 10).toString();

    await this.page.locator('ngb-datepicker-navigation-select select').last().selectOption(year);
    await this.page.waitForTimeout(300);
    await this.page.locator('ngb-datepicker-navigation-select select').first().selectOption(monthName);
    await this.page.waitForTimeout(300);
    await this.page.locator('.ngb-dp-day .btn-light:not(.text-muted)')
      .filter({ hasText: new RegExp(`^${dayWithoutZero}$`) })
      .click({ force: true });
    await this.page.waitForTimeout(500);

    try {
      await this.page.locator('ngb-datepicker').waitFor({ state: 'hidden', timeout: 3000 });
    } catch {
      // Datepicker may still be visible, continue
    }
  }

  private async handleProceedConfirmation(): Promise<void> {
    try {
      const proceedButton = this.page.locator('button:has-text("Proceed")');
      if (await proceedButton.isVisible({ timeout: 2000 })) {
        await proceedButton.click();
        await this.page.waitForTimeout(1000);
      }
    } catch {
      // Proceed button not present, continue
    }

    try {
      const ionAlert = this.page.locator('ion-alert');
      if (await ionAlert.isVisible({ timeout: 2000 })) {
        console.log('Found ion-alert dialog, dismissing...');
        const alertButton = ionAlert.locator('button').first();
        if (await alertButton.isVisible({ timeout: 1000 })) {
          await alertButton.click();
          console.log('Dismissed ion-alert dialog');
          await this.page.waitForTimeout(1000);
        }
      }
    } catch {
      // No ion-alert present, continue
    }
  }

  // ============================================
  // Verification Methods
  // ============================================

  async benefitExists(payerName: string): Promise<boolean> {
    return await this.page.locator(`text=${payerName}`).isVisible();
  }

  async getBenefitCount(): Promise<number> {
    return await this.page.locator('[data-cy^="benefit-row-"]').count();
  }

  async waitForSuccessToast(timeout: number = 5000): Promise<void> {
    await this.benefitsPage.waitForSuccessToast(timeout);
  }

  async hasErrorToast(): Promise<boolean> {
    return await this.benefitsPage.hasErrorToast();
  }
}
