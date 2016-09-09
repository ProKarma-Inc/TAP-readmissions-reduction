import { Component } from '@angular/core';
import { ReAdmissionService } from '../services';
import { ReAdmissionData } from '../models';

@Component({
  moduleId: module.id,
  selector: 'pk-re-admission-30day-rates',
  templateUrl: 're-admission-30day-rates.component.html',
  styleUrls: ['re-admission-30day-rates.component.css'],
  providers: [ ReAdmissionService ]
})
export class ReAdmission30dayRatesComponent {

  constructor(private reAdmissionService: ReAdmissionService) {

  }
}
