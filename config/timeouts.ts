/**
 * Centralized timeout constants for the test framework
 * Replace hardcoded timeout values with these constants for consistency
 */

// Element and action timeouts (milliseconds)
export const TIMEOUTS = {
  /** Short wait for quick UI updates (1 second) */
  SHORT: 1000,

  /** Medium wait for standard operations (3 seconds) */
  MEDIUM: 3000,

  /** Long wait for slower operations (5 seconds) */
  LONG: 5000,

  /** Wait for page navigation (30 seconds) */
  NAVIGATION: 30000,

  /** Wait for API responses (30 seconds) */
  API: 30000,

  /** Action timeout for clicks, fills, etc. (30 seconds) */
  ACTION: 30000,

  /** Element visibility timeout (15 seconds) */
  ELEMENT: 15000,

  /** Form submission timeout (20 seconds) */
  FORM_SUBMIT: 20000,

  /** Search results timeout (8 seconds) */
  SEARCH: 8000,

  /** Dialog/modal appearance timeout (5 seconds) */
  DIALOG: 5000,

  /** Dropdown options load timeout (5 seconds) */
  DROPDOWN: 5000,

  /** Date picker interaction timeout (3 seconds) */
  DATE_PICKER: 3000,
  /** Default page timeout for actions — used by setDefaultTimeout (60 seconds) */
  PAGE_DEFAULT: 60000,

  /** Default navigation timeout — used by setDefaultNavigationTimeout (60 seconds) */
  PAGE_NAVIGATION: 60000,
} as const;

// Test-level timeouts (milliseconds)
export const TEST_TIMEOUTS = {
  /** Standard test timeout (2 minutes) */
  STANDARD: 120000,

  /** Long test timeout (5 minutes) */
  LONG: 300000,

  /** Extended test timeout for complex workflows (10 minutes) */
  EXTENDED: 600000,

  /** Maximum test timeout for full suite tests (15 minutes) */
  MAXIMUM: 900000,

  /** Smoke test timeout (1 minute) */
  SMOKE: 60000,

  /** Health check timeout (30 seconds) */
  HEALTH_CHECK: 30000,
} as const;

// Wait options for Playwright
export const WAIT_OPTIONS = {
  networkIdle: { waitUntil: 'networkidle' as const },
  domContentLoaded: { waitUntil: 'domcontentloaded' as const },
  load: { waitUntil: 'load' as const },
  commit: { waitUntil: 'commit' as const },
} as const;

// Retry configuration
export const RETRY_CONFIG = {
  /** Default number of retries */
  DEFAULT_RETRIES: 3,

  /** Retry delay multiplier for exponential backoff */
  BACKOFF_MULTIPLIER: 2,

  /** Initial retry delay (milliseconds) */
  INITIAL_DELAY: 500,

  /** Maximum retry delay (milliseconds) */
  MAX_DELAY: 5000,
} as const;

// Viewport sizes
export const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  desktopLarge: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

export type TimeoutKey = keyof typeof TIMEOUTS;
export type TestTimeoutKey = keyof typeof TEST_TIMEOUTS;
export type ViewportKey = keyof typeof VIEWPORTS;
