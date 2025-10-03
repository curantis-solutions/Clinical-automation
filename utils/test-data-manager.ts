import { testData, TenantTestData, tenantExists, getAvailableTenants } from '../config/test-data';
import { CredentialManager } from './credential-manager';

/**
 * Test Data Manager
 * Provides easy access to environment and tenant-specific test data
 * Similar to CredentialManager but for test data
 */
export class TestDataManager {
  private static currentTenant: string | null = null;

  /**
   * Set the current tenant for tests
   * @param tenant - Tenant name (e.g., 'curantis', 'integrum')
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
   * Priority: 1) Explicitly set tenant, 2) TENANT env var, 3) Default to 'curantis'
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

    // Default to curantis
    return 'curantis';
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
    const env = this.getEnvironment();
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
   * Get physician name for search
   * @returns Physician short name (e.g., "MDcypress")
   */
  static getPhysician(): string {
    return this.getData().physician;
  }

  /**
   * Get physician full name
   * @returns Physician full name (e.g., "MDcypress cypresslast")
   */
  static getPhysicianFullName(): string {
    return this.getData().physicianFullName;
  }

  /**
   * Get physician name with credentials
   * @returns Physician name with credentials (e.g., "cypresslast, MDcypress (MD)")
   */
  static getPhysicianWithCredentials(): string {
    return this.getData().physicianWithCredentials;
  }

  /**
   * Get care team name
   * @returns Care team name
   */
  static getCareTeam(): string {
    return this.getData().careTeam;
  }

  /**
   * Get default facility name
   * @returns Facility name
   */
  static getFacility(): string {
    return this.getData().facility;
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

  /**
   * Get credentials for a specific role
   * Note: User credentials are now stored in .env.local, not in test-data.ts
   * Use CredentialManager.getCredentials() instead
   * @deprecated Use CredentialManager.getCredentials(environment, role, tenant)
   * @param role - User role (MD, RN, SW, HA)
   * @returns Credentials object
   */
  static getCredentialsForRole(role: string): { username: string; password: string } {
    const env = this.getEnvironment();
    const tenant = this.getTenant();
    return CredentialManager.getCredentials(env, role, tenant);
  }

  /**
   * Get received by name (for certifications)
   * @returns Received by name or undefined
   */
  static getReceivedBy(): string | undefined {
    return this.getData().receivedBy;
  }

  /**
   * Get MD employee ID (if available)
   * @returns MD employee ID or undefined
   */
  static getEmployeeIdMD(): string | undefined {
    return this.getData().employeeIdMD;
  }

  /**
   * Get RN employee ID (if available)
   * @returns RN employee ID or undefined
   */
  static getEmployeeIdRN(): string | undefined {
    return this.getData().employeeIdRN;
  }

  /**
   * Reset tenant to default
   */
  static resetTenant(): void {
    this.currentTenant = null;
    console.log('✅ Tenant reset to default (curantis)');
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
    const data = this.getData();

    console.log('\n📋 Current Test Data Configuration:');
    console.log(`   Environment: ${env}`);
    console.log(`   Tenant: ${tenant}`);
    console.log(`   Physician: ${data.physician}`);
    console.log(`   Care Team: ${data.careTeam}`);
    console.log(`   Facility: ${data.facility}\n`);
  }
}
