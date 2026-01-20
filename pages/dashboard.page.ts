import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Dashboard Page Object
 * Handles navigation through the Rubik's Cube module menu
 */
export class DashboardPage extends BasePage {
  // Selectors for dashboard elements
  private readonly selectors = {
    // Rubik's cube icon in the top header bar (3x3 grid icon)
    rubiksCubeIcon: '[data-cy="btn-options-applications"]',

    // Module menu that opens after clicking Rubik's cube
    moduleMenu: [
      '[data-cy="Billing"]',
      '[data-cy="Patient"]',
      '[data-cy]',
      '[role="menu"]',
      '[role="dialog"]',
      '.module-menu',
      'div[class*="MuiPopover"]',
      'div[class*="MuiMenu"]'
    ].join(', '),

    // Generic module item selector using data-cy attribute
    moduleItem: (moduleName: string) => `[data-cy="${moduleName}"]`,

    // Dashboard page indicators
    dashboardTitle: 'h1:has-text("Dashboard"), h2:has-text("Dashboard"), [class*="dashboard-title"]',
    welcomeMessage: 'text=/Welcome back/i',
    onServicePatientList: 'text=/On-Service Patient List/i'
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the dashboard
   */
  async goto(): Promise<void> {
    await this.navigate('/#/dashboard');
    await this.waitForPageLoad();
    console.log('Navigated to dashboard page');
  }

  /**
   * Check if dashboard is displayed
   * @returns true if on dashboard page
   */
  async isDashboardDisplayed(): Promise<boolean> {
    try {
      // Check for any dashboard indicators
      const hasWelcome = await this.isElementVisible(this.selectors.welcomeMessage);
      const hasPatientList = await this.isElementVisible(this.selectors.onServicePatientList);
      return hasWelcome || hasPatientList;
    } catch {
      return false;
    }
  }

  /**
   * Check if Rubik's cube icon is visible
   * @returns true if Rubik's cube icon is visible
   */
  async isRubiksCubeVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.rubiksCubeIcon);
  }

  /**
   * Click the Rubik's cube icon to open module menu
   */
  async clickRubiksCube(): Promise<void> {
    try {
      console.log('Looking for Rubik\'s cube icon...');

      // Wait for the icon to be visible
      await this.waitForElement(this.selectors.rubiksCubeIcon, 10000);

      // Get the locator and click
      const cubeIcon = this.page.locator(this.selectors.rubiksCubeIcon).first();
      await cubeIcon.scrollIntoViewIfNeeded();
      await cubeIcon.click();

      console.log('✅ Clicked Rubik\'s cube icon');

      // Wait for module menu to appear
      await this.page.waitForTimeout(500);

      // Verify menu opened
      const isMenuOpen = await this.isModuleMenuOpen();
      if (!isMenuOpen) {
        console.warn('⚠️ Module menu may not have opened');
      } else {
        console.log('✅ Module menu is open');
      }
    } catch (error) {
      console.error('❌ Failed to click Rubik\'s cube icon:', error);
      throw new Error(`Could not click Rubik's cube icon: ${error}`);
    }
  }

  /**
   * Check if the module menu is open
   * @returns true if module menu is displayed
   */
  async isModuleMenuOpen(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.moduleMenu);
  }

  /**
   * Navigate to a specific module by name
   * @param moduleName - Name of the module to navigate to
   * @example await dashboardPage.navigateToModule('Alerts')
   */
  async navigateToModule(moduleName: string): Promise<void> {
    try {
      console.log(`🎯 Navigating to module: ${moduleName}`);

      // First, click Rubik's cube to open menu
      await this.clickRubiksCube();

      // Wait for menu to be visible
      await this.waitForElement(this.selectors.moduleMenu, 5000);

      // Find and click the module
      const moduleSelector = this.selectors.moduleItem(moduleName);
      await this.waitForElement(moduleSelector, 5000);

      const moduleElement = this.page.locator(moduleSelector).first();
      await moduleElement.scrollIntoViewIfNeeded();
      await moduleElement.click();

      console.log(`✅ Clicked on module: ${moduleName}`);

      // Wait for navigation
      await this.waitForPageLoad();
      await this.page.waitForTimeout(1000);

      console.log(`✅ Successfully navigated to ${moduleName}`);
    } catch (error) {
      console.error(`❌ Failed to navigate to module ${moduleName}:`, error);
      throw new Error(`Could not navigate to module "${moduleName}": ${error}`);
    }
  }

  /**
   * Check if a specific module is visible in the menu
   * @param moduleName - Name of the module to check
   * @returns true if module is visible
   */
  async isModuleVisible(moduleName: string): Promise<boolean> {
    try {
      // Open menu if not already open
      if (!await this.isModuleMenuOpen()) {
        await this.clickRubiksCube();
      }

      const moduleSelector = this.selectors.moduleItem(moduleName);
      return await this.isElementVisible(moduleSelector);
    } catch {
      return false;
    }
  }

  /**
   * Get list of all available modules (if possible)
   * @returns Array of module names
   */
  async getAvailableModules(): Promise<string[]> {
    try {
      // Open menu if not already open
      if (!await this.isModuleMenuOpen()) {
        await this.clickRubiksCube();
      }

      // Try to get all menu items
      const menuItems = await this.page.locator('[role="menuitem"], button, a').allTextContents();
      return menuItems.filter(text => text && text.trim().length > 0);
    } catch (error) {
      console.warn('Could not retrieve available modules:', error);
      return [];
    }
  }

  /**
   * Verify successful navigation away from dashboard
   * @param expectedUrlPattern - Optional URL pattern to verify
   */
  async verifyNavigationSuccess(expectedUrlPattern?: string | RegExp): Promise<void> {
    const currentUrl = await this.getUrl();

    if (expectedUrlPattern) {
      if (typeof expectedUrlPattern === 'string') {
        expect(currentUrl).toContain(expectedUrlPattern);
      } else {
        expect(currentUrl).toMatch(expectedUrlPattern);
      }
    }

    console.log(`✅ Navigation successful, current URL: ${currentUrl}`);
  }

  // Convenience methods for specific modules
  // These can be expanded based on your application's modules

  /**
   * Navigate to Alerts module
   */
  async goToAlerts(): Promise<void> {
    await this.navigateToModule('Alerts');
  }

  /**
   * Navigate to Messaging module
   */
  async goToMessaging(): Promise<void> {
    await this.navigateToModule('Messaging');
  }

  /**
   * Navigate to Calendar module
   */
  async goToCalendar(): Promise<void> {
    await this.navigateToModule('My Calendar');
  }

  /**
   * Navigate to Intake Queue module
   */
  async goToIntakeQueue(): Promise<void> {
    await this.navigateToModule('Intake Queue');
  }

  /**
   * Navigate to Bereavement module
   */
  async goToBereavement(): Promise<void> {
    await this.navigateToModule('Bereavement');
  }

  /**
   * Navigate to Volunteer Activity module
   */
  async goToVolunteerActivity(): Promise<void> {
    await this.navigateToModule('Volunteer Activity');
  }

  /**
   * Navigate to Unscheduled Visits module
   */
  async goToUnscheduledVisits(): Promise<void> {
    await this.navigateToModule('Unscheduled Visits');
  }
}
