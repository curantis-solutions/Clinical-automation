import { Page } from '@playwright/test';
import {
  LOCType,
  LOCOrderFormData,
  LOCVoidData,
  OrderApprovalType,
} from '../types/loc.types';
import { LOCPage } from '../pages/loc.page';
import { DateHelper } from '../utils/date-helper';
import { TestDataManager } from '../utils/test-data-manager';
import { CARE_LOCATIONS } from '../fixtures/loc-fixtures';
import { CredentialManager } from '../utils/credential-manager';

/**
 * LOC Workflow
 * Handles add/void operations for Level of Care orders.
 *
 * LOC orders have NO edit/amend mode. To change an LOC, you void the existing
 * order and create a new one. The app auto-prompts for a new LOC after voiding.
 *
 * @example
 * // Add a Routine Home Care order with defaults
 * await locWorkflow.addLOCOrder('Routine Home Care');
 *
 * @example
 * // Add a Respite Care order with custom data
 * await locWorkflow.addLOCOrder('Respite Care', {
 *   locType: 'Respite Care',
 *   reasonForRespite: 'Family vacation',
 *   careLocationType: 'Q5004-Skilled Nursing',
 *   careLocation: 'My SNF Facility',
 * });
 *
 * @example
 * // Void existing LOC and create a replacement
 * await locWorkflow.voidAndRecreateLOCOrder(
 *   { voidDate: '02/10/2026', voidReason: 'Patient condition changed' },
 *   'General In-Patient',
 *   { locType: 'General In-Patient', gipReasons: ['Pain'], careLocation: 'My Facility' }
 * );
 */
export class LOCWorkflow {
  private readonly locPage: LOCPage;

  constructor(private page: Page) {
    this.locPage = new LOCPage(page);
  }

  /**
   * Resolve the care location (facility name) for a given care location type.
   * Reads TEST_ENV and TENANT from environment variables.
   *
   * Fallback chain:
   *   1. CARE_LOCATIONS[qCode][env][tenant]
   *   2. TestDataManager.getFacilitySNF() for Q5004
   *   3. TestDataManager.getFacilityALF() for Q5002
   *   4. undefined (caller should skip care location selection)
   *
   * @param careLocationType - Q-code string, e.g. 'Q5004' or 'Q5004-Skilled Nursing'
   * @returns Facility name or undefined if not available
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

  /**
   * Add a new LOC order from scratch.
   * Navigates to Order Entry, opens the form, fills all fields, and submits.
   *
   * @param locType - Which LOC type to create
   * @param customData - Optional custom form data (merged with defaults)
   */
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

    // Wait for "Creating order..." dialog to appear and disappear
    try {
      const creatingDialog = this.page.getByText('Creating order');
      await creatingDialog.waitFor({ state: 'visible', timeout: 5000 });
      await creatingDialog.waitFor({ state: 'hidden', timeout: 30000 });
      console.log('Order creation completed');
    } catch {
      // Dialog may have already disappeared
      await this.page.waitForTimeout(5000);
    }

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

  /**
   * Void an existing LOC order and create a replacement.
   * After voiding, the app auto-opens the Add Order modal for a new LOC.
   *
   * @param voidData - Void date and reason
   * @param newLocType - LOC type for the replacement order
   * @param customData - Optional custom form data for the new order
   */
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
    // Do NOT call selectOrderType() — it's pre-selected and disabled in this flow
    await this.page.waitForTimeout(3000);

    // Fill the new LOC form (same selectors work inside the modal)
    await this.fillLOCForm(data);

    // Exit Order Management
    await this.locPage.exitOrderManagement();

    console.log(`Voided and recreated LOC as ${newLocType} successfully\n`);
  }

  // ============================================
  // Private: Fill LOC Form
  // ============================================

  /**
   * Fill the LOC form with the given data.
   * Handles LOC type selection, conditional fields, date, provider, and approval.
   */
  private async fillLOCForm(data: LOCOrderFormData): Promise<void> {
    // 1. Select Level of Care type
    await this.locPage.selectLevelOfCare(data.locType);

    // 2. Handle type-specific fields (reasons, symptoms, etc.)
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

    // 3. Select care location type and facility (common to all LOC types)
    await this.selectCareLocation(data);

    // 4. Set start date
    if (data.startDate) {
      await this.locPage.setStartDate(data.startDate);
      await this.page.waitForTimeout(5000);
    }

    // 5. Handle ordering provider and approval
    // Auto-detect approval type: MD users get e-sign, non-MDs get Verbal + provider search
    const approvalType = data.approvalType || (TestDataManager.isPhysician() ? 'MD' : 'Verbal');
    if (approvalType === 'MD') {
      // MD: provider auto-filled, just check e-sign
      await this.locPage.selectApprovalType('MD');
    } else {
      // RN: search and select provider, then choose approval type
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

  /**
   * Select care location type and facility.
   * Resolves the facility name via CARE_LOCATIONS fixture or TestDataManager fallback.
   * Skips facility selection for 'Home' care location type.
   */
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

  /**
   * Build default form data based on LOC type
   */
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
