# Ingestion Flow for SRE INSIGHTS HUB

1. **Event Flow Overview** (diagram + text)

   * Source (K8s, CW, CI/CD, Logs) → API Gateway → Lambda (ingestion) → DynamoDB `sre_events`.
   * Stream triggers aggregator → updates `trending_incidents` and `service_recommendations`.

2. **API Endpoints**

   * `POST /events` (ingestion)
   * `GET /trending`
   * `GET /recommendations/{serviceId}`

3. **Lambda Responsibilities**

   * `event_ingestor` → validate + normalize + store in `sre_events`.
   * `aggregator` → update trending + rule-based recommendations.
   * `query_handlers` → serve APIs.

4. **Error Handling**

   * If ingestion Lambda fails → retry → DLQ.
   * If stream processing fails → send to DLQ → alert.

5. **Auth/Security**

   * API Gateway → Cognito JWT → only trusted producers can send `/events`.
   * IAM → fine-grained DynamoDB permissions.


