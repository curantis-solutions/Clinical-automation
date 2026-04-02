import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PDF Helper Utility — General Purpose
 * Downloads files from the browser and extracts text content from PDFs.
 * No billing/claim-specific logic — that belongs in billing page objects.
 */
export class PdfHelper {
  private static readonly DOWNLOAD_DIR = path.join(process.cwd(), 'test-results', 'downloads');

  /**
   * Click a download trigger, wait for the file to download, and return the saved file path.
   * @param page - Playwright Page
   * @param downloadTrigger - Selector to click that triggers the download
   * @returns Path to the downloaded file
   */
  static async downloadFile(page: Page, downloadTrigger: string): Promise<string> {
    if (!fs.existsSync(this.DOWNLOAD_DIR)) {
      fs.mkdirSync(this.DOWNLOAD_DIR, { recursive: true });
    }

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      page.locator(downloadTrigger).click(),
    ]);

    const fileName = download.suggestedFilename();
    const filePath = path.join(this.DOWNLOAD_DIR, fileName);
    await download.saveAs(filePath);
    return filePath;
  }

  /**
   * Extract all text content from a PDF file.
   * @param filePath - Absolute path to the PDF file
   * @returns Full text content of the PDF
   */
  static async extractText(filePath: string): Promise<string> {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  /**
   * Download a file and extract its text in one call.
   * @param page - Playwright Page
   * @param downloadSelector - Selector for the download trigger element
   * @returns Extracted text content
   */
  static async downloadAndExtractText(page: Page, downloadSelector: string): Promise<string> {
    const filePath = await this.downloadFile(page, downloadSelector);
    return await this.extractText(filePath);
  }

  /**
   * Verify that text contains all expected values.
   * @param text - Text to search in
   * @param expectedValues - Array of strings that must be present
   */
  static verifyContains(text: string, expectedValues: string[]): { passed: boolean; missing: string[] } {
    const missing = expectedValues.filter(val => !text.includes(val));
    return { passed: missing.length === 0, missing };
  }

  /**
   * Clean up a downloaded file.
   */
  static cleanup(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
