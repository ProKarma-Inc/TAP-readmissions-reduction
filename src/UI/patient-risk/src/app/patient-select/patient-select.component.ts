import { Component } from '@angular/core';
import { DischargePopulationComponent } from './discharge-population.component';

@Component({
  moduleId: module.id,
  selector: 'pk-patient-select',
  templateUrl: 'patient-select.component.html',
  directives: [DischargePopulationComponent]
})
export class PatientSelectComponent {
  constructor() {
  }
}
