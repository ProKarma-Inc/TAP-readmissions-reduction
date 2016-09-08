import { Component } from '@angular/core';
import { HeaderComponent } from './header';
import { PatientSelectComponent } from './patient-select';
import { ReadmissionRiskResultsComponent } from './readmission-risk-results';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  directives: [HeaderComponent, PatientSelectComponent, ReadmissionRiskResultsComponent, ROUTER_DIRECTIVES]
})
export class AppComponent {
}
