# Reducing Hospital Admissions
A reference architecture for using big data and machine learning to improve patient care with Intel’s Trusted Analytics Platform (TAP) 

## 1. The Problem

The Affordable Care Act established the Hospital Readmissions Reduction Program (HRRP), which requires the Centers for Medicare & Medicaid Services (CMS) to promote quality health care for Americans. To this end the CMS is required to reduce payments to hospitals with excessive readmissions. Additionally, hospitals incur unnecessary costs when patients are readmitted for conditions that could have been addressed or mitigated during the patient's initial admission. As a result, hospitals are seeking ways to reduce readmissions rates.

## 2. Executive Summary

The prevalence of large patient datasets and the computational resources now available via cloud computing gives data scientists the ability to find meaningful patterns in patient readmission data. From these patterns, models can be built which enable hospitals to identify the most at-risk patients before they are discharged and apply an appropriate intervention. Below are the specifics points that will be covered to demonstrate how Intel’s Trusted Analytics Platform (TAP) con solve the problem statement from Section 1:

  *	**Solution Overview**: TAP packages standard Open Source tools (e.g. Cloudera Hadoop, Docker, and Cloud Foundry) to create an integrated platform to quickly develop predictive models from large datasets and then deploy those models for use in applications.
  *	**Reference Architecture**: Data sources can be combined to train a predictive model with high accuracy on assessing likelihood of patient readmission. That model can be deployed as a service so that it’s predictions can be consumed by other applications (see figure 1).
  *	**Reference Implementation**: We have created a specific implementation of the Reference Architecture using the open source MIMIC-III medical dataset, complete with detailed explanations, walkthrough and code available at https://github.com/MichaelAHood/readmissions-risk-scorer/blob/master/data-science-on-TAP.md
  *	**Adoption Plan for Your Own Implementation**: The last step is a discussion of how a specific hospital can use the Reference Architecture to create their own implementation with their own data and existing applications. 
  * **Reducing Readmissions Case Study**: In conclusion, there is a case study that discusses how Intel helped a large hospital group successfully implement a readmissions reduction program using big data and machine learning.

![Predictive Modeling Process](images/predictive-modeling-process.png)
Figure 1: Reference Architecture for creation and deployment of a predictive model to assess patient readmission risk

## 3. How to Use the Reference Architecture

Figure 1 demonstrates the Reference Architecture in which patient Electronic Medical Record (EMR) data can be combined with multiple data sources, such as census data, and socio-economic data to form a rich picture of a patient. With the right data, data scientists can create predictive models that learn the relationships between patient data and their propensity for different conditions, e.g. heart disease or risk of early readmission.

The Reference Architecture is meant to be customized to a specific hospital – creating a unique implementation. For this reason, we have created a Reference Implementation (see section 4 and the GitHub repo) complete with downloadable code and detailed documentation. Specific discussion and considerations for a hospital’s own implementation can be found in Section 5.

In general, once a predictive model has been created and validated, it can be deployed as a cloud-based service that allows the model's predictions to be consumed by other applications. For example, discharge planning software can pass a list of patient IDs to the model and receive a score that indicates the readmission risk for each patient. Once high-risk patients have been identified, their EMRs and discharge plans can be evaluated to address any appropriate risk factors. In this way, the model serves as a cognitive aid to assist hospital staff in identifying high-risk patients who may have gone unnoticed.


## 4. What the Solution Contains – The Reference Implementation

The Reference Implementation (see Figure 2) utilizes the core TAP technologies, e.g. Cloudera Hadoop (CDH), Docker, and Cloud Foundry in the following ways:

 *	Historical data and patient records are stored in the CDH cluster.
 *	Jupyter notebooks are created in Docker containers enabling data scientists to conduct collaborative and reproducible analysis.
 *	Apache Spark -- the big data computing engine -- is utilized on the CDH cluster to analyze large distributed datasets.
 *	Apache Spark’s Machine Learning Library is used to train and validate the predictive model.
 *	Cloud Foundry is used to package the predictive model and deploy it in the TAP cloud as an API service.
 *	Cloud Foundry is also used to create an application that depicts prediction results in a visual manner to facilitate comprehension by medical staff.

See https://github.com/MichaelAHood/readmissions-risk-scorer for more details.

![Solution Architecture](images/architecture-diagram-1.png)
Figure 2: Logical relationship and key technologies used in this reference implementation.

## 5. Adoption Roadmap – Creating Your Own Implementation

This adoption roadmap frames the discussion for understanding how creating your own implementation of the Reference Architecture differs from the specifics of the Reference Implementation in Section 4.

This adoption roadmap for this solution consists of five essential steps:

