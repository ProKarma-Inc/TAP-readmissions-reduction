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


  private comorbidSeverityOptions: HighchartsOptions;
  private marker: string;
  private comorbidsLabels: Array<string>;

  constructor(private reAdmissionService: ReAdmissionService) {
    this.marker = 'url(/app/readmission-risk-results/marker.png)';
    this.comorbidsLabels = ['&lt;1.0', '1.0 - &lt;2.0', '2.0 - &lt;3.0', '3.0 - &lt;=4.0'];
  }




    let severityData: Array<any> = [
      {y: comorbindsSeverities.One.length, marker: {symbol: 'circle'}},
      {y: comorbindsSeverities.Two.length, marker: {symbol: 'circle'}},
      {y: comorbindsSeverities.Three.length, marker: {symbol: 'circle'}},
      {y: comorbindsSeverities.Four.length, marker: {symbol: 'circle'}}
    ];

    let severity: number = 3;
    if (severity < 1.0) {
      severityData[0].marker.symbol = this.marker;
    } else if (severity >= 1.0 && severity < 2.0) {
      severityData[1].marker.symbol = this.marker;
    } else if (severity >= 2.0 && severity < 3.0) {
      severityData[2].marker.symbol = this.marker;
    } else if (severity >= 3.0 && severity < 4.0) {
      severityData[3].marker.symbol = this.marker;
    }

    this.comorbidSeverityOptions = {
      chart: {type: 'spline', width: 580, height: 230},
      title: {text: null},
      legend: {enabled: false},
      xAxis: {
        title: {text: 'Range'},
        categories: this.comorbidsLabels
      },
      yAxis: {
        title: {text: 'Patient Count'}
      },
      series: [
        {
          name: 'Patient Count',
          data: severityData
        }]
    }
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
