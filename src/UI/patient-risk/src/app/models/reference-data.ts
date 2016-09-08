import { AgeDistribution } from './ageDistribution';
import { ComorbidsDistribution } from './comorbidsDistribution';

export class ReferenceData {
  public ages: AgeDistribution;
  public comorbidSeverities: ComorbidsDistribution;
  public comorbidMortalities: ComorbidsDistribution;

  constructor(){
    this.ages = new AgeDistribution();
    this.comorbidSeverities = new ComorbidsDistribution();
    this.comorbidMortalities = new ComorbidsDistribution();
  }
}
