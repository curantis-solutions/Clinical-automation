# Add Patient Workflow - Reusable Function with Fixtures

This directory contains reusable functions and fixtures for adding patients in automated tests.

## 📁 Files

- **`addpatient-workflow.ts`** - Main reusable workflow function
- **`addpatient-with-fixtures.spec.ts`** - Example tests using fixtures
- **`admit-patient-workflow.spec.ts`** - Complete end-to-end workflow test
- **`../../fixtures/patient-data.fixture.ts`** - Patient data fixtures

---

## 🚀 Quick Start

### Option 1: Using Fixtures (Recommended)

```typescript
import { addPatientFromFixture } from './addpatient-workflow';
import { PATIENT_FIXTURES } from '../../fixtures/patient-data.fixture';

// Add a predefined patient
const result = await addPatientFromFixture(
  page,
  PATIENT_FIXTURES.HOSPICE_MALE_VETERAN
);

console.log(`Patient created with ID: ${result.patientId}`);
```

### Option 2: Using Custom Configuration

```typescript
import { addPatientWorkflow, PatientWorkflowConfig } from './addpatient-workflow';

const config: PatientWorkflowConfig = {
  careType: 'Hospice',
  demographics: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '01/15/1950',
    gender: 'Male',
    veteran: true,
  },
  contactInfo: {
    phoneNumber: '214-555-1234',
  },
  address: {
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
  },
};

const result = await addPatientWorkflow(page, config);
```

---

## 📋 Available Fixtures

### Hospice Patients
- **`HOSPICE_MALE_VETERAN`** - Male veteran with skilled bed
- **`HOSPICE_FEMALE_NON_VETERAN`** - Female non-veteran, widowed
- **`HOSPICE_MALE_SKILLED_BED`** - Male with skilled bed requirement
- **`HOSPICE_MINIMAL_MALE`** - Minimal data (auto-generated names)

### Palliative Patients
- **`PALLIATIVE_FEMALE_SINGLE`** - Single female, non-veteran
- **`PALLIATIVE_MALE_DIVORCED`** - Divorced male veteran
- **`PALLIATIVE_MINIMAL_FEMALE`** - Minimal data (auto-generated names)

### Evaluation Patients
- **`EVALUATION_MALE_VETERAN`** - Male veteran, widowed
- **`EVALUATION_FEMALE_MARRIED`** - Married female, non-veteran

---

## 🆕 New Features: Referral Information & Runtime Data

### Referral Information in Fixtures

Fixtures now support storing referral information (caller, referrer, referring physician, ordering physician) directly in the fixture data. This eliminates hardcoding search names in tests.

**Example Fixture with Referral Info:**
```typescript
export const HOSPICE: PatientDataFixture = {
  // ... patient data ...
  referralInfo: {
    caller: {
      referralType: 'Call',
      relation: 'Physician',
      searchName: 'cypresslast',
    },
    referrer: {
      sameAsCaller: true,
    },
    referringPhysician: {
      sameAsReferrer: true,
    },
    orderingPhysician: {
      sameAsReferringPhysician: true,
    },
  },
};
```

**Using Referral Info in Tests:**
```typescript
// Get referral info from fixture
const callerInfo = PATIENT_FIXTURES.HOSPICE.referralInfo?.caller;

// Use it in the workflow
await addCallerInformation(page, {
  referralType: callerInfo?.referralType || 'Call',
  relation: callerInfo?.relation || 'Physician',
  searchName: callerInfo?.searchName,
});
```

### Runtime Data Storage

Patient IDs and URLs are automatically stored back to the fixture after patient creation. Access them later in your tests.

**Automatic Storage:**
```typescript
// Patient ID is automatically captured and stored in fixture
const result = await addPatientFromFixture(page, PATIENT_FIXTURES.HOSPICE);
// result.patientId is now also stored in PATIENT_FIXTURES.HOSPICE.runtimeData
```

**Accessing Stored Data:**
```typescript
import { getPatientIdFromFixture } from '../../fixtures/patient-data.fixture';

// Retrieve patient ID from fixture
const patientId = getPatientIdFromFixture(PATIENT_FIXTURES.HOSPICE);
console.log(`Patient ID: ${patientId}`);

// Access other runtime data
console.log(`Created At: ${PATIENT_FIXTURES.HOSPICE.runtimeData?.createdAt}`);
console.log(`URL: ${PATIENT_FIXTURES.HOSPICE.runtimeData?.url}`);
```

---

## 💡 Usage Examples

### Example 1: Add Single Patient with Fixture

```typescript
test('Add Hospice Patient', async ({ page }) => {
  const result = await addPatientFromFixture(
    page,
    PATIENT_FIXTURES.HOSPICE_MALE_VETERAN
  );

  expect(result.success).toBeTruthy();
  expect(result.patientId).toBeDefined();
});
```

### Example 2: Add Multiple Patients

