#!/usr/bin/env python
from flask import Flask, json, request, Response
from pymongo import MongoClient
import requests
import numpy as np
from datetime import datetime
import os


########################################################################################################################
# MAIN
########################################################################################################################

app = Flask(__name__)

# Get the port number from the environment variable VCAP_APP_PORT
# When running this app on the local machine, default the port to 8080
port = int(os.getenv('VCAP_APP_PORT', 8080))
# Get the MONGODB_URI from the environment variable VCAP_SERVICES
MONGODB_URI = os.getenv("['VCAP_SERVICES']['mongodb30'][0]['credentials']['uri']", 
                        "mongodb://h2saxjj0fcj37oiq:e9syw6r4wtpoa6cd@10.0.4.4:32869/7y14zotonpz6i98x")
# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client.get_default_database()
# Switch context to 'processedpatients'
processedPatientsPointer = db['processedpatients']
# Get all hospital admission IDs
dischargedPatientsPointer = db['dischargeadmissions']
allIDs = [doc['hadm_id'] for doc in dischargedPatientsPointer.find()]
# Get the RECORD_GETTER_URL from the environment variable VCAP_SERVICES
RECORD_GETTER_URL = os.getenv("['VCAP_SERVICES']['app1'][0]['credentials']['uri']", 
                              "http://record-getter.52.204.218.231.nip.io")

# Define a helper to convert the datetime string to a python datetime object
def to_datetime(dtString):
    dt = dtString.replace('T', ' ').replace('Z', '')
    return datetime.strptime(dt, "%Y-%m-%d %H:%M:%S.%f")

########################################################################################################################
# Routes
########################################################################################################################
# Root welcome.

@app.route('/')
def root():
    response = "I am a record parser running on port " + str(port) + ".\n"
    return Response(response, mimetype='text/plain')

@app.route('/v1/send-records-to-mongo', methods=['GET'])
def parse_qs():
    # Take a random selection of 100 patients for discharge
    dischargeIDs = list(np.random.choice(np.array(allIDs), 100))
    apiURL = '{0}/v1/get-records?admissionIDs={1}'.format(RECORD_GETTER_URL, dischargeIDs)
    content = requests.get(apiURL).content
    docs = json.loads(content)['documents']
    for doc in docs:
        for time in ['admittime', 'dischtime', 'dob']:
            doc['patientInfo'][time] = to_datetime(doc['patientInfo'][time])
    # Dump the pre-existing Mongo collection
    processedPatientsPointer.remove()
    docsToUpdate = [doc['patientInfo'] for doc in docs]
    # Insert new docs to Mongo
    for doc in docsToUpdate:
        processedPatientsPointer.insert_one(doc)
    response = "{0} docs sucessfully sent to mongo!".format(len(docsToUpdate))
    return Response(response, mimetype='text/plain')

if __name__ == '__main__':
    # Start up the Flask app server.
    app.run(host='0.0.0.0', port=port, debug=True)
