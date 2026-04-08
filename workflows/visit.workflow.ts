import { Page } from '@playwright/test';
import { CarePlanPage } from '../pages/care-plan.page';
import { VisitRecordingPage } from '../pages/visit-recording.page';
import {
  type VisitTypeKey,
  type VisitTypeConfig,
  getVisitType,
} from '../types/visit.types';

/**
 * Visit Workflow
 * Pure orchestration — coordinates CarePlanPage + VisitRecordingPage.
 * Zero raw locators — all UI interaction delegated to page objects.
 *
 * Config-driven via VisitTypeKey — all visit types resolved from VISIT_TYPES config.
 *
 * @example
 * // Config-driven: create by key
 * await visitWorkflow.createVisitByType('F2F');
 * await visitWorkflow.createVisitByType('ROUTINE');
 *
 * @example
 * // Full flow via unified method
 * await visitWorkflow.createAndRecordVisit('F2F', {
 *   visitDate: '03/15/2026',
 *   startTime: { hours: '10', minutes: '00' },
 *   endTime: { hours: '10', minutes: '30' },
 * });
 */
export class VisitWorkflow {
  private readonly carePlan: CarePlanPage;
  private readonly visitRecording: VisitRecordingPage;
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.carePlan = new CarePlanPage(page);
    this.visitRecording = new VisitRecordingPage(page);
  }

  // ============================================
  // Config-driven visit creation
  // ============================================

  /**
   * Create a new visit using the VISIT_TYPES config.
   * Resolves role + typeLabel from the config key.
   * Waits for the first section's nav button to be visible.
   */
  async createVisitByType(key: VisitTypeKey): Promise<VisitTypeConfig> {
    const config = getVisitType(key);
    await this.carePlan.clickAddVisit();
    await this.visitRecording.selectVisitRole(config.role);
    await this.visitRecording.selectVisitType(config.typeLabel);
    await this.visitRecording.submitNewVisit();

    // Wait for the assessment page to load
    const waitForSection = config.hasVitals ? 'Vitals' : config.sections[0]?.name ?? 'Summary';
    await this.visitRecording.waitForAssessmentReady(waitForSection);

    console.log(`Visit created: ${config.role} / ${config.typeLabel} (${key})`);
    return config;
  }

  /**
   * Record the F2F visit sections — Vitals (BP) + F2F (Narrative, Attestation).
   * Assumes we're already on the assessment page after createVisitByType().
   * @param narrative - Clinical narrative text
   * @param narrativeSubject - Clinical narrative subject (required field)
   */
  async recordF2FVisit(
    narrativeSubject: string = 'Face to Face Encounter',
    narrative: string = 'Face to face encounter completed. Patient assessed and plan of care reviewed.',
  ): Promise<string> {
    // Vitals — Blood Pressure
    await this.visitRecording.fillVitalsBloodPressure('120', '80');

    // Navigate to F2F section
    await this.visitRecording.navigateToF2FSection();

    // Clinical Narrative
    await this.visitRecording.fillF2FNarrative(narrativeSubject, narrative);

    // Attestation
    await this.visitRecording.checkF2FAttestation();
    const signatoryName = await this.visitRecording.getSignatoryName();
    await this.visitRecording.fillF2FSignatoryName(signatoryName);
    await this.visitRecording.fillF2FDate();

    console.log(`F2F visit recorded — signatory: ${signatoryName}`);
    return signatoryName;
  }

  /**
   * Complete the visit with dates and times via the Complete popup.
   * @param visitDate - Visit date in MM/DD/YYYY format (used for both start and end)
   * @param startTime - Start time { hours, minutes }
   * @param endTime - End time { hours, minutes }
   */
  async completeVisit(
    visitDate: string,
    startTime: { hours: string; minutes: string },
    endTime: { hours: string; minutes: string },
  ): Promise<void> {
    await this.visitRecording.clickCompleteVisit();
    await this.visitRecording.fillCompleteVisitDates(visitDate, visitDate, startTime, endTime);
    await this.visitRecording.submitCompleteVisit();
    console.log(`Visit completed: ${visitDate} ${startTime.hours}:${startTime.minutes} - ${endTime.hours}:${endTime.minutes}`);
  }

  /**
   * Record the INA visit sections — Vitals (BP) + Summary (Narrative).
   * Assumes we're already on the assessment page after createVisitByType().
   * @param narrativeDescription - Narrative description text
   */
  async recordINAVisit(options?: {
    narrativeDescription?: string;
    narrativeOrigin?: string;
    narrativeCategory?: string;
  }): Promise<void> {
    const description = options?.narrativeDescription ?? 'Initial nursing assessment completed. Patient assessed and plan of care established.';
    const origin = options?.narrativeOrigin ?? 'Pain';
    const category = options?.narrativeCategory ?? 'Pain Assessment';

    // Vitals — Blood Pressure
    await this.visitRecording.navigateToINAVitals();
    await this.visitRecording.fillVitalsBloodPressure('120', '80');

    // Summary — Narrative
    await this.visitRecording.navigateToINASummary();
    await this.visitRecording.fillINANarrative(description, origin, category);

    // HIS Report preview — required before Complete
    await this.visitRecording.clickHISReportPreview();

    console.log('INA visit recorded — BP + Narrative + HIS preview');
  }

  /**
   * Record a Postmortem Encounter: Death Assessment (date/time/location) + BP + Narrative.
   * Assumes we're on the assessment page after createVisitByType('POSTMORTEM').
   */
  async recordPostmortemVisit(options?: {
    month?: string;
    day?: string;
    year?: string;
    hour?: string;
    minute?: string;
    location?: string;
    narrativeDescription?: string;
  }): Promise<void> {
    const description = options?.narrativeDescription ?? 'Postmortem encounter completed. Patient pronounced deceased.';

    // Death Assessment — fill date/time/location
    await this.visitRecording.fillDeathAssessment({
      month: options?.month,
      day: options?.day,
      year: options?.year,
      hour: options?.hour,
      minute: options?.minute,
      location: options?.location,
    });

    // Vitals — Blood Pressure (0/0 for deceased patient)
    await this.visitRecording.navigateToVitalsSection();
    await this.visitRecording.fillVitalsBloodPressure('0', '0');

    // Summary — Narrative
    await this.visitRecording.navigateToSummary();
    await this.visitRecording.fillINANarrative(description, 'General');

    console.log('Postmortem visit recorded — Death Assessment + BP + Narrative');
  }

  // ============================================
  // Config-driven completion
  // ============================================

  /**
   * Complete a visit using the config to dispatch the correct flow.
   * - 'task': 1-step Task modal (dates + times)
   * - 'signature': 2-step Signature modal → Task modal (INA)
   * - 'discharge': Discharge modal (Postmortem)
   *
   * NOTE: HIS preview (if required) must be called during recording, not here.
   * recordINAVisit() already includes clickHISReportPreview().
   */
  async completeVisitByType(
    key: VisitTypeKey,
    dateOptions: {
      visitDate: string;
      startTime?: { hours: string; minutes: string };
      endTime?: { hours: string; minutes: string };
    },
  ): Promise<void> {
    const config = getVisitType(key);
    const startTime = dateOptions.startTime ?? { hours: '10', minutes: '00' };
    const endTime = dateOptions.endTime ?? { hours: '10', minutes: '30' };

    switch (config.completeFlow) {
      case 'task':
        await this.completeVisit(dateOptions.visitDate, startTime, endTime);
        break;
      case 'signature':
        await this.visitRecording.completeINAVisit(dateOptions.visitDate, startTime, endTime);
        break;
      case 'discharge':
        await this.visitRecording.completePostmortemVisit(dateOptions.visitDate, startTime, endTime);
    }

    console.log(`Visit completed via config: ${key} (${config.completeFlow})`);
  }

  // ============================================
  // Config-driven full flow
  // ============================================

  /**
   * Unified entry point: create → record → complete using visit type config.
   * Currently supports F2F and INA recording flows.
   * Other flows can be added as needed.
   */
  async createAndRecordVisit(
    key: VisitTypeKey,
    options: {
      visitDate: string;
      startTime?: { hours: string; minutes: string };
      endTime?: { hours: string; minutes: string };
      narrativeSubject?: string;
      narrative?: string;
      narrativeOrigin?: string;
      narrativeCategory?: string;
    },
  ): Promise<void> {
    const config = await this.createVisitByType(key);

    // Dispatch recording by flow
    switch (config.recordingFlow) {
      case 'F2F':
        await this.recordF2FVisit(options.narrativeSubject, options.narrative);
        break;
      case 'INA':
        await this.recordINAVisit({
          narrativeDescription: options.narrative,
          narrativeOrigin: options.narrativeOrigin,
          narrativeCategory: options.narrativeCategory,
        });
        break;
      case 'POSTMORTEM':
        await this.recordPostmortemVisit({ narrativeDescription: options.narrative });
        break;
      default:
        console.log(`Recording flow '${config.recordingFlow}' not yet implemented — skipping recording`);
        break;
    }

    // Complete
    await this.completeVisitByType(key, options);

    console.log(`Full visit flow complete: ${key} — date: ${options.visitDate}`);
  }
}
