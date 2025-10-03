import { CareType, PatientData, Gender } from '../types/patient.types';

/**
 * Utility class for generating test patient data
 */
export class PatientDataGenerator {
  private static firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
    'William', 'Mary', 'James', 'Jennifer', 'Richard', 'Linda', 'Thomas', 'Patricia'
  ];

  private static lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'
  ];

  private static cities = ['Dallas', 'Irving', 'Plano', 'Frisco', 'McKinney', 'Arlington'];

  /**
   * Generate random number with specified digits
   */
  private static generateRandomNumber(digits: number): string {
    let result = '';
    for (let i = 0; i < digits; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  /**
   * Generate random SSN in format XXX-XX-XXXX
   */
  static generateSSN(): string {
    const part1 = this.generateRandomNumber(3);
    const part2 = this.generateRandomNumber(2);
    const part3 = this.generateRandomNumber(4);
    return `${part1}-${part2}-${part3}`;
  }

  /**
   * Generate random phone number
   */
  static generatePhoneNumber(): string {
    return this.generateRandomNumber(10);
  }

  /**
   * Generate random zip code
   * Returns a known valid Texas zip code with county mapping
   */
  static generateZipCode(): string {
    // Use known valid Texas zip codes that have county mapping configured in the system
    const validTexasZipCodes = ['75001', '75002', '75006', '75212', '75220', '75230'];
    return this.getRandomItem(validTexasZipCodes);
  }

  /**
   * Get random item from array
   */
  private static getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate random first name
   */
  static generateFirstName(): string {
    const environment = process.env.TEST_ENV || 'qa';
    const prefix = `Auto${environment.toUpperCase()}`;
    const randomName = this.getRandomItem(this.firstNames);
    return `${prefix}${randomName}${Date.now()}`;
  }

  /**
   * Generate random last name
   */
  static generateLastName(): string {
    const environment = process.env.TEST_ENV || 'qa';
    const randomName = this.getRandomItem(this.lastNames);
    return `${randomName}${this.generateRandomNumber(3)}`;
  }

  /**
   * Generate random date of birth (between 20-90 years old)
   */
  static generateDateOfBirth(): string {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - (Math.floor(Math.random() * 70) + 20); // 20-90 years old
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${month}/${day}/${birthYear}`;
  }

  /**
   * Generate complete patient data
   * @param careType - Type of care (Hospice, Palliative, Evaluation)
   * @param overrides - Optional overrides for any patient data fields
   * @returns Complete PatientData object
   */
  static generatePatientData(
    careType: CareType,
    overrides?: Partial<PatientData>
  ): PatientData {
    const defaultData: PatientData = {
      careType,
      demographics: {
        firstName: this.generateFirstName(),
        lastName: this.generateLastName(),
        ssn: this.generateSSN(),
        dateOfBirth: this.generateDateOfBirth(),
        gender: this.getRandomItem(['Male', 'Female'] as Gender[]),
        veteran: false,
      },
      contactInfo: {
        phoneNumber: this.generatePhoneNumber(),
        emailAddress: 'test@curantissolutions.com',
      },
      address: {
        streetAddress: '123 Beltline Road',
        city: this.getRandomItem(this.cities),
        state: 'TX',
        zipCode: this.generateZipCode(),
      },
      additionalInfo: {
        maritalStatus: 'Single',
        firstLanguage: 'English',
        religion: 'Christian',
        ethnicity: 'White',
        ethnicityHope: 'White',
        raceHope: 'White',
        skilledBed: careType === 'Hospice' ? false : undefined,
      },
    };

    // Merge with overrides if provided
    if (overrides) {
      return {
        ...defaultData,
        demographics: { ...defaultData.demographics, ...overrides.demographics },
        contactInfo: { ...defaultData.contactInfo, ...overrides.contactInfo },
        address: { ...defaultData.address, ...overrides.address },
        additionalInfo: { ...defaultData.additionalInfo, ...overrides.additionalInfo },
      };
    }

    return defaultData;
  }

  /**
   * Generate minimal patient data (only required fields)
   */
  static generateMinimalPatientData(careType: CareType): PatientData {
    return {
      careType,
      demographics: {
        firstName: this.generateFirstName(),
        lastName: this.generateLastName(),
        ssn: this.generateSSN(),
        dateOfBirth: this.generateDateOfBirth(),
        gender: 'Male',
        veteran: false,
      },
      contactInfo: {
        phoneNumber: this.generatePhoneNumber(),
        emailAddress: 'test@curantissolutions.com',
      },
      address: {
        streetAddress: '123 Beltline Road',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75212',
      },
    };
  }
}
