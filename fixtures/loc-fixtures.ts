/**
 * LOC Test Data — Care Location Fixtures
 *
 * Maps care location type (Q-code) → environment → tenant → facility name.
 * Empty strings = not yet populated (need to discover via the app).
 *
 * Resolution logic lives in LOCWorkflow.getCareLocation().
 */
export const CARE_LOCATIONS: Record<string, Record<string, Record<string, string>>> = {
  'Q5004': {  // Skilled Nursing
    qa:      { cth: 'Bear Creek SNF', integrum: 'Addison Facility' },
    staging: { ch: 'skillednursingfacilitytest' },
    prod:    { cth: 'Sun Skilled Nursing FAcility', cch: 'Addison Manor' },
  },
  'Q5002': {  // Assisted Living
    qa:   { cth: 'Allen Assisted Facility', integrum: 'AssistedTestFacility' },
    prod: { cth: 'Addison Assisted facility', cch: 'Happy Camper Assisted Living' },
  },
  'Q5009': {  // Not Otherwise Specified
    qa:   { cth: 'Cornerstone Hospice', integrum: 'Unspecified facility' },
    prod: { cth: 'Unspecified', cch: 'My Unspecified' },
  },
  // Add more as needed: Q5001, Q5003, Q5005, Q5006, Q5007, Q5008, Q5010
};
