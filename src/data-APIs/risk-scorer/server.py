#!/usr/bin/env python

import os
from flask import Flask, json, request, Response
from pyspark import SparkContext
from pyspark.sql import SQLContext
from pyspark.mllib.tree import DecisionTreeModel, RandomForestModel
from helpers import get_patient_data, pre_process_patients, vectorize_data, predict_proba, create_api_response
import ast


def setup_spark():
    os.environ['PYSPARK_SUBMIT_ARGS'] = "--packages com.databricks:spark-csv_2.10:1.4.0 pyspark-shell"
    os.environ['PYSPARK_PYTHON'] = "python2.7"
    sc = SparkContext("local[*]", "risk-scorer")
    return sc 

def setup_model(sc, model_uri):
    model = RandomForestModel.load(sc, model_uri)
    return model


########################################################################################################################
# MAIN
########################################################################################################################

app = Flask(__name__)

# Get the port number from the environment variable VCAP_APP_PORT
# When running this app on the local machine, default the port to 8080
port = int(os.getenv('VCAP_APP_PORT', 8080))

# Get model uri.
# This should be changed to whatever model uri you have saved your spark model to.
model_uri = os.getenv('uri', 'hdfs://cdh-master-0.node.envname.consul/user/vcap/readmission-scorer-v1.dat')

# Routes

# Root welcome.
@app.route('/')
def root():
    response = "I am a Readmission Risk Scorer. I am running on port " + str(port) + ".\n"
    return Response(response, mimetype='text/plain')

@app.route('/v1/score', methods=['GET'])
def score_qs():
    sqlContext = SQLContext(sc)
    input = request.args.get('data')
    # Converts data payload to a list of admission_ids, e.g. [123, 456, 789, ...]
    dischargeIDs = ast.literal_eval(input)
    pd = get_patient_data(dischargeIDs, sqlContext)
    data = pre_process_patients(pd, sqlContext)
    vectors = vectorize_data(data, None)
    dataPts = sc.parallelize(vectors.take(len(dischargeIDs)))
    probabilities = predict_proba(model, dataPts)
    apiResponse = create_api_response(dischargeIDs, probabilities)
    print "response: ", apiResponse
    return Response(apiResponse, mimetype='text/plain')

# Placeholder for POST json score support.
@app.route('/v2', methods=['GET'])
def score_json():
    response = "Hi, I'm /v2! Feel free to give me new methods."
    print response
    return Response(response, mimetype='text/plain')

if __name__ == '__main__':
    sc = setup_spark()
    model = setup_model(sc, model_uri)
      # Start up the Flask app server.
    app.run(host='0.0.0.0', port=port, debug=True)
