import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Patient, ReferenceData, AgeDistribution, ComorbidsDistribution } from '../models';
import { environment } from '../environment';

@Injectable()
export class PatientService {
  private basePatientUri: string;
  private patientUri: string;

  private baseRefernceDataUri: string;
  private getReferenceDataUri: string;

  constructor(private http: Http) {/*
    if(environment.production){
      this.baseUri = 'http://patient-risk-api.52.204.218.231.nip.io/api/';
    }else{
      this.baseUri = 'http://localhost:9090/api/';
    }*/

    this.basePatientUri = 'http://patient-risk-api.52.204.218.231.nip.io/api/';

    this.patientUri  = this.basePatientUri + 'processed-patients';
    this.baseRefernceDataUri = 'http://reference-data-api.52.204.218.231.nip.io/v1/';
    this.getReferenceDataUri = this.baseRefernceDataUri + 'get-reference-data';
  }

  getAllPatients(): Observable<Array<Patient>>{
    let patients$ = this.http
      .get(`${this.patientUri}`, {headers: this.getHeaders()})
      .map(mapPatients)
      .catch(handleError);
    return patients$;
  }

  getReferenceData(age: number): Observable<ReferenceData>{
    let params: URLSearchParams = new URLSearchParams();
    params.set('ages', age.toString());

    let referenceData$ = this.http
      .get(`${this.getReferenceDataUri}`, {
                                            headers: this.getHeaders(),
                                            search: params
                                           })
      .map(toReferenceData)
      .catch(handleError);
    return referenceData$;
  }

  private getHeaders(){
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    return headers;
  }
}

function mapPatients(response: Response): Patient[]{
  let patients = response.json().processedPatients.map(toPatient);
  //console.log(patients);
  return patients;
}

function mapReferenceData(response: Response): ReferenceData{
  let referenceData = response.json().map(toReferenceData);
  console.log(referenceData);
  return referenceData;
}

function toReferenceData(response: any) : ReferenceData{
  let referenceData = new ReferenceData();

  let responseJson = response.json();

  referenceData.ages.allAges = responseJson.ages; //array of ages

  let severities = responseJson.comorbid_severities;
  for(let i = 0; i < severities.length; i++){
    let severity = severities[i];
    if(severity >= 0 && severity < 1.0){
      referenceData.comorbidSeverities.One.push(severity);
    } else if(severity >=  1.0 && severity < 2.0){
      referenceData.comorbidSeverities.Two.push(severity);
    } else if(severity >= 2.0 && severity < 3.0){
      referenceData.comorbidSeverities.Three.push(severity);
    } else if(severity >= 3.0 && severity < 4.0){
      referenceData.comorbidSeverities.Four.push(severity);
    }
  }

  let mortalities = responseJson.comorbid_mortalities;
  for(let i = 0; i < mortalities.length; i++){
    let mortality = mortalities[i];
    if(mortality >= 0 && mortality < 1.0){
      referenceData.comorbidMortalities.One.push(mortality);
    } else if(mortality >=  1.0 && mortality < 2.0){
      referenceData.comorbidMortalities.Two.push(mortality);
    } else if(mortality >= 2.0 && mortality < 3.0){
      referenceData.comorbidMortalities.Three.push(mortality);
    } else if(mortality >= 3.0 && mortality < 4.0){
      referenceData.comorbidMortalities.Four.push(mortality);
    }
  }

  return referenceData;
}

function toPatient(response: any): Patient{
  let riskScoreColor = '#333333'; //dark grey
  let riskScore = response.readmissionRisk;
  if (riskScore <= 0.25){
    riskScoreColor = '#5CB85C'; // green
  } else if (riskScore <= 0.50){
    riskScoreColor = '#F7D83D'; // yellow
  } else if(riskScore <= 0.75){
    riskScoreColor = '#F9A15A'; // orange
  } else{
    riskScoreColor = '#FC4133'; // red
  }

   let patient = <Patient>({
    subject_id: response.subject_id,
    hadm_id: response.hadm_id,
    admission_type: response.admission_type,
    diagnosis: response.diagnosis,
    ethnicity: response.ethnicity,
    insurance: response.insurance,
    language: response.language,
    marital_status: response.marital_status,
    comorbid_severity: response.comorbid_severity,
    comorbid_mortality: response.comorbid_mortality,
    age: response.age,
    gender: response.gender,
    admittime: response.admittime,
    dischtime: response.dischtime,
    dob: response.dob,
    readmissionRisk: response.readmissionRisk,
    readmissionRiskScoreColor: riskScoreColor,
    readmissionRiskScoreAsPercent: Math.ceil(response.readmissionRisk * 100) + '%'
  });
  //console.log('Parsed patient:', patient);
  return patient;
}

function handleError (error: any) {
  // log error
  let errorMsg = error.message;
  console.error(errorMsg);

  // throw an application level error
  return Observable.throw(errorMsg);
}
