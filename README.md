# 🔄 UnifiedDataHub

> Enterprise-grade data ingestion and unified query platform built with NestJS, TypeScript, and MongoDB

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

**UnifiedDataHub** is a scalable, modular platform for ingesting data from multiple heterogeneous sources, transforming it into a unified schema, and exposing it through a flexible REST API.

**Use Cases:**
* 🏢 Enterprise Data Integration
* 📊 Data Aggregation Platforms
* 🔄 ETL Pipelines (KB to GB scale)
* 🔍 Unified Search APIs
* 📈 Analytics & BI Platforms

## ✨ Key Features

* **Scalable Ingestion** - Stream-based processing for files 1KB to 1GB+
* **Flexible Data Model** - Unified schema with dynamic `raw` field
* **Powerful Query API** - Text search, range filters, pagination, sorting
* **Clean Architecture** - Modular design following NestJS conventions
* **Production Ready** - Comprehensive test coverage (86+ tests)

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/rafaelsmenezes/unified-datahub.git
cd unified-datahub
npm install

# Configure
cp .env.example .env
# Edit .env with your MongoDB URI and data source URLs

# Run
npm run start:dev

# API docs at http://localhost:3000/api/docs
```

## 📖 API Examples

**Query data:**
```http
GET /api/data?q=search&city=London&priceMin=100&priceMax=500
```

**Get by ID:**
```http
GET /api/data/:id
```

**Trigger ingestion:**
```http
POST /api/admin/ingest
```

## 🧪 Testing

```bash
npm test              # All tests
npm run test:cov      # With coverage
npm run test:e2e      # E2E tests
```

## 🏗️ Architecture

Organized by feature modules (vertical slices):

```
src/
├── ingestion/        # Data ingestion module
├── dataset/          # Query & retrieval module
└── shared/           # Cross-cutting concerns
```

## 🛠️ Tech Stack

* **NestJS** 11.x - Progressive Node.js framework
* **TypeScript** 5.7 - Type-safe development
* **MongoDB** 8.x - Document database
* **Mongoose** - ODM for MongoDB
* **stream-json** - Memory-efficient JSON streaming
* **Jest** - Testing framework

## 📊 Performance

* Stream-based processing for constant memory usage
* MongoDB indexes on frequently queried fields
* Batch upserts for efficient bulk operations
* Configurable batch size for tuning

## 🔧 Adding a New Data Source

1. Create mapper in `src/ingestion/infrastructure/mappers/`
2. Register in `src/shared/config/sources.config.ts`
3. Add to SourcesModule factory

No changes to core logic needed! ✨

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👨‍💻 Author

**Rafael Silva Menezes**
* GitHub: [@rafaelsmenezes](https://github.com/rafaelsmenezes)
* LinkedIn: [rafaelsilvamenezes](https://www.linkedin.com/in/rafaelsilvamenezes)

---

⭐ **If you find this project useful, please give it a star!**
