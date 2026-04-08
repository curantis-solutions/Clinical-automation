import { Page, expect } from '@playwright/test';
import { ClaimsPage } from '../pages/billing/claims.page';
import { BatchManagementPage } from '../pages/billing/batch-management.page';
import { AccountsReceivablePage } from '../pages/billing/accounts-receivable.page';
import { DashboardPage } from '../pages/dashboard.page';
import { NoticeExpectedData, NoticeRowData, BatchDetailRowData, ARRowData, BatchDownloadFormat, ARDownloadFormat, BillType } from '../types/billing.types';
import { Ub04ExpectedFields } from '../types/ub04.types';

/**
 * Billing Workflow
 * Orchestrates navigation to billing module, claims verification flows,
 * and UB-04 PDF content verification.
 *
 * All selectors live in page objects — this file contains only orchestration logic.
 */
export class BillingWorkflow {
  private readonly claimsPage: ClaimsPage;
  private readonly batchPage: BatchManagementPage;
  private readonly arPage: AccountsReceivablePage;
  private readonly dashboardPage: DashboardPage;

  /** Revenue codes that indicate RLIS data — used for Box 42-49 empty check */
  private static readonly REVENUE_CODES = ['0651', '0652', '0655', '0656', '0657', '0658', '0659'];

  constructor(private page: Page) {
    this.claimsPage = new ClaimsPage(page);
    this.batchPage = new BatchManagementPage(page);
    this.arPage = new AccountsReceivablePage(page);
    this.dashboardPage = new DashboardPage(page);
  }

  // ── Navigation ──

  /**
   * Navigate from any page to Billing > Claims > specified sub-tab.
   */
  async navigateToBillingClaims(tab: 'Ready' | 'Review'): Promise<void> {
    await this.dashboardPage.navigateToModule('Billing');
    await this.claimsPage.navigateTo(tab);
  }

  /**
   * Navigate from any page to 837 Batch Management.
   */
  async navigateTo837BatchManagement(): Promise<void> {
    await this.dashboardPage.navigateToModule('Billing');
    await this.page.waitForTimeout(500);
    await this.batchPage.clickMainTab();
  }

  /**
   * Navigate from any page to Accounts Receivable.
   */
  async navigateToAccountsReceivable(): Promise<void> {
    await this.dashboardPage.navigateToModule('Billing');
    await this.page.waitForTimeout(500);
    await this.arPage.clickSidebarNav();
  }

  // ── Claims Verification ──

  /**
   * Search for a patient's claims and verify count + bill type.
   */
  async verifyClaimsForPatient(
    patientId: string,
    expectedCount: number,
    expectedType: '811' | '812' | '813' | '814' | '81A'
  ): Promise<void> {
    await this.claimsPage.searchByPatient(patientId);
    await this.claimsPage.assertClaimCount(expectedCount);
    await this.claimsPage.assertClaimTypeVisible(expectedType);
  }

  /**
   * Wait for claim reprocessing to complete for a patient.
   */
  async waitForClaimReprocessing(patientId: string, timeout?: number): Promise<void> {
    await this.claimsPage.waitForReprocessingComplete(patientId, timeout);
  }

  /**
   * Verify all Notice (81A) claim details in Ready > Notices.
   */
  async verifyNoticeClaimDetails(patientId: string, expected: NoticeExpectedData): Promise<NoticeRowData> {
    await this.navigateToBillingClaims('Ready');
    await this.claimsPage.switchSecondaryTab('Notices');

    await this.claimsPage.searchByPatient(patientId);
    await this.claimsPage.assertClaimCount(1);

    const actual = await this.claimsPage.assertNoticeDetails(0, expected);
    console.log(`  Patient: ${actual.patientName} | Payer: ${actual.payerName}`);
    return actual;
  }

  // ── NOE Submission ──

