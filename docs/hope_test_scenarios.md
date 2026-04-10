# HOPE Test Scenarios

---

## Scenario 1 — Admit Patient and Complete INV (No SFV)

> **Note:** All Symptoms are 0, 1, or 9

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Admit a patient  | — |
| 2 | Navigate to Careplan | Notices on Brief and Careplan: INV needed by 10/06, HUV needed by 10/16/25, HUV2 needed by 10/31/25 |
| 3 | Start an INV | — |
| 4 | Click on **Preference** | Fill out: F2000, Hope Administration, F2100, F2200, F3000, Signs of Imminent Death |
| 5 | Click on **Neurological** | Fill out Symptom Rank for Anxiety and Agitation |
| 6 | Click on **Pain** | Fill out: J0900, J0905, J0910.C, J0910.A&B, N0500, N0510 |
| 7 | Click on **Respiratory** | Fill out: J2030, J2040 |
| 8 | Click on **Gastrointestinal** | Fill out: N0520, Most Recent Bowel Movement, Vomiting (Symptom Rank), Nausea (Symptom Rank) |
| 9 | Click on **Skin** | Fill out: Wound/Skin Conditions, Skin and Ulcer/Injury Treatments |
| 10 | Click on **HOPE Preview** | All answers should map and no red alerts |
| 11 | Complete Summary and POC Issues | Admit the patient |
| 12 | Navigate to HIS/HOPE | Auto Admission HOPE file will be created |
| 13 | Click on HOPE File | Section A (Payor Info needs to be filled). All other cards should get a checkmark. Navigate to Z card and complete the record |
| 14 | Export the HOPE record | Rubix Cube → HIS/HOPE → Select the record → Export. Zip file downloaded |

---

## Scenario 2 — Admit Patient and Complete INV (With SFV)

> **Note:** All Symptoms are 0, 1, or 9. If a symptom is moderate or severe (2 or 3), an SFV is required.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Admit a patient  | — |
| 2 | Navigate to Careplan | Notices on Brief and Careplan: INV needed by 10/06, HUV needed by 10/16/25, HUV2 needed by 10/31/25 |
| 3 | Start an INV | — |
| 4 | Click on **Preference** | Fill out: F2000, Hope Administration, F2100, F2200, F3000, Signs of Imminent Death |
| 5 | Click on **Neurological** | Fill out Symptom Rank for Anxiety and Agitation |
| 6 | Click on **Pain** | Fill out: J0900, J0905, J0910.C, J0910.A&B, N0500, N0510 |
| 7 | Click on **Respiratory** | Fill out: J2030, J2040 |
| 8 | Click on **Gastrointestinal** | Fill out: N0520, Most Recent Bowel Movement, Vomiting (Symptom Rank), Nausea (Symptom Rank) |
| 9 | Click on **Skin** | Fill out: Wound/Skin Conditions, Skin and Ulcer/Injury Treatments |
| 10 | Click on **HOPE Preview** | All answers should map and no red alerts |
| 11 | Complete Summary and POC Issues | Admit the patient |
| 12 | Navigate to HIS/HOPE | Auto Admission HOPE file created. Grid will show indicator: **SFV Pending** |
| 13 | Click on HOPE File | Section A (Payor Info needs to be filled). All cards get a checkmark **except Section J** (requires SFV) |
| 14 | Navigate to Careplan | Start an SFV with any visit type (Initial/Comp, Comprehensive, Routine, Emergent, Watch Care, EMC, Inpatient). SFV can be done by RN, NP, LVN/LPN |
| 15 | Click on **Preference** | Fill out: F2000, Hope Administration, F2100, F2200, F3000, Signs of Imminent Death |
| 16 | Click on **Neurological** | Fill out Symptom Rank for Anxiety and Agitation |
| 17 | Click on **Pain** | Fill out: J0900, J0905, J0910.C, J0910.A&B, N0500, N0510 |
| 18 | Click on **Respiratory** | Fill out: J2030, J2040 |
| 19 | Click on **Gastrointestinal** | Fill out: N0520, Most Recent Bowel Movement, Vomiting (Symptom Rank), Nausea (Symptom Rank) |
| 20 | Complete Summary and POC Issues | Admit the patient |
| 21 | Navigate to HIS/HOPE | SFV Pending indicator no longer appears |
| 22 | Click on HOPE File | Section A (Payor Info needs to be filled). All cards get a checkmark. Navigate to Z card and complete the record |
| 23 | Export the HOPE record | Rubix Cube → HIS/HOPE → Select the record → Export. Zip file downloaded |

