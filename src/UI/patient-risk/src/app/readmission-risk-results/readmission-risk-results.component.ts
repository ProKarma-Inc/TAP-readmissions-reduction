import { Component, OnInit, OnDestroy } from '@angular/core';
import { PatientService, ReAdmissionService } from '../services';
import { Patient } from "../models/patient";
import { Router, ActivatedRoute } from '@angular/router';
import { CHART_DIRECTIVES } from 'angular2-highcharts';
import { RiskLegendComponent } from '../risk-legend';
import {ComorbidsDistribution} from "../models/comorbidsDistribution";
import { AgeDistribution } from "../models/ageDistribution";
import { Subscription } from 'rxjs';

@Component({
  moduleId: module.id,
  selector: 'pk-readmission-risk-results',
  templateUrl: 'readmission-risk-results.component.html',
  styleUrls: ['readmission-risk-results.css'],
  providers: [PatientService, ReAdmissionService],
  directives: [RiskLegendComponent, CHART_DIRECTIVES]
})
export class ReadmissionRiskResultsComponent implements OnInit, OnDestroy {
  private patient: Patient;
  private errorMessage: string;
  private admissionId: number;
  private comorbidMortalityOptions: HighchartsOptions;
  private comorbidSeverityOptions: HighchartsOptions;
  private ageOptions: HighchartsOptions;
  private marker: string;
  private infoIcon: string;
  private comorbidsLabels: Array<string>;

  private severityToolTip: string;
  private mortalityToolTip: string;
  private ageToolTip: string;

  private patientSubscription: Subscription;
  private referenceDataSubscription: Subscription;

  constructor(private patientService: PatientService, private readmissionService: ReAdmissionService,
              private router: Router, private activatedRouter: ActivatedRoute) {
       this.admissionId = this.activatedRouter.snapshot.params['admissionId'];
       this.marker = 'url(/app/readmission-risk-results/marker.png)';
       this.infoIcon = '/app/readmission-risk-results/info16.png';
       this.comorbidsLabels = ['&lt;1.0', '1.0 - &lt;2.0', '2.0 - &lt;3.0', '3.0 - &lt;=4.0'];

       this.severityToolTip = 'The extent of physiologic decomposition or organ system loss of function';
       this.mortalityToolTip = 'The likelihood of dying';
       this.ageToolTip = 'Age compared to the population';
  };

    public ngOnInit() {
      this.patientSubscription = this.patientService.getAllPatients()
        .subscribe(
          patients => {
              this.patient = patients.find(patient => patient.hadm_id == this.admissionId);

             this.referenceDataSubscription = this.readmissionService.getReferenceData(this.patient.age)
                .subscribe(
                  referenceData =>{
                    this.severityChart(referenceData.comorbidSeverities);
                    this.mortalityChart(referenceData.comorbidMortalities);
                    this.ageChart(referenceData.ages);
                  },
                  e => this.errorMessage = e
                );
          },
          error => this.errorMessage = error
        );
    };

    public ngOnDestroy(){
      if(!this.patientSubscription.isUnsubscribed){
        this.patientSubscription.unsubscribe();
      }

      if(!this.referenceDataSubscription.isUnsubscribed){
        this.referenceDataSubscription.unsubscribe();
      }
    }

  public backToPatientSelect(){
    this.router.navigate(['']);
  };

  private severityChart(comorbindsSeverities: ComorbidsDistribution) {
    let severityData: Array<any> = [
      {y: comorbindsSeverities.One.length, marker: {symbol: 'circle'}},
      {y: comorbindsSeverities.Two.length, marker: {symbol: 'circle'}},
      {y: comorbindsSeverities.Three.length, marker: {symbol: 'circle'}},
      {y: comorbindsSeverities.Four.length, marker: {symbol: 'circle'}}
    ];

    let severity: number = this.patient.comorbid_severity;
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
      title: {text: 'Distribution of Illness Severity for Reference Population'},
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

  private mortalityChart(comorbidMortalities: ComorbidsDistribution){
    let mortalityData: Array<any> = [
      { y: comorbidMortalities.One.length, marker: {symbol: 'circle'}},
      { y: comorbidMortalities.Two.length, marker: {symbol: 'circle'}},
      { y: comorbidMortalities.Three.length, marker: {symbol: 'circle'}},
      { y: comorbidMortalities.Four.length, marker: {symbol: 'circle'}}
    ];

    let mortality: number = this.patient.comorbid_mortality;
    if(mortality < 1.0){
      mortalityData[0].marker.symbol = this.marker;
    } else if(mortality >= 1.0 && mortality < 2.0){
      mortalityData[1].marker.symbol = this.marker;
    } else if(mortality >= 2.0 && mortality < 3.0){
      mortalityData[2].marker.symbol = this.marker;
    } else if(mortality >= 3.0 && mortality < 4.0){
      mortalityData[3].marker.symbol = this.marker;
    }

    this.comorbidMortalityOptions = {
      chart: { type: 'spline', width: 580, height: 230 },
      title: { text : 'Distribution of Mortality Risk for Reference Population' },
      legend: { enabled: false },
      xAxis: {
        title: { text: 'Range'},
        categories: this.comorbidsLabels
      },
      yAxis: {
        title: { text: 'Patient Count'}
      },
      series: [
        {
          name: 'Patient Count',
          data: mortalityData
        }]
    };
  }

  private ageChart(ages: AgeDistribution){

    let bucketLabels: Array<string> = ages.generateColumns();
    let ageBuckets: Array<Array<number>> = ages.generateAgeBuckets();
    let ageData: Array<any> = [];

    for(let i = 0; i < ageBuckets.length; i++){
      if(ageBuckets[i].indexOf(this.patient.age) === -1) {
        ageData.push({y: ageBuckets[i].length, marker: {symbol: 'circle'}});
      } else{
        ageData.push({y: ageBuckets[i].length, marker: {symbol: this.marker}});
      }
    }

    this.ageOptions = {
      chart: { type: 'spline', width: 580, height: 230 },
      title: { text : 'Distribution of Age for Reference Population' },
      legend: { enabled: false },
      xAxis: {
        title: { text: 'Range'},
        categories: bucketLabels
      },
      yAxis: {
        title: { text: 'Patient Count'}
      },
      series: [
        {
          name: 'Patient Count',
          data: ageData
        }
      ]};
  }
}