  /**
   * Submit the NOE (81A) from Ready > Notices via Generate Claim.
   * Handles the full modal flow: post date → Submit Batch → close success dialog.
   */
  async submitNoeFromReady(patientId: string, postDate?: string): Promise<void> {
    await this.navigateToBillingClaims('Ready');
    await this.claimsPage.switchSecondaryTab('Notices');
    await this.claimsPage.searchByPatient(patientId);

    const noeRow = await this.claimsPage.findRowByPatientAndBillType(patientId, '81A');
    if (noeRow < 0) {
      console.log(`NOE (81A) not found in Ready > Notices — may have already been submitted`);
      return;
    }

    await this.claimsPage.selectClaimRow(noeRow);
    await this.claimsPage.clickGenerateClaim();
    await this.claimsPage.completeGenerateClaimModal(postDate);
  }

  // ── Claim Submission ──

  /**
   * Submit a claim (e.g., 812) from Ready > Claims via Generate Claim.
   * Handles the full modal flow: select row → Generate Claim → post date → Submit Batch → close success dialog.
   */
  async submitClaimFromReady(patientId: string, billType: BillType, postDate?: string): Promise<void> {
    await this.navigateToBillingClaims('Ready');
    await this.claimsPage.switchSecondaryTab('Claims');
    await this.claimsPage.searchByPatient(patientId);

    const row = await this.claimsPage.findRowByPatientAndBillType(patientId, billType);
    if (row < 0) {
      throw new Error(`Claim ${billType} not found in Ready > Claims for patient ${patientId}`);
    }

    await this.claimsPage.selectClaimRow(row);
    await this.claimsPage.clickGenerateClaim();
    await this.claimsPage.completeGenerateClaimModal(postDate);
  }

  // ── 837 Batch Management Verification ──

  /**
   * Verify a submitted claim in 837 Batch > Claims and download batch file.
   * Navigates once, polls for batch, verifies detail, then opens Batch Options.
   * Returns { detail, availableFormats }.
   */
  async verifyAndDownloadClaimIn837Batch(
    patientId: string,
    payerName: string,
    format: BatchDownloadFormat
  ): Promise<{ detail: BatchDetailRowData; availableFormats: string[] }> {
    await this.navigateTo837BatchManagement();

    let batchData: { batchName: string; totalClaims: string } = { batchName: '', totalClaims: '0' };
    await expect(async () => {
      await this.batchPage.navigateToTab('Claims');
      await this.batchPage.searchBatch(patientId);
      const rowCount = await this.batchPage.getBatchRowCount();
      if (rowCount < 1) throw new Error(`No 837 batch found for patient ${patientId} in Claims tab`);
      batchData = await this.batchPage.readBatchRowData(0);
    }).toPass({ timeout: 60_000, intervals: [5_000] });

    const detailPatientIdText = await this.batchPage.waitForDetailAndGetPatientId();
    if (!detailPatientIdText.includes(patientId)) {
      throw new Error(`Patient ${patientId} not found in batch "${batchData.batchName}" detail (got "${detailPatientIdText}")`);
    }

    const detail = await this.batchPage.readDetailRowData(0);
    console.log(`  837 Batch (Claims): ${batchData.batchName} | Patient: ${detail.patientId} | Claim: ${detail.claimId}`);

    const availableFormats = await this.batchPage.downloadBatch(0, format);
    console.log(`  837 Batch download (${format}) | Formats: [${availableFormats.join(', ')}]`);

    return { detail, availableFormats };
  }

