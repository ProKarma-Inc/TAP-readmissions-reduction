/**
 * Created by prokarma on 9/9/2016.
 */
export class ReAdmissionData{
  public dates: Array<Date>;
  public readmissionRates: Array<number>;

  constructor(){
    this.dates = [];
    this.readmissionRates = [];
  }
}
