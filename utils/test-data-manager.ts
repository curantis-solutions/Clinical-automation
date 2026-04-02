import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { testData, TenantTestData, tenantExists, getAvailableTenants } from '../config/test-data';
import { CredentialManager } from './credential-manager';
import { ApiClient } from './api-client';

/** Path to shared runtime test data (persists between spec files) */
const RUNTIME_DATA_PATH = path.resolve(__dirname, '../test-data/current-test-data.json');

/**
 * Test Data Manager
 * Provides easy access to environment and tenant-specific test data
 * Similar to CredentialManager but for test data
 */
export class TestDataManager {
  private static currentTenant: string | null = null;
  private static _isPhysician: boolean = false;
  private static _currentRole: string | null = null;

  /**
   * Set the login role (MD, RN, SW, etc.) — also updates isPhysician flag
   */
  static setRole(role: string): void {
    this._currentRole = role;
    this._isPhysician = role.toUpperCase() === 'MD';
    console.log(`Role set to: ${role} (isPhysician: ${this._isPhysician})`);
  }

  /**
   * Get the current login role
   */
  static getRole(): string | null {
    return this._currentRole;
  }

  /**
   * Set the current tenant for tests
   * @param tenant - Tenant name (e.g., 'cth', 'integrum')
   */
  static setTenant(tenant: string): void {
    const env = this.getEnvironment();

    if (!tenantExists(env, tenant)) {
      const available = getAvailableTenants(env);
      throw new Error(
        `Tenant "${tenant}" not found in ${env} environment. ` +
        `Available tenants: ${available.join(', ')}`
      );
    }

    this.currentTenant = tenant;
    console.log(`✅ Tenant set to: ${tenant} (${env} environment)`);
  }

  /**
   * Get the current tenant name
   * Priority: 1) Explicitly set tenant, 2) TENANT env var, 3) Default to 'cth'
   * @returns Current tenant name
   */
  static getTenant(): string {
    if (this.currentTenant) {
      return this.currentTenant;
    }

    // Check environment variable
    const envTenant = process.env.TENANT;
    if (envTenant) {
      return envTenant.toLowerCase();
    }

    // Default to cth
    return 'cth';
  }

  /**
   * Get the current environment
   * @returns Current environment name
   */
  private static getEnvironment(): string {
    return CredentialManager.getEnvironment();
  }

  /**
   * Get all test data for the current tenant
   * @returns Complete tenant test data
   */
  static getData(): TenantTestData {
    const env = this.getEnvironment().toLowerCase();
    const tenant = this.getTenant();

    const data = testData[env]?.[tenant];

    if (!data) {
      throw new Error(
        `No test data found for environment: ${env}, tenant: ${tenant}. ` +
        `Please ensure test data is configured in config/test-data.ts`
      );
    }

    return data;
  }

  /**
   * Get physician name for search (short config value that works in all dropdowns)
   */
  static getPhysician(): string {
    return this.getData().physician;
  }
  static getOtherPhysician(): string | undefined {
    return this.getData().otherPhysician;
  }

  /**
   * Get care team name
   * @returns Care team name
   */
  static getCareTeam(): string {
    return this.getData().careTeam;
  }

  /**
   * Get SNF facility name (if available)
   * @returns SNF facility name or undefined
   */
  static getFacilitySNF(): string | undefined {
    return this.getData().facilitySNF;
  }

  /**
   * Get ALF facility name (if available)
   * @returns ALF facility name or undefined
   */
  static getFacilityALF(): string | undefined {
    return this.getData().facilityALF;
  }
  static getFacilityPNF(): string | undefined {
      return this.getData().facilityPNF;
    }

  /**
   * Get the patient MRN used across all order test suites.
   * Priority: 1) Runtime file (set by addpatient-with-fixtures), 2) Config fallback
   * @returns Patient ID/MRN string
   */
  static getOrdersPatientId(): string {
    // Try runtime file first (written by patient admission test)
    try {
      if (fs.existsSync(RUNTIME_DATA_PATH)) {
        const data = JSON.parse(fs.readFileSync(RUNTIME_DATA_PATH, 'utf-8'));
        if (data?.ordersPatientId) {
          return String(data.ordersPatientId);
        }
      }
    } catch { /* fall through to config */ }

    // Fallback to static config
    const id = this.getData().ordersPatientId;
    if (!id) {
      throw new Error(
        'ordersPatientId not configured. Run addpatient-with-fixtures first, ' +
        'or set ordersPatientId in config/test-data.ts'
      );
    }
    return id;
  }

