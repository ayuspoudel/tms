# Initial Idea

> Author: Ayush Poudel | 06/24/2025

### Problem Statement/ Identification

With advances in how systems are developed, ran and deployed at scale using robust, reduntant, reoverable, secure and cost efficient infra and automation Devops and SRE teams are overwhelmed by alerts being triggered at any time of the day. They recieve thousands of raw logs, metrics, CI/CD alerts daily, where most of those are really just noise. The challenge is to extract important signal from noise, identify what's really trending right now. The goal is to provide actionable recommendations to reduce MTTR. 

### Proposed Solution

The goal is to build a serverless realtime **SRE INSIGHTS HUB** on AWS that:

- Ingests events from 
    - Kubernetes
    - Cloudwatch
    - CI/CD Pipelines
    - Application Logs

- Stores raw events in Dynamo DB
- Aggregates and analyses events in near real time using DynamoDB Streams + lambda
- Identifies trending incidents, generates playbooks for each service
- Exposes APIs to 
    - Query Trending Issues
    - Query Recommendations per Service
    - Push Real Time Updates to the Dashboard


### ROI

- Reduces MTTRs: If engineers see trending issues instead of lot of noises actions can be suggested quickly
- Capturing Tribal Knowledge: Past Incidents become more of stored recommendations

### System Design

- Design high volume event ingestion
- Scalability and API Authorization with secured data handling
- Real time event processing and analytics
- Event-driven, resilient and cost-optimized