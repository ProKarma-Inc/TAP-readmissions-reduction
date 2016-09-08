About
================================================================================
The following APIs were created during the development of this reference architecture:

  1. `risk-scorer` - A machine learning model that was trained to predict the readmission risk of a patient about to be discharged. The API receives an array consisting of one or many `patientIDs` and returns a risk score.
  2. `record-getter` - This API takes the list of `patientIDs` from the discharge planner, fetches their medical records, queries the `risk-scorer` for each patient and returns a JSON object that has all of the patient data in a single consolidated format.
  3. `discharge-planner` - This app simulates a flow of patients out of the hospital. In any given hospital there is some process that determines when each patient is ready to be discharged. Since, this reference architecture was developed from historical open source data, there is no live discharge process to integerate with. When a `GET` method is called on this app, it randomly selects a new batch of patients, queries the `record-getter` and send those records to MongoDB where they can be consumed by the front-end app.
  4. `reference-data-api` - This API is a lightweight service that returns population reference data for plotting a histogram of the age and different comorbidity scores in the patient specific view of the app. The population reference data is segmented by age range, so each patient's data is displayed in the context of their age range.
