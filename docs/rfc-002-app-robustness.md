
---

# 🧩 **RFC — Phase 2: Robustness & Scalability Improvements**

**Repository:** [buenro-tech-assessment](https://github.com/rafaelsmenezes/buenro-tech-assessment)
**Author:** Rafael Menezes
**Date:** 2025-10-16
**Status:** Draft
**Goal:** Define next-phase improvements to enhance robustness, scalability, and observability of the unified data ingestion system.

---

## **1️⃣ Motivation**

The current version of the system meets all requirements of the Buenro technical challenge:

* ✅ Modular ingestion architecture
* ✅ Unified data schema
* ✅ Efficient batch streaming
* ✅ Flexible filtering and querying

This RFC defines the **next phase of evolution**, focusing on **operational maturity**, **resilience**, and **observability** — key for production-scale environments.

---

## **2️⃣ Proposed Improvements**

### **2.1 Full-text & Advanced Search**

**Current:**

* Mongo filters using `$regex` and `$or` conditions.

**Limitations:**

* No fuzzy or weighted relevance search.
* Limited performance for large datasets.

**Proposal:**

* Integrate **MongoDB Atlas Search** (native Lucene-based) or **Elasticsearch** for advanced search capabilities:

  * Fuzzy matching.
  * Multi-field relevance scoring.
  * Language analyzers (stemming, stop words).

**Outcome:**

* Significantly improved UX for free-text search queries and global filtering.

---

### **2.2 Schema Validation per Source**

**Current:**

* Source data is mapped directly from raw JSON to unified entities.

**Risk:**

* Malformed or unexpected source fields could break ingestion silently.

**Proposal:**

* Introduce **JSON Schema validation** per source (via `ajv` or `zod`):

  * Validate source structure before mapping.
  * Log and skip invalid entries.

**Outcome:**

* Improved data integrity and observability during ingestion.

---

### **2.3 Idempotent Checkpointing**

**Current:**

* Streaming and upserts are atomic, but ingestion restart resumes from start.

**Problem:**

* In long-running or large datasets (100MB+), a restart may reprocess previous records.

**Proposal:**

* Implement **checkpointing** (e.g., store last byte offset, ETag, or `lastModified`).
* Resume ingestion from the last checkpoint.

**Outcome:**

* Enables resumable, idempotent ingestion — essential for large datasets or remote sources.

---

### **2.4 Observability: Metrics & Tracing**

**Current:**

* Basic logging only.

**Proposal:**

* Integrate:

  * **Prometheus metrics**: ingestion throughput, errors, duration, batch size, retry count.
  * **OpenTelemetry / Sentry**: for tracing and structured error reporting.

**Outcome:**

* Full visibility into ingestion performance and reliability.

---

### **2.5 API Robustness & Security**

**Proposal:**

* Add **rate-limiting** and **authentication** middleware (e.g., `@nestjs/throttler` + JWT).
* Integrate **Redis caching** for high-frequency queries.

**Outcome:**

* Protects system from abuse and improves API response times.

---

### **2.6 Background Jobs & Retry Mechanisms**

**Current:**

* Ingestion runs synchronously in-process.

**Proposal:**

* Move ingestion to background **workers** (e.g., BullMQ or RabbitMQ consumers):

  * Queue-based ingestion with concurrency control.
  * Automatic retries and DLQ (dead letter queue) on failure.

**Outcome:**

* Improves reliability, scalability, and error isolation.

---

### **2.7 Performance & Load Testing**

**Proposal:**

* Integrate **k6** for automated performance testing and baseline creation.
* Test under different scenarios:

  * Bulk ingestion (streaming)
  * Query filtering
  * Concurrent API requests

**Outcome:**

* Ensures the platform scales under real-world load and regression testing becomes measurable.

---

## **3️⃣ Prioritization Roadmap**

| Phase | Category          | Description                  | Priority  |
| ----- | ----------------- | ---------------------------- | --------- |
| 1     | Observability     | Prometheus metrics + Sentry  | 🔥 High   |
| 1     | Schema Validation | JSON Schema per source       | 🔥 High   |
| 2     | Background Jobs   | BullMQ ingestion             | 🔥 High   |
| 2     | Checkpointing     | Resume ingestion via offset  | 🟡 Medium |
| 3     | Search Upgrade    | Mongo Atlas Search / Elastic | 🟢 Low    |
| 3     | API Hardening     | Auth + rate limit + cache    | 🟢 Low    |
| 3     | Perf Testing      | k6 benchmark suite           | 🟢 Low    |

---

## **4️⃣ Example Architecture Extension**

```mermaid
flowchart TD
  A[IngestionService] --> B[Source Registry]
  B --> C[Schema Validator (Zod/AJV)]
  C --> D[Worker Queue (BullMQ)]
  D --> E[MongoRepository Bulk Upsert]
  E --> F[Checkpoint Store (Mongo/Redis)]
  D --> G[Prometheus Metrics + Traces]
  H[API Gateway] --> I[Cache Layer (Redis)]
  I --> J[Mongo/Atlas Search]
```

---

## **5️⃣ Expected Outcomes**

* **More resilient ingestion** under failure and restart conditions.
* **Improved developer observability** (metrics, logs, traces).
* **Reduced operational cost** through caching and rate-limiting.
* **Easier horizontal scaling** through job queue architecture.

---

## **6️⃣ References**

* [MongoDB Atlas Search Documentation](https://www.mongodb.com/docs/atlas/atlas-search/)
* [BullMQ](https://docs.bullmq.io/)
* [OpenTelemetry for NestJS](https://opentelemetry.io/docs/instrumentation/js/integrations/nestjs/)
* [k6.io — Load Testing](https://k6.io/docs/)

---

## ✅ **Summary**

> This RFC defines the **Phase 2** maturity roadmap for the Buenro ingestion system,
> focusing on **robustness, observability, and scalability**, aligning the project with production-grade engineering practices used at companies like **Delivery Hero, Stripe, or Airbnb**.

---
