# Patient Form Elements Documentation

## Overview
This document contains information about the patient form elements found in the "Add Patient" popup modal.

## Form Elements Analysis

### Input Fields
The patient form typically contains the following input fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| First Name | input[text] | Yes | Patient's first name |
| Last Name | input[text] | Yes | Patient's last name |
| Email | input[email] | No | Patient's email address |
| Phone | input[tel] | Yes | Patient's phone number |
| Date of Birth | input[date] | Yes | Patient's date of birth |
| Address | input[text] | No | Patient's street address |
| City | input[text] | No | Patient's city |
| State | input[text] | No | Patient's state/province |
| Zip Code | input[text] | No | Patient's postal code |
| Emergency Contact | input[text] | No | Emergency contact name |
| Emergency Phone | input[tel] | No | Emergency contact phone |

### Radio Button Options
The form contains radio buttons for patient type selection:

| Value | Description |
|-------|-------------|
| Hospice | Hospice care patient |
| Home Health | Home health care patient |
| Private Duty | Private duty patient |

### Select Dropdowns
Common dropdown fields may include:

| Field Name | Options | Description |
|------------|---------|-------------|
| Gender | Male, Female, Other | Patient's gender |
| Insurance | Various insurance providers | Patient's insurance information |
| Physician | List of available physicians | Primary care physician |

### Buttons
| Button Text | Type | Function |
|-------------|------|----------|
| Save | submit | Saves the patient information |
| Cancel | button | Closes the form without saving |
| Add | submit | Alternative save button text |

## Test Data Structure
```javascript
const fakePatientData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'test.patient.{timestamp}@example.com',
  phone: '555-123-4567',
  dateOfBirth: '1980-01-01',
  address: '123 Main Street',
  city: 'Anytown',
  state: 'CA',
  zipCode: '12345',
  emergencyContact: 'Jane Doe',
  emergencyPhone: '555-987-6543',
  patientType: 'Hospice'
};
```

## Common Selectors
### Input Field Selectors
- `input[name="firstName"], ion-input[name="firstName"] input`
- `input[name="lastName"], ion-input[name="lastName"] input`
- `input[name="email"], ion-input[name="email"] input`
- `input[name="phone"], ion-input[name="phone"] input`

### Radio Button Selectors
- `ion-radio[value="Hospice"], input[type="radio"][value="Hospice"]`
- `ion-radio[value="Home Health"], input[type="radio"][value="Home Health"]`
- `ion-radio[value="Private Duty"], input[type="radio"][value="Private Duty"]`

### Button Selectors
- Save: `button[type="submit"], ion-button:has-text("Save"), button:has-text("Save")`
- Cancel: `button:has-text("Cancel"), ion-button:has-text("Cancel")`

### Modal Selectors
- Modal container: `ion-modal, .modal, [role="dialog"]`
- Add patient button: `[data-testid="btn-add-patient"], #btn-add-patient, button:has-text("Add Patient")`

## Notes
- The form uses Ionic framework components (ion-input, ion-radio, ion-button, etc.)
- All form elements are contained within an ion-modal component
- Field validation may be present on required fields
- The form may dynamically show/hide fields based on patient type selection
- Timestamps should be used in email addresses to ensure uniqueness during testing