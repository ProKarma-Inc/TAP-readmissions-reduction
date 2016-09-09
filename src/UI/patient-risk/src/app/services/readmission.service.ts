/**
 * Created by prokarma on 9/9/2016.
 */
import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { ReferenceData, ReAdmissionData } from '../models';

@Injectable()
export class ReAdmissionService {
  private baseReferenceDataUri: string;

  constructor(private http: Http){
    this.baseReferenceDataUri = 'http://reference-data-api.52.204.218.231.nip.io/v1/';
  }

  public getReferenceData(age: number): Observable<ReferenceData>{
    let params: URLSearchParams = new URLSearchParams();
    params.set('ages', age.toString());

    let referenceData$ = this.http
      .get(`${this.baseReferenceDataUri + 'get-reference-data'}`, {
        headers: this.getHeaders(),
        search: params
      })
      .map(toReferenceData)
      .catch(handleError);
    return referenceData$;
  }

  public get30DayReAdmissionRates(): Observable<ReAdmissionData>{
    let reAdmissionData$ = this.http
      .get(`${this.baseReferenceDataUri + 'get-readmission-data'}`, { headers: this.getHeaders() })
      .map(toReAdmissionData)
      .catch(handleError);
    return reAdmissionData$;
  }

  private getHeaders(){
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    return headers;
  }
}

function toReAdmissionData(response: Response): ReAdmissionData{
  let jsonResponse = response.json();
  let reAdmissionData = <ReAdmissionData>({
    dates: jsonResponse.dates,
    readmissionRates: jsonResponse.readmissionRates
  });
  return reAdmissionData;
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

function handleError (error: any) {
  // log error
  let errorMsg = error.message;
  console.error(errorMsg);

  // throw an application level error
  return Observable.throw(errorMsg);
}
