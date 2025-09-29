import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

export interface EnvironmentConfig {
  name: string;
  url: string;
  timeout?: number;
  retries?: number;
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    name: 'Development',
    url: process.env.DEV_URL || '',
    timeout: 60000,
    retries: 2
  },
  qa: {
    name: 'QA',
    url: process.env.QA_URL || 'https://clinical.qa1.curantissolutions.com',
    timeout: 30000,
    retries: 1
  },
  staging: {
    name: 'Staging',
    url: process.env.STAGING_URL || '',
    timeout: 30000,
    retries: 0
  },
  prod: {
    name: 'Production',
    url: process.env.PROD_URL || '',
    timeout: 20000,
    retries: 0
  }
};

export type Environment = keyof typeof environments;

/**
 * Get the current environment configuration
 * @returns The environment configuration for the current TEST_ENV
 */
export function getCurrentEnvironment(): Environment {
  const env = (process.env.TEST_ENV || 'qa').toLowerCase() as Environment;

  if (!environments[env]) {
    throw new Error(
      `Invalid environment: ${env}. Valid options: ${Object.keys(environments).join(', ')}`
    );
  }

  return env;
}

/**
 * Get the configuration for the current environment
 * @returns The configuration object for the current environment
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const env = getCurrentEnvironment();
  return environments[env];
}

/**
 * Check if the current environment is production
 * @returns true if the current environment is production
 */
export function isProduction(): boolean {
  return getCurrentEnvironment() === 'prod';
}

/**
 * Check if the current environment is QA
 * @returns true if the current environment is QA
 */
export function isQA(): boolean {
  return getCurrentEnvironment() === 'qa';
}