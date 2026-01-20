import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { selectDateFormatted, getTodaysDate } from '../utils/date-helper';
import { executeWithScreenshot } from '../utils/error-handler';

/**
 * Benefits Page Object
 * Handles patient benefits/payer management
 */

export interface BenefitData {
  payerLevel: string;
  payerType: string;
  subscriberId?: string;
  policyNo?: string;
  hisMedicaidNumber?: string;
  hisPending?: boolean;
  payerEffectiveDate: string;
  planNameIndex?: number;
  relationshipToPatient?: string;
  groupNumber?: string;
  benefitElectionDate?: string;
  admitBenefitPeriod: number | string;
  benefitPeriodStartDate: string;
  highDaysUsed?: number | string;
}

export class BenefitsPage extends BasePage {
  private readonly selectors = {
    // Navigation
    benefitsNavBarItem: '[data-cy="btn-nav-bar-item-benefits"]',

    // Add Payer
    addPayer: '[data-cy="btn-add-payer"]',

    // Payer Selection
    payerLevel: '[data-cy="select-payer-level-list"]',
    payerType: '[data-cy="select-payer-type-list"]',
    payerName: '[data-cy="select-payer-name"]',
    enterPayerName: '[data-cy="input-search-input"]',
    payerNameOption: (index: number) => `[data-cy='input-filtered-options-${index}']`,

    // Payer IDs
    subscriberId: '#subscriberId-0 > [data-cy="input-susbscriber-id-0"]',
    policyNo: '#policyNumberNoMedicare-0 > [data-cy="input-policy-number-0"]',
    hisMedicareNumber: 'input[data-cy="input-medicare-number"]',
    hisMedicaidNumber: 'input[data-cy="input-medicaid-number"]',
    hisPending: '[data-cy="checkbox-medicaid-pending"]',

    // Dates
    payerEffectiveDate: '[data-cy="date-payer-effective-date"]',
    benefitElectionDate: '[data-cy="date-benefit-election-date"]',
    benefitPeriodStartDate: '[data-cy="date-admit-benefit-period-start-date"]',

    // Plan Details
    planNameAddress: '[data-cy="select-plan-name"] > .ng-select-container > .ng-value-container > .ng-input > input',
    patientsEligibilityVerified: '[data-cy="checkbox-patient-eligivility"]',
    relationshipToPatient: '[data-cy="select-relationships"]',
    groupNumber: 'ion-input[data-cy="input-group-number"]',

    // Benefit Period
    admitBenefitPeriod: 'input[data-cy="input-admit-benefit-period"]',
    highDaysUsed: 'input[data-cy="input-routine-home-care-high-days-used"]',

    // Buttons
    cancelBenefit: '[data-cy="btn-cancel"]',
    saveBenefit: '[data-cy="btn-save"]',
    okAlertButton: '.alert-button-default',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Benefits tab
   */
  async navigateToBenefitsTab(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.waitForElement(this.selectors.benefitsNavBarItem);
    await this.page.locator(this.selectors.benefitsNavBarItem).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Navigated to Benefits tab');
  }

  /**
   * Click Add Payer button
   */
  async clickAddPayer(): Promise<void> {
    await this.page.locator(this.selectors.addPayer).click();
    await this.page.waitForTimeout(1000);
    console.log('✅ Clicked Add Payer button');
  }

  /**
   * Select option from ng-select dropdown
   * @param selector - Dropdown selector
   * @param optionText - Text of the option to select
   */
  private async selectNgOption(selector: string, optionText: string): Promise<void> {
    console.log(`📋 Selecting option: ${optionText}`);

    // Scroll into view and click the dropdown to open it
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);

    // Click to open dropdown
    await this.page.locator(selector).click({ force: true });
    await this.page.waitForTimeout(1500);

    // Wait for ng-dropdown-panel to be visible
    try {
      await this.page.waitForSelector('ng-dropdown-panel', { state: 'visible', timeout: 5000 });
      console.log('✅ Dropdown panel is visible');
    } catch (error) {
      console.log('⚠️ Dropdown panel not visible, trying anyway...');
    }

    // Primary selector - look for ng-option-label with exact text
    try {
      const optionCount = await this.page.locator('ng-dropdown-panel .ng-option-label').count();
      console.log(`📋 Found ${optionCount} option labels in dropdown`);

      if (optionCount > 0) {
        // Log all available options for debugging
        const allOptions = await this.page.locator('ng-dropdown-panel .ng-option-label').allTextContents();
        console.log(`📋 Available options: ${allOptions.join(', ')}`);

        // Click the option with exact text match
        await this.page.locator('ng-dropdown-panel .ng-option-label')
          .filter({ hasText: optionText })
          .first()
          .click({ force: true });

        await this.page.waitForTimeout(1000);
        console.log(`✅ Selected option: ${optionText}`);
        return;
      }
    } catch (error) {
      console.log(`⚠️ Failed with ng-option-label: ${error.message}`);
    }

    // Fallback: Try clicking parent ng-option element
    try {
      await this.page.locator('ng-dropdown-panel .ng-option')
        .filter({ hasText: optionText })
        .first()
        .click({ force: true });

      await this.page.waitForTimeout(1000);
      console.log(`✅ Selected option via ng-option: ${optionText}`);
      return;
    } catch (error) {
      console.log(`⚠️ Failed with ng-option: ${error.message}`);
    }

    throw new Error(`Could not find or click dropdown option: ${optionText}`);
  }

