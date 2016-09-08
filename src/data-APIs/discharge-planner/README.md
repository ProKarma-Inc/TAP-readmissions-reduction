An app for scheduling new patients for discharge, deployed on Cloud Foundry using Flask

About
================================================================================

This app simulates a flow of patients out of the hospital. In any given hospital there is some process that determines when each patient is ready to be discharged. Since, this reference architecture was developed from historical open source data, there is no live discharge process to integerate with. When a `GET` method is called on this app, it randomly selects a new batch of patients, queries the `record-getter`, removes the old patients form `MongoDB` and send the new records to `MongoDB` where they can be consumed by the front-end app.

To Use
================================================================================
Navigate into the `discharge-planner` folder and use:

`cf push discharge-planner`

If your API is at the following url: `http://discharge-planner.12.345.678.910.nip.io`, and you want to select a new group of patients for discharge, then query the `send-records-to-mongo` method, like so: 
`http://discharge-planner.52.204.218.231.nip.io/v1/send-records-to-mongo`.

You will receive a response like

```python
80 docs sucessfully sent to mongo!
```