1. Identifying your organization’s relevant data and load it into the TAP cluster.
2. Explore, process, and engineer features for use in predictive modeling.
3. Pick a performance criteria and train a predictive model accordingly.
4. Deploy the predictive model as an API that can be used by another application.
5. Build an application that incorporates the model predictions into your workflow.

**1. Identifying your organization’s relevant data and load it into the TAP cluster.** At a minimum, the hospitals admission records are required to identify which patients were readmitted within a given time frame. Other sources of data, such as demographic information, electronic chart data, and comorbidity records, can further enrich the patient readmission data, boosting model performance. Choosing what data to incorporate into a model can be as much a creative effort as it is an investigative one, and should be treated as an iterative development process. Subject Matter Experts (SMEs), IT professionals, and Data Scientists should be involved in this initial phase. Data can be loaded and stored in TAP in many forms that lend themselves to the individual preferences and needs of an IT and Analytics team. CSV files and Hive tables are two storage formats that facilitate using big data tools, such as Apache Spark.

**2. Explore, process, and engineer features for use in predictive modeling.** This step involves creating the data pipeline that takes the data – from the source defined in the previous step – and prepares it for modeling. This step includes conducting Exploratory Data Analysis (EDA) to learn the structure of the data, cleaning any dirty or missing data, and identifying what data fields will be useful for modeling. A significant effort in this step is feature engineering, that is the creation of new data features from pre-existing ones. Feature Engineering is best done when SMEs, IT professionals, and data scientists come together to brainstorm and discuss novel ideas and courses of action. In most cases, socioeconomic, demographic data, and low-dimensional features, such as height, weight, and age contain the majority of the predictive signal.

**3. Pick a performance criteria and train a predictive model accordingly.** This step entails considering the practical details of what a model is doing. No model is perfect and this fact requires that tradeoffs must be made since some patients will be incorrectly flagged by the model and other high-risk patients will be missed entirely. Therefore, an analysis must be done that considers the cost of false positives and false negatives – administering unnecessary medical care or missing a high-risk patient – and the benefit of true positives – reducing readmissions. The stakeholders in this discussion are the healthcare professionals, operations planning staff, and data scientists. With appropriate performance criteria the data scientist can train and validate a model according to the specified criteria. In our experience, the area under the Receiver Operating Characteristic curve (AUC-ROC) is best suited for delivering optimal results on this particular problem.

**4. Deploy the predictive model as an API that can be used by another application.** Once a model has been created it must be deployed in a format that enables other applications to consume the predictions it makes. From a development and integration standpoint the simplest way to do this is to package the model as a service where it can be called like a REST API. Creating the model as a service gives application developers tremendous flexibility in how they choose to utilize the model – allowing them to only worry about the input and output of the model and ignore the internal details of how the model works.

**5. Build an application that incorporates the model predictions into your workflow.** With the model available as a service, it is necessary to incorporate the prediction results into an existing workflow to give medical practitioners a way to utilize the model's predictions. Since the output of a model is just a number representing a risk score for readmission, this reference architecture builds a lightweight app that allows visualizations of the predictions and patient data. It is often helpful to provide contextual data to go with a given prediction so hospital staff can view the model's prediction within the broader context of the overall population. However, with the model as a service it is modular and flexible enough to incorporate into different applications as needed to fit an organization’s requirements.

## 6. Solution Background – A Case Study in Reducing Readmissions

This Reference Architecture originated through Intel's partnership with Cloudera to conduct a pilot program with a Large Hospital Group to use predictive analytics to reduce readmission rates. 

Intel Data Scientists took historical patient data and combined it with socioeconomic data, such as housing prices and health services in the surrounding area. With this enriched dataset they trained a Random Forest predictive model that enabled doctors to pinpoint which patients were a high readmission risk. Hospital staff were able to administer additional care to identify any shortcomings in the treatment and discharge plan, thereby reducing overall readmission rates.

By Using the predictions from the analysis, the Hospital Group was able to reap the following benefits:

  1. Reducing 6,000 occurrences of patient readmission.
  2. Avoiding $4 million in potential Medicare penalties.
  3. Saving approximately $72 million in medical costs.
  4. Improving hospital ratings by lowering readmission rate and increasing patient satisfaction.
  5. More efficient utilization of resources by focusing at high-risk patients.

One of the unintended benefits of implementing this solution was more efficient utilization of resources. Specifically, the increased quality of care provided to the identified high-risk patients during their initial visit freed up resources that enabled the Hospital Group to help an additional 300 - 500% more patients.

## Conclusion:

We have provided a Reference Implementation as a blueprint that enables any hospital organization to use TAP to quickly adopt the above described solution, and begin reaping the same benefits.

For more information about using Intel TAP in your own organization, please contact: Michael.j.demshki@intel.com
