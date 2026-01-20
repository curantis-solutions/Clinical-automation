import { Page, expect } from '@playwright/test';

/**
 * Date Calculation Helper
 * Provides date utilities for HOPE tests
 */
export class DateCalculator {
  /**
   * Get today's date in MM/DD/YYYY format
   */
  static getTodaysDate(): string {
    const today = new Date();
    return this.formatDate(today);
  }

  /**
   * Get a past date (X days ago) in MM/DD/YYYY format
   * @param daysAgo - Number of days in the past
   */
  static getPastDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return this.formatDate(date);
  }

  /**
   * Get a future date (X days from now) in MM/DD/YYYY format
   * @param daysAhead - Number of days in the future
   */
  static getFutureDate(daysAhead: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return this.formatDate(date);
  }

  /**
   * Calculate INV (Initial Nursing Visit) due date
   * INV is due 5 days after admission
   * @param admissionDate - Admission date string in MM/DD/YYYY format
   */
  static calculateINVDate(admissionDate: string): string {
    const date = this.parseDate(admissionDate);
    date.setDate(date.getDate() + 5);
    return this.formatDate(date);
  }

  /**
   * Calculate HUV1 (HOPE Update Visit 1) due date
   * HUV1 is due 15 days after admission
   * @param admissionDate - Admission date string in MM/DD/YYYY format
   */
  static calculateHUV1Date(admissionDate: string): string {
    const date = this.parseDate(admissionDate);
    date.setDate(date.getDate() + 15);
    return this.formatDate(date);
  }

  /**
   * Format date as MM/DD/YYYY
   */
  static formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  /**
   * Parse date string MM/DD/YYYY to Date object
   */
  private static parseDate(dateString: string): Date {
    const [month, day, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Format date in different format if needed
   * @param date - Date object
   * @param format - Format string ('MM/DD/YYYY', 'YYYY-MM-DD', etc.)
   */
  static formatDateCustom(date: Date, format: string): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      default:
        return `${month}/${day}/${year}`;
    }
  }
}

/**
 * Alert Validator Helper
 * Validates alert messages in the application
 */
export class AlertValidator {
  constructor(private page: Page) {}

  /**
   * Verify INV alert message
   * @param expectedDate - Expected INV due date in MM/DD/YYYY format
   */
  async verifyINVAlert(expectedDate: string): Promise<void> {
    console.log(`\n🔔 Verifying INV alert for date: ${expectedDate}`);

    // Look for alert message containing INV and the expected date
    const alertMessage = await this.page.locator('[data-cy="alert-inv"]').textContent();

    expect(alertMessage).toContain('INV');
    expect(alertMessage).toContain(expectedDate);

    console.log(`✅ INV alert verified: ${expectedDate}`);
  }

  /**
   * Verify HUV1 alert message
   * @param expectedDate - Expected HUV1 due date in MM/DD/YYYY format
   */
  async verifyHUV1Alert(expectedDate: string): Promise<void> {
    console.log(`🔔 Verifying HUV1 alert for date: ${expectedDate}`);

    // Look for alert message containing HUV1 and the expected date
    const alertMessage = await this.page.locator('[data-cy="alert-huv1"]').textContent();

    expect(alertMessage).toContain('HUV1');
    expect(alertMessage).toContain(expectedDate);

    console.log(`✅ HUV1 alert verified: ${expectedDate}`);
  }

  /**
   * Verify both INV and HUV1 alerts
   * @param invDate - Expected INV due date
   * @param huv1Date - Expected HUV1 due date
   */
  async verifyBothAlerts(invDate: string, huv1Date: string): Promise<void> {
    console.log(`\n🔔 Verifying both INV and HUV1 alerts`);

    // Look for alert message containing both INV and HUV1
    const alertMessage = await this.page.locator('[data-cy="alert-message"]').textContent();

    expect(alertMessage).toContain('INV');
    expect(alertMessage).toContain(invDate);
    expect(alertMessage).toContain('HUV1');
    expect(alertMessage).toContain(huv1Date);

    console.log(`✅ INV alert verified: ${invDate}`);
    console.log(`✅ HUV1 alert verified: ${huv1Date}`);
  }

