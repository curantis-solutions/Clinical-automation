import { Page } from '@playwright/test';
import {
  LOCType,
  LOCOrderFormData,
  LOCVoidData,
  OrderApprovalType,
} from '../types/loc.types';
import { LOCPage } from '../pages_ionic8/loc.page';
import { DateHelper } from '../utils/date-helper';
import { TestDataManager } from '../utils/test-data-manager';
import { CARE_LOCATIONS } from '../fixtures/loc-fixtures';
import { CredentialManager } from '../utils/credential-manager';

/**
 * LOC Workflow (Ionic 8)
 * Handles add/void operations for Level of Care orders.
 */
export class LOCWorkflow {
  private readonly locPage: LOCPage;

  constructor(private page: Page) {
    this.locPage = new LOCPage(page);
  }

  /**
   * Resolve the care location (facility name) for a given care location type.
   */
  static getCareLocation(careLocationType: string): string | undefined {
    const qCode = careLocationType.split('-')[0];
    const env = CredentialManager.getEnvironment().toLowerCase();
    const tenant = TestDataManager.getTenant();

    const value = CARE_LOCATIONS[qCode]?.[env]?.[tenant];
    if (value) {
      return value;
    }

    if (qCode === 'Q5004') {
      return TestDataManager.getFacilitySNF();
    }
    if (qCode === 'Q5002') {
      return TestDataManager.getFacilityALF();
    }

    return undefined;
  }

  // ============================================
  // Public: Add LOC Order
  // ============================================

  async addLOCOrder(locType: LOCType, customData?: Partial<LOCOrderFormData>): Promise<void> {
    console.log(`\nAdding ${locType} LOC order...`);

    const defaults = this.getDefaults(locType);
    const data = { ...defaults, ...customData } as LOCOrderFormData;

    // Navigate to Profile tab first, then Order Entry
    await this.locPage.navigateToProfile();
    await this.locPage.navigateToOrderEntry();

    // Click Add Order
    await this.locPage.clickAddOrder();

    // Select Order Type → "Level of Care"
    await this.locPage.selectOrderType('Level of Care');

    // Fill the LOC form
    await this.fillLOCForm(data);

    // Verify the order appears in the grid
    const found = await this.locPage.verifyOrderInGrid(locType);
    if (!found) {
      throw new Error(`${locType} order not found in grid after submit`);
    }

    // Exit Order Management
    await this.locPage.exitOrderManagement();

    console.log(`${locType} LOC order added successfully\n`);
  }

  // ============================================
  // Public: Void and Recreate LOC Order
  // ============================================

  async voidAndRecreateLOCOrder(
    voidData: LOCVoidData,
    newLocType: LOCType,
    customData?: Partial<LOCOrderFormData>
  ): Promise<void> {
    console.log(`\nVoiding existing LOC and recreating as ${newLocType}...`);

    const defaults = this.getDefaults(newLocType);
    const data = { ...defaults, ...customData } as LOCOrderFormData;

    // Navigate to Profile tab first, then Order Entry
    await this.locPage.navigateToProfile();
    await this.locPage.navigateToOrderEntry();

    // Find the active (non-voided) LOC order and void it
    const activeIndex = await this.locPage.findActiveLOCOrderIndex();
    await this.locPage.openVoidOrder(activeIndex);
    if (voidData.voidDate) {
      await this.locPage.fillVoidDate(voidData.voidDate);
    }
    await this.locPage.fillVoidReason(voidData.voidReason);
    await this.locPage.submitVoid();

    // App auto-opens Add Order modal with Order Type = "Level of Care" (locked/disabled)
    await this.page.waitForTimeout(3000);

    // Fill the new LOC form
    await this.fillLOCForm(data);

    // Exit Order Management
    await this.locPage.exitOrderManagement();

    console.log(`Voided and recreated LOC as ${newLocType} successfully\n`);
  }

  // ============================================
  // Private: Fill LOC Form
  // ============================================

  private async fillLOCForm(data: LOCOrderFormData): Promise<void> {
    // 1. Select Level of Care type
    await this.locPage.selectLevelOfCare(data.locType);

    // 2. Handle type-specific fields
    switch (data.locType) {
      case 'Routine Home Care':
        break;
      case 'Respite Care':
        if (data.reasonForRespite) {
          await this.locPage.fillReasonForRespite(data.reasonForRespite);
        }
        break;
      case 'General In-Patient':
        if (data.gipReasons && data.gipReasons.length > 0) {
          await this.locPage.selectGIPReasons(data.gipReasons);
        }
        break;
      case 'Continuous Care':
        if (data.symptoms && data.symptoms.length > 0) {
          await this.locPage.selectSymptoms(data.symptoms);
        }
        break;
    }

    // 3. Select care location type and facility
    await this.selectCareLocation(data);

    // 4. Set start date
    if (data.startDate) {
      await this.locPage.setStartDate(data.startDate);
      await this.page.waitForTimeout(5000);
    }

    // 5. Handle ordering provider and approval
    const approvalType = data.approvalType || (TestDataManager.isPhysician() ? 'MD' : 'Verbal');
    if (approvalType === 'MD') {
      await this.locPage.selectApprovalType('MD');
    } else {
      const provider = data.orderingProvider || TestDataManager.getPhysician();
      await this.locPage.searchAndSelectOrderingProvider(provider);
      await this.locPage.selectApprovalType(approvalType);
    }

    // 6. Fill optional provider notes
    if (data.providerNotes) {
      await this.locPage.fillProviderNotes(data.providerNotes);
    }

    // 7. Submit
    await this.locPage.clickSubmit();
  }

  private async selectCareLocation(data: LOCOrderFormData): Promise<void> {
    const DEFAULT_CLT: Record<LOCType, string> = {
      'Routine Home Care': 'Home',
      'Respite Care': 'Q5004',
      'General In-Patient': 'Q5009',
      'Continuous Care': 'Q5002',
    };

    const clt = data.careLocationType || DEFAULT_CLT[data.locType];
    await this.locPage.selectCareLocationType(clt);

    if (clt !== 'Home') {
      const facility = data.careLocation || LOCWorkflow.getCareLocation(clt);
      if (facility) {
        await this.locPage.searchAndSelectCareLocation(facility);
      }
    }
  }

  // ============================================
  // Private: Defaults
  // ============================================

  private getDefaults(locType: LOCType): LOCOrderFormData {
    const today = DateHelper.getTodaysDate();

    switch (locType) {
      case 'Routine Home Care':
        return {
          locType: 'Routine Home Care',
          careLocationType: 'Home',
          startDate: today,
          approvalType: (TestDataManager.isPhysician() ? 'MD' : 'Verbal') as OrderApprovalType,
        };

      case 'Respite Care':
        return {
          locType: 'Respite Care',
          reasonForRespite: 'Caregiver respite',
          careLocationType: 'Q5004',
          startDate: today,
          approvalType: (TestDataManager.isPhysician() ? 'MD' : 'Verbal') as OrderApprovalType,
        };

      case 'General In-Patient':
        return {
          locType: 'General In-Patient',
          gipReasons: ['Pain'],
          careLocationType: 'Q5009',
          startDate: today,
          approvalType: (TestDataManager.isPhysician() ? 'MD' : 'Verbal') as OrderApprovalType,
        };

      case 'Continuous Care':
        return {
          locType: 'Continuous Care',
          symptoms: ['Agitation'],
          careLocationType: 'Q5002',
          startDate: today,
          approvalType: (TestDataManager.isPhysician() ? 'MD' : 'Verbal') as OrderApprovalType,
        };
    }
  }
}
