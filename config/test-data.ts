/**
 * Test Data Configuration
 * Hierarchical structure: Environment → Tenant → Test Data
 * Supports multiple tenants per environment
 */

/**
 * Test data for a specific tenant
 */
export interface TenantTestData {
  // Physician data
  physician: string;           // Short name for search (e.g., "MDcypress")
  otherPhysician?: string;     // A different provider name for attestation switch tests

  // Care team
  careTeam: string;            // Care team name

  // Facility
  facilitySNF?: string;        // Skilled Nursing Facility (optional)
  facilityALF?: string;        // Assisted Living Facility (optional)
  facilityPNF?: string;        // Place Not Specified Nursing Facility (optional)

  // Patient
  ordersPatientId?: string;    // Patient MRN used across all order test suites

  // Additional data
  receivedBy?: string;         // Name for certifications
}

/**
 * Test data grouped by tenant for an environment
 */
export interface EnvironmentTestData {
  [tenantName: string]: TenantTestData;
}

/**
 * Complete test data structure for all environments
 */
export const testData: Record<string, EnvironmentTestData> = {
  // QA Environment
  qa: {
    // CTH tenant in QA
    cth: {
      physician: 'Cypresslast',
      otherPhysician: 'directorcth',
      careTeam: 'ACypressIDG',
      facilitySNF: 'papa pig nurse care',
      facilityALF: 'Allen Assisted Facility',
      receivedBy: 'MDcypress cypresslast',
      facilityPNF: 'Automation Facility',
      ordersPatientId: '214157',
    },

    // Integrum tenant in QA
    integrum: {
      physician: 'Cypresslast',
      careTeam: 'acyIDGQA',
      receivedBy: 'MDcypress cypresslast',
    },
  },

  // Staging Environment
  staging: {
    cth: {
      physician: 'MDcypress',
      careTeam: 'ACypressIDG',
      receivedBy: 'MDcypress cypresslast',
    },
  },

  // Production Environment
  prod: {
    cth: {
      physician: 'directorcth',
      careTeam: 'A Team',
      receivedBy: 'MDcypress cypresslast',
    },
     cch: {
      physician: 'directorcch',
      careTeam: 'A Team',
      receivedBy: 'medical directorcch',
    },
  },

  // Development Environment
  dev: {
    cth: {
      physician: 'MDcypress',
      careTeam: 'DevTeam',
      receivedBy: 'MDcypress cypresslast',
    },
  },
};

/**
 * Get available tenants for an environment
 * @param environment - The environment name
 * @returns Array of tenant names
 */
export function getAvailableTenants(environment: string): string[] {
  return Object.keys(testData[environment] || {});
}

/**
 * Check if a tenant exists in an environment
 * @param environment - The environment name
 * @param tenant - The tenant name
 * @returns true if tenant exists
 */
export function tenantExists(environment: string, tenant: string): boolean {
  return Boolean(testData[environment]?.[tenant]);
}
