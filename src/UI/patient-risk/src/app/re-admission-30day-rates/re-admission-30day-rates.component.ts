import { Component, OnInit } from '@angular/core';
import { ReAdmissionService } from '../services';
import { ReAdmissionData } from '../models';

@Component({
  moduleId: module.id,
  selector: 'pk-re-admission-30day-rates',
  templateUrl: 're-admission-30day-rates.component.html',
  styleUrls: ['re-admission-30day-rates.component.css'],
  providers: [ ReAdmissionService ]
})
export class ReAdmission30dayRatesComponent implements OnInit{
  private errorMessage: string;
  private reAdmissionData: ReAdmissionData;


  constructor(private reAdmissionService: ReAdmissionService) {

  }

  ngOnInit(){
    this.reAdmissionService.get30DayReAdmissionRates()
      .subscribe(raData => {
          this.reAdmissionData = raData;
          console.log(raData);
        },
      error => this.errorMessage = error
      );
  }
}
