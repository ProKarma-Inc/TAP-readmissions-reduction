An API for scoring patients about to be discharged, deployed on Cloud Foundry using Flask

About
================================================================================
This API uses Spark MlLib 1.5 that is packaged in TAP 0.7. 

This particular `risk-scorer` application takes the `RandomForestModel` that was created in the Data Science tutorial and publishes it as a Scoring Engine API. Since Spark MlLib is inherently latent for use with front line applications and there is a certain amount of startup and execution overhead associated with making predictions, the wall-clock time difference between making one prediction and making many predictions is negligible. The design consequence of this fact means that this API is best used when a larger batch of predictions need to be made at once and then cached for use by a front-end layer.

To Use
================================================================================
Navigate into the `risk-scorer` folder and use:

`cf push risk-scorer`

If your API is at the following url: `http://risk-scorer.12.345.678.910.nip.io`, and you want to get patient readmission scores for admission ids `121451`, `193408` and `150357` just use the `/v1/score` ending with the admission ids in an array as the data param, like so: 

`http://risk-scorer.12.345.678.910.nip.io/v1/score-patients?admissionIDs=[121451, 193408, 150357]`

That returns:

```python
[
  {
    admissionID: 121451,
    readmissionRisk: 0.7333333333333333
  },
    admissionID: 150357,
    readmissionRisk: 0.4666666666666667
  },
    admissionID: 193408,
    readmissionRisk: 0.06666666666666667
  }
]
```

