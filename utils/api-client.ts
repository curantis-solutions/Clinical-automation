import { Page, Response } from '@playwright/test';

/**
 * API Client for capturing user information from the app's own API calls.
 *
 * After login, the app calls GET /idg/company-resources/users/ which returns
 * the logged-in user's profile. We intercept that response to extract the name
 * and role info (e.g. isPhysician) without making any additional API calls.
 *
 * IMPORTANT: `interceptUserInfo()` must be called BEFORE login, since
 * the /users/ request fires during the login → dashboard transition.
 */

export interface UserInfo {
  /** Display username containing first + last name (e.g. "medical directorcch") */
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  /** Whether the logged-in user is a physician (from persons[0].isPhysician) */
  isPhysician: boolean;
}

export class ApiClient {
  /**
   * Intercept the app's GET /idg/company-resources/users/ response.
   * Must be called BEFORE login — the app makes this call during dashboard load.
   *
   * @example
   *   const userInfoPromise = ApiClient.interceptUserInfo(page);
   *   await loginPage.login(username, password);
   *   const userInfo = await userInfoPromise;
   *
   * @param page - Playwright Page (call BEFORE triggering login)
   * @param timeoutMs - How long to wait for the response (default 30s)
   * @returns Promise resolving with UserInfo when the app's /users/ call completes
   */
  static interceptUserInfo(page: Page, timeoutMs = 30000): Promise<UserInfo> {
    return page.waitForResponse(
      (resp: Response) =>
        resp.url().includes('/idg/company-resources/users') &&
        resp.request().method() === 'GET' &&
        resp.status() === 200,
      { timeout: timeoutMs }
    ).then(async (response: Response) => {
      const data = await response.json();

      // Root-level username contains "firstName lastName" (e.g. "medical directorcch")
      const username: string = data.username || '';

      // The API nests user details inside persons[0]
      const person = data.persons?.[0] || data;
      const firstName: string = person.firstName || '';
      const lastName: string = person.lastName || '';
      const displayName: string =
        person.displayName || `${firstName} ${lastName}`.trim();
      const isPhysician: boolean = person.isPhysician === true;

      console.log(`User info captured — username: "${username}", isPhysician: ${isPhysician}`);
      return { username, firstName, lastName, displayName, isPhysician };
    });
  }
}
