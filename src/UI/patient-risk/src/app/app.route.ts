import { ReadmissionRiskResultsComponent } from './readmission-risk-results/readmission-risk-results.component';
import { provideRouter, RouterConfig } from '@angular/router';
import { PatientSelectComponent } from './patient-select/patient-select.component';

const routes: RouterConfig = [
  { path: '', component: PatientSelectComponent },
  { path: 'details/:admissionId', component: ReadmissionRiskResultsComponent }
];

export const APP_ROUTE_PROVIDER = [
  provideRouter(routes, {})
];