```typescript
test('Add Multiple Patients', async ({ page }) => {
  const fixtures = [
    PATIENT_FIXTURES.HOSPICE_MALE_VETERAN,
    PATIENT_FIXTURES.PALLIATIVE_FEMALE_SINGLE,
    PATIENT_FIXTURES.EVALUATION_MALE_VETERAN,
  ];

  for (const fixture of fixtures) {
    const result = await addPatientFromFixture(page, fixture, {
      skipLogin: true, // Skip login after first patient
      returnToPatientList: true,
    });

    expect(result.success).toBeTruthy();
  }
});
```

### Example 3: Add All Hospice Patients

```typescript
import { getHospiceFixtures } from '../../fixtures/patient-data.fixture';

test('Add All Hospice Patients', async ({ page }) => {
  const hospiceFixtures = getHospiceFixtures();

  for (const fixture of hospiceFixtures) {
    const result = await addPatientFromFixture(page, fixture, {
      skipLogin: true,
      returnToPatientList: true,
    });

    console.log(`Created: ${result.patientFirstName} ${result.patientLastName}`);
  }
});
```

### Example 4: Custom Patient with Auto-Generated Data

```typescript
const config: PatientWorkflowConfig = {
  careType: 'Hospice',
  demographics: {
    // firstName, lastName, ssn will be auto-generated
    dateOfBirth: '01/15/1950',
    gender: 'Male',
    veteran: false,
  },
  contactInfo: {}, // Auto-generated
  address: {
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
  },
};

const result = await addPatientWorkflow(page, config);
```

---

## ⚙️ Configuration Options

### Workflow Options

```typescript
options: {
  skipLogin?: boolean;          // Skip login step (default: false)
  skipNavigation?: boolean;     // Skip navigation to Patient module (default: false)
  returnToPatientList?: boolean; // Return to patient list after creation (default: false)
}
```

### Credentials

```typescript
credentials: {
  username?: string;  // Custom username
  password?: string;  // Custom password
  role?: string;      // Role: 'RN', 'MD', 'SW', etc. (default: 'RN')
}
```

---

## 📊 Result Object

The workflow functions return a `PatientWorkflowResult` object:

```typescript
{
  success: boolean;           // Whether patient was created successfully
  patientId?: number;         // Captured patient ID (if available)
  patientFirstName: string;   // Patient's first name
  patientLastName: string;    // Patient's last name
  patientSSN: string;         // Patient's SSN
  error?: string;             // Error message (if failed)
  url?: string;               // Current page URL
}
```

---

## 🔧 Helper Functions

### Get Fixtures by Care Type

```typescript
import {
  getHospiceFixtures,
  getPalliativeFixtures,
  getEvaluationFixtures
} from '../../fixtures/patient-data.fixture';

const hospicePatients = getHospiceFixtures();
const palliativePatients = getPalliativeFixtures();
const evaluationPatients = getEvaluationFixtures();
```

### Get Random Fixture

```typescript
import { getRandomPatientFixture } from '../../fixtures/patient-data.fixture';

const randomFixture = getRandomPatientFixture();
const result = await addPatientFromFixture(page, randomFixture);
```

### Create Custom Configs

```typescript
import {
  createHospicePatientConfig,
  createPalliativePatientConfig,
  createEvaluationPatientConfig
} from './addpatient-workflow';

const config = createHospicePatientConfig({
  demographics: {
    firstName: 'Custom',
    lastName: 'Name',
  },
});
```

---

## 🧪 Running Tests

### Run all workflow tests
```bash
npx playwright test tests/workflows/
```

### Run fixture examples only
```bash
npx playwright test tests/workflows/addpatient-with-fixtures.spec.ts
```

### Run with specific fixture tag
```bash
npx playwright test --grep "@fixture"
```

### Run in headed mode
```bash
npx playwright test tests/workflows/addpatient-with-fixtures.spec.ts --headed
```

---

## 📝 Creating New Fixtures

To add new patient fixtures, edit `fixtures/patient-data.fixture.ts`:

```typescript
export const MY_CUSTOM_PATIENT: PatientDataFixture = {
  fixtureName: 'MY_CUSTOM_PATIENT',
  description: 'Description of this patient',
  careType: 'Hospice',
  demographics: {
    firstName: 'Custom',
    lastName: 'Patient',
    dateOfBirth: '01/01/1960',
    gender: 'Male',
    veteran: false,
  },
  contactInfo: {
    phoneNumber: '214-555-9999',
  },
  address: {
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
  },
};

// Add to PATIENT_FIXTURES collection
export const PATIENT_FIXTURES = {
  // ... existing fixtures
  MY_CUSTOM_PATIENT,
};
```

---

## 🎯 Best Practices

1. **Use Fixtures for Consistency** - Prefer fixtures over custom configs for repeatable tests
2. **Skip Login When Possible** - Use `skipLogin: true` for subsequent patients in the same test
3. **Return to Patient List** - Use `returnToPatientList: true` when adding multiple patients
4. **Auto-Generate When Appropriate** - Leave fields undefined to auto-generate unique data
5. **Validate Results** - Always check `result.success` and `result.patientId`

---

## 📞 Support

For issues or questions, refer to:
- Main test file: `admit-patient-workflow.spec.ts`
- Example tests: `addpatient-with-fixtures.spec.ts`
- Fixture definitions: `../../fixtures/patient-data.fixture.ts`
