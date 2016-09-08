/**
 * Created by prokarma on 8/17/2016.
 */
// app/models/discharge-comorbid.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dischargeComorbidsSchema = new Schema({
    row_id: {
        type: Number,
        required: true
    },
    subject_id: {
        type: Number,
        required: true
    },
    hadm_id:{
        type: Number,
        required: true
    },
    drg_type: String,
    drg_code: {
        type: Number,
        required: true
    },
    description: String,
    drg_severity: {
        type: Number,
        required: true
    },
    drg_mortality: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('DischargeCormorbids', dischargeComorbidsSchema);