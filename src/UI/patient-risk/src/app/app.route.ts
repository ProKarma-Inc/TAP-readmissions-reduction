import { ReadmissionRiskResultsComponent } from './readmission-risk-results/readmission-risk-results.component';
import { provideRouter, RouterConfig } from '@angular/router';
import { PatientSelectComponent } from './patient-select/patient-select.component';
import {ReAdmission30dayRatesComponent} from "./re-admission-30day-rates/re-admission-30day-rates.component";

const routes: RouterConfig = [
  { path: '', component: PatientSelectComponent },
  { path: 'details/:admissionId', component: ReadmissionRiskResultsComponent },
  { path: 'readmissionRates/:fullSize', component: ReAdmission30dayRatesComponent }
];

export const APP_ROUTE_PROVIDER = [
  provideRouter(routes, {})
];