---

## Scenario 3 — Complete HUV1 (No SFV)

> **Note:** All Symptoms are 0, 1, or 9

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Careplan | Notices: HUV needed by 10/16/25, HUV2 needed by 10/31/25 |
| 2 | Start a visit (Initial/Comp, Comprehensive, Routine, Emergent, Watch Care, EMC, Inpatient) | — |
| 3 | Click on **Preference** | Fill out: Signs of Imminent Death |
| 4 | Click on **Neurological** | Fill out Symptom Rank for Anxiety and Agitation |
| 5 | Click on **Pain** | Fill out: Symptom Rank for Pain, N0500, N0510 |
| 6 | Click on **Respiratory** | Fill out Symptom Rank for Shortness of Breath |
| 7 | Click on **Gastrointestinal** | Fill out: N0520, Most Recent Bowel Movement, Vomiting (Symptom Rank), Nausea (Symptom Rank) |
| 8 | Click on **Skin** | Fill out: Wound/Skin Conditions, Skin and Ulcer/Injury Treatments |
| 9 | Click on **HOPE Report Preview** | All answers should map and no red alerts |
| 10 | Complete Summary and POC Issues | — |
| 11 | Navigate to HIS/HOPE | Auto HUV HOPE file created |
| 12 | Click on HOPE File | Section A (Payor Info needs to be filled). All cards get a checkmark. Navigate to Z card and complete the record |
| 13 | Export the HOPE record | Rubix Cube → HIS/HOPE → Select the record → Export. Zip file downloaded |

---

## Scenario 4 — Complete HUV1 (With SFV)

> **Note:** HUV can be done by RN, NP. If any symptom is marked 2 or 3, an SFV is required.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Careplan | Notices: HUV needed by 10/16/25, HUV2 needed by 10/31/25 |
| 2 | Start a visit (Initial/Comp, Comprehensive, Routine, Emergent, Watch Care, EMC, Inpatient) | — |
| 3 | Click on **Preference** | Fill out: Signs of Imminent Death |
| 4 | Click on **Neurological** | Fill out Symptom Rank for Anxiety and Agitation |
| 5 | Click on **Pain** | Fill out: Symptom Rank for Pain, N0500, N0510 |
| 6 | Click on **Respiratory** | Fill out Symptom Rank for Shortness of Breath |
| 7 | Click on **Gastrointestinal** | Fill out: N0520, Most Recent Bowel Movement, Vomiting (Symptom Rank), Nausea (Symptom Rank) |
| 8 | Click on **Skin** | Fill out: Wound/Skin Conditions, Skin and Ulcer/Injury Treatments |
| 9 | Click on **HOPE Report Preview** | All answers should map and no red alerts |
| 10 | Complete Summary and POC Issues | — |
| 11 | Navigate to HIS/HOPE | Auto HUV HOPE file created |
| 12 | Click on HOPE File | Section A (Payor Info needs to be filled). All cards get a checkmark **except Section J** (requires SFV). Z0350 will be empty |
| 13 | Navigate to Careplan | Start an SFV with any visit type. SFV can be done by RN, NP, LVN/LPN |
| 14 | Click on **Neurological** | Fill out Symptom Rank for Anxiety and Agitation |
| 15 | Click on **Pain** | Fill out: Symptom Rank for Pain, N0500, N0510 |
| 16 | Click on **Respiratory** | Fill out Symptom Rank for Shortness of Breath |
| 17 | Click on **Gastrointestinal** | Fill out: N0520, Most Recent Bowel Movement, Vomiting (Symptom Rank), Nausea (Symptom Rank) |
| 18 | Complete Summary and POC Issues | — |
| 19 | Navigate to HIS/HOPE | SFV Pending indicator no longer appears |
| 20 | Click on HOPE File | Section A (Payor Info needs to be filled). All cards get a checkmark. Navigate to Z card — verify Z0350 has SFV completed date. Complete the record |
| 21 | Export the HOPE record | Rubix Cube → HIS/HOPE → Select the record → Export. Zip file downloaded |

