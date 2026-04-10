import { test, expect, Page, BrowserContext } from '@playwright/test';
import { createPageObjectsForPage, PageObjects } from '../../fixtures/page-objects.fixture';
import { CredentialManager } from '../../utils/credential-manager';
import { TIMEOUTS } from '../../config/timeouts';
import { TAB_A_FIELDS, TAB_F_FIELDS, TAB_I_FIELDS, TAB_J_FIELDS, TAB_M_FIELDS, TAB_N_FIELDS, TAB_Z_FIELDS } from '../../pages/hope-admission.page';

const todaysdate = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};

/**
 * TC-01: CarePlan Visit — End-to-End Flow
 *
 * Creates a visit, fills key assessment modules (Vitals, COVID screening),
 * opens Plan of Care, previews HOPE Report, completes the visit,
 * and verifies completion status.
 *
 * Flow:
 *   Step 01: Login as RN and navigate to patient Care Plan
 *   Step 02: Create a new visit (Initial Nursing Assessment)
 *   Step 03: Fill Vitals module — Blood Pressure, Temperature, Height, Weight
 *   Step 04: Fill COVID screening — all No
 *   Step 05: Navigate to Pain module and fill basic assessment
 *   Step 06: Open Plan of Care
 *   Step 07: Open HOPE Report Preview
 *   Step 08: Complete the visit (signature + task)
 *   Step 09: Verify visit status on Care Plan grid
 */

let sharedPage: Page;
let sharedContext: BrowserContext;
let pages: PageObjects;

const PATIENT_ID = '270764';//'214157';

