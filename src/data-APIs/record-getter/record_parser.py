import requests
import json
import pandas as pd
import numpy as np

def parse_records(urls, admissionIDs):
    '''
    Input: a list of strings, and an array of integers
    Output: a pandas DataFrame
    Description: parse_records is a custom parser procedure will query mongoDB and
    extract the data fields for each admissionID that we want to be able to show in the
    visualization application. The final output is a pandas dataframe where each row is 
    an admissionID where the columns are specified in the admissionCols, comorbidCols 
    and patientCols arrays.
    '''

    admissionsURL, comorbidsURL, patientsURL = urls[0], urls[1], urls[2]
    
    admissionsResponse = requests.get(admissionsURL)
    comorbidsResponse = requests.get(comorbidsURL)
    patientsResponse = requests.get(patientsURL )

    admissionDocs = json.loads(admissionsResponse.content)['admissions']
    comorbidDocs = json.loads(comorbidsResponse.content)['comorbids']
    patientDocs = json.loads(patientsResponse.content)['patients']

    dfAdmissions = pd.DataFrame(admissionDocs)
    dfComorbids = pd.DataFrame(comorbidDocs).rename(index=str, columns={"drg_mortality": "comorbid_mortality", 
                                                                        "drg_severity": "comorbid_severity"})
    dfPatients = pd.DataFrame(patientDocs)
    
    subjectIDs = dfAdmissions['subject_id'][dfAdmissions.hadm_id.isin(admissionIDs)]

    admissionCols = ['hadm_id', 
                     'subject_id', 
                     'admission_type',
                     'diagnosis', 
                     'insurance', 
                     'ethnicity', 
                     'language', 
                     'marital_status',
                     'admittime',
                     'dischtime'
                     ]

    admissionInfo = dfAdmissions[admissionCols][dfAdmissions.hadm_id.isin(admissionIDs)]

    patientCols = ['subject_id', 
                   'gender',
                   'dob'
                   ]

    patientInfo = dfPatients[patientCols][dfPatients.subject_id.isin(subjectIDs)]

    comorbidCols = ['hadm_id', 
                    'comorbid_mortality',
                    'comorbid_severity'
                    ]

    grouped = dfComorbids[comorbidCols][dfComorbids.hadm_id.isin(admissionIDs)].groupby('hadm_id')
    intFrame = admissionInfo.join(grouped.mean(), how='left', on='hadm_id')
    finalFrame = intFrame.merge(patientInfo, how='left', on='subject_id')

    finalFrame['age'] = np.round((pd.to_datetime(finalFrame.admittime) - pd.to_datetime(finalFrame.dob)) \
                        / np.timedelta64(365, 'D'))      
    
    finalFrame['hadm_id'] = finalFrame['hadm_id'].astype(int)
    finalFrame['subject_id'] = finalFrame['subject_id'].astype(int)
    
    return finalFrame


def get_risk_score(admissionIDs, recordsDF, riskScorerAPI):
    response = requests.get(riskScorerAPI.format(admissionIDs))
    scoresDF = pd.read_json(response.content)
    recordsDF['readmissionRisk'] = scoresDF['readmissionRisk']
    return recordsDF

def dataframe_to_docs(df):
    '''
    Input: a pandas DataFrame
    Output: a json formatted string
    Description: takes the pandas DataFrame and converts it into a json-like document that will
    be the response for the API 
    '''

    cols = df.columns
    records = [list(record) for record in df.to_records()]
    documents = []
    numDocs = 0
    
    for record in records:
        zipped = zip(cols, record[1:])
        docInfo = {z[0]: z[1] for z in zipped}
        doc = {'hadm_id': docInfo['hadm_id'],
               'patientInfo': docInfo}
        documents.append(doc)
        numDocs += 1

    response = {'numberDocsReturned': numDocs,
                'documents': documents}
    
    return json.dumps(response)