import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Patient } from '../models';

@Injectable()
export class PatientService {
  private basePatientUri: string;

  constructor(private http: Http) {
    this.basePatientUri = 'http://patient-risk-api.52.204.218.231.nip.io/api/';
  }

  getAllPatients(): Observable<Array<Patient>>{
    let patients$ = this.http
      .get(`${this.basePatientUri + 'processed-patients'}`, {headers: this.getHeaders()})
      .map(mapPatients)
      .catch(handleError);
    return patients$;
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
  return patient;
}

function handleError (error: any) {
  // log error
  let errorMsg = error.message;
  console.error(errorMsg);

  // throw an application level error
  return Observable.throw(errorMsg);
}
