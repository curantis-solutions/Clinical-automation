import { Page, Route } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * API Helper utilities for intercepting and storing API responses
 */

export interface PatientChartResponse {
  id: number;
  tenantId: number;
  externalId: number;
  teamName: string | null;
  careType: string;
  patientStatus: string;
  // Add other fields as needed
}

export interface TestData {
  patientId?: number;
  patientFirstName?: string;
  patientLastName?: string;
  patientSSN?: string;
  admitDate?: string;
  testRunTimestamp?: string;
  // Multiple patient IDs for suite tests
  patientIds?: {
    noImpact?: number;
    mild?: number;
    moderate?: number;
    severe?: number;
    noSymptoms?: number;
  };
  // Add other test data as needed
}

const TEST_DATA_FILE = path.join(process.cwd(), 'test-data', 'current-test-data.json');

/**
 * Ensure test-data directory exists
 */
function ensureTestDataDir(): void {
  const dir = path.dirname(TEST_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Save test data to file
 * @param data - Test data to save
 */
export function saveTestData(data: Partial<TestData>): void {
  ensureTestDataDir();

  let existingData: TestData = {};

  // Read existing data if file exists
  if (fs.existsSync(TEST_DATA_FILE)) {
    try {
      const fileContent = fs.readFileSync(TEST_DATA_FILE, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('⚠️ Could not read existing test data:', message);
    }
  }

  // Merge with new data
  const updatedData = { ...existingData, ...data };

  // Write to file
  fs.writeFileSync(TEST_DATA_FILE, JSON.stringify(updatedData, null, 2));
  console.log(`💾 Test data saved to: ${TEST_DATA_FILE}`);
}

/**
 * Load test data from file
 * @returns Test data object
 */
export function loadTestData(): TestData {
  if (!fs.existsSync(TEST_DATA_FILE)) {
    console.warn('⚠️ Test data file not found, returning empty object');
    return {};
  }

  try {
    const fileContent = fs.readFileSync(TEST_DATA_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to load test data:', message);
    return {};
  }
}

/**
 * Setup API interception for patient chart creation
 * @param page - Playwright page
 * @returns Promise that resolves with the patient ID when captured
 */
export async function interceptPatientChartCreation(page: Page): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: Patient chart API call not intercepted within 30 seconds'));
    }, 30000);

    page.route('**/patient-charts', async (route: Route) => {
      const request = route.request();

      // Only intercept POST requests (patient creation)
      if (request.method() === 'POST') {
        console.log('📡 Intercepted POST request to /patient-charts');

        try {
          // Continue with the request and get the response
          const response = await route.fetch();
          const responseBody = await response.json();

          console.log('📥 Received response from /patient-charts');
          console.log(`✅ Patient ID: ${responseBody.id}`);
          console.log(`✅ Patient Status: ${responseBody.patientStatus}`);
          console.log(`✅ Care Type: ${responseBody.careType}`);

          // Save patient ID to test data
          saveTestData({
            patientId: responseBody.id,
            testRunTimestamp: new Date().toISOString()
          });

          // Fulfill the route with the response
          await route.fulfill({
            status: response.status(),
            headers: response.headers(),
            body: JSON.stringify(responseBody)
          });

          clearTimeout(timeout);
          resolve(responseBody.id);

        } catch (error) {
          console.error('❌ Error intercepting patient chart response:', error);
          await route.continue();
          clearTimeout(timeout);
          reject(error);
        }
      } else {
        // Not a POST request, continue normally
        await route.continue();
      }
    });
  });
}

/**
 * Setup API interception listener (non-blocking)
 * @param page - Playwright page
 * @param callback - Callback function to execute when API is intercepted
 */
export function setupPatientChartListener(
  page: Page,
  callback: (patientId: number, response: PatientChartResponse) => void
): void {
  page.route('**/patient-charts', async (route: Route) => {
    const request = route.request();

    if (request.method() === 'POST') {
      console.log('📡 Intercepted POST request to /patient-charts');

      try {
        const response = await route.fetch();
        const responseBody: PatientChartResponse = await response.json();

        console.log(`✅ Captured Patient ID: ${responseBody.id}`);

        // Execute callback with patient data
        callback(responseBody.id, responseBody);

        // Fulfill the route
        await route.fulfill({
          status: response.status(),
          headers: response.headers(),
          body: JSON.stringify(responseBody)
        });

      } catch (error) {
        console.error('❌ Error in patient chart listener:', error);
        await route.continue();
      }
    } else {
      await route.continue();
    }
  });
}

/**
 * Clear test data file
 */
export function clearTestData(): void {
  if (fs.existsSync(TEST_DATA_FILE)) {
    fs.unlinkSync(TEST_DATA_FILE);
    console.log('🗑️  Test data file cleared');
  }
}

/**
 * Get patient ID from test data
 * @returns Patient ID or undefined if not found
 */
export function getPatientId(): number | undefined {
  const testData = loadTestData();
  return testData.patientId;
}

/**
 * Save patient ID by scenario type
 * @param scenarioType - Type of scenario (noImpact, mild, moderate, severe, noSymptoms)
 * @param patientId - Patient ID to save
 */
export function savePatientIdByScenario(
  scenarioType: 'noImpact' | 'mild' | 'moderate' | 'severe' | 'noSymptoms',
  patientId: number
): void {
  const testData = loadTestData();

  if (!testData.patientIds) {
    testData.patientIds = {};
  }

  testData.patientIds[scenarioType] = patientId;
  saveTestData(testData);
  console.log(`💾 Patient ID saved for scenario '${scenarioType}': ${patientId}`);
}

/**
 * Get patient ID by scenario type
 * @param scenarioType - Type of scenario
 * @returns Patient ID or undefined if not found
 */
export function getPatientIdByScenario(
  scenarioType: 'noImpact' | 'mild' | 'moderate' | 'severe' | 'noSymptoms'
): number | undefined {
  const testData = loadTestData();
  return testData.patientIds?.[scenarioType];
}
