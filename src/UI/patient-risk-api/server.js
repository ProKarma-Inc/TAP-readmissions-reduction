/**
 * Created by prokarma on 8/17/2016.
 */
// server.js

//Call packages

var mongoConfig = new require('./config/mongodb.js');
var db = mongoConfig();

var express = new require('express');
var app = express();
var bodyParser = new require('body-parser');
var mongoose = new require('mongoose');

mongoose.connect(db.connectionString);


//Schemas
var DischargePatient = new require('./app/models/discharged-patient');

//Configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9090;

//Routes for API
var router = express.Router();

router.use(function(request, response, next){
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Test route
//http://localhost:9090/api
router.get('/', function(request, response){
  response.json({
      message: 'Readmission Risk Patient Select api is running.',
      availableResources: [
          '/ This screen',
          '/discharge-patients GET discharged-patient[]'
      ]
  });
});

/*
This is reading from a MongoDb which is filled with the daily discharged patients.
This data is filled via the Model API which gathers a list of current patients to be
discharged and runs them through the Risk-Scorer API and applies the risk score.

Once the Risk-Score is calculated for each patients this data is dumped into MongoDb
for the Patient Select List screen of the UI.
*/
router.route('/discharge-patients')
    .get(function (request, response){
        DischargePatient.find(function(error, patients){
            if(error){
                response.send(error);
            }
            response.json({
                count: patients.length,
                dischargePatients: patients
            });
        });
    });


//Register Routes
app.use('/api', router);

//start server
app.listen(port);

console.log('Api is running on port:' + port);