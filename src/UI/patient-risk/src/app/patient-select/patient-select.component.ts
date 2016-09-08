import { Component, OnInit } from '@angular/core';
import { DischargePopulationComponent } from './discharge-population.component';
import { ProportionAtRiskComponent } from './proportion-at-risk.component';

@Component({
  moduleId: module.id,
  selector: 'pk-patient-select',
  templateUrl: 'patient-select.component.html',
  directives: [DischargePopulationComponent, ProportionAtRiskComponent]
})
export class PatientSelectComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