  /**
   * Verify NOE in 837 Batch > Notices and download batch file — single navigation.
   * Navigates once, polls for batch, verifies detail, then opens Batch Options.
   * Returns { detail, availableFormats }.
   */
  async verifyAndDownloadNoeIn837Batch(
    patientId: string,
    payerName: string,
    format: BatchDownloadFormat
  ): Promise<{ detail: BatchDetailRowData; availableFormats: string[] }> {
    await this.navigateTo837BatchManagement();

    // Poll until batch appears in Notices tab
    let batchData: { batchName: string; totalClaims: string } = { batchName: '', totalClaims: '0' };
    await expect(async () => {
      await this.batchPage.navigateToTab('Notices');
      await this.batchPage.searchBatch(patientId);
      const rowCount = await this.batchPage.getBatchRowCount();
      if (rowCount < 1) throw new Error(`No 837 batch found for patient ${patientId} in Notices tab`);
      batchData = await this.batchPage.readBatchRowData(0);
    }).toPass({ timeout: 60_000, intervals: [5_000] });

    // Single search result auto-expands — verify patient in detail
    const detailPatientIdText = await this.batchPage.waitForDetailAndGetPatientId();
    if (!detailPatientIdText.includes(patientId)) {
      throw new Error(`Patient ${patientId} not found in batch "${batchData.batchName}" detail (got "${detailPatientIdText}")`);
    }

    const detail = await this.batchPage.readDetailRowData(0);
    console.log(`  837 Batch: ${batchData.batchName} | Patient: ${detail.patientId} | Claim: ${detail.claimId}`);

    const availableFormats = await this.batchPage.downloadBatch(0, format);
    console.log(`  837 Batch download (${format}) | Formats: [${availableFormats.join(', ')}]`);

    return { detail, availableFormats };
  }

  // ── Accounts Receivable Verification ──

  /**
   * Verify NOE in AR > Notices and download claim — single navigation.
   * Navigates once, polls for entry, verifies fields, then opens Download Claim modal.
   * Returns { arData, availableFormats }.
   */
  async verifyAndDownloadNoeInAR(
    patientId: string,
    payerName: string,
    patientName: string,
    format: ARDownloadFormat
  ): Promise<{ arData: ARRowData; availableFormats: string[] }> {
    await this.navigateToAccountsReceivable();

    // Poll until entry appears in Notices tab
    let arData!: ARRowData;
    await expect(async () => {
      await this.arPage.navigateToTab('Notices');
      await this.arPage.searchByPatient(patientId);
      const rowCount = await this.arPage.getVisibleRowCount();
      if (rowCount < 1) throw new Error(`No AR entries found for patient ${patientId} in Notices tab`);
      arData = await this.arPage.readRowData(0);
    }).toPass({ timeout: 60_000, intervals: [5_000] });

    // Normalize whitespace (AR grid renders names with newlines)
    const normalizedPatientName = arData.patientName.replace(/\s+/g, ' ').trim();
    const normalizedPayerName = arData.payerName.replace(/\s+/g, ' ').trim();

    if (!normalizedPatientName.includes(patientName)) {
      throw new Error(`AR patient name mismatch: expected "${patientName}", got "${normalizedPatientName}"`);
    }
    if (!normalizedPayerName.includes(payerName)) {
      throw new Error(`AR payer name mismatch: expected "${payerName}", got "${normalizedPayerName}"`);
    }
    if (arData.status !== 'Submitted') {
      throw new Error(`AR status mismatch: expected "Submitted", got "${arData.status}"`);
    }
    if (arData.billedAmount !== '$0.00') {
      throw new Error(`AR billed amount mismatch: expected "$0.00", got "${arData.billedAmount}"`);
    }

    console.log(`  AR: Status=${arData.status} | Billed=${arData.billedAmount}`);

    // Already on the AR page — download without re-navigating
    // Single search result is auto-expanded, row 0 is the target
    const availableFormats = await this.arPage.downloadClaimAs(0, payerName, format);
    console.log(`  AR download (${format}) | Formats: [${availableFormats.join(', ')}]`);

    return { arData, availableFormats };
  }

