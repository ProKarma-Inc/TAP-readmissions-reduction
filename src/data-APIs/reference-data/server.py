#!/usr/bin/env python
from flask import Flask, json, request, Response
import pandas as pd
import numpy as np
import json
import requests
import os


########################################################################################################################
# MAIN
########################################################################################################################

app = Flask(__name__)

# Get the port number from the environment variable VCAP_APP_PORT
# When running this app on the local machine, default the port to 8080
port = int(os.getenv('VCAP_APP_PORT', 8080))

referenceDF = pd.read_csv('data/app-reference-data.csv')
readmissionDF = pd.read_csv('data/app-readmission-data.csv')

def get_data(df, age):
    patientAge = int(age)
    print patientAge
    if (patientAge < 25) & (patientAge >= 1):
        return df[(df.age < 25) & (df.age >= 1)]
    elif (patientAge >= 25) & (patientAge < 50):
        return df[(df.age >= 25) & (df.age < 50)]
    return df[df.age >= 50]

def convert_reference_to_json(df):
    referenceResult = {'ages': list(np.round(df.age.values, 2)),
                       'comorbid_severities': list(np.round(df.avg_severity.values, 2)),
                       'comorbid_mortalities': list(np.round(df.avg_mortality.values, 2))}
    return json.dumps(referenceResult)

def convert_readmission_to_json(df):
    readmissionResult = {'readmissionRates': list(df.readmissionRate.values),
                         'dates': list(df.date.values)}
    return json.dumps(readmissionResult)
########################################################################################################################
# Routes
########################################################################################################################
# Root welcome.

@app.route('/')
def root():
    response = "I am an API to provide population reference data. I am running on port " + str(port) + ".\n"
    return Response(response, mimetype='text/plain')

@app.route('/v1/get-reference-data', methods=['GET'])
def parse_qs():
    patientAge = request.args.get('ages')
    patientReferenceDF = get_data(referenceDF, patientAge)
    jsonResponse = convert_reference_to_json(patientReferenceDF)
    response = Response(jsonResponse, mimetype='application/json')
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET'
    response.headers['Access-Control-Allow-Headers'] = 'X-Requested-With'
    return response

@app.route('/v1/get-readmission-data', methods=['GET'])
def return_qs():
    jsonResponse = convert_readmission_to_json(readmissionDF)
    response = Response(jsonResponse, mimetype='application/json')
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET'
    response.headers['Access-Control-Allow-Headers'] = 'X-Requested-With'
    return response

if __name__ == '__main__':
    # Start up the Flask app server.
    app.run(host='0.0.0.0', port=port, debug=True)