  /**
   * Verify alert message contains specific text
   * @param expectedText - Text expected in alert
   */
  async verifyAlertContains(expectedText: string): Promise<void> {
    const alertMessage = await this.page.locator('[data-cy="alert-message"]').textContent();
    expect(alertMessage).toContain(expectedText);
    console.log(`✅ Alert contains: ${expectedText}`);
  }
}

/**
 * Patient Data Storage Helper
 * Manages patient data across tests
 */
export class PatientDataHelper {
  private static patientData: Map<string, any> = new Map();

  /**
   * Store patient data with a key
   * @param key - Unique identifier (e.g., 'NoimpactSym', 'MildSym')
   * @param data - Patient data to store
   */
  static storePatientData(key: string, data: any): void {
    this.patientData.set(key, data);
    console.log(`💾 Stored patient data: ${key}`);
  }

  /**
   * Retrieve patient data by key
   * @param key - Unique identifier
   */
  static getPatientData(key: string): any {
    const data = this.patientData.get(key);
    if (!data) {
      throw new Error(`Patient data not found for key: ${key}`);
    }
    return data;
  }

  /**
   * Store patient ID
   * @param suffix - Patient ID suffix (e.g., 'NoimpactSym')
   * @param patientId - Patient ID
   */
  static storePatientId(suffix: string, patientId: number): void {
    this.storePatientData(`PatientId${suffix}`, patientId);
  }

  /**
   * Get patient ID
   * @param suffix - Patient ID suffix
   */
  static getPatientId(suffix: string): number {
    return this.getPatientData(`PatientId${suffix}`);
  }

  /**
   * Clear all stored patient data
   */
  static clearAll(): void {
    this.patientData.clear();
    console.log('🗑️  Cleared all patient data');
  }
}

/**
 * Visit Helper
 * Provides utilities for visit management
 */
export class VisitHelper {
  /**
   * Generate visit name with timestamp
   * @param visitType - Type of visit (e.g., 'Initial Nursing Assessment')
   */
  static generateVisitName(visitType: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${visitType}_${timestamp}`;
  }

  /**
   * Format role name for consistency
   * @param role - Role name
   */
  static formatRoleName(role: string): string {
    const roleMap: Record<string, string> = {
      'RN': 'Registered Nurse (RN)',
      'MD': 'Medical Director',
      'NP': 'Nurse Practitioner (NP)',
      'Case Manager': 'Case Manager',
    };

    return roleMap[role] || role;
  }
}

/**
 * Symptom Impact Helper
 * Provides utilities for symptom impact management
 */
export class SymptomImpactHelper {
  /**
   * Get symptom impact value from level
   * @param level - Impact level number or string
   */
  static getImpactValue(level: number | string): string {
    const impactMap: Record<string | number, string> = {
      0: '0 - Not Impacted',
      1: '1 - Mild Impact',
      2: '2 - Moderate Impact',
      3: '3 - Severe Impact',
      9: '9 - Patient not experiencing the symptom',
      'NoImpact': '0 - Not Impacted',
      'Mild': '1 - Mild Impact',
      'Moderate': '2 - Moderate Impact',
      'Severe': '3 - Severe Impact',
      'NotExperiencing': '9 - Patient not experiencing the symptom',
    };

    const value = impactMap[level];
    if (!value) {
      throw new Error(`Unknown symptom impact level: ${level}`);
    }

    return value;
  }

  /**
   * Validate symptom impact is within expected range
   * @param value - Impact value string
   */
  static validateImpactValue(value: string): boolean {
    const validValues = [
      '0 - Not Impacted',
      '1 - Mild Impact',
      '2 - Moderate Impact',
      '3 - Severe Impact',
      '9 - Patient not experiencing the symptom',
    ];

    return validValues.includes(value);
  }
}
