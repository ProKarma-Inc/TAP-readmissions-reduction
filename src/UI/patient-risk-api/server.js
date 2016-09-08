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
var DischargeAdmission = new require('./app/models/discharge-admission');
var DischargeComorbids = new require('./app/models/discharge-comorbid');
var DischargePatient = new require('./app/models/discharge-patient');
var ProcessedPatient = new require('./app/models/processed-data');

var dataImporter = new require('./config/SampleDataImporter.js')(DischargeAdmission,
                                                                 DischargeComorbids,
                                                                 DischargePatient,
                                                                 ProcessedPatient);

//uncomment if you need to clear out all the data
/*dataImporter.deleteAllData();*/

//check if test data needs to be loaded
dataImporter.populateAdmissionsSampleDataIfNone();
dataImporter.populateComorbidsSampleDataIfNone();
dataImporter.populatePatientSampleDataIfNone();
dataImporter.populateProcessedPatientsIfNone();


//Configuration
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9090;

//Routes for API
var router = express.Router();

router.use(function(request, response, next){
    console.log('Routerness is happening.');
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
          '/discharge-admissions GET discharge-admission[]',
          '/discharge-comorbids GET discharge-comorbid[]',
          '/discharge-patients GET discharge-patient[]',
          '/processed-patients GET processed-patient[]',
          '/ages-distribution GET AgeDistribution[]',
          '/comorbid-severity-distribution GET severityDistributions[]',
          '/comorbid-mortality-distribution GET mortalityDistributions[]'
      ]
  });
});

router.route('/discharge-admissions')
   .get(function(request, response){
    DischargeAdmission.find(function(error, admissions){
      if(error){
        response.send(error);
      }
      response.json({
                      count: admissions.length,
                      admissions: admissions
                    });
    });
  });

router.route('/discharge-comorbids')
    .get(function(request, response){
      DischargeComorbids.find(function(error, comorbids){
        if(error){
          response.send(comorbids);
        }
        response.json({
                         count: comorbids.length,
                         comorbids: comorbids
                      });
      });
    });

router.route('/discharge-patients')
    .get(function (request, response){
      DischargePatient.find(function(error, patients){
        if(error){
          response.send(error);
        }
        response.json({
                        count: patients.length,
                        patients: patients
                      });
      });
    });

router.route('/processed-patients')
    .get(function (request, response){
        ProcessedPatient.find(function(error, patients){
            if(error){
                response.send(error);
            }
            response.json({
                count: patients.length,
                processedPatients: patients
            });
        });
    });

router.route('/ages-distribution')
    .get(function(request, response){
        ProcessedPatient.find(function(error, patients){
            if(error){
                response.send(error);
            }

            var ageDistributions = new AgeDistribution();
            for(var i = 0; i < patients.length; i++){
                var age = patients[i].ages;
                if(age <= 10){
                    ageDistributions.A.push(age)
                } else if(age > 10 && age <= 20){
                    ageDistributions.B.push(age);
                } else if(age > 20 && age <= 30){
                    ageDistributions.C.push(age);
                } else if(age > 30 && age <= 40){
                    ageDistributions.D.push(age);
                } else if(age > 40 && age <= 50){
                    ageDistributions.E.push(age);
                } else if(age > 50 && age <= 60){
                    ageDistributions.F.push(age);
                } else if(age > 60 && age <=70){
                    ageDistributions.G.push(age);
                } else if(age > 70 && age <= 80){
                    ageDistributions.H.push(age);
                } else if(age > 80 && age <= 90){
                    ageDistributions.I.push(age);
                } else{
                    ageDistributions.J.push(age);
                }
            }

            response.json({
                ACount: ageDistributions.A.length,
                BCount: ageDistributions.B.length,
                CCount: ageDistributions.C.length,
                DCount: ageDistributions.D.length,
                ECount: ageDistributions.E.length,
                FCount: ageDistributions.F.length,
                GCount: ageDistributions.G.length,
                HCount: ageDistributions.H.length,
                ICount: ageDistributions.I.length,
                JCount: ageDistributions.J.length,
                ageDistributions: ageDistributions
            });

        });
    });

router.route('/comorbid-severity-distribution')
    .get(function(request, response){
        ProcessedPatient.find(function(error, patients){
            if(error){
                response.send(error);
            }

            var severityDistributions = new ComorbidsDistribution();
            for(var i = 0; i < patients.length; i++){
                var severity = patients[i].comorbid_severity;
                if(severity >= 0 && severity < 1.0){
                    severityDistributions.One.push(severity);
                } else if(severity >=  1.0 && severity < 2.0){
                    severityDistributions.Two.push(severity);
                } else if(severity >= 2.0 && severity < 3.0){
                    severityDistributions.Three.push(severity);
                } else if(severity >= 3.0 && severity < 4.0){
                    severityDistributions.Four.push(severity);
                }else{
                    severityDistributions.Five.push(severity);
                }
            }

            response.json({
                OneCount: severityDistributions.One.length,
                TwoCount: severityDistributions.Two.length,
                ThreeCount: severityDistributions.Three.length,
                FourCount: severityDistributions.Four.length,
                FiveCount: severityDistributions.Five.length,
                severityDistributions: severityDistributions
            });
        });
    });

router.route('/comorbid-mortality-distribution')
    .get(function(request, response){
        ProcessedPatient.find(function(error, patients){
            if(error){
                response.send(error);
            }

            var mortalityDistributions = new ComorbidsDistribution();
            for(var i = 0; i < patients.length; i++){
                var mortality = patients[i].comorbid_mortality;
                if(mortality >= 0 && mortality < 1.0){
                    mortalityDistributions.One.push(mortality);
                } else if(mortality >=  1.0 && mortality < 2.0){
                    mortalityDistributions.Two.push(mortality);
                } else if(mortality >= 2.0 && mortality < 3.0){
                    mortalityDistributions.Three.push(mortality);
                } else if(mortality >= 3.0 && mortality < 4.0){
                    mortalityDistributions.Four.push(mortality);
                }else{
                    mortalityDistributions.Five.push(mortality);
                }
            }

            response.json({
                OneCount: mortalityDistributions.One.length,
                TwoCount: mortalityDistributions.Two.length,
                ThreeCount: mortalityDistributions.Three.length,
                FourCount: mortalityDistributions.Four.length,
                FiveCount: mortalityDistributions.Five.length,
                severityDistributions: mortalityDistributions
            });
        });
    });

//Register Routes
app.use('/api', router);

//start server
app.listen(port);

console.log('Api is running on port:' + port);

//Helper
var AgeDistribution = function(){
    var self = this;

    self.A = [];
    self.B = [];
    self.C = [];
    self.D = [];
    self.E = [];
    self.F = [];
    self.G = [];
    self.H = [];
    self.I = [];
    self.J = [];
};

var ComorbidsDistribution = function(){
    var self = this;

    self.One = [];
    self.Two = [];
    self.Three = [];
    self.Four = [];
    self.Five = [];
};