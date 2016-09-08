/**
 * Created by prokarma on 8/17/2016.
 */
// app/models/discharge-admission.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dischargeAdmissionsSchema = new Schema({
  row_id: Number,
  subject_id: Number,
  hadm_id: Number,
  admittime: Date,
  dischtime: Date,
  deathtime: Date,
  admission_type: String,
  admission_location: String,
  discharge_location: String,
  insurance: String,
  language: String,
  religion: String,
  marital_status: String,
  ethnicity: String,
  edregtime: Date,
  edouttime: Date,
  diagnosis: String,
  hospital_expire_flag: Number,
  has_ioevents_data: Number,
  has_chartevents_data: Number
});

module.exports = mongoose.model('DischargeAdmission', dischargeAdmissionsSchema);
