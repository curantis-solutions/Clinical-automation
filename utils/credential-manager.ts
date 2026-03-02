import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

export interface Credentials {
  username: string;
  password: string;
}

export class CredentialManager {
  private static _currentRole: string | null = null;

  /** Get the role used at login (MD, RN, SW, etc.) */
  static getCurrentRole(): string | null {
    return this._currentRole;
  }
  /**
   * Get credentials for a specific environment, tenant, and role
   * @param environment - The environment (dev, qa, staging, prod)
   * @param role - Optional role specification (MD, RN, SW, HA, etc.)
   * @param tenant - Optional tenant specification (cth, integrum, etc.)
   * @returns Credentials object with username and password
   */
  static getCredentials(environment?: string, role?: string, tenant?: string): Credentials {
    const env = environment || process.env.TEST_ENV || 'qa';
    const envKey = env.toUpperCase();
    const tenantKey = tenant || this.getTenant();

    let username: string | undefined;
    let password: string | undefined;

    // Try tenant-specific credentials first if tenant is provided
    if (tenantKey) {
      const tenantEnvKey = tenantKey.toUpperCase();

      // Format: {ENV}_{TENANT}_{ROLE}_USERNAME or {ENV}_{TENANT}_USERNAME
      const usernameKey = role
        ? `${envKey}_${tenantEnvKey}_${role.toUpperCase()}_USERNAME`
        : `${envKey}_${tenantEnvKey}_USERNAME`;

      const passwordKey = role
        ? `${envKey}_${tenantEnvKey}_${role.toUpperCase()}_PASSWORD`
        : `${envKey}_${tenantEnvKey}_PASSWORD`;

      username = process.env[usernameKey];
      password = process.env[passwordKey];

      if (username && password) {
        return { username, password };
      }
    }

    // Fallback to non-tenant-specific credentials
    const usernameKey = role
      ? `${envKey}_${role.toUpperCase()}_USERNAME`
      : `${envKey}_USERNAME`;

    const passwordKey = role
      ? `${envKey}_${role.toUpperCase()}_PASSWORD`
      : `${envKey}_PASSWORD`;

    username = process.env[usernameKey];
    password = process.env[passwordKey];

    if (!username || !password) {
      const tenantInfo = tenantKey ? `, tenant: ${tenantKey}` : '';
      const roleInfo = role ? `, role: ${role}` : '';

      throw new Error(
        `Credentials not found for environment: ${env}${tenantInfo}${roleInfo}. ` +
        `Please ensure ${usernameKey} and ${passwordKey} are set in your .env.local file.`
      );
    }

    return {
      username,
      password
    };
  }

  /**
   * Get the base URL for the current environment
   * @param environment - The environment (dev, qa, staging, prod)
   * @returns The base URL for the environment
   */
  static getBaseUrl(environment?: string): string {
    const env = environment || process.env.TEST_ENV || 'qa';
    const envKey = `${env.toUpperCase()}_URL`;
    const url = process.env[envKey];

    if (!url) {
      throw new Error(
        `URL not found for environment: ${env}. ` +
        `Please ensure ${envKey} is set in your .env.local file.`
      );
    }

    return url;
  }

  /**
   * Check if running in headless mode
   * @returns true if running headless, false otherwise
   */
  static isHeadless(): boolean {
    return process.env.HEADLESS !== 'false';
  }

  /**
   * Get the current test environment
   * @returns The current test environment
   */
  static getEnvironment(): string {
    return process.env.TEST_ENV || 'qa';
  }

  /**
   * Get the current tenant
   * @returns The current tenant
   */
  static getTenant(): string {
    return process.env.TENANT || 'cth';
  }

  /**
   * Get the human-readable environment name
   * @param environment - The environment (dev, qa, staging, prod)
   * @returns Environment display name
   */
  static getEnvironmentName(environment?: string): string {
    const env = environment || process.env.TEST_ENV || 'qa';
    const names: Record<string, string> = {
      dev: 'Development',
      qa: 'QA',
      staging: 'Staging',
      prod: 'Production'
    };
    return names[env.toLowerCase()] || 'QA';
  }
}