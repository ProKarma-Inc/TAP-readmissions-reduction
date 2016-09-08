import os
from pyspark.ml.feature import VectorAssembler
from pyspark.mllib.feature import LabeledPoint
from pyspark.mllib.tree import DecisionTreeModel, RandomForestModel
from pyspark.sql.types import *
from itertools import izip
import json


def get_patient_data(dischargeIDs, sqlContext):
    # These helper will be replaced with one that queries a SQL databse to get the appropriate info
    # Right now, as a placeholder I am querying a list of patients from HDFS
    hdfsMasterName = "cdh-master-0.node.envname.consul"

    hdfsPathAdmissions = "hdfs://{0}/org/1fc35ebe-d845-45e3-a2b1-b3effe9483e2/brokers/userspace/9e6d3f28-a119-43d9-ad67-fdbe4860be98/9997ff80-b53f-46c4-9dca-f76cc56c876a/000000_1"
    hdfsPathAdmissions = hdfsPathAdmissions.format(hdfsMasterName)
    
    hdfsPathPatients = "hdfs://{0}/org/1fc35ebe-d845-45e3-a2b1-b3effe9483e2/brokers/userspace/9e6d3f28-a119-43d9-ad67-fdbe4860be98/d82b3a1e-de79-4312-98be-1499e25e25c6/000000_1" 
    hdfsPathPatients = hdfsPathPatients.format(hdfsMasterName)
    
    hdfsPathCodes = "hdfs://{0}/org/1fc35ebe-d845-45e3-a2b1-b3effe9483e2/brokers/userspace/9e6d3f28-a119-43d9-ad67-fdbe4860be98/e69a6c0a-5507-4cec-a184-c2a480ee2a6a/000000_1"
    hdfsPathCodes = hdfsPathCodes.format(hdfsMasterName)

    df_admissions = sqlContext.read.format('com.databricks.spark.csv').\
                                options(header='true', inferSchema=True).\
                                load(hdfsPathAdmissions)
    df_patients = sqlContext.read.format('com.databricks.spark.csv').\
                                options(header='true', inferSchema=True).\
                                load(hdfsPathPatients)    
    df_drgcodes = sqlContext.read.format('com.databricks.spark.csv').\
                                options(header='true', inferSchema=True).\
                                load(hdfsPathCodes)
    
    # Select the admission records for the patients of interest
    discharges = df_admissions[df_admissions.HADM_ID.isin(dischargeIDs)]
    sqlContext.registerDataFrameAsTable(discharges, "discharges")
    
    # Get the subject_ids for each of those records
    dischargeSubjectIDs = [d[0] for d in discharges.select('SUBJECT_ID').collect()]
    
    # Get the comorbidity scores for everyone in the discharge group
    drgCodes = df_drgcodes[df_drgcodes.HADM_ID.isin(dischargeIDs)].na.fill(0)
    sqlContext.registerDataFrameAsTable(drgCodes, "drgCodes")                     
    
    dischargeComorbids = sqlContext.sql("""
                                       select
                                           HADM_ID,
                                           AVG(DRG_SEVERITY) as AVG_DRG_SEVERITY,
                                           AVG(DRG_SEVERITY) as AVG_DRG_MORTALITY
                                        from drgCodes
                                        group by HADM_ID
                                        """)
    sqlContext.registerDataFrameAsTable(dischargeComorbids, "dischargeComorbids")
    
    # Select the subejct_id, gender, and age from the discharge patients
    dischargePatientInfo = df_patients[df_patients.SUBJECT_ID.isin(dischargeSubjectIDs)] \
                            .select('SUBJECT_ID', 'GENDER', 'DOB')
    sqlContext.registerDataFrameAsTable(dischargePatientInfo, 'patientInfo')
    
    # Join the admission table info with the comorbodity table info
    admissionsWithComorbids = sqlContext.sql("""
                                        select 
                                            di.SUBJECT_ID,
                                            di.HADM_ID,
                                            di.ADMISSION_TYPE, 
                                            di.ETHNICITY,
                                            di.INSURANCE,
                                            di.LANGUAGE,
                                            di.MARITAL_STATUS,
                                            dc.AVG_DRG_SEVERITY,
                                            dc.AVG_DRG_MORTALITY,
                                            di.ADMITTIME
                                        from discharges di
                                        left join dischargeComorbids dc
                                        on di.HADM_ID = dc.HADM_ID
                                        """)
    sqlContext.registerDataFrameAsTable(admissionsWithComorbids, 'admissionsWithComorbids')
    
    # Join the admission-comorbifity table with the table that contains patient age and gender
    joined = sqlContext.sql("""
                        select 
                            a.SUBJECT_ID,
                            a.HADM_ID,
                            a.ADMISSION_TYPE, 
                            a.ETHNICITY,
                            a.INSURANCE,
                            a.LANGUAGE,
                            a.MARITAL_STATUS,
                            a.AVG_DRG_SEVERITY,
                            a.AVG_DRG_MORTALITY,
                            round(datediff(a.ADMITTIME, p.DOB) / 364.25) as AGE,
                            p.GENDER
                        from admissionsWithComorbids a
                        left join patientInfo p
                        on a.SUBJECT_ID = p.SUBJECT_ID
                        """)
    sqlContext.registerDataFrameAsTable(joined, "joined")
    
    return joined

