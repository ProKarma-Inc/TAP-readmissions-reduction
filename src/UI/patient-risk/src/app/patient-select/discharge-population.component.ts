import { Component, OnInit, ElementRef, Renderer } from '@angular/core';
import { PatientService } from '../services';
import { Patient } from '../models/patient';
import { ROUTER_DIRECTIVES, Router } from '@angular/router';
import { RiskLegendComponent } from '../risk-legend';

@Component({
  moduleId: module.id,
  selector: 'pk-discharge-population',
  templateUrl: 'discharge-population.component.html',
  styleUrls: ['discharge-population.css'],
  directives: [RiskLegendComponent],
  providers: [PatientService, ROUTER_DIRECTIVES]
})
export class DischargePopulationComponent implements OnInit{
  private originalPatients: Array<Patient>;
  private currentPatients: Array<Patient>;
  private displayedPatients: Array<Patient>;
  private columns: Array<string>;
  private errorMessage: string;
  private numberOfPages: Array<number>;
  private paginationsButtonsDisplayed: Array<number>;
  private numberOfPageButtons: number;
  private itemsPerPage: number;
  private currentPage: number;
  private riskScoreSortingDirection: string;
  private ageSortingDirection: string;
  private ageMaxSliderValue: number;
  private ageMinSliderValue: number;
  private filterByAdmissionDateFrom: string;
  private filterByAdmissionDateTo: string;
  private currentRiskScoreLevelFilter: string;

  constructor(private patientService: PatientService, private router: Router, private element: ElementRef, private renderer: Renderer) {
    this.originalPatients = [];
    this.currentPatients = [];
    this.displayedPatients = [];
    this.numberOfPages = [];
    this.paginationsButtonsDisplayed = [];
    this.riskScoreSortingDirection = '';
    this.ageSortingDirection = '';
    this.columns = ['Patient ID', 'Age', 'Gender', 'Marital Status', 'Language', 'Admission Date', 'Admission Type', 'Discharge Date', 'Risk Score', 'Details'];
    this.ageMaxSliderValue = 120;
    this.ageMinSliderValue = 0;
    this.numberOfPageButtons = 5;
    this.itemsPerPage = 15;
    this.currentPage = 1;
    this.currentRiskScoreLevelFilter = 'all';
  }

  ngOnInit() {
    this.patientService.getAllPatients()
                      .subscribe(
                        p => {
                            this.currentPatients = p;
                            this.originalPatients = p;

                            for(let i = 0; i < this.itemsPerPage; i++) {
                              this.displayedPatients.push(this.currentPatients[i]);
                            }

                          this.calculatePaginationButtons();
                        },
                        e => this.errorMessage = e
                      );
  }

  public goToDetails(patient: Patient){
      this.router.navigate(['/details', patient.hadm_id]);
  }

  public sortPatientList(column){
    const DESCENDING = 'Dsc';
    const ASCENDING = 'Asc';

    if(column === 'Risk Score') {
      if (this.riskScoreSortingDirection === '') {
        this.riskScoreSortingDirection = DESCENDING;
      }

      if (this.riskScoreSortingDirection === ASCENDING) {
        this.currentPatients.sort(sortRiskScoreAsc);
        this.riskScoreSortingDirection = DESCENDING;
      } else {
        this.currentPatients.sort(sortRiskScoreDesc);
        this.riskScoreSortingDirection = ASCENDING;
      }
    }

    if(column === 'Age'){
      if(this.ageSortingDirection === ''){
        this.ageSortingDirection = DESCENDING;
      }

      if(this.ageSortingDirection === ASCENDING){
        this.currentPatients.sort(sortAgeAsc);
        this.ageSortingDirection = DESCENDING;
      } else{
        this.currentPatients.sort(sortAgeDesc);
        this.ageSortingDirection = ASCENDING;
      }
    }

    this.goToPage(1);
    this.calculatePaginationButtons();
  }


  public goToPage(page: number){
    let startingIndex = 0;
    if(page !== 1){
      startingIndex = Math.ceil((page * this.itemsPerPage) - (this.itemsPerPage - 1));
    }

    let endingIndex = (startingIndex + (this.itemsPerPage - 1));

    this.displayedPatients = this.currentPatients.filter(function(value, index){
      if(index >= startingIndex && index <= endingIndex){
        return true;
      }
    });

    let previousActive = this.element.nativeElement.querySelector('.active');
    if(previousActive) {
      this.renderer.setElementClass(previousActive, 'active', false);
    }

    let currentPageElement = this.element.nativeElement.querySelector('#Page' + page);
    if(!currentPageElement){
      return;
    }
    this.renderer.setElementClass(currentPageElement, 'active', true);

    this.currentPage = page;
  }

