/**
 * Created by prokarma on 8/23/2016.
 */
export class Patient{
  subject_id: number;
  hadm_id: number;
  admission_type: string;
  diagnosis: string;
  ethnicity: string;
  insurance: string;
  language: string;
  marital_status: string;
  comorbid_severity: number;
  comorbid_mortality: number;
  age: number;
  gender: string;
  admittime: Date;
  dischtime: Date;
  dob: Date;
  readmissionRisk: number;
  readmissionRiskScoreAsPercent: string;
  readmissionRiskScoreColor: string;
}