  /**
   * Verify a submitted claim in AR > Claims and download claim file.
   * Navigates once, polls for entry, verifies status=Submitted and billedAmount != $0.00.
   * Returns { arData, availableFormats }.
   */
  async verifyAndDownloadClaimInAR(
    patientId: string,
    payerName: string,
    patientName: string,
    format: ARDownloadFormat
  ): Promise<{ arData: ARRowData; availableFormats: string[] }> {
    await this.navigateToAccountsReceivable();

    let arData!: ARRowData;
    await expect(async () => {
      await this.arPage.navigateToTab('Claims');
      await this.arPage.searchByPatient(patientId);
      const rowCount = await this.arPage.getVisibleRowCount();
      if (rowCount < 1) throw new Error(`No AR entries found for patient ${patientId} in Claims tab`);
      arData = await this.arPage.readRowData(0);
    }).toPass({ timeout: 60_000, intervals: [5_000] });

    const normalizedPatientName = arData.patientName.replace(/\s+/g, ' ').trim();
    const normalizedPayerName = arData.payerName.replace(/\s+/g, ' ').trim();

    if (!normalizedPatientName.includes(patientName)) {
      throw new Error(`AR patient name mismatch: expected "${patientName}", got "${normalizedPatientName}"`);
    }
    if (!normalizedPayerName.includes(payerName)) {
      throw new Error(`AR payer name mismatch: expected "${payerName}", got "${normalizedPayerName}"`);
    }
    if (arData.status !== 'Submitted') {
      throw new Error(`AR status mismatch: expected "Submitted", got "${arData.status}"`);
    }
    if (arData.billedAmount === '$0.00') {
      throw new Error(`AR billed amount should not be $0.00 for a claim`);
    }

    console.log(`  AR (Claims): Status=${arData.status} | Billed=${arData.billedAmount}`);

    const availableFormats = await this.arPage.downloadClaimAs(0, payerName, format);
    console.log(`  AR download (${format}) | Formats: [${availableFormats.join(', ')}]`);

    return { arData, availableFormats };
  }

  // ── 837 Text Verification ──

  /**
   * Download the 837 text file from AR and return its content.
   * Navigates to AR > specified tab, searches for patient, opens Download Claim modal,
   * selects 837 format, and reads the downloaded text file.
   */
  async download837TextFromAR(
    patientId: string,
    payerName: string,
    secondaryTab: 'Claims' | 'Notices' = 'Claims'
  ): Promise<string> {
    await this.navigateToAccountsReceivable();
    await this.arPage.navigateToTab(secondaryTab);
    await this.arPage.searchByPatient(patientId);

    return await this.arPage.downloadClaimAsText(0, payerName);
  }

  // ── UB-04 PDF Verification ──

  /**
   * Download the claim PDF/UB04 from Ready tab and verify UB-04 form fields.
   */
  async verifyClaimUb04(
    patientId: string,
    expected: Ub04ExpectedFields,
    secondaryTab: 'Claims' | 'Notices' | 'R&B' = 'Notices'
  ): Promise<void> {
    await this.navigateToBillingClaims('Ready');
    await this.claimsPage.switchSecondaryTab(secondaryTab);
    await this.claimsPage.searchByPatient(patientId);

    const text = await this.claimsPage.downloadClaimPdf(0);
    const errors = this.verifyUb04Fields(text, expected);

    if (errors.length > 0) {
      throw new Error(`UB-04 verification failed:\n  ${errors.join('\n  ')}`);
    }
  }

