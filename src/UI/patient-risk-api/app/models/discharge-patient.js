/**
 * Created by prokarma on 8/17/2016.
 */
// app/models/discharge-admission.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dischargePatientSchema = new Schema({
    row_id: Number,
    subject_id: Number,
    gender: String,
    dob: Date,
    dod: Date,
    dod_hosp: Date,
    dod_ssn: Date,
    expire_flag: Number
});

module.exports = mongoose.model('DischargePatient', dischargePatientSchema);
