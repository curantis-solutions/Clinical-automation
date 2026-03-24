import { Page, expect } from '@playwright/test';
import { BasePage } from '../pages/base.page';

/**
 * Dashboard Page Object — Ionic 8 (qa2)
 *
 * VERIFIED via MCP Playwright on qa2 (2026-03-05).
 *
 * Changes from Ionic 4 (qa1):
 * - Rubik's cube icon: data-cy="btn-options-applications" STILL EXISTS (same)
 * - Module navigation is now in a persistent sidebar, not a popup menu
 * - Sidebar buttons use accessible names like "Dashboard icon Dashboard"
 * - Module items still use [data-cy] on ion-button elements
 * - Organization dropdown: select[data-cy="select-organization"]
 */
export class DashboardPage extends BasePage {
  private readonly selectors = {
    // Apps icon (rubik's cube) — same data-cy as qa1
    rubiksCubeIcon: '[data-cy="btn-options-applications"]',

    // Sidebar module navigation buttons (Ionic 8 uses sidebar, not popup)
    sidebarButton: (moduleName: string) => `button:has-text("${moduleName}")`,

    // Dashboard indicators
    welcomeMessage: 'text=/Welcome back/i',
    onServicePatientList: 'text=/On-Service Patient List/i',

    // Organization dropdown
    organizationDropdown: 'select[data-cy="select-organization"]',
  };

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/#/dashboard');
    await this.waitForPageLoad();
  }

  async isDashboardDisplayed(): Promise<boolean> {
    try {
      const hasWelcome = await this.isElementVisible(this.selectors.welcomeMessage);
      const hasPatientList = await this.isElementVisible(this.selectors.onServicePatientList);
      return hasWelcome || hasPatientList;
    } catch {
      return false;
    }
  }

  async isRubiksCubeVisible(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.rubiksCubeIcon);
  }

  // Modules that live behind the rubik's cube (apps popover), not in the sidebar
  private readonly appModules = ['Patient', 'Patients', 'Location', 'HIS/HOPE', 'Workforce',
    'Reports', 'Analytics', 'Community Bereavement', 'Billing', 'Order Management',
    'eRx', 'Referral Management', 'ChartMeds'];

  /**
   * Navigate to a module. Sidebar modules are clicked directly;
   * app modules require opening the rubik's cube popover first.
   */
  async navigateToModule(moduleName: string): Promise<void> {
    const isAppModule = this.appModules.some(m => m.toLowerCase() === moduleName.toLowerCase());

    if (isAppModule) {
      // Normalize "Patient" → "Patients" (popover label)
      const popoverName = moduleName.toLowerCase() === 'patient' ? 'Patients' : moduleName;
      await this.page.locator(this.selectors.rubiksCubeIcon).click();
      await this.page.waitForTimeout(1000);
      await this.page.locator(`button:has-text("${popoverName}")`).click();
    } else {
      const selector = this.selectors.sidebarButton(moduleName);
      await this.page.locator(selector).first().click();
    }

    await this.waitForPageLoad();
    await this.page.waitForTimeout(1000);
  }

  // Convenience methods
  async goToAlerts(): Promise<void> { await this.navigateToModule('Alerts'); }
  async goToMessaging(): Promise<void> { await this.navigateToModule('Messaging'); }
  async goToCalendar(): Promise<void> { await this.navigateToModule('My Calendar'); }
  async goToIntakeQueue(): Promise<void> { await this.navigateToModule('Intake Queue'); }
  async goToBereavement(): Promise<void> { await this.navigateToModule('Bereavement'); }
  async goToVolunteerActivity(): Promise<void> { await this.navigateToModule('Volunteer Activity'); }
  async goToUnscheduledVisits(): Promise<void> { await this.navigateToModule('Unscheduled Visits'); }

  async verifyNavigationSuccess(expectedUrlPattern?: string | RegExp): Promise<void> {
    const currentUrl = await this.getUrl();
    if (expectedUrlPattern) {
      if (typeof expectedUrlPattern === 'string') {
        expect(currentUrl).toContain(expectedUrlPattern);
      } else {
        expect(currentUrl).toMatch(expectedUrlPattern);
      }
    }
  }
}