  /**
   * Save the patient MRN to the shared runtime file so all order test suites can use it.
   * Called by addpatient-with-fixtures after patient admission.
   * @param patientId - The admitted patient's MRN/ID
   */
  static setOrdersPatientId(patientId: string | number): void {
    const id = String(patientId);

    // Write to runtime JSON file
    let data: Record<string, any> = {};
    try {
      if (fs.existsSync(RUNTIME_DATA_PATH)) {
        data = JSON.parse(fs.readFileSync(RUNTIME_DATA_PATH, 'utf-8'));
      }
    } catch { /* start fresh */ }

    data.ordersPatientId = id;
    data.ordersPatientIdUpdatedAt = new Date().toISOString();
    fs.writeFileSync(RUNTIME_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Saved ordersPatientId: ${id} to ${RUNTIME_DATA_PATH}`);

    // Also update config/test-data.ts so the ID persists across runs
    const configPath = path.resolve(__dirname, '../config/test-data.ts');
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const updated = configContent.replace(
        /ordersPatientId:\s*'[^']*'/,
        `ordersPatientId: '${id}'`
      );
      if (updated !== configContent) {
        fs.writeFileSync(configPath, updated, 'utf-8');
        console.log(`✅ Updated ordersPatientId in config/test-data.ts to: ${id}`);
      }
    } catch (err) {
      console.warn(`⚠️ Could not update config/test-data.ts: ${err}`);
    }
  }

  /**
   * Get received by name (for certifications)
   * @returns Received by name or undefined
   */
  static getReceivedBy(): string | undefined {
    return this.getData().receivedBy;
  }

  /**
   * Intercept the /users/ API response to detect the logged-in user's role.
   * Must be called BEFORE login — the app fires GET /users/ during dashboard load.
   *
   * Sets `isPhysician` based on the API response. The physician search term
   * always comes from the config (`physician` field) since it's a short name
   * that works reliably in all dropdowns (care team, certification, LOC).
   *
   * @example
   *   const physicianPromise = TestDataManager.interceptPhysicianName(page);
   *   await login(...);
   *   await physicianPromise;
   *   // isPhysician() now reflects the logged-in user's role
   *
   * @param page - Playwright Page (call BEFORE login)
   * @returns Promise resolving to the physician search term (from config)
   */
  static isPhysician(): boolean {
    return this._isPhysician;
  }

  static interceptPhysicianName(page: Page): Promise<string> {
    const physician = this.getData().physician;
    return ApiClient.interceptUserInfo(page)
      .then((userInfo) => {
        this._isPhysician = userInfo.isPhysician;
        console.log(`User "${userInfo.username}" isPhysician: ${userInfo.isPhysician} — using config physician: "${physician}"`);
        return physician;
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Failed to intercept user info: ${message}`);
        console.warn('isPhysician defaults to role-based detection');
        return physician;
      });
  }

  /**
   * Reset tenant to default
   */
  static resetTenant(): void {
    this.currentTenant = null;
    console.log('✅ Tenant reset to default (cth)');
  }

  /**
   * Get available tenants for current environment
   * @returns Array of available tenant names
   */
  static getAvailableTenants(): string[] {
    const env = this.getEnvironment();
    return getAvailableTenants(env);
  }

  /**
   * Print current configuration (for debugging)
   */
  static printConfig(): void {
    const env = this.getEnvironment();
    const tenant = this.getTenant();

    console.log('\n📋 Current Test Data Configuration:');
    console.log(`   Environment: ${env}`);
    console.log(`   Tenant: ${tenant}`);
    console.log(`   Physician: ${this.getPhysician()}`);
    console.log(`   Care Team: ${this.getCareTeam()}\n`);
  }
}
