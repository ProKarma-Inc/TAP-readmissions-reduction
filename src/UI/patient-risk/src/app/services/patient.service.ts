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

  public getAllPatients(): Observable<Array<Patient>>{
    let patients$ = this.http
      .get(`${this.basePatientUri + 'discharge-patients'}`, {headers: this.getHeaders()})
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

function mapPatients(response: Response): Array<Patient>{
  let patients = response.json().dischargePatients.map(toPatient);
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
    subject_id: response.SUBJECT_ID,
    hadm_id: response.HADM_ID,
    admission_type: response.ADMISSION_TYPE,
    diagnosis: response.DIAGNOSIS,
    ethnicity: response.ETHNICITY,
    insurance: response.INSURANCE,
    language: response.LANGUAGE,
    marital_status: response.MARITAL_STATUS,
    comorbid_severity: response.COMORBID_SEVERITY,
    comorbid_mortality: response.COMORBID_MORTALITY,
    age: response.AGE,
    gender: response.GENDER,
    admittime: response.ADMITTIME,
    dischtime: response.DISCHTIME,
    dob: response.DOB,
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