---

## Scenario 5 — Complete HUV2 (No SFV)

> **Note:** All Symptoms are 0, 1, or 9

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Careplan | Notices: HUV needed by 10/16/25, HUV2 needed by 10/31/25 |
| 2 | Start a visit (Initial/Comp, Comprehensive, Routine, Emergent, Watch Care, EMC, Inpatient) | — |
| 3 | Click on **Preference** | Fill out: Signs of Imminent Death |
| 4 | Click on **Neurological** | Fill out Symptom Rank for Anxiety and Agitation |
| 5 | Click on **Pain** | Fill out: Symptom Rank for Pain, N0500, N0510 |
| 6 | Click on **Respiratory** | Fill out Symptom Rank for Shortness of Breath |
| 7 | Click on **Gastrointestinal** | Fill out: N0520, Most Recent Bowel Movement, Vomiting (Symptom Rank), Nausea (Symptom Rank) |
| 8 | Click on **Skin** | Fill out: Wound/Skin Conditions, Skin and Ulcer/Injury Treatments |
| 9 | Click on **HOPE Report Preview** | All answers should map and no red alerts |
| 10 | Complete Summary and POC Issues | — |
| 11 | Navigate to HIS/HOPE | Auto HUV HOPE file created |
| 12 | Click on HOPE File | Section A (Payor Info needs to be filled). All cards get a checkmark. Navigate to Z card and complete the record |
| 13 | Export the HOPE record | Rubix Cube → HIS/HOPE → Select the record → Export. Zip file downloaded |

---

## Scenario 6 — Complete HUV2 (With SFV)

> **Note:** If any symptom is marked 2 or 3, an SFV is required.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Careplan | Notices: HUV needed by 10/16/25, HUV2 needed by 10/31/25 |
| 2 | Start a visit (Initial/Comp, Comprehensive, Routine, Emergent, Watch Care, EMC, Inpatient) | — |
| 3 | Click on **Preference** | Fill out: Signs of Imminent Death |
| 4 | Click on **Neurological** | Fill out Symptom Rank for Anxiety and Agitation |
| 5 | Click on **Pain** | Fill out: Symptom Rank for Pain, N0500, N0510 |
| 6 | Click on **Respiratory** | Fill out Symptom Rank for Shortness of Breath |
| 7 | Click on **Gastrointestinal** | Fill out: N0520, Most Recent Bowel Movement, Vomiting (Symptom Rank), Nausea (Symptom Rank) |
| 8 | Click on **Skin** | Fill out: Wound/Skin Conditions, Skin and Ulcer/Injury Treatments |
| 9 | Click on **HOPE Report Preview** | All answers should map and no red alerts |
| 10 | Complete Summary and POC Issues | — |
| 11 | Navigate to HIS/HOPE | Auto HUV HOPE file created |
| 12 | Click on HOPE File | Section A (Payor Info needs to be filled). All cards get a checkmark **except Section J** (requires SFV). Z0350 will be empty |
| 13 | Navigate to Careplan | Start an SFV with any visit type. SFV can be done by RN, NP, LVN/LPN |
| 14 | Click on **Neurological** | Fill out Symptom Rank for Anxiety and Agitation |
| 15 | Click on **Pain** | Fill out: Symptom Rank for Pain, N0500, N0510 |
| 16 | Click on **Respiratory** | Fill out Symptom Rank for Shortness of Breath |
| 17 | Click on **Gastrointestinal** | Fill out: N0520, Most Recent Bowel Movement, Vomiting (Symptom Rank), Nausea (Symptom Rank) |
| 18 | Complete Summary and POC Issues | — |
| 19 | Navigate to HIS/HOPE | SFV Pending indicator no longer appears |
| 20 | Click on HOPE File | Section A (Payor Info needs to be filled). All cards get a checkmark. Navigate to Z card — verify Z0350 has SFV completed date. Complete the record |
| 21 | Export the HOPE record | Rubix Cube → HIS/HOPE → Select the record → Export. Zip file downloaded |

