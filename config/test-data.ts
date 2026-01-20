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
  physicianFullName: string;   // Full display name (e.g., "MDcypress cypresslast")
  physicianWithCredentials: string; // Full name with credentials (e.g., "cypresslast, MDcypress (MD)")

  // Care team
  careTeam: string;            // Care team name

  // Facility
  facility: string;            // Default facility name
  facilitySNF?: string;        // Skilled Nursing Facility (optional)
  facilityALF?: string;        // Assisted Living Facility (optional)

  // Additional data
  receivedBy?: string;         // Name for certifications
  employeeIdMD?: string;       // Employee ID for MD
  employeeIdRN?: string;       // Employee ID for RN
  rnSign?: string;             // RN signature name for visit sign-offs
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
      physicianFullName: 'MDcypress cypresslast',
      physicianWithCredentials: 'cypresslast, MDcypress (MD)',
      careTeam: 'ACypressIDG',
      facility: 'Home',
      facilitySNF: 'papa pig nurse care',
      facilityALF: 'Allen Assisted Facility',
      receivedBy: 'MDcypress cypresslast',
      employeeIdMD: '1000391',
      employeeIdRN: '1000369',
      rnSign: 'RNCypress cypresslast',
    },

    // Integrum tenant in QA
    integrum: {
      physician: 'Cypresslast',
      physicianFullName: 'MDcypress cypresslast',
      physicianWithCredentials: 'cypresslast, MDcypress (MD)',
      careTeam: 'acyIDGQA',
      facility: 'Home',
      receivedBy: 'MDcypress cypresslast',
      employeeIdMD: '757472',
      employeeIdRN: '1000369',
      rnSign: 'RNCypress cypresslast',
    },
  },

  // Staging Environment
  staging: {
    cth: {
      physician: 'MDcypress',
      physicianFullName: 'MDcypress cypresslast',
      physicianWithCredentials: 'cypresslast, MDcypress (MD)',
      careTeam: 'ACypressIDG',
      facility: 'Home',
      receivedBy: 'MDcypress cypresslast',
    },
  },

  // Production Environment
  prod: {
    cth: {
      physician: 'directorcth',
      physicianFullName: 'MDcypress cypresslast',
      physicianWithCredentials: 'cypresslast, MDcypress (MD)',
      careTeam: 'A Team',
      facility: 'Home',
      receivedBy: 'MDcypress cypresslast',
    },
  },

  // Development Environment
  dev: {
    cth: {
      physician: 'MDcypress',
      physicianFullName: 'MDcypress cypresslast',
      physicianWithCredentials: 'cypresslast, MDcypress (MD)',
      careTeam: 'DevTeam',
      facility: 'Home',
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
