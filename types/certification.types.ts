/**
 * Certification Type Definitions
 * Discriminated union types for Verbal vs Written certification forms
 */

export type CertificationType = 'Verbal' | 'Written';

export interface VerbalCertificationFormData {
  certType: 'Verbal';
  benefitPeriodIndex?: number;
  hospicePhysician?: string;
  hospicePhysicianOptionIndex?: number;
  certifyingObtainedOn?: string;
  certifyingReceivedBy?: string;
  attendingPhysician?: string;
  attendingPhysicianOptionIndex?: number;
  attendingObtainedOn?: string;
  attendingReceivedBy?: string;
}

export interface WrittenCertificationFormData {
  certType: 'Written';
  benefitPeriodIndex?: number;
  hospicePhysician?: string;
  hospicePhysicianOptionIndex?: number;
  certifyingSignedOn?: string;
  attendingPhysician?: string;
  attendingPhysicianOptionIndex?: number;
  attendingSignedOn?: string;
  briefNarrativeStatement?: string;
  narrativeOnFile?: boolean;
  signatureReceivedFromAttending?: boolean;
}

export type CertificationFormData = VerbalCertificationFormData | WrittenCertificationFormData;

export interface CertificationEditData {
  reasonForChange: string;
}