---

## Scenario 7 — HOPE Discharge

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Discharge a patient / Postmortem Visit | — |
| 2 | Navigate to HIS/HOPE | Discharge file generated. Section A pre-filled. Navigate to Z card and complete the record |
| 3 | Export the HOPE record | Rubix Cube → HIS/HOPE → Select the record → Export. Zip file downloaded |

---

## Scenario 8 — Inactivation of a Record

> **Note:** Inactivation link is only available for exported files.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Patient Profile and change name | — |
| 2 | Click on Inactivation link | HOPE file generated with Type = **3** |
| 3 | Verify name field | Should show **old name** even if name was changed |
| 4 | Verify all dates | All dates should be pre-filled |
| 5 | Verify Z0500A | Should be **empty** |
| 6 | Verify Z0500B | Value should remain **unchanged** |
| 7 | Complete the record | — |
| 8 | Export the HOPE record | Rubix Cube → HIS/HOPE → Select the record → Export. Zip file downloaded |

---

## Scenario 9 — Modification of a Record

> **Note:** Modification link is only available for exported files.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Patient Profile and change name | — |
| 2 | Click on Modification link | HOPE file generated with Type = **3** |
| 3 | Verify name field | Name change **should** be reflected |
| 4 | Verify all dates | All dates should be pre-filled |
| 5 | Verify Z0500A | Should be **empty** |
| 6 | Verify Z0500B | Value should remain **unchanged** |
| 7 | Complete the record | — |
| 8 | Export the HOPE record | Rubix Cube → HIS/HOPE → Select the record → Export. Zip file downloaded |

---

## Scenario 10 — Update Unexported HOPE Data When Patient Profile or Benefit Data Changes

> Applies when a HOPE record is in **READY** or **NOT READY** status.

| Patient Profile Field Updated | HOPE Question Updated |
|-------------------------------|----------------------|
| Name | A0500 |
| DOB | A0909 |
| Gender | A0800 |
| SSN | A0600 |
| Initial care location (earliest LOC order) | A0215 *(admission only)* |
| Referral location | A1805 *(admission only)* |
| Ethnicity | A1005 *(admission only)* |
| Race | A1010 *(admission only)* |
| Language | A1110 *(admission only)* |
| Medicare # | A0600 |
| Medicaid # | A0700 |

---

## Scenario 11 — Flag Exported HOPE Discharge Record When Discharge Information Changes

> Applies when a HOPE record is in **Exported** status.
> Reference: [CL-1708](https://curantissolutions.atlassian.net/browse/CL-1708)

| Changed Field | Affected Files | Message Displayed |
|---------------|---------------|-------------------|
| Visit date for HUV-1, HUV-2, SFV-Adm, SFV-HUV#1, SFV-HUV#2 | HUV#1 or HUV#2 | *Visit date was updated — Inactivation Required* |
| Admission Date | All files in exported status at time of change | *Admission date was changed — Inactivation Required* |
| Discharge Date | Discharge | *Discharge date was changed — Inactivation Required* |
| First Name, Last Name, SSN, DOB, Gender | All files in exported status at time of change | *Patient Identifiers Updated — Inactivation Required* |
| Discharge Reason | Discharge | *Discharge Reason Updated — Modification Required* |