def pre_process_patients(df, sqlContext):
    '''
    Input: PySpark DataFrame
    Output: PySpark DataFrame
    Description: Encodes categoricals as numerica values for classification. Ordinarily the best practice
                would be to use StringIndexer, but the ability to save a fitted StringIndexer is not currently
                available in Spark 1.5 or 1.6. 
    '''
    
    data = sqlContext.sql("""
                        SELECT 
                            CASE
                                WHEN ADMISSION_TYPE LIKE 'NEWBORN' THEN 0.0
                                WHEN ADMISSION_TYPE LIKE 'EMERGENCY' THEN 1.0
                                WHEN ADMISSION_TYPE LIKE 'URGENT' THEN 2.0
                                ELSE 3.0
                                END as admission_type,
                            CASE 
                                WHEN INSURANCE LIKE 'Private' THEN 0.0
                                WHEN INSURANCE LIKE 'Medicare' THEN 1.0
                                WHEN INSURANCE LIKE 'Medicaid' THEN 2.0
                                WHEN INSURANCE LIKE 'Government' THEN 3.0
                                WHEN INSURANCE LIKE 'Self Pay' THEN 4.0
                                ELSE 5.0
                                END as insurance,
                            CASE
                                WHEN GENDER LIKE 'M' THEN 0.0
                                WHEN GENDER LIKE 'F' THEN 1.0
                                ELSE 2.0
                                END as gender,
                            IF (AGE > 200, 91, AGE) as age,
                            IF (AVG_DRG_SEVERITY IS NULL, 0, AVG_DRG_SEVERITY) as avg_severity,
                            IF (AVG_DRG_MORTALITY IS NULL, 0, AVG_DRG_MORTALITY) as avg_mortality,
                            CASE
                                WHEN ETHNICITY LIKE 'WHITE%' OR 
                                     ETHNICITY LIKE 'EUROPEAN%' OR
                                     ETHNICITY LIKE 'PORTUGUESE%' THEN 0.0
                                WHEN ETHNICITY LIKE 'BLACK%' OR 
                                     ETHNICITY LIKE 'AFRICAN%' THEN 1.0
                                WHEN ETHNICITY LIKE 'HISPANIC%' OR 
                                     ETHNICITY LIKE 'LATINO%' THEN 2.0
                                WHEN ETHNICITY LIKE '%MIDDLE EASTERN%' THEN 3.0
                                WHEN ETHNICITY LIKE 'ASIAN%' OR
                                     ETHNICITY LIKE '%ASIAN - INDIAN%' THEN 4.0
                                ELSE 5.0 
                                END as ethn,
                            CASE 
                              WHEN ADMISSION_TYPE='NEWBORN' THEN 0.0
                              WHEN LANGUAGE='ENGL' THEN 1.0
                              WHEN LANGUAGE='' THEN 2.0
                              ELSE 3.0
                              END as lang,
                            CASE
                              WHEN MARITAL_STATUS LIKE 'NEWBORN' THEN 0.0
                              WHEN MARITAL_STATUS LIKE '' OR MARITAL_STATUS LIKE 'LIFE PARTNER' THEN 1.0
                              WHEN MARITAL_STATUS LIKE 'UNKNOWN%' THEN 2.0
                              WHEN MARITAL_STATUS LIKE 'MARRIED' THEN 3.0
                              WHEN MARITAL_STATUS LIKE 'DIVORCED' THEN 4.0
                              WHEN MARITAL_STATUS LIKE 'SINGLE' THEN 5.0
                              WHEN MARITAL_STATUS LIKE 'WIDOWED' THEN 6.0
                              WHEN MARITAL_STATUS LIKE 'SEPARATED' THEN 7.0
                              ELSE 8.0
                              END as status
                        FROM joined
                    """)
    return data

def vectorize_data(df, featureCols):
    '''
    Input:
    Output:
    Description:
    '''
    # These features are currently hard-coded, but they can be paramterized
    featureCols = ['admission_type', 
                  'insurance', 
                  'gender', 
                  'ethn', 
                  'lang', 
                  'status', 
                  'avg_severity', 
                  'avg_mortality', 
                  'age']

    va = VectorAssembler(inputCols=featureCols, outputCol='features')
    assembled = va.transform(df)
    vectors = assembled.select('features').map(lambda f: LabeledPoint(1, f.features))
    return vectors

def predict_proba(model, data):
    '''
    Input: A PySpark RandomForestModel object, RDD of LabeledPoints
    Output: List of probabilies 
    This wrapper exposes the probabilities (i.e. confidences) for a given prediciton. 
    '''
    # Collect the individual decision tree models by calling the underlying
    # Java model. These are returned as JavaArray defined by py4j.
    trees = model._java_model.trees()
    ntrees = model.numTrees()
    scores = DecisionTreeModel(trees[0]).predict(data.map(lambda x: x.features))

    # For each decision tree, apply its prediction to the entire dataset and
    # accumulate the results using 'zip'.
    for i in xrange(1, ntrees):
        dtm = DecisionTreeModel(trees[i])
        scores = scores.zip(dtm.predict(data.map(lambda x: x.features)))
        scores = scores.map(lambda x: x[0] + x[1])

    # Divide the accumulated scores over the number of trees
    probabilities = scores.map(lambda x: float(x)/ntrees).collect()
    return probabilities

def create_api_response(dischargeIDs, probabilies):
    patientDischarges = izip(dischargeIDs, probabilies)
    # Put the results in an easy to interpret dictionary
    apiResponse = {pd[0] : {'readmissionRisk': pd[1]} for pd in patientDischarges}
    # Convert to a string for HTTP response
    return json.dumps(apiResponse)
