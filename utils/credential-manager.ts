import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

export interface Credentials {
  username: string;
  password: string;
}

export class CredentialManager {
  /**
   * Get credentials for a specific environment and role
   * @param environment - The environment (dev, qa, staging, prod)
   * @param role - Optional role specification (admin, user, viewer)
   * @returns Credentials object with username and password
   */
  static getCredentials(environment?: string, role?: string): Credentials {
    const env = environment || process.env.TEST_ENV || 'qa';
    const envKey = env.toUpperCase();

    // If role is specified, look for role-specific credentials
    const usernameKey = role
      ? `${envKey}_${role.toUpperCase()}_USERNAME`
      : `${envKey}_USERNAME`;

    const passwordKey = role
      ? `${envKey}_${role.toUpperCase()}_PASSWORD`
      : `${envKey}_PASSWORD`;

    const username = process.env[usernameKey];
    const password = process.env[passwordKey];

    if (!username || !password) {
      throw new Error(
        `Credentials not found for environment: ${env}${role ? `, role: ${role}` : ''}. ` +
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
}