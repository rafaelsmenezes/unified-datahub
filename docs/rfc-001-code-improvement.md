
---

# 🧩 RFC: Future Improvements & Refactoring Plan

**Project:** Buenro Tech Assessment — Unified Data Ingestion Platform
**Author:** Rafael Silva Menezes
**Date:** 2025-10-16
**Status:** Draft (Post-Delivery Enhancement Plan)
**Version:** v1.0

---

## 1. Overview

This document describes the **next iteration of improvements** for the Buenro unified ingestion platform.

The current version **fully meets** the technical challenge requirements — modular architecture, efficient ingestion, unified schema, and flexible querying — but certain **non-blocking refinements** are identified to improve scalability, maintainability, and observability for production-grade environments.

---

## 2. Goals

* Enhance **scalability** for large concurrent data sources.
* Improve **data modeling** and **indexing** for query efficiency.
* Strengthen **observability** and error handling.
* Reduce code duplication and centralize configurations.
* Improve **developer experience** and long-term extensibility.

---

## 3. Architectural Improvements

### 3.1 Source Registration Factory

**Problem:** Current `registerSources()` and `AppModule.onModuleInit()` are tightly coupled.
**Proposal:**

* Create a `SourceRegistryModule` or factory that dynamically loads mappers and sources from configuration files or environment variables.
* This allows new sources to be added without modifying the application core.

**Example:**

```ts
@Module({
  imports: [HttpModule, PersistenceModule],
  providers: [SourceRegistryService],
})
export class IngestionModule {}

@Injectable()
export class SourceRegistryService {
  constructor(private ingestion: IngestionService) {}

  onModuleInit() {
    const sources = loadSourcesFromConfig();
    sources.forEach((s) => this.ingestion.registerSource(s));
  }
}
```

**Impact:**

* Enables dynamic ingestion configuration.
* Improves maintainability and scalability.

---

### 3.2 Parallelized Ingestion with Controlled Concurrency

**Problem:** Current ingestion runs sequentially across multiple sources.
**Proposal:**

* Implement a concurrency limiter using `p-limit` or an async pool pattern.
* Process multiple sources in parallel while respecting MongoDB throughput and memory constraints.

**Impact:**

* Faster ingestion of large datasets (e.g., 150MB+).
* Safer scaling under resource constraints.

---

## 4. Data Modeling Improvements

### 4.1 Enhanced Indexing

**Problem:** Current indexes are limited to `name`, `city`, `availability`, and `pricePerNight`.
**Proposal:**

* Add **text index** for frequent string filters (e.g., `raw.description`, `raw.title`).
* Add **compound indexes** for high-traffic queries.

**Example:**

```ts
schema.index({ 'raw.description': 'text', 'raw.title': 'text' });
schema.index({ city: 1, pricePerNight: 1 });
```

**Impact:**

* Improved query performance for large datasets.
* Better scalability as data volume grows.

---

### 4.2 Schema Versioning

**Problem:** Future sources may introduce incompatible structures.
**Proposal:**

* Introduce `schemaVersion` in the unified document model.
* Allows controlled migration and compatibility for future mappers.

**Example:**

```ts
schema.add({
  schemaVersion: { type: Number, default: 1 },
});
```

---

## 5. Performance and Configurability

### 5.1 Configurable Batch and Query Limits

**Problem:** Static limits (`batchSize`, `limit`, `skip`) are hard-coded.
**Proposal:**

* Move all thresholds to centralized configuration (e.g., `config/performance.config.ts`).

**Example:**

```ts
export default () => ({
  ingestion: {
    batchSize: parseInt(process.env.BATCH_SIZE ?? '1000', 10),
    concurrency: parseInt(process.env.INGEST_CONCURRENCY ?? '2', 10),
  },
  query: {
    maxLimit: parseInt(process.env.QUERY_MAX_LIMIT ?? '1000', 10),
  },
});
```

---

### 5.2 Caching Layer (Future Phase)

**Proposal:**
Add a caching layer (Redis or in-memory) for frequent read queries.

**Impact:**

* Reduced query latency for popular filters.
* Lower load on MongoDB.

---

## 6. Code Quality & Error Handling

### 6.1 Centralized Error Handling

**Problem:** Multiple `try/catch` blocks and repetitive logging.
**Proposal:**

* Implement a centralized `ErrorHandlerService` with NestJS interceptors.
* Use structured error objects and logging context.

**Impact:**

* Cleaner code, better consistency across modules.
* Simplified debugging.

---

### 6.2 Unified Logging & Metrics

**Proposal:**

* Use structured JSON logs (e.g., via `nestjs-pino`).
* Track ingestion metrics: processed records, failed batches, duration, and throughput.

**Example:**

```ts
logger.log({
  event: 'ingestion_completed',
  source,
  recordsProcessed,
  durationMs,
});
```

**Impact:**

* Easier monitoring and observability.
* Readiness for production deployment.

---

## 7. Query and Filtering Enhancements

### 7.1 Dynamic Filter Builder

**Problem:** `FilterBuilder` requires manual updates for new fields.
**Proposal:**

* Make it schema-driven — introspect MongoDB collection keys or use mapper metadata.
* Dynamically build filters for all available fields.

**Impact:**

* Full filtering flexibility for any new data attributes.
* Reduces code maintenance overhead.

---

### 7.2 Pagination Support

**Proposal:**

* Add `limit` and `skip` (or `page`/`pageSize`) parameters to `QueryDataDto`.
* Apply `.limit()` and `.skip()` in repository queries.
* Return metadata `{ total, limit, skip }`.

**Impact:**

* Improved API usability for large datasets.
* Aligns with RESTful best practices.

---

## 8. API & Monitoring

### 8.1 Ingestion Status Endpoint

**Proposal:**
Add `/admin/ingestion/status` endpoint returning the progress and last ingestion time per source.

**Impact:**

* Better transparency for operations and debugging.
* Simplifies manual monitoring.

---

## 9. Implementation Roadmap

| Phase | Area          | Description                                    | Priority |
| ----- | ------------- | ---------------------------------------------- | -------- |
| 1     | Performance   | Parallel ingestion + config-driven batch size  | High     |
| 2     | Data Modeling | Indexing + schema versioning                   | Medium   |
| 3     | Observability | Centralized logging + metrics                  | Medium   |
| 4     | API           | Pagination + ingestion status endpoint         | Medium   |
| 5     | DX            | Dynamic FilterBuilder + modular source factory | Low      |

---

## 10. Conclusion

The current system is **production-ready for the challenge scope**, meeting all technical and architectural requirements.
This RFC defines a **roadmap for continuous improvement**, ensuring the platform can evolve into a **scalable, observable, and maintainable ingestion ecosystem**.

---

### ✅ Summary of Key Next Steps

* Parallel ingestion with concurrency control.
* Configurable batch size and pagination.
* Text indexes for dynamic fields.
* Structured logging and metrics.
* Dynamic filter generation.

---

