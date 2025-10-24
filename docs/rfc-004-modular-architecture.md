# RFC-004: Modular Architecture - Vertical Slice Organization

**Date:** October 24, 2025  
**Author:** Rafael Silva Menezes  
**Status:** Implemented  
**Branch:** `refactor/modular-architecture`

---

## 📋 Context

Currently, the project is organized by **technical layers** (horizontal):

```text
src/
├── domain/           # ALL entities
├── application/      # ALL use cases
├── infrastructure/   # ALL implementations
└── interfaces/       # ALL controllers
```

This organization makes navigation and scalability difficult as the project grows.

---

## 🎯 Objective

Reorganize the code into **functional modules** (vertical slices), following NestJS conventions and Domain-Driven Design principles.

```text
src/
├── ingestion/        # Ingestion module
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── interfaces/
│
├── dataset/          # Query module
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── interfaces/
│
└── shared/           # Shared code
    ├── infrastructure/
    └── config/
```

---

## ✅ Benefits

### High Cohesion

- All code related to "ingestion" stays together
- No need to navigate between 4 different folders

### Bounded Contexts (DDD)

- Each module represents a bounded context
- Ingestion and Dataset have distinct responsibilities

### Scalability

- Easier to navigate in large projects
- Each module can evolve independently

### Microservices-Ready

- If you need to break into services, it's already organized
- Natural migration to distributed architecture

### NestJS Convention

- It's the recommended way by the framework
- Feature-based organization

---

## 🏗️ Proposed Structure

### 1. Ingestion Module (Data Ingestion)

**Responsibility:** Fetch data from external sources and persist

```text
src/ingestion/
├── domain/
│   ├── entities/
│   │   └── unified-data.entity.ts
│   └── interfaces/
│       ├── ingestion.service.interface.ts
│       ├── batch-saver.interface.ts
│       └── stream-generator.interface.ts
│
├── application/
│   └── use-cases/
│       └── ingestion.usecase.ts
│
├── infrastructure/
│   ├── services/
│   │   ├── ingestion.service.ts
│   │   ├── batch-saver.service.ts
│   │   └── stream-generator.service.ts
│   ├── mappers/
│   │   ├── source1.mapper.ts
│   │   └── source2.mapper.ts
│   └── scheduler/
│       └── ingestion.scheduler.ts
│
├── interfaces/
│   └── rest/
│       └── admin.controller.ts
│
└── ingestion.module.ts
```

### 2. Dataset Module (Data Query)

**Responsibility:** Query and return stored data

```text
src/dataset/
├── domain/
│   ├── entities/
│   │   └── unified-data.entity.ts  (or reuse from ingestion)
│   └── repositories/
│       └── unified-data.repository.interface.ts
│
├── application/
│   └── use-cases/
│       ├── query-data.usecase.ts
│       ├── get-data-by-id.usecase.ts
│       └── utils/
│           └── filter-builder.ts
│
├── infrastructure/
│   └── persistence/
│       ├── models/
│       │   └── mongo-unified-data.schema.ts
│       └── repositories/
│           └── mongo-unified-data.repository.ts
│
├── interfaces/
│   └── rest/
│       ├── data.controller.ts
│       ├── dto/
│       └── pipes/
│
└── dataset.module.ts
```

### 3. Shared Module (Shared Code)

**Responsibility:** Common infrastructure and configuration

```text
src/shared/
├── infrastructure/
│   ├── http/
│   │   └── http-client.service.ts
│   ├── database/
│   │   └── database.module.ts
│   └── sources/
│       └── sources.module.ts
│
└── config/
    ├── database.config.ts
    ├── sources.config.ts
    └── ingestion.config.ts
```

---

## 📊 Comparison

| Aspect            | By Layers (Before)       | By Modules (After)              |
| ----------------- | ------------------------ | ------------------------------- |
| **Navigation**    | Difficult (4 folders)    | Easy (everything together)      |
| **Cohesion**      | Low                      | High                            |
| **Scalability**   | Makes it difficult       | Facilitates                     |
| **Microservices** | Hard to separate         | Easy to separate                |
| **NestJS**        | Not conventional         | Conventional                    |
| **DDD**           | Doesn't support well     | Supports bounded contexts       |

---

## 🔄 Migration Plan

### Phase 1: Create module structure

1. Create `src/ingestion/`
2. Create `src/dataset/`
3. Create `src/shared/`

### Phase 2: Move files

**Ingestion:**

- `domain/entities/unified-data.entity.ts` → `ingestion/domain/entities/`
- `domain/ingestion/*` → `ingestion/domain/interfaces/`
- `application/use-cases/ingestion.usecase.ts` → `ingestion/application/use-cases/`
- `infrastructure/ingestion/*` → `ingestion/infrastructure/services/`
- `infrastructure/scheduler/*` → `ingestion/infrastructure/scheduler/`
- `interfaces/rest/admin.controller.ts` → `ingestion/interfaces/rest/`

**Dataset:**

- `domain/repositories/*` → `dataset/domain/repositories/`
- `application/use-cases/query-data.usecase.ts` → `dataset/application/use-cases/`
- `application/use-cases/get-data-by-id.usecase.ts` → `dataset/application/use-cases/`
- `infrastructure/persistence/*` → `dataset/infrastructure/persistence/`
- `interfaces/rest/data.controller.ts` → `dataset/interfaces/rest/`

**Shared:**

- `config/*` → `shared/config/`
- `infrastructure/http/*` → `shared/infrastructure/http/`
- `infrastructure/database/*` → `shared/infrastructure/database/`
- `infrastructure/sources/*` → `shared/infrastructure/sources/`

### Phase 3: Update imports

1. Configure path aliases in `tsconfig.json`
2. Update all imports
3. Run tests to ensure nothing broke

### Phase 4: Update AppModule

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, sourcesConfig, ingestionConfig],
    }),
    SharedModule,      // Database, HTTP, Sources
    IngestionModule,   // Data ingestion
    DatasetModule,     // Data querying
  ],
})
export class AppModule {}
```

---

## 🧪 Quality Assurance

- ✅ All tests must continue passing
- ✅ No broken functionality
- ✅ Coverage maintained or improved
- ✅ Linting without errors

---

## 📚 References

1. [NestJS Module Organization](https://docs.nestjs.com/modules)
2. [Domain-Driven Design - Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html)
3. [Vertical Slice Architecture](https://jimmybogard.com/vertical-slice-architecture/)

---

## 🎯 Expected Result

Code organized by **functional contexts** instead of **technical layers**, facilitating:

- Navigation and maintenance
- Project scalability
- Decomposition into microservices
- Onboarding of new developers
- Alignment with NestJS and DDD conventions

---

**Author:** Rafael Silva Menezes  
**GitHub:** [@rafaelsmenezes](https://github.com/rafaelsmenezes)
