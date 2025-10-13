/**
 * Environment Helper
 * Dynamically loads environment-specific configuration
 */

export type Environment = 'qa' | 'staging' | 'prod';

export interface EnvConfig {
  url: string;
  username: string;
  password: string;
  userRN: string;
  userRNPwd: string;
  physician: string;
  careTeam: string;
  rnSign: string;
}

/**
 * Get current environment from TEST_ENV variable
 */
export function getCurrentEnvironment(): Environment {
  const env = process.env.TEST_ENV?.toLowerCase() || 'qa';
  if (!['qa', 'staging', 'prod'].includes(env)) {
    console.warn(`⚠️ Invalid TEST_ENV: ${env}. Defaulting to 'qa'`);
    return 'qa';
  }
  return env as Environment;
}

/**
 * Get environment-specific configuration
 * @param env - Environment (qa, staging, prod). If not provided, uses TEST_ENV
 */
export function getEnvConfig(env?: Environment): EnvConfig {
  const targetEnv = env || getCurrentEnvironment();
  const envUpper = targetEnv.toUpperCase();

  const config: EnvConfig = {
    url: process.env[`${envUpper}_URL`] || '',
    username: process.env[`${envUpper}_USERNAME`] || '',
    password: process.env[`${envUpper}_PASSWORD`] || '',
    userRN: process.env[`${envUpper}_USER_RN`] || '',
    userRNPwd: process.env[`${envUpper}_USER_RN_PWD`] || '',
    physician: process.env[`${envUpper}_PHYSICIAN`] || '',
    careTeam: process.env[`${envUpper}_CARE_TEAM`] || '',
    rnSign: process.env[`${envUpper}_RN_SIGN`] || '',
  };

  // Validate that required fields are present
  if (!config.url || !config.username || !config.password) {
    throw new Error(
      `❌ Missing required environment variables for ${envUpper} environment. ` +
      `Please check your .env.local file.`
    );
  }

  return config;
}

/**
 * Get specific credential for current environment
 */
export function getCredential(key: keyof EnvConfig): string {
  const config = getEnvConfig();
  return config[key];
}

/**
 * Log current environment info
 */
export function logEnvironmentInfo(): void {
  const env = getCurrentEnvironment();
  const config = getEnvConfig(env);

  console.log(`\n🌍 Environment: ${env.toUpperCase()}`);
  console.log(`🔗 URL: ${config.url}`);
  console.log(`👤 User: ${config.username}`);
  console.log(`👩‍⚕️ RN User: ${config.userRN}\n`);
}
