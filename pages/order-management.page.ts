import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { selectDateFormatted } from '../utils/date-helper';

/**
 * Order Management Page Object
 * Handles Order Entry functionality (LOC, VF, Medication, etc.)
 */

export interface LOCOrderData {
  levelOfCare: string;
  careLocationType: string;
  startDate: string;
  role: 'MD' | 'RN' | 'NP' | 'Case Manager';
  physician: string;
}

export interface LOCOrderByTypeData {
  role: 'MD' | 'Registered Nurse (RN)' | 'NP' | 'Case Manager';
  physician: string;
  locType: 'Routine Home Care' | 'Respite Care' | 'General In-Patient' | 'Continuous Care';
  facility?: string; // Required for Respite Care, GIP, and Continuous Care
  startDate: string;
}

export class OrderManagementPage extends BasePage {
  private readonly selectors = {
    // Order Entry
    orderEntryBtn: '[class*="orderEntryBtn"]',
    addOrder: '[data-cy="btn-create-new-order-for-patient"]',
    orderType: '[data-cy="select-order-type-dropdown"]',

    // Level of Care
    levelOfCareId: '[data-cy="select-level-of-care"]',
    careLocationType: '[data-cy="select-care-location-type"]',
    careLocation: '[data-cy="select-care-location"] input',

    // Respite Care
    respiteReason: '.input > [data-cy="input-reason-for-respite"]',

    // General In-Patient
    gipReasonPain: '[data-cy="checkbox-pain"]',

    // Continuous Care
    symptoms: '[data-cy="select-symptoms"]',
    agitationsymptom: '[data-cy="symptoms-option-agitation"]',
    closeSymptomDDL: '[data-cy="select-symptoms"] [class="ng-arrow"]',

    // Order Details
    startDt: '[data-cy="date-order-start-date"]',
    orderingProvider: '[data-cy="select-ordering-provider"] input',
    searchProvider: '.ng-input input',

    // Order Approval
    verbal: '[data-cy="radio-verbal"]',
    readBack: '[data-cy="checkbox-e-sign-verification"]',
    written: '[data-cy="radio-written"]',

    // Buttons
    orderSubmit: '.button-md-success > .button-inner',
    exitOrderMgmt: '[data-cy="btn-exit-order-entry-page"]',
    cancelOrder: '[data-cy="btn-cancel-order"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Order Entry
   */
  async navigateToOrderEntry(): Promise<void> {
    await this.page.locator(this.selectors.orderEntryBtn).scrollIntoViewIfNeeded();
    await this.page.locator(this.selectors.orderEntryBtn).click();
    await this.page.waitForTimeout(3000);
    console.log('✅ Navigated to Order Entry');
  }

  /**
   * Click Add Order button
   */
  async clickAddOrder(): Promise<void> {
    await this.page.locator(this.selectors.addOrder).click();
    await this.page.waitForTimeout(2000);
    console.log('✅ Clicked Add Order');
  }

  /**
   * Select order type from dropdown
   * @param orderType - Type of order (e.g., "Level of Care", "Medication", "Visit Frequency")
   */
  async selectOrderType(orderType: string): Promise<void> {
    await this.page.locator(this.selectors.orderType).click();
    await this.page.waitForTimeout(2000);

    // Find and click the option
    await this.page.locator('[class="ng-option"] span')
      .filter({ hasText: orderType })
      .click();
    await this.page.waitForTimeout(2000);
    console.log(`✅ Selected order type: ${orderType}`);
  }

  /**
   * Select Level of Care
   * @param locType - Type of LOC (e.g., "Routine Home Care", "General In-Patient", "Respite Care")
   */
  async selectLevelOfCare(locType: string): Promise<void> {
    await this.page.locator(this.selectors.levelOfCareId).click();
    await this.page.waitForTimeout(2000);

    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: locType })
      .click();
    await this.page.waitForTimeout(2000);
    console.log(`✅ Selected Level of Care: ${locType}`);
  }

  /**
   * Select Care Location Type
   * @param locationType - Type of location (e.g., "Home", "Q5004", "Q5009")
   */
  async selectCareLocationType(locationType: string): Promise<void> {
    await this.page.locator(this.selectors.careLocationType).click();
    await this.page.waitForTimeout(2000);

    await this.page.locator('[class*="ng-option"] span')
      .filter({ hasText: locationType })
      .click();
    await this.page.waitForTimeout(2000);
    console.log(`✅ Selected Care Location Type: ${locationType}`);
  }

  /**
   * Set order start date
   * @param dateString - Date in MM/DD/YYYY format
   */
  async setStartDate(dateString: string): Promise<void> {
    await this.page.locator(this.selectors.startDt).click();
    await this.page.waitForTimeout(2000);
    await selectDateFormatted(this.page, dateString);
    console.log(`✅ Set start date: ${dateString}`);
  }

  /**
   * Select ordering provider based on role
   * @param role - Provider role (MD, RN, NP, Case Manager)
   * @param physicianName - Name of the physician
   */
  async selectOrderingProvider(role: string, physicianName: string): Promise<void> {
    switch (role) {
      case 'Registered Nurse (RN)':
      case 'Case Manager':
      case 'NP':
        // For RN/NP/Case Manager - need to search and select physician
        await this.page.locator(this.selectors.orderingProvider).click();
        await this.page.waitForTimeout(1000);
        await this.page.locator(this.selectors.orderingProvider).fill(physicianName);
        await this.page.waitForTimeout(2000);

        // Click the first option in the dropdown
        await this.page.locator('.ng-option-label').first().click();
        await this.page.waitForTimeout(1000);

        // Select Verbal order
        await this.page.locator(this.selectors.verbal).click();
        await this.page.waitForTimeout(1000);
        console.log(`✅ Selected physician: ${physicianName} (Verbal order)`);
        break;

      case 'MD':
        // For MD - just select Read Back
        await this.page.locator(this.selectors.readBack).click();
        await this.page.waitForTimeout(2000);
        console.log(`✅ Selected Read Back (MD order)`);
        break;

      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }

  /**
   * Submit order
   */
  async submitOrder(): Promise<void> {
    await this.page.locator(this.selectors.orderSubmit).click({ force: true });
    await this.page.waitForTimeout(10000);
    console.log('✅ Order submitted successfully');
  }

  /**
   * Exit Order Management
   */
  async exitOrderManagement(): Promise<void> {
    await this.page.waitForTimeout(1000);
    const exitButton = this.page.locator(this.selectors.exitOrderMgmt);

    try {
      await exitButton.waitFor({ state: 'visible', timeout: 5000 });
      await exitButton.click();
      await this.page.waitForTimeout(5000); // Wait for navigation
      console.log('✅ Exited Order Management');
    } catch (error) {
      console.log('⚠️ Exit button not found, may already be on patient page');
    }
  }

  /**
   * Add Order Entry Level of Care (OE LOC)
   * This is the main method that combines all steps
   * @param orderData - LOC order data
   */
  async addOELOC(orderData: LOCOrderData): Promise<void> {
    console.log('\n📋 Adding Order Entry - Level of Care...');

    // Navigate to Order Entry
    await this.navigateToOrderEntry();

    // Click Add Order
    await this.clickAddOrder();

    // Select Order Type: Level of Care
    await this.selectOrderType('Level of Care');

    // Select Level of Care type (default: Routine Home Care)
    await this.selectLevelOfCare(orderData.levelOfCare || 'Routine Home Care');

    // Select Care Location Type (default: Home)
    await this.selectCareLocationType(orderData.careLocationType || 'Home');

    // Set start date
    await this.setStartDate(orderData.startDate);

    // Select ordering provider based on role
    await this.selectOrderingProvider(orderData.role, orderData.physician);

    // Submit order
    await this.submitOrder();

    // Exit Order Management
    await this.exitOrderManagement();

    console.log('✅ Order Entry LOC added successfully\n');
  }

  /**
   * Add Order Entry Level of Care by Type (OE LOC)
   * Handles different LOC types with specific requirements
   * @param orderData - LOC order data with type-specific fields
   */
  async addOELOCbytype(orderData: LOCOrderByTypeData): Promise<void> {
    console.log(`\n📋 Adding Order Entry - ${orderData.locType}...`);

    await this.page.waitForTimeout(5000);

    // Navigate to Order Entry
    await this.navigateToOrderEntry();

    // Click Add Order
    await this.clickAddOrder();

    // Select Order Type: Level of Care
    await this.selectOrderType('Level of Care');

    // Select Level of Care type
    await this.selectLevelOfCare(orderData.locType);

    // Handle type-specific fields
    switch (orderData.locType) {
      case 'Routine Home Care': {
        // Select Home as care location type
        await this.selectCareLocationType('Home');
        break;
      }

      case 'Respite Care': {
        // Fill respite reason
        await this.page.locator(this.selectors.respiteReason).click();
        await this.page.locator(this.selectors.respiteReason).fill('vacation');
        await this.page.waitForTimeout(1000);

        // Select Q5004 as care location type
        await this.selectCareLocationType('Q5004');

        // Select facility
        if (!orderData.facility) {
          throw new Error('Facility is required for Respite Care');
        }
        await this.page.locator(this.selectors.careLocation).click();
        await this.page.locator(this.selectors.careLocation).fill(orderData.facility);
        await this.page.waitForTimeout(2000);

        // Click the facility option
        await this.page.locator('[class*="ng-option"] span')
          .filter({ hasText: orderData.facility })
          .click();
        await this.page.waitForTimeout(2000);
        break;
      }

      case 'General In-Patient': {
        // Check Pain reason
        await this.page.locator(this.selectors.gipReasonPain).click();
        await this.page.waitForTimeout(1000);

        // Select Q5009 as care location type
        await this.selectCareLocationType('Q5009');

        // Select facility
        if (!orderData.facility) {
          throw new Error('Facility is required for General In-Patient');
        }
        await this.page.locator(this.selectors.careLocation).click();
        await this.page.locator(this.selectors.careLocation).fill(orderData.facility);
        await this.page.waitForTimeout(2000);

        // Click the facility option
        await this.page.locator('[class*="ng-option"] span')
          .filter({ hasText: orderData.facility })
          .click();
        await this.page.waitForTimeout(2000);
        break;
      }

      case 'Continuous Care': {
        // Select symptoms
        await this.page.locator(this.selectors.symptoms).click();
        await this.page.waitForTimeout(1000);

        // Select agitation symptom
        await this.page.locator(this.selectors.agitationsymptom).click();
        await this.page.waitForTimeout(1000);

        // Close symptom dropdown
        await this.page.locator(this.selectors.closeSymptomDDL).click();
        await this.page.waitForTimeout(1000);

        // Select Q5002 as care location type
        await this.selectCareLocationType('Q5002');

        // Select facility
        if (!orderData.facility) {
          throw new Error('Facility is required for Continuous Care');
        }
        await this.page.locator(this.selectors.careLocation).click();
        await this.page.locator(this.selectors.careLocation).fill(orderData.facility);
        await this.page.waitForTimeout(2000);

        // Click the facility option
        await this.page.locator('[class*="ng-option"] span')
          .filter({ hasText: orderData.facility })
          .click();
        await this.page.waitForTimeout(2000);
        break;
      }

      default:
        throw new Error(`Invalid LOC type: ${orderData.locType}`);
    }

    // Set start date
    await this.setStartDate(orderData.startDate);
    await this.page.waitForTimeout(5000);

    // Select ordering provider based on role
    switch (orderData.role) {
      case 'Registered Nurse (RN)':
      case 'Case Manager':
      case 'NP': {
        await this.page.locator(this.selectors.orderingProvider).click();
        await this.page.waitForTimeout(1000);
        await this.page.locator(this.selectors.orderingProvider).fill(orderData.physician);
        await this.page.waitForTimeout(2000);

        // Click the first option in the dropdown
        await this.page.locator('.ng-option-label').first().click();
        await this.page.waitForTimeout(1000);

        // Select Verbal order
        await this.page.locator(this.selectors.verbal).click();
        await this.page.waitForTimeout(1000);
        console.log(`✅ Selected physician: ${orderData.physician} (Verbal order)`);
        break;
      }

      case 'MD': {
        // For MD - just select Read Back
        await this.page.locator(this.selectors.readBack).click();
        await this.page.waitForTimeout(2000);
        console.log(`✅ Selected Read Back (MD order)`);
        break;
      }

      default:
        throw new Error(`Invalid role: ${orderData.role}`);
    }

    // Submit order
    await this.submitOrder();

    // Exit Order Management
    await this.exitOrderManagement();

    console.log(`✅ ${orderData.locType} order added successfully\n`);
  }
}