# Data Model for SRE INSIGHTS HUB


From open source data such as Kubernetes events, Prometheus, CloudWatch, and Application Logs, a common pattern emerges. The goal is to design DynamoDB tables for neat data storage and easy querying.

## Typical Events

- **Kubernetes Events**  
    Examples: Pod crash, OOMKilled, ImagePullBackOff, NodeNotReady.  
    ```json
    {
        "kind": "Event",
        "involvedObject": { "kind": "Pod", "name": "checkout-api-57ff7" },
        "reason": "BackOff",
        "message": "Back-off restarting failed container",
        "type": "Warning",
        "firstTimestamp": "2025-08-26T14:01:23Z"
    }
    ```

- **CloudWatch Alarms**  
    Examples: CPU > 85%, Latency spike, Error rate > 5%.  
    ```json
    {
        "AlarmName": "HighCPU-PaymentsAPI",
        "StateChangeTime": "2025-08-26T14:03:00Z",
        "NewStateValue": "ALARM",
        "Trigger": {
            "MetricName": "CPUUtilization",
            "Threshold": 85
        }
    }
    ```

- **CI/CD Pipeline Events**  
    Examples: Deploy succeeded/failed, Rollback triggered.  
    ```json
    {
        "workflow": "Deploy Checkout Service",
        "status": "failure",
        "run_id": 4821,
        "updated_at": "2025-08-26T14:06:00Z"
    }
    ```

- **Application Logs**  
    Examples: API 500s, DB connection errors, timeouts.  
    ```json
    {
        "timestamp": "2025-08-26T14:05:00Z",
        "level": "ERROR",
        "service": "auth-service",
        "message": "Login DB connection timeout",
        "traceId": "abc123"
    }
    ```

---

## Typical Queries

- **Per Service Debugging:**  
    _Show all events for payments-api in the last 15 minutes._

- **Trending View:**  
    _Top 10 incidents right now across all services by severity score._

- **Recommendations:**  
    _What actions should I take for auth-service?_

- **Correlation:**  
    _Show related errors around a deploy failure._

- **Operational Metrics:**  
    _How many high-severity incidents were recorded today?_

---

## Schema Optimization

- **Raw Ingestion → sre_events:**  
    - **PK:** serviceId  
    - **SK:** timestamp  
    - **Rationale:** Efficient per-service time-range queries  
    - **TTL:** For auto-expiry

- **Aggregations → trending_incidents:**  
    - **PK:** incidentId (serviceId#eventType)  
    - **Rationale:** Fast lookup of trending issues, with pre-computed counters

- **Playbooks → service_recommendations:**  
    - **PK:** serviceId  
    - **Rationale:** Single item per service = O(1) query for recommendations

- **Normalization:**  
    Raw diverse event formats normalized into:  
    `serviceId, timestamp, eventType, severity, details, ttl`  
    This creates a unified schema across sources.

- **Efficiency:**  
    TTL + Streams avoid expensive scans.  
    Event volume handled with DynamoDB on-demand and partitioning by service.