  /**
   * Select option by index from ng-select dropdown
   * @param selector - Dropdown selector
   * @param index - Index of the option to select
   */
  private async selectNgOptionByIndex(selector: string, index: number): Promise<void> {
    await this.page.locator(selector).click({ force: true });
    await this.page.waitForTimeout(1000);

    // Wait for dropdown panel
    await this.page.waitForSelector('ng-dropdown-panel', { state: 'visible', timeout: 5000 });

    await this.page.locator('ng-dropdown-panel .ng-option').nth(index).click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Generate random group number
   */
  private generateGroupNumber(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Complete benefits form with provided data
   * @param benefitData - Benefit information
   */
  async completeBenefitsForm(benefitData: BenefitData): Promise<void> {
    console.log('\n💳 Completing Benefits form...');

    await executeWithScreenshot(this.page, 'Navigate to Benefits tab', async () => {
      await this.navigateToBenefitsTab();
    });

    await executeWithScreenshot(this.page, 'Click Add Payer button', async () => {
      await this.clickAddPayer();
    });

    await executeWithScreenshot(this.page, `Select Payer Level: ${benefitData.payerLevel}`, async () => {
      await this.selectNgOption(this.selectors.payerLevel, benefitData.payerLevel);
    });

    await executeWithScreenshot(this.page, `Select Payer Type: ${benefitData.payerType}`, async () => {
      await this.selectNgOption(this.selectors.payerType, benefitData.payerType);
    });

    await executeWithScreenshot(this.page, 'Search and select Payer Name', async () => {
      await this.page.locator(this.selectors.payerName).click();
      await this.page.locator(this.selectors.enterPayerName).fill(benefitData.payerType);
      await this.page.waitForTimeout(1000);
      await this.page.locator(this.selectors.payerNameOption(0)).click();
    });

    await executeWithScreenshot(this.page, 'Fill Subscriber ID or Policy Number', async () => {
      if (benefitData.payerType === 'Medicare') {
        const subscriberId = benefitData.subscriberId || '1gg1gg1gg11';
        await this.page.locator(this.selectors.subscriberId).click();
        await this.page.locator(this.selectors.subscriberId).fill(subscriberId);
      } else {
        const policyNo = benefitData.policyNo || '123455678P';
        await this.page.locator(this.selectors.policyNo).click();
        await this.page.locator(this.selectors.policyNo).fill(policyNo);
      }
    });

    await executeWithScreenshot(this.page, 'Set Payer Effective Date', async () => {
      await this.page.locator(this.selectors.payerEffectiveDate).click();
      await this.page.waitForTimeout(500);
      await selectDateFormatted(this.page, benefitData.payerEffectiveDate);
    });

    await executeWithScreenshot(this.page, 'Select Plan Name/Address', async () => {
      if (benefitData.planNameIndex !== undefined) {
        await this.selectNgOptionByIndex(this.selectors.planNameAddress, benefitData.planNameIndex);
      } else {
        await this.selectNgOptionByIndex(this.selectors.planNameAddress, 2);
      }
    });

    await executeWithScreenshot(this.page, 'Check Patient Eligibility Verified', async () => {
      await this.page.locator(this.selectors.patientsEligibilityVerified).click();
      await this.page.waitForTimeout(1000);
    });

    await executeWithScreenshot(this.page, `Select Relationship: ${benefitData.relationshipToPatient || 'Self'}`, async () => {
      const relationship = benefitData.relationshipToPatient || 'Self';
      await this.selectNgOption(this.selectors.relationshipToPatient, relationship);
    });

    await executeWithScreenshot(this.page, 'Fill Group Number', async () => {
      const groupNumber = benefitData.groupNumber || this.generateGroupNumber();
      await this.page.locator(this.selectors.groupNumber).locator('input').fill(groupNumber);
    });

    await executeWithScreenshot(this.page, 'Set Benefit Election Date', async () => {
      const electionDate = benefitData.benefitElectionDate || getTodaysDate();
      await this.page.locator(this.selectors.benefitElectionDate).click();
      await this.page.waitForTimeout(500);
      await selectDateFormatted(this.page, benefitData.benefitPeriodStartDate);
      // await this.page.locator(this.selectors.benefitElectionDate)
      //   .locator('input')
      //   .fill(electionDate, { force: true });
      // await this.page.waitForTimeout(500);
    });

    await executeWithScreenshot(this.page, 'Fill Admit Benefit Period', async () => {
      await this.page.locator(this.selectors.admitBenefitPeriod).fill(String(benefitData.admitBenefitPeriod));
    });

    await executeWithScreenshot(this.page, 'Set Benefit Period Start Date', async () => {
      await this.page.locator(this.selectors.benefitPeriodStartDate).click();
      await this.page.waitForTimeout(500);
      await selectDateFormatted(this.page, benefitData.benefitPeriodStartDate);
    });

    await executeWithScreenshot(this.page, 'Fill High Days Used', async () => {
      const highDays = benefitData.highDaysUsed !== undefined ? String(benefitData.highDaysUsed) : '0';
      await this.page.locator(this.selectors.highDaysUsed).fill(highDays);
    });

    await executeWithScreenshot(this.page, 'Save Benefit', async () => {
      await this.page.locator(this.selectors.saveBenefit).click();
      await this.page.waitForTimeout(2000);
    });

    // Handle alert if present
    try {
      await this.page.locator(this.selectors.okAlertButton).click({ timeout: 3000 });
    } catch {
      // No alert present, continue
    }

    console.log('✅ Benefits form completed successfully\n');
  }
}
