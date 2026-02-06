/**
 * =============================================================================
 * PATIENT WORKFLOWS — Barrel export + facade class
 * =============================================================================
 *
 * Re-exports every public function, interface, and type from the individual
 * workflow files so that consumers can import from `workflows/patient-profile`.
 *
 * Also contains the `PatientWorkflow` convenience class that stores `page`
 * once in the constructor.
 */

import { Page } from '@playwright/test';
import { PatientDataFixture } from '../../fixtures/patient-data.fixture';

// ── Re-exports ──────────────────────────────────────────────────────────────

export {
  addPatientWorkflow,
  addPatientFromFixture,
  type PatientWorkflowConfig,
  type PatientWorkflowResult,
} from './patient-creation.workflow';

export {
  addCallerInformation,
  type CallerInfoConfig,
  type CallerInfoResult,
} from './caller-info.workflow';

export {
  addReferrerInformation,
  type ReferrerInfoConfig,
  type ReferrerInfoResult,
} from './referrer-info.workflow';

export {
  addReferringPhysicianInformation,
  DEFAULT_PHYSICIAN_SEARCH_NAME,
  type ReferringPhysicianInfoConfig,
  type ReferringPhysicianInfoResult,
} from './referring-physician.workflow';

export {
  addOrderingPhysicianInformation,
  type OrderingPhysicianInfoConfig,
  type OrderingPhysicianInfoResult,
} from './ordering-physician.workflow';

// ── Facade imports (for class methods) ──────────────────────────────────────

import { addPatientWorkflow, PatientWorkflowConfig } from './patient-creation.workflow';
import { addPatientFromFixture } from './patient-creation.workflow';
import { addCallerInformation, CallerInfoConfig } from './caller-info.workflow';
import { addReferrerInformation, ReferrerInfoConfig } from './referrer-info.workflow';
import { addReferringPhysicianInformation, ReferringPhysicianInfoConfig } from './referring-physician.workflow';
import { addOrderingPhysicianInformation, OrderingPhysicianInfoConfig } from './ordering-physician.workflow';

// =============================================================================
// PATIENT WORKFLOW CLASS (wraps standalone functions for clean fixture usage)
// =============================================================================

/**
 * Class wrapper for patient workflow functions.
 * Stores `page` in the constructor so callers don't need to pass it every time.
 *
 * @example
 * const pw = new PatientWorkflow(page);
 * await pw.addPatientFromFixture(hospiceFixture, { skipLogin: true });
 * await pw.addCallerInformation({ referralType: 'Call', relation: 'Physician' });
 */
export class PatientWorkflow {
  constructor(private page: Page) {}

  async addPatientWorkflow(config: PatientWorkflowConfig) {
    return addPatientWorkflow(this.page, config);
  }

  async addPatientFromFixture(
    fixture: PatientDataFixture,
    options?: { skipLogin?: boolean; skipNavigation?: boolean; returnToPatientList?: boolean; credentials?: { username?: string; password?: string; role?: string } }
  ) {
    return addPatientFromFixture(this.page, fixture, options);
  }

  async addCallerInformation(callerInfo: CallerInfoConfig) {
    return addCallerInformation(this.page, callerInfo);
  }

  async addReferrerInformation(referrerInfo: ReferrerInfoConfig) {
    return addReferrerInformation(this.page, referrerInfo);
  }

  async addReferringPhysicianInformation(mode: 'add' | 'edit', physicianInfo: ReferringPhysicianInfoConfig, fieldsToEdit?: string[]) {
    return addReferringPhysicianInformation(this.page, mode, physicianInfo, fieldsToEdit);
  }

  async addOrderingPhysicianInformation(mode: 'add' | 'edit', physicianInfo: OrderingPhysicianInfoConfig, fieldsToEdit?: string[]) {
    return addOrderingPhysicianInformation(this.page, mode, physicianInfo, fieldsToEdit);
  }
}
