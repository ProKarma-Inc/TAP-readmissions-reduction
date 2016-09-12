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
    def load_data(dataLocation, collectionName, isURL=False):
        if isURL:
            response.get(dataLocation)
            docsAsJSON = json.loads(response[collectionName])
            return pd.DataFrame(docsAsJSON)
        return pd.read_csv(dataLocation, delimiter='|')
            
    
    admissionsURL, comorbidsURL, patientsURL = urls[0], urls[1], urls[2]

    dfAdmissions = load_data(admissionsURL, None, isURL=False)
    
    dfComorbids = load_data(comorbidsURL, None, isURL=False).rename(index=str, columns={'DRG_MORTALITY': 'COMORBID_MORTALITY', 
                                                                                        'DRG_SEVERITY': 'COMORBID_SEVERITY'})
    dfPatients = load_data(patientsURL, None, isURL=False)
    
    subjectIDs = dfAdmissions['SUBJECT_ID'][dfAdmissions.HADM_ID.isin(admissionIDs)]

    admissionCols = ['HADM_ID', 
                     'SUBJECT_ID', 
                     'ADMISSION_TYPE',
                     'DIAGNOSIS', 
                     'INSURANCE', 
                     'ETHNICITY', 
                     'LANGUAGE', 
                     'MARITAL_STATUS',
                     'ADMITTIME',
                     'DISCHTIME'
                     ]

    admissionInfo = dfAdmissions[admissionCols][dfAdmissions.HADM_ID.isin(admissionIDs)]

    patientCols = ['SUBJECT_ID', 
                   'GENDER',
                   'DOB'
                   ]

    patientInfo = dfPatients[patientCols][dfPatients.SUBJECT_ID.isin(subjectIDs)]

    comorbidCols = ['HADM_ID', 
                    'COMORBID_MORTALITY',
                    'COMORBID_SEVERITY'
                    ]

    grouped = dfComorbids[comorbidCols][dfComorbids.HADM_ID.isin(admissionIDs)].groupby('HADM_ID')
    intFrame = admissionInfo.join(grouped.mean(), how='left', on='HADM_ID')
    finalFrame = intFrame.merge(patientInfo, how='left', on='SUBJECT_ID')

    finalFrame['AGE'] = np.round((pd.to_datetime(finalFrame.ADMITTIME) - pd.to_datetime(finalFrame.DOB)) \
                        / np.timedelta64(365, 'D'))      
    
    finalFrame['HADM_ID'] = finalFrame['HADM_ID'].astype(int)
    finalFrame['SUBJECT_ID'] = finalFrame['SUBJECT_ID'].astype(int)
    
    return finalFrame


def get_risk_score(admissionIDs, recordsDF, riskScorerAPI):
    # ids = list(admissionIDs.values)
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
        doc = {'hadm_id': docInfo['HADM_ID'],
               'patientInfo': docInfo}
        documents.append(doc)
        numDocs += 1

    response = {'count': numDocs,
                'documents': documents}
    
    return json.dumps(response)