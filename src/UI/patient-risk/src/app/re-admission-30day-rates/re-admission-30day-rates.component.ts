import { Component, OnInit } from '@angular/core';
import { ReAdmissionService } from '../services';
import { ReAdmissionData } from '../models';
import { CHART_DIRECTIVES } from 'angular2-highcharts';

@Component({
  moduleId: module.id,
  selector: 'pk-re-admission-30day-rates',
  templateUrl: 're-admission-30day-rates.component.html',
  styleUrls: ['re-admission-30day-rates.component.css'],
  providers: [ReAdmissionService],
  directives: [CHART_DIRECTIVES]
})
export class ReAdmission30dayRatesComponent implements OnInit{
  private errorMessage: string;
  private reAdmissionData: ReAdmissionData;

  private readmissionRatesOptions: HighchartsOptions;

  constructor(private reAdmissionService: ReAdmissionService) {

  }

  ngOnInit(){
    this.reAdmissionService.get30DayReAdmissionRates()
      .subscribe(raData => {
          this.reAdmissionData = raData;
          this.readmissionRatesChart();
        },
      error => this.errorMessage = error
      );
  }

  private readmissionRatesChart() {

    let xAxisTitles: Array<string> = [];
    for(let i = 0; i < this.reAdmissionData.dates.length; i++){
      xAxisTitles.push(this.reAdmissionData.dates[i].toString());
    }
    this.readmissionRatesOptions = {
      chart: {type: 'spline', width: 580, height: 230},
      title: {text: null},
      legend: {enabled: false},
      xAxis: {
        title: {text: 'Range'},
        categories: xAxisTitles
      },
      yAxis: {
        title: {text: 'Rates'}
      },
      series: [
        {
          name: 'Dates',
          data: this.reAdmissionData.readmissionRates
        }]
    }
  }

}