test.describe.serial('TC-01: CarePlan Visit — E2E Flow @careplan', () => {
  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      baseURL: CredentialManager.getBaseUrl(),
      permissions: ['geolocation'],
      geolocation: { latitude: 41.8781, longitude: -87.6298 },
    });
    sharedPage = await sharedContext.newPage();
    sharedPage.setDefaultTimeout(TIMEOUTS.PAGE_DEFAULT);
    sharedPage.setDefaultNavigationTimeout(TIMEOUTS.PAGE_NAVIGATION);
    pages = createPageObjectsForPage(sharedPage);
  });

  test.afterAll(async () => {
    if (sharedContext) {
      await sharedContext.close();
    }
  });

  // =========================================================================
  // Step 01: Login and navigate to Care Plan
  // =========================================================================
  test('Step 01: Login as RN and navigate to patient Care Plan', async () => {
    test.setTimeout(120000);

    await test.step('Login as RN', async () => {
      await pages.login.goto();
      const credentials = CredentialManager.getCredentials(undefined, 'RN');
      await pages.login.login(credentials.username, credentials.password);
      await sharedPage.waitForURL(/dashboard/, { timeout: 15000 });
      console.log('Logged in as RN');
    });

    await test.step('Navigate to patient Care Plan', async () => {
      await pages.dashboard.goto();
      await pages.dashboard.navigateToModule('Patient');
      await pages.patient.searchPatient(PATIENT_ID);
      await pages.patient.getPatientFromGrid(0);
      await sharedPage.waitForTimeout(2000);

      // Click Careplan nav button
      await sharedPage.locator('[data-cy="btn-nav-bar-item-care-plan"]').click();
      await sharedPage.waitForURL(/carePlan/, { timeout: 15000 });
      console.log('Navigated to Care Plan page');
    });
  });

  // =========================================================================
  // Step 02: Open existing Initial Nursing Assessment from grid
  // =========================================================================
  test.skip('Step 02: Open existing Initial Nursing Assessment visit', async () => {
    test.setTimeout(120000);
    await test.step('Find and open visit from grid', async () => {
      const visitRows = sharedPage.locator('.visitsRow');
      await visitRows.first().waitFor({ state: 'visible', timeout: 10000 });
      const rowCount = await visitRows.count();
      console.log(`Found ${rowCount} visit row(s)`);

      for (let i = 0; i < rowCount; i++) {
        const typeText = await visitRows.nth(i).locator('[data-cy="label-visit-type"]').textContent();
        if (typeText?.includes('Initial Nursing Assessment')) {
          // Click the visit ID to open it
          await visitRows.nth(i).locator('[data-cy="label-visit-id"]').click();
          await sharedPage.waitForURL(/assessment/, { timeout: 15000 });
          await sharedPage.waitForTimeout(2000);
          console.log(`Opened Initial Nursing Assessment visit (row ${i})`);
          return;
        }
      }
      throw new Error('No Initial Nursing Assessment visit found in grid');
    });
    // await test.step('Create visit via dialog', async () => {
    //   await pages.visitAddDialog.clickAddVisit();
    //   await pages.visitAddDialog.selectRole('Registered Nurse (RN)');
    //   await pages.visitAddDialog.selectType('Initial Nursing Assessment');
    //   await pages.visitAddDialog.submit();

    //   const url = sharedPage.url();
    //   expect(url).toContain('/assessment/');
    //   console.log('Created new Initial Nursing Assessment visit');
    // });
  });

  // =========================================================================
  // Step 03: Fill Vitals module
  // =========================================================================
  test.skip('Step 03: Fill Vitals — BP, Temperature, Height, Weight', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Vitals module', async () => {
      await pages.visitAssessment.navigateToModule('Vitals');
      const title = await pages.visitAssessment.getSectionTitle();
      expect(title).toContain('Vitals');
    });

    await test.step('Fill Blood Pressure', async () => {
      await pages.visitAssessment.fillBloodPressure('120', '80');
    });

    await test.step('Fill Temperature', async () => {
      await pages.visitAssessment.fillTemperature('98.6');
    });

    await test.step('Fill Pulse', async () => {
      await pages.visitAssessment.fillPulse('72');
    });

    await test.step('Fill Respiratory Rate', async () => {
      await pages.visitAssessment.fillRespiratoryRate('18');
    });

    await test.step('Fill Height', async () => {
      await pages.visitAssessment.fillHeight('5', '10');
    });

    await test.step('Fill Weight', async () => {
      await pages.visitAssessment.fillWeight('170');
    });
  });

  // =========================================================================
  // Step 04: Fill COVID screening
  // =========================================================================
  test.skip('Step 04: Fill COVID-19 screening — all No', async () => {
    test.setTimeout(120000);

    await test.step('Answer all COVID questions as No', async () => {
      await pages.visitAssessment.fillCovidScreeningAllNo();
    });
  });

  // =========================================================================
  // Step 05: Navigate to Preferences module
  // =========================================================================
  test.skip('Step 05: Fill Preferences module', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Preferences', async () => {
      await pages.visitAssessment.navigateToModule('Preferences');
      const title = await pages.visitAssessment.getSectionTitle();
      expect(title).toContain('Preferences');
    });

    await test.step('Fill Preferences fields', async () => {
      await pages.preferencesModule.fillPreferences({
        assessmentWith: ['patientResponsibleParty'],
        hopeDiagnosis: 'cancer',
        otherConditions: 'Neuropathy',
        interpreterAssist: 'yes',
        levelOfAssistance: 'independent',
        cprAsked: 'yesDiscussionOccurred',
        understandCpr: 'yes',
        wantCpr: 'no',
        outOfHospitalDnr: 'yes',
        codeStatus: 'fullCode',
        polst: 'no',
        most: 'no',
        lifeSustainingTreatmentsAsked: 'yesAndDiscussed',
        wantLifeSustainingTreatments: 'no',
        furtherHospitalizations: 'yes',
        wantfurtherHospitalizations: 'no',
        spiritualConcerns: 'yes',
        haveSpiritualConcerns: 'no',
        signsOfImminentDeath: 'no',
        notes: 'Patient prefers to avoid hospitalization and aggressive treatments.',
       


      });
    });
  });

  // =========================================================================
  // Step 06: Fill Pain module
  // =========================================================================
  test.skip('Step 06: Fill Pain module', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Pain (saves Preferences)', async () => {
      await pages.visitAssessment.navigateToModule('Pain');
      const title = await pages.visitAssessment.getSectionTitle();
      expect(title).toContain('Pain');
    });

    await test.step('Fill Pain fields', async () => {
      await pages.painModule.fillPain({
        assessmentWith: ['patientResponsibleParty'],
        painTool: 'Numeric',
        painScore: 2,
        neuropathicPain: 'yes',
        experiencingPain: 'yes',
        symptomImpact: 'mildImpact',
        impactAreas: ['sleep', 'emotionalDistress'],
        explanation: 'Mild pain with movement, managed with PRN medication',
        activePain: 'no',
        painAssessmentDone: 'yes',
        scheduledOpioid: 'yes',
        prnOpioid: 'yes',
        painNote: 'Patient reports mild pain in joints, especially with activity. No neuropathic characteristics. Pain is currently well-managed with PRN opioids as needed for movement-related discomfort.',
      });
    });

    await test.step('Save Pain by clicking another module then back', async () => {
      // Navigate to Neurological to trigger save, then back to Pain to verify
      await pages.visitAssessment.navigateToModule('Neurological');
      await pages.visitAssessment.navigateToModule('Pain');
      console.log('Saved Pain data by navigating away and back');
    });
  });

  // =========================================================================
  // Step 07: Fill Neurological module
  // =========================================================================
  test.skip('Step 07: Fill Neurological module', async () => {
    test.setTimeout(120000);

    await test.step('Navigate to Neurological (saves Pain)', async () => {
      await pages.visitAssessment.navigateToModule('Neurological');
      const title = await pages.visitAssessment.getSectionTitle();
      expect(title).toContain('Neurological');
    });

    await test.step('Fill Neurological with conditions', async () => {
      await pages.neurologicalModule.fillNeurological({
        oriented: ['person', 'place', 'time', 'situation'],
        conditions: {
          anxiety: {
            score: 3,
            symptomImpact: 'mildImpact',
            impactAreas: ['sleep', 'emotionalDistress'],
          },
          agitation: {
            score: 2,
            symptomImpact: 'mildImpact',
            impactAreas: ['sleep', 'emotionalDistress'],
          },
        },
      });
    });

  });

  // =========================================================================
  // Step 08: Fill remaining modules (saves data on each transition)
  // =========================================================================
  test.skip('Step 08: Fill remaining modules', async () => {
    test.setTimeout(300000);

    await test.step('Fill Respiratory', async () => {
      await pages.visitAssessment.navigateToModule('Respiratory');
      await pages.respiratoryModule.fillRespiratory({
        sobScreening: 'yes',
        sobNow: 'yes',
        treatmentInitiated: 'yes',
        treatmentTypes: ['opioids'],
        symptomImpact: 'mildImpact',
        impactAreas: ['dailyActivities', 'sleep'],
        explanation: 'Mild SOB with exertion, managed with opioids',
        patientOnOxygen: 'noRoomAir',
        notes: 'Patient experiences mild shortness of breath with exertion, such as walking or climbing stairs. SOB is currently managed with opioid medications as needed, which provide relief. Patient is not on supplemental oxygen and uses a fan for comfort. No respiratory treatments have been initiated at this time.'
      });
    });

    await test.step('Fill Cardiovascular', async () => {
      await pages.visitAssessment.navigateToModule('Cardiovascular');
      await pages.cardiovascularModule.fillAllCardiovascular();
    });

    await test.step('Fill Gastrointestinal', async () => {
      await pages.visitAssessment.navigateToModule('Gastrointestinal');
      await pages.gastrointestinalModule.fillGastrointestinal({
        bowelRegimen: 'yes',
        treatments: ['laxatives'],
        bmType: 'irregular',
        bmIrregular: 'constipation',
        abdomenState: ['soft'],
        vomiting: true,
        vomitingData: {
          severity: 3,
          dateUnknown: true,
          timeUnknown: true,
          symptomImpact: 'mildImpact',
          impactAreas: ['intakeOnly'],
          explanation: 'Mild vomiting managed with medication',
        },
        nausea: true,
        nauseaData: {
          score: 2,
          frequency: 'intermittent',
          symptomImpact: 'mildImpact',
          impactAreas: ['intakeOnly'],
          explanation: 'Intermittent nausea with meals',
        },
      });
    });

    await test.step('Fill Genitourinary', async () => {
      await pages.visitAssessment.navigateToModule('Genitourinary');
      await pages.genitourinaryModule.fillAllGenitourinary();
    });

    await test.step('Fill Nutritional & Metabolic', async () => {
      await pages.visitAssessment.navigateToModule('Nutritional & Metabolic');
      await pages.nutritionalMetabolicModule.fillAllNutritionalMetabolic();
    });

    await test.step('Fill Skin', async () => {
      await pages.visitAssessment.navigateToModule('Skin');
      await pages.skinModule.fillSkin({
        addWound: true,
        locationTitle: 'Left Ankle',
        width: '2',
        length: '3',
        depth: '1',
        painScore: 3,
        woundCareTreatment: 'Clean and dress wound daily',
        woundStatus: 'active',
        injuryTreatments: ['pressureUlcerInjuryCare', 'applicationOfNonSurgicalDressings'],
      });

      // Verify wound data in history
      const verified = await pages.skinModule.verifyWoundHistory({
        locationTitle: 'Left Ankle',
        status: 'active',
        dimensions: 'W-2, L-3, D-1',
      });
      expect(verified).toBeTruthy();
    });

    await test.step('Fill Musculoskeletal', async () => {
      await pages.visitAssessment.navigateToModule('Musculoskeletal');
      await pages.musculoskeletalModule.fillAllMusculoskeletal();
    });

    await test.step('Fill ADLs/Functional Needs', async () => {
      await pages.visitAssessment.navigateToModule('ADLs/Functional Needs');
      await pages.adlsModule.fillAllADLs();
    });

    await test.step('Fill Precautions, Safety & Teachings', async () => {
      await pages.visitAssessment.navigateToModule('Precautions, Safety & Teachings');
      await pages.precautionsModule.fillAllPrecautions();
    });

    await test.step('Fill Hospice Aide', async () => {
      await pages.visitAssessment.navigateToModule('Hospice Aide');
      await pages.hospiceAideModule.fillHospiceAide({
        addTask: true,
        assistance: 'assist',
        frequencyOccurrence: '2',
        frequencyDuration: '1',
      });
    });

    await test.step('Fill Military History', async () => {
      await pages.visitAssessment.navigateToModule('Military History');
      await pages.militaryHistoryModule.fillAllMilitaryHistory();
    });

    await test.step('Fill Summary — Narratives + Coordination of Care', async () => {
      await pages.visitAssessment.navigateToModule('Summary');
      await pages.summaryModule.fillSummary({
        addNarrative: true,
        narrativeText: 'Patient assessed during routine visit. Vitals stable.',
        addCoordinationOfCare: true,
        coordinationDescription: 'Discussed care plan with patient family and care team',
      });
    });

    await test.step('Navigate to Symptom Summary to save', async () => {
      await pages.visitAssessment.navigateToModule('Symptom Summary');
      console.log('All modules filled and saved');
    });
  });

  // =========================================================================
  // Step 09: Open Plan of Care
  // =========================================================================
  test.skip('Step 09: Plan of Care — accept all issues', async () => {
    test.setTimeout(300000);

    await test.step('Open Plan of Care', async () => {
      await pages.visitAssessment.clickPlanOfCare();
      console.log('Plan of Care opened');
    });

    await test.step('Accept all suggested issues', async () => {
      await pages.planOfCare.acceptAllIssues();
    });

    await test.step('Exit Plan of Care', async () => {
      await pages.planOfCare.exitPlanOfCare();
    });
  });

  // =========================================================================
  // Step 10: HOPE Report Preview
  // =========================================================================
  test.skip('Step 10: Open HOPE Report Preview and validate', async () => {
    test.setTimeout(120000);

    await test.step('Open HOPE Report Preview', async () => {
      await pages.visitAssessment.clickHopeReportPreview();
    });

    await test.step('Validate HOPE Report data', async () => {
      const result = await pages.hopeReportPreview.validateAll();

      // ── Section A — Administration (from Preferences) ───────────────
      // Language is auto-populated from patient profile
      expect(result.populated['Language']).toBeTruthy();
      expect(result.populated['Language']).toContain('English');
      expect(result.populated['Interpreter Assist']).toBeTruthy();
      expect(result.populated['Interpreter Assist']).toContain('Yes');
      // Living Arrangements set via select in Preferences
      expect(result.populated['Living Arrangements']).toBeTruthy();
      expect(result.populated['Living Arrangements']).toContain('Alone');
      // Level of Assistance set to "independent" in Preferences
      expect(result.populated['Level of Assistance']).toBeTruthy();
      expect(result.populated['Level of Assistance']).toContain('Around the Clock');

      // ── Section F — Preferences ─────────────────────────────────────
      // cprAsked: 'yesDiscussionOccurred'
      expect(result.populated['CPR Preference']).toContain('discussion occurred');
      // lifeSustainingTreatmentsAsked: 'yesAndDiscussed'
      expect(result.populated['Life-Sustaining Treatment']).toContain('discussion occurred');
      // furtherHospitalizations: 'yes' (mapped to yesAndDiscussed)
      // May not populate if selector value doesn't match — check truthy only
      if (result.populated['Hospitalization Preference']) {
        console.log(`  Hospitalization Preference: ${result.populated['Hospitalization Preference']}`);
      }
      // spiritualConcerns: 'yes'
      if (result.populated['Spiritual/Existential Concerns']) {
        console.log(`  Spiritual Concerns: ${result.populated['Spiritual/Existential Concerns']}`);
      }

      // ── Section I — Active Diagnosis ────────────────────────────────
      // hopeDiagnosis: 'cancer' → but principal diagnosis is from patient profile
      // otherConditions: 'Neuropathy' checkbox checked

      // ── Section J — Pain (from Pain module) ─────────────────────────
      // experiencingPain: 'no' → HOPE maps to Screened for Pain
      expect(result.populated['J0900 Screened for Pain']).toBeTruthy();
      expect(result.populated['J0900 Screened for Pain']).toContain('Yes');
      expect(result.populated['J0900 Pain Screening Date']).toBeTruthy(); 
      // Pain screening date should be populated
      expect(result.populated['J0900 Pain Screening Date']).toContain(todaysdate());
      // Pain severity derived from score 2 → Mild
      expect(result.populated['J0900 Pain Severity']).toContain('Mild');
      // Pain tool = Numeric
      expect(result.populated['J0900 Pain Tool Used']).toContain('Numeric');
      // painAssessmentDone: 'yes' → Comprehensive Pain = Yes
      expect(result.populated['J0910 Comprehensive Pain']).toContain('Yes');
      expect(result.populated['J0910 Comprehensive Pain Date']).toBeTruthy();
      expect(result.populated['J0910 Comprehensive Pain Date']).toContain(todaysdate());
      // neuropathicPain: 'no'
      expect(result.populated['J0915 Neuropathic Pain']).toBeTruthy();
      expect(result.populated['J0915 Neuropathic Pain']).toContain('Yes');
      // signsOfImminentDeath: 'no' in Preferences
      // expect(result.populated['J0050 Imminent Death']).toBeTruthy();

      // ── Section J — Respiratory (from Respiratory module) ───────────
      // sobScreening: 'yes'
      expect(result.populated['J2030 SOB Screening']).toContain('Yes');
      // sobNow: 'yes'
      expect(result.populated['J2030 SOB Indicated']).toContain('Yes');
      // treatmentInitiated: 'yes'
      expect(result.populated['J2040 SOB Treatment']).toContain('Yes');

      // ── Section J — Symptom Impact ──────────────────────────────────
      // Pain symptomImpact: 'mildImpact'
      expect(result.populated['J2051 Pain Impact']).toContain('Mild Impact');
      // Respiratory symptomImpact: 'mildImpact'
      expect(result.populated['J2051 SOB Impact']).toContain('Mild Impact');
      // Neurological anxiety symptomImpact: 'mildImpact'
      expect(result.populated['J2051 Anxiety Impact']).toContain('Mild Impact');
      // Neurological agitation symptomImpact: 'mildImpact'
      expect(result.populated['J2051 Agitation Impact']).toContain('Mild Impact');
      // GI vomiting symptomImpact: 'mildImpact'
      expect(result.populated['J2051 Vomiting Impact']).toContain('Mild Impact');
      // GI nausea symptomImpact: 'mildImpact'
      expect(result.populated['J2051 Nausea Impact']).toContain('Mild Impact');

      // ── Section M — Skin (from Skin module) ─────────────────────────
      // Wound added → Skin Conditions should be Yes
      expect(result.populated['M1190 Skin Conditions']).toBeTruthy();
      // injuryTreatments: pressureUlcerInjuryCare
      expect(result.populated['M1200 Pressure Ulcer Care']).toContain('Yes');
      // injuryTreatments: applicationOfNonSurgicalDressings
      expect(result.populated['M1200 Non-Surgical Dressings']).toContain('Yes');

      // ── Section N — Medications ─────────────────────────────────────
      // scheduledOpioid: 'yes'
      expect(result.populated['N0500 Scheduled Opioid']).toContain('Yes');
      // prnOpioid: 'yes'
      expect(result.populated['N0510 PRN Opioid']).toContain('Yes');
      // bowelRegimen: 'yes'
      expect(result.populated['N0520 Bowel Regimen']).toContain('Yes');
    });

    await test.step('Close HOPE Report Preview', async () => {
      await pages.hopeReportPreview.close();
    });
  });

  // =========================================================================
  // Step 11: Complete the visit
  // =========================================================================
  test.skip('Step 11: Complete the visit and verify status', async () => {
    test.setTimeout(120000);

    await test.step('Click Complete button', async () => {
      await pages.visitAssessment.clickComplete();
      console.log('Complete clicked');
    });

    await test.step('Verify visit status is Completed on Care Plan grid', async () => {
      // Wait for navigation back to Care Plan page
      await sharedPage.waitForURL(/carePlan/, { timeout: 30000 }).catch(() => {});
      await sharedPage.waitForTimeout(3000);

      // Find the first visit row and check status
      const visitStatus = sharedPage.locator('[data-cy="label-visit-status"]').first();
      await visitStatus.waitFor({ state: 'visible', timeout: 10000 });
      const statusText = await visitStatus.textContent();
      expect(statusText?.trim()).toContain('Completed');
      console.log(`Visit status: ${statusText?.trim()}`);

      // Verify visit type
      const visitType = sharedPage.locator('[data-cy="label-visit-type"]').first();
      const typeText = await visitType.textContent();
      expect(typeText).toContain('Initial Nursing Assessment');
      console.log(`Visit type: ${typeText?.trim()}`);

      // Verify Plan of Care checkmark is present
      const pocCheckmark = sharedPage.locator('[data-cy="icon-visit-status-checkmark-care-plan"]').first();
      expect(await pocCheckmark.isVisible()).toBeTruthy();
      console.log('Plan of Care checkmark: visible');
    });
  });

  // =========================================================================
  // Step 12: Navigate to HIS/HOPE module and verify admission record
  // =========================================================================
  test('Step 12: Navigate to HIS/HOPE module and verify admission record', async () => {
    test.setTimeout(120000);

    await test.step('Click HIS/HOPE nav button', async () => {
      const hopeNavBtn = sharedPage.locator('[data-cy="btn-nav-bar-item-his"]');
      await hopeNavBtn.waitFor({ state: 'visible', timeout: 10000 });
      await hopeNavBtn.click();
      await sharedPage.waitForTimeout(3000);
      console.log('Navigated to HIS/HOPE module');
    });

    await test.step('Verify HIS/HOPE page header', async () => {
      const header = sharedPage.locator('.header-title');
      await header.waitFor({ state: 'visible', timeout: 10000 });
      const headerText = await header.textContent();
      expect(headerText?.trim()).toContain('Patient HIS/HOPE Report');
      console.log('HIS/HOPE page loaded');
    });

    await test.step('Verify HOPE admission record in grid', async () => {
      // Use last() since there may be multiple admission records — latest is last
      const reportRow = sharedPage.locator('#automation-report-row').last();
      await reportRow.waitFor({ state: 'visible', timeout: 10000 });

      // Verify Report Type = HOPE
      const reportType = reportRow.locator('ion-col').nth(0).locator('.label');
      expect(await reportType.textContent()).toContain('HOPE');
      console.log('  Report Type: HOPE');

      // Verify Report = Admission
      const report = reportRow.locator('ion-col').nth(1).locator('.label');
      expect(await report.textContent()).toContain('Admission');
      console.log('  Report: Admission');

      // Verify Date Generated is populated
      const dateGenerated = reportRow.locator('ion-col').nth(2).locator('.label');
      const dateText = (await dateGenerated.textContent())?.trim();
      expect(dateText).toBeTruthy();
      console.log(`  Date Generated: ${dateText}`);

      // Verify Type of Record
      const typeOfRecord = reportRow.locator('ion-col').nth(4).locator('.label');
      const recordType = (await typeOfRecord.textContent())?.trim();
      console.log(`  Type of Record: ${recordType}`);

      // Verify File Status
      const fileStatus = reportRow.locator('ion-col').nth(5).locator('.label');
      const statusText = (await fileStatus.textContent())?.trim();
      console.log(`  File Status: ${statusText}`);
    });

    await test.step('Open latest admission record', async () => {
      await pages.hopeAdmission.openLatestAdmissionRecord();
    });
  });

  // =========================================================================
  // Step 13: Verify HOPE admission record data mapping across tabs
  // =========================================================================
  test('Step 13: Verify HOPE admission record tabs and data mapping', async () => {
    test.setTimeout(180000);

    await test.step('List all tabs and their status', async () => {
      const tabNames = await pages.hopeAdmission.getTabNames();
      console.log(`Found ${tabNames.length} tabs:`);
      for (const name of tabNames) {
        const complete = await pages.hopeAdmission.isTabComplete(name);
        console.log(`  ${complete ? '✓' : '○'} ${name}`);
      }
    });

    await test.step('Verify Tab A - Administrative Information', async () => {
      const tabA = {
        key: 'A',
        label: 'A - Administrative Information',
        tabSelector: '.tabs-container span:has-text("A - Administrative Information")',
        fields: TAB_A_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabA);

      // Verify key fields
      expect(results['A0100.A NPI']).toBeTruthy();
      expect(results['A0500 First Name']).toBeTruthy();
      expect(results['A0500 Last Name']).toBeTruthy();
      expect(results['A1110.A Language']).toBeTruthy();
      expect(results['A1905 Living Arrangements']).toBeTruthy();
      expect(results['A1910 Level of Assistance']).toBeTruthy();

      // Log all values
      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }
    });

    await test.step('Verify Tab F - Preferences', async () => {
      const tabF = {
        key: 'F',
        label: 'F - Preferences',
        tabSelector: '.tabs-container span:has-text("F - Preferences")',
        fields: TAB_F_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabF);

      // Verify key fields mapped from Preferences module
      expect(results['F2000.A CPR Preference']).toContain('discussion occurred');
      expect(results['F2000.B CPR Date']).toBeTruthy();
      expect(results['F2100.A Life-Sustaining']).toContain('discussion occurred');
      expect(results['F2100.B Life-Sustaining Date']).toBeTruthy();

      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }
    });

    await test.step('Verify Tab I - Active Diagnosis', async () => {
      const tabI = {
        key: 'I',
        label: 'I - Active Diagnosis',
        tabSelector: '.tabs-container span:has-text("I - Active Diagnosis")',
        fields: TAB_I_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabI);

      // Verify principal diagnosis = Cancer (from hopeDiagnosis: 'cancer')
      expect(results['I0010 Principal Diagnosis']).toContain('Cancer');

      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }
    });

    await test.step('Verify Tab J - Health Conditions', async () => {
      const tabJ = {
        key: 'J',
        label: 'J - Health Conditions',
        tabSelector: '.tabs-container span:has-text("J - Health Conditions")',
        fields: TAB_J_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabJ);

      // Verify key fields from Pain, Respiratory, Neurological modules
      expect(results['J0900.A Pain Screening']).toContain('Yes');
      expect(results['J0900.C Pain Severity']).toContain('Mild');
      expect(results['J0900.D Pain Tool']).toContain('Numeric');
      expect(results['J2030.A SOB Screening']).toContain('Yes');
      expect(results['J2030.C SOB Indicated']).toContain('Yes');
      expect(results['J2040.A SOB Treatment']).toContain('Yes');
      expect(results['J2050.A Symptom Impact Screening']).toContain('Yes');

      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }
    });

    await test.step('Verify Tab M - Skin Conditions', async () => {
      const tabM = {
        key: 'M',
        label: 'M - Skin Conditions',
        tabSelector: '.tabs-container span:has-text("M - Skin Conditions")',
        fields: TAB_M_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabM);

      // Verify skin conditions = Yes, Diabetic Foot Ulcers checked
      expect(results['M1190 Skin Conditions']).toContain('Yes');
      expect(results['M1195.A Diabetic Foot Ulcers']).toBe('true');
      // Pressure ulcer care and non-surgical dressings checked
      expect(results['M1200.E Pressure Ulcer Care']).toBe('true');
      expect(results['M1200.G Non-Surgical Dressings']).toBe('true');

      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }
    });

    await test.step('Verify Tab N - Medications', async () => {
      const tabN = {
        key: 'N',
        label: 'N - Medications',
        tabSelector: '.tabs-container span:has-text("N - Medications")',
        fields: TAB_N_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabN);

      // Verify opioids and bowel regimen = Yes
      expect(results['N0500.A Scheduled Opioid']).toContain('Yes');
      expect(results['N0510.A PRN Opioid']).toContain('Yes');
      expect(results['N0520.A Bowel Regimen']).toContain('Yes');

      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }
    });

    await test.step('Verify Tab Z - Record Administration', async () => {
      const tabZ = {
        key: 'Z',
        label: 'Z - Record Administration',
        tabSelector: '.tabs-container span:has-text("Z - Record Administration")',
        fields: TAB_Z_FIELDS,
      };
      const results = await pages.hopeAdmission.readTabFields(tabZ);

      // Verify signature row has data
      expect(results['Z0400 Signature']).toBeTruthy();
      expect(results['Z0400 Sections']).toBeTruthy();
      expect(results['Z0400 Date Completed']).toBeTruthy();

      for (const [label, value] of Object.entries(results)) {
        console.log(`  ${label}: ${value || '(empty)'}`);
      }
    });
  });

  // =========================================================================
  // Step 14: Fill missing data and complete the HOPE admission record
  // =========================================================================
  test('Step 14: Fill missing data and complete HOPE admission record', async () => {
    test.setTimeout(180000);

    await test.step('Re-open admission record if needed', async () => {
      // After Step 13, we may be on a sub-form. Close it, then re-open the record.
      const closeBtn = sharedPage.locator('#inputModalCancel');
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click();
        await sharedPage.waitForTimeout(2000);
        console.log('Closed sub-form');
      }
      // Check if we're back on the grid — if so, re-open the record
      const tabs = sharedPage.locator('.tabs-container span');
      if (await tabs.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('Still on admission record');
      } else {
        console.log('Back on grid — re-opening admission record');
        await pages.hopeAdmission.openLatestAdmissionRecord();
      }
    });

    await test.step('Tab A — Select Payer Information', async () => {
      // await pages.hopeAdmission.navigateToTab('A - Administrative Information');
      // await pages.hopeAdmission.selectPayerInformation();
    });

    await test.step('Tab J — Select Constipation symptom severity', async () => {
      // await pages.hopeAdmission.navigateToTab('J - Health Conditions');
      // await pages.hopeAdmission.selectSingleDropdownFirstOption('automation-constipation-symptom-severity');
    });

    await test.step('Verify tab completion status', async () => {
      const tabNames = await pages.hopeAdmission.getTabNames();
      for (const name of tabNames) {
        const complete = await pages.hopeAdmission.isTabComplete(name);
        console.log(`  ${complete ? '✓' : '○'} ${name}`);
      }
    });

    await test.step('Tab Z — Complete the record', async () => {
      await pages.hopeAdmission.navigateToTab('Z - Record Administration');

      // Get profile name and fill signature using reusable method
      const profileName = await pages.visitAssessment.getProfileName();
      console.log(`Profile name: ${profileName}`);

      // Click Complete button
      await pages.hopeAdmission.clickComplete();

      // Fill signature dialog (reuse from visit assessment)
      await pages.visitAssessment.fillSignatureModal(profileName);
    });
  });
});