  /**
   * Verify UB-04 form fields against extracted PDF text.
   */
  private verifyUb04Fields(text: string, expected: Ub04ExpectedFields): string[] {
    const errors: string[] = [];

    const assertPresent = (field: string, value: string) => {
      if (!text.includes(value)) {
        errors.push(`${field}: expected "${value}" to be present`);
      }
    };

    const assertAbsent = (field: string, description: string, searchValues: string[]) => {
      for (const val of searchValues) {
        if (text.includes(val)) {
          errors.push(`${field}: expected ${description} to be absent, but found "${val}"`);
        }
      }
    };

    if (expected.box1_providerName) assertPresent('Box 1 (Provider)', expected.box1_providerName);
    if (expected.box3a_claimId) assertPresent('Box 3a (Claim ID)', expected.box3a_claimId);
    if (expected.box3b_chartId) assertPresent('Box 3b (Chart ID)', expected.box3b_chartId);
    if (expected.box4_billType) assertPresent('Box 4 (Bill Type)', expected.box4_billType);
    if (expected.box5_fedTaxNo) assertPresent('Box 5 (Fed Tax No)', expected.box5_fedTaxNo);
    if (expected.box6_fromDate) assertPresent('Box 6 FROM', expected.box6_fromDate);
    if (expected.box6_throughDate) assertPresent('Box 6 THROUGH', expected.box6_throughDate);

    if (expected.box8_patientName) {
      const lastName = expected.box8_patientName.split(',')[0].trim();
      assertPresent('Box 8 (Patient Name)', lastName);
    }
    if (expected.box10_birthdate) assertPresent('Box 10 (Birthdate)', expected.box10_birthdate);
    if (expected.box11_sex) assertPresent('Box 11 (Sex)', expected.box11_sex);
    if (expected.box12_admissionDate) assertPresent('Box 12 (Admit Date)', expected.box12_admissionDate);
    if (expected.box14_admissionType) assertPresent('Box 14 (Admission Type)', expected.box14_admissionType);
    if (expected.box15_sourceOfAdmission) assertPresent('Box 15 (Source)', expected.box15_sourceOfAdmission);
    if (expected.box17_status) assertPresent('Box 17 (Status)', expected.box17_status);
    if (expected.box31_occurrenceCode) assertPresent('Box 31 (Occurrence Code)', expected.box31_occurrenceCode);
    if (expected.box31_occurrenceDate) assertPresent('Box 31 (Occurrence Date)', expected.box31_occurrenceDate);

    if (expected.box32to35_conditionCodes !== undefined) {
      if (expected.box32to35_conditionCodes.length > 0) {
        for (const code of expected.box32to35_conditionCodes) {
          assertPresent('Box 32-35 (Condition Code)', code);
        }
      }
    }

    if (expected.revenueLineItems !== undefined) {
      if (expected.revenueLineItems.length === 0) {
        assertAbsent('Box 42-49 (Revenue Items)', 'revenue codes', BillingWorkflow.REVENUE_CODES);
      } else {
        expected.revenueLineItems.forEach((item, i) => {
          if (item.revenueCode) assertPresent(`Box 42 Line ${i + 1} (Revenue Code)`, item.revenueCode);
          if (item.description) assertPresent(`Box 43 Line ${i + 1} (Description)`, item.description);
          if (item.hcpcsCode) assertPresent(`Box 44 Line ${i + 1} (HCPCS)`, item.hcpcsCode);
          if (item.serviceDate) assertPresent(`Box 45 Line ${i + 1} (Service Date)`, item.serviceDate);
          if (item.serviceUnits) assertPresent(`Box 46 Line ${i + 1} (Units)`, item.serviceUnits);
          if (item.totalCharges) assertPresent(`Box 47 Line ${i + 1} (Charges)`, item.totalCharges);
        });
      }
    }

    if (expected.box47_totalCharges) assertPresent('Box 47 (Total Charges)', expected.box47_totalCharges);
    if (expected.box50_payerName) assertPresent('Box 50 (Payer)', expected.box50_payerName);
    if (expected.box60_insuredId) assertPresent('Box 60 (Insured ID)', expected.box60_insuredId);

    if (expected.diagnosisCodes) {
      for (const code of expected.diagnosisCodes) {
        assertPresent('Box 67-72 (Diagnosis)', code);
      }
    }

    // Box 35: Occurrence Span Code (e.g., '77' for non-covered days)
    if (expected.box35_occurrenceSpanCode) {
      assertPresent('Box 35 (Occurrence Span Code)', expected.box35_occurrenceSpanCode);
    }
    if (expected.box35_occurrenceSpanFromDate) {
      assertPresent('Box 35 (Occurrence Span From)', expected.box35_occurrenceSpanFromDate);
    }
    if (expected.box35_occurrenceSpanToDate) {
      assertPresent('Box 35 (Occurrence Span To)', expected.box35_occurrenceSpanToDate);
    }

    if (expected.box76_attendingLastName) assertPresent('Box 76 (Attending)', expected.box76_attendingLastName);
    if (expected.box76_attendingNpi) assertPresent('Box 76 (Attending NPI)', expected.box76_attendingNpi);

    return errors;
  }
}
