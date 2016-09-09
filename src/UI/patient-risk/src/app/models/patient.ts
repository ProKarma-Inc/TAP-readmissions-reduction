/**
 * Created by prokarma on 8/23/2016.
 */
export class Patient{
  public subject_id: number;
  public hadm_id: number;
  public admission_type: string;
  public diagnosis: string;
  public ethnicity: string;
  public insurance: string;
  public language: string;
  public marital_status: string;
  public comorbid_severity: number;
  public comorbid_mortality: number;
  public age: number;
  public gender: string;
  public admittime: Date;
  public dischtime: Date;
  public dob: Date;
  public readmissionRisk: number;
  public readmissionRiskScoreAsPercent: string;
  public readmissionRiskScoreColor: string;
}
