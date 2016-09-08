An API for getting and processing patient info, deployed on Cloud Foundry using Flask

About
================================================================================

This API will allow a discharge planning system that has access to the patient `admissionIDs` to pass a list of ids and receive the relevant patient data for display in a front-end layer.

The `record-getter` also makes a call to the `risk-scorer` API to fetch the risk score associated with each patient.

To Use
================================================================================
Navigate into the `record-getter` folder and use:

`cf push record-getter`

If your API is at the following url: `http://record-getter.12.345.678.910.nip.io`, and you want to get patient info for admission ids `155684` and `135188` just use the `/v1/get-records` ending with the admission ids in an array as the data param, like so: 

`http://record-getter.12.345.678.910.nip.io/v1/get-records?admissionIDs=[135188, 155684]`

That returns:
```python
{
  numberDocsReturned: 2,
  documents: [
              {
              patientInfo: {
              language: "",
              admittime: "2173-05-05T00:05:00.000Z",
              comorbid_severity: 0,
              admission_type: "URGENT",
              dischtime: "2173-05-18T02:10:00.000Z",
              age: 77,
              insurance: "Medicare",
              hadm_id: 135188,
              dob: "2096-03-01T00:00:00.000Z",
              marital_status: "DIVORCED",
              subject_id: 10431,
              gender: "F",
              comorbid_mortality: 0,
              diagnosis: "DUODENAL ULCER",
              readmissionRisk: 0.133333333333333,
              ethnicity: "PATIENT DECLINED TO ANSWER"
              },
              hadm_id: 135188
            },
            {
              patientInfo: {
              language: "ENGL",
              admittime: "2132-09-25T20:26:00.000Z",
              comorbid_severity: 2,
              admission_type: "EMERGENCY",
              dischtime: "2132-10-03T15:35:00.000Z",
              age: 45,
              insurance: "Medicaid",
              hadm_id: 155684,
              dob: "2087-06-17T00:00:00.000Z",
              marital_status: "SINGLE",
              subject_id: 29106,
              gender: "M",
              comorbid_mortality: 1.3333333333333333,
              diagnosis: "PANCREATITIS;GASTROINTESTINAL BLEED",
              readmissionRisk: 0.46666666666666606,
              ethnicity: "WHITE"
              },
              hadm_id: 155684
            }
          ]
}
```

Hope this makes things easier!

