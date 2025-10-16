
---

# Buenro Tech Assessment – Backend Solution

## Overview

This project implements a **scalable ingestion and querying backend** using **NestJS**, **TypeScript**, and **MongoDB**, designed to support multiple external JSON sources of varying structure.

It fulfills the requirements of the Buenro Senior Backend Engineer technical case:

* Ingest multiple external JSONs (from S3) of sizes from KB to GB.
* Store data in a unified structure that supports efficient queries.
* Provide a single API endpoint with flexible filtering logic.
* Easily extendable to new data sources.

---

## 🧱 Architecture

```
src/
├── domain/                    # Entities and interfaces
├── application/               # Business logic (use cases)
├── infrastructure/            # Data integration, storage, ingestion pipeline
├── interfaces/                # Controllers and DTOs for REST API
└── main.ts                    # Application bootstrap
```

### Layers

* **Domain:** Core definitions, contracts, and business rules.
* **Application:** Use-cases coordinating ingestion and queries.
* **Infrastructure:** Concrete components (HTTP client, mappers, Mongo repository, batching).
* **Interfaces:** API controllers, data transformations, validation.

---

## ⚙️ Key Capabilities

### Data Ingestion

* Streams JSON from remote sources via HTTP (S3 endpoints).
* Processes large files without loading entire content into memory.
* Uses `batchStream` and bulk upsert to efficiently persist data.
* Supports multiple sources with separate mappers and registration.

### Unified Data Model

* A single `UnifiedData` entity captures common fields, plus `raw` for extras.
* Mongo schema supports indexes on frequently filtered fields.
* Compound index `{ source, externalId }` ensures idempotency.
* Dynamic extensibility via the `raw` field for additional attributes.

### API & Filtering

* Endpoint: `GET /api/data`
* Filterable parameters:

  * `q` (text search), `source`, `city`, boolean `availability`, numeric `priceMin / priceMax`, `priceSegment`.
* Supports pagination, sorting, and combined filters.
* `GET /api/data/:id` returns single item, or `404` if not found.

---

## 🧩 How to Run

### Prerequisites

* Node.js (v20+)
* MongoDB (local or remote)
* (Optional) Docker for Mongo

### Setup

```bash
git clone https://github.com/rafaelsmenezes/buenro-tech-assessment.git
cd buenro-tech-assessment
npm install
```

Create `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/buenro
PORT=3000
SOURCE1_URL=<your source1 JSON URL>
SOURCE2_URL=<your source2 JSON URL>
INGESTION_CRON=0 8 * * *
```

### Run

```bash
npm run start:dev
```

To ingest data:

```
POST /api/admin/ingest
```

---

## 🔍 Example Query

```
GET http://localhost:3000/api/data?q=Lisbon&source=source1&priceMin=100
```

Sample response:

```json
{
  "items": [
    {
      "source": "source1",
      "externalId": "123456",
      "name": "Ocean View Apartment",
      "city": "Lisbon",
      "pricePerNight": 320,
      "availability": true,
      "raw": { /* original record */ }
    }
  ],
  "meta": {
    "total": 1,
    "limit": 25,
    "skip": 0
  }
}
```

---

## 🚀 Extending to New Sources

To support an additional JSON source:

1. Create a new mapper in `infrastructure/ingestion/mappers` (e.g. `Source3Mapper`) implementing `map(record: any): UnifiedData`.
2. Add its registration in `registerSources` (in `sources.config.ts`).
3. The ingestion pipeline will automatically process it with existing batching, streaming, and persistence logic.

No changes to core ingestion or API layers are required.

---

## 🧠 Design Decisions & Trade-offs

| Concern                | Approach Taken                                |
| ---------------------- | --------------------------------------------- |
| Large JSON handling    | Streaming + batching, avoiding memory bloat   |
| High-throughput writes | Bulk upserts in chunked operations            |
| Schema flexibility     | Unified schema + `raw` for optional extras    |
| Query flexibility      | Dynamic filter builder, regex support         |
| Performance            | Indexed fields, lean queries, bulk writes     |
| Extensibility          | Mapper + registration pattern for new sources |

---

## ✔️ Readiness Assessment

This solution satisfies all required criteria of the technical challenge:

* Architecture is modular and extensible.
* Data model is unified and index-aware.
* Filtering logic is comprehensive (text, numeric, boolean).
* Performance and memory usage are carefully considered.
* Adding a new source is trivial via mapper + registration.

Future improvements include ingestion parallelism, structured logging, and dynamic filter builder for new raw fields.

---

## 📎 Author & Links

**Rafael Menezes**
GitHub: [https://github.com/rafaelsmenezes](https://github.com/rafaelsmenezes)
LinkedIn: [https://www.linkedin.com/in/rafaelsilvamenezes](https://www.linkedin.com/in/rafaelsilvamenezes)

---
