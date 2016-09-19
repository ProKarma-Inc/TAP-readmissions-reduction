import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReAdmissionService } from '../services';
import { ReAdmissionData } from '../models';
import { CHART_DIRECTIVES } from 'angular2-highcharts';
import { ROUTER_DIRECTIVES, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  moduleId: module.id,
  selector: 'pk-re-admission-30day-rates',
  templateUrl: 're-admission-30day-rates.component.html',
  styleUrls: ['re-admission-30day-rates.component.css'],
  providers: [ReAdmissionService],
  directives: [CHART_DIRECTIVES]
})
export class ReAdmission30dayRatesComponent implements OnInit, OnDestroy{
  private errorMessage: string;
  private reAdmissionData: ReAdmissionData;
  private readmissionRatesOptions: HighchartsOptions;
  private chartSizeAndType: any;
  private toPatientsPage: boolean;
  private reAdmissionSubsciption: Subscription;

  constructor(private reAdmissionService: ReAdmissionService, private router: Router, private activatedRouter: ActivatedRoute) {
    let fullSize: string = this.activatedRouter.snapshot.params['fullSize'];
    if(fullSize === 'fullSize'){
      this.chartSizeAndType = {type: 'spline', width: 1200, height: 900};
      this.toPatientsPage = true;
    } else{
      this.chartSizeAndType = {type: 'spline', width: 350, height: 250};
      this.toPatientsPage = false;
    }
  }

  public ngOnInit(){
    this.reAdmissionSubsciption = this.reAdmissionService.get30DayReAdmissionRates()
      .subscribe(raData => {
          this.reAdmissionData = raData;
          this.readmissionRatesChart();
        },
      error => this.errorMessage = error
      );
  }

  public ngOnDestroy(){
    if(this.reAdmissionSubsciption.isUnsubscribed){
      this.reAdmissionSubsciption.unsubscribe();
    }
  }

  public toPatientList(){
    this.router.navigate(['']);
  }

  public navigateToReadmissionRiskChart(){
    this.router.navigate(['/readmissionRates', 'fullSize']);
  }

  private readmissionRatesChart() {

    let xAxisTitles: Array<string> = [];
    for(let i = 0; i < this.reAdmissionData.dates.length; i++){
      xAxisTitles.push(this.reAdmissionData.dates[i].toString());
    }
    this.readmissionRatesOptions = {
      chart: this.chartSizeAndType,
      title: {text: '30-Day Re-Admission Rate'},
      legend: {enabled: false},
      xAxis: {
        title: {text: 'Dates'},
        categories: xAxisTitles
      },
      yAxis: {
        title: {text: 'Rates'}
      },
      series: [
        {
          name: 'Rates',
          data: this.reAdmissionData.readmissionRates
        }]
    }
  }
}
