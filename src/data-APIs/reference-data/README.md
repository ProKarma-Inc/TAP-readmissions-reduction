An API for population reference data for creating visualizations, deployed on Cloud Foundry using Flask

About
================================================================================

This API is a lightweight service that returns population reference data for plotting a histogram of the age and different comorbidity scores in the patient specific view of the app. The population reference data is segmented by age range, so each patient's data is displayed in the context of their age range.

To Use
================================================================================
Navigate into the `reference-data` folder and use:

`cf push reference-data`

If your API is at the following url: `http://reference-data-api.12.345.678.910.nip.io`, you can use the following two methods:

1. `get-reference-data` - Pass the patients `age` like so: `http://reference-data-api.12.345.678.910.nip.io/v1/get-reference-data?age=42`. This will return a JSON object like the one bellow:
```python
{
  age: [43.0, 32.0, 48.0, ...],
  comorbid_mortality: [1.0, 2.0, 1.5, ...],
  comorbid_severity: [1.0, 2.0, 1.5, ...]
}
```

2. `get-readmission-data` - Just query the API with this method: `http://reference-data-api.12.345.678.910.nip.io/v1/get-readmission-data`. This returns the following JSON object:
```python
{
  date: [
        "2015-09-06",
        "2015-09-13",
        "2015-09-20",
        ...
        ],
  readmissionRate: [
        0.07219130794685127,
        0.06496413693747094,
        0.06812552891285015,
        ...
                  ]
}
```