  public previousPage(){
    let previousPage = (this.currentPage - 1);
    if(previousPage < 1){
      return;
    }
    this.currentPage = previousPage;

    if(this.paginationsButtonsDisplayed.indexOf(this.currentPage) === -1){
      this.paginationsButtonsDisplayed.pop();
      this.paginationsButtonsDisplayed.unshift(this.currentPage);
    }

    this.goToPage(this.currentPage);
  }

  public isPreviousDisabled(){
    if(this.currentPage === 1){
      return true;
    }
    return false;
  }

  public nextPage(){
    let nextPage = (this.currentPage + 1);
    if(nextPage > this.numberOfPages.length){
      return;
    }
    this.currentPage = nextPage;

    if(this.paginationsButtonsDisplayed.indexOf(this.currentPage) === -1) {
      this.paginationsButtonsDisplayed.shift();
      this.paginationsButtonsDisplayed.push(this.currentPage);
    }

    this.goToPage(this.currentPage);
  }

  public isNextDisabled(){
    if(this.currentPage === this.numberOfPages.length){
      return true;
    }
    return false;
  }

  public hideDisplayButton(page: number){
    if(this.paginationsButtonsDisplayed.indexOf(page) === -1){
      return true;
    }
    return false;
  }

  public filterByAge(){
    this.updateFilterDisplay();
  }

  public filterByRiskLevel(level: string){
    this.currentRiskScoreLevelFilter = level;
    this.updateFilterDisplay();
  }

  public filterAdmissionDateFrom(){
    this.updateFilterDisplay();
  }

  public filterAdmissionDateTo(){
    this.updateFilterDisplay();
  }

  public calculatePaginationButtons(){
    this.currentPage = 1;
    this.numberOfPages = [];
    for(let i = 0; i < (this.currentPatients.length/this.itemsPerPage); i++){
      this.numberOfPages.push(i + 1);
    }

    this.paginationsButtonsDisplayed = [];
    for(let i = 0; i < this.numberOfPageButtons; i++){
      if(i < this.numberOfPageButtons) {
        this.paginationsButtonsDisplayed.push(i + 1);
      }
    }
  }

  public clearFilters() {
    this.currentRiskScoreLevelFilter = 'all';
    this.currentPatients = this.originalPatients;
    this.displayedPatients = this.currentPatients.slice(0, this.itemsPerPage);
    this.ageMaxSliderValue = 100;
    this.calculatePaginationButtons();
  }

  public updateFilterDisplay(){
    // Filter by Age
    let filteredPatients = this.originalPatients.filter(patient => patient.age >= this.ageMinSliderValue && patient.age <= this.ageMaxSliderValue);

    // Filter by Risk Level
    switch(this.currentRiskScoreLevelFilter){
      case 'low':
        filteredPatients = (filteredPatients.filter(patient => patient.readmissionRisk <= 0.25));
        break;
      case 'borderline':
        filteredPatients = (filteredPatients.filter(patient => patient.readmissionRisk > 0.25 && patient.readmissionRisk <= 0.50));
        break;
      case 'high':
        filteredPatients = (filteredPatients.filter(patient => patient.readmissionRisk > 0.50 && patient.readmissionRisk <= 0.75));
        break;
      case 'critical':
        filteredPatients = (filteredPatients.filter(patient => patient.readmissionRisk > 0.75));
        break;
      default:
        //filteredPatients = filteredPatients;
        break;
    }

    // Filter by Discharge Date From
    if (this.filterByAdmissionDateFrom) {
      filteredPatients = filteredPatients.filter(patient => new Date(patient.dischtime.toString()) >= new Date(this.filterByAdmissionDateFrom));
    }

    // Filter by Discharge Date To
    if (this.filterByAdmissionDateTo) {
      filteredPatients = filteredPatients.filter(patient => new Date(patient.dischtime.toString()) <= new Date(this.filterByAdmissionDateTo));
    }

    this.currentPatients = filteredPatients;
    this.displayedPatients = this.currentPatients.slice(0, this.itemsPerPage);
    this.calculatePaginationButtons();
    this.goToPage(1);
  }
}

function sortRiskScoreDesc(lhs, rhs){
  return rhs.readmissionRisk - lhs.readmissionRisk;
}
function sortRiskScoreAsc(lhs, rhs){
  return lhs.readmissionRisk - rhs.readmissionRisk;
}
function sortAgeDesc(lhs, rhs){
  return rhs.age - lhs.age;
}
function sortAgeAsc(lhs, rhs){
  return lhs.age - rhs.age;
}
