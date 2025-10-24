# RFC-004: Modular Architecture - Vertical Slice Organization

**Data:** 24 de Outubro de 2025  
**Autor:** Rafael Silva Menezes  
**Status:** Em Implementação  
**Branch:** `refactor/modular-architecture`

---

## 📋 Contexto

Atualmente o projeto está organizado por **camadas técnicas** (horizontal):

```
src/
├── domain/           # TODAS as entidades
├── application/      # TODOS os use cases
├── infrastructure/   # TODAS as implementações
└── interfaces/       # TODOS os controllers
```

Esta organização dificulta navegação e escalabilidade à medida que o projeto cresce.

---

## 🎯 Objetivo

Reorganizar o código em **módulos funcionais** (vertical slices), seguindo convenções do NestJS e princípios de Domain-Driven Design.

```
src/
├── ingestion/        # Módulo de ingestão
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── interfaces/
│
├── dataset/          # Módulo de consulta
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── interfaces/
│
└── shared/           # Código compartilhado
    ├── infrastructure/
    └── config/
```

---

## ✅ Benefícios

### **Alta Coesão**
- Todo código relacionado a "ingestion" fica junto
- Não precisa navegar entre 4 pastas diferentes

### **Bounded Contexts (DDD)**
- Cada módulo representa um contexto delimitado
- Ingestion e Dataset têm responsabilidades distintas

### **Escalabilidade**
- Mais fácil navegar em projetos grandes
- Cada módulo pode evoluir independentemente

### **Microservices-Ready**
- Se precisar quebrar em serviços, já está organizado
- Migração natural para arquitetura distribuída

### **NestJS Convention**
- É a forma recomendada pelo framework
- Feature-based organization

---

## 🏗️ Estrutura Proposta

### **1. Ingestion Module** (Ingestão de Dados)

**Responsabilidade:** Buscar dados de fontes externas e persistir

```
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

### **2. Dataset Module** (Consulta de Dados)

**Responsabilidade:** Consultar e retornar dados armazenados

```
src/dataset/
├── domain/
│   ├── entities/
│   │   └── unified-data.entity.ts  (ou reusar de ingestion)
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

### **3. Shared Module** (Código Compartilhado)

**Responsabilidade:** Infraestrutura e configuração comum

```
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

## 📊 Comparação

| Aspecto | Por Camadas (Atual) | Por Módulos (Proposto) |
|---------|---------------------|------------------------|
| **Navegação** | Difícil (4 pastas) | Fácil (tudo junto) |
| **Coesão** | Baixa | Alta |
| **Escalabilidade** | Dificulta | Facilita |
| **Microservices** | Difícil separar | Fácil separar |
| **NestJS** | Não convencional | Convencional |
| **DDD** | Não suporta bem | Suporta bounded contexts |

---

## 🔄 Plano de Migração

### **Fase 1:** Criar estrutura de módulos
1. Criar `src/ingestion/`
2. Criar `src/dataset/`
3. Criar `src/shared/`

### **Fase 2:** Mover arquivos

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

### **Fase 3:** Atualizar imports
1. Configurar path aliases no `tsconfig.json`
2. Atualizar todos os imports
3. Rodar testes para garantir que nada quebrou

### **Fase 4:** Atualizar AppModule
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

## 🧪 Garantia de Qualidade

- ✅ Todos os testes devem continuar passando
- ✅ Nenhuma funcionalidade quebrada
- ✅ Coverage mantido ou melhorado
- ✅ Linting sem erros

---

## 📚 Referências

1. [NestJS Module Organization](https://docs.nestjs.com/modules)
2. [Domain-Driven Design - Bounded Contexts](https://martinfowler.com/bliki/BoundedContext.html)
3. [Vertical Slice Architecture](https://jimmybogard.com/vertical-slice-architecture/)

---

## 🎯 Resultado Esperado

Código organizado por **contextos funcionais** ao invés de **camadas técnicas**, facilitando:
- Navegação e manutenção
- Escalabilidade do projeto
- Decomposição em microservices
- Onboarding de novos desenvolvedores
- Alinhamento com convenções NestJS e DDD

---

**Autor:** Rafael Silva Menezes  
**GitHub:** [@rafaelsmenezes](https://github.com/rafaelsmenezes)
