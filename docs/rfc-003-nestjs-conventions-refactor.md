# RFC-003: Refatoração para Convenções NestJS

**Data:** 24 de Outubro de 2025  
**Autor:** Rafael Silva Menezes  
**Status:** Implementado  
**Branch:** `refactor/nestjs-conventions`

---

## 📋 Contexto

Durante a evolução do projeto, identificamos oportunidades de melhorar a aderência às **convenções e padrões idiomáticos do NestJS**.

Este RFC documenta a refatoração completa do projeto para alinhar com as melhores práticas do framework.

---

## 🎯 Objetivos da Refatoração

1. **Dependency Injection 100% via NestJS** - Eliminar instanciações manuais
2. **Module Organization** - AppModule minimalista, lógica em feature modules
3. **Configuration Management** - ConfigModule com registerAs pattern
4. **Native Features** - Usar soluções nativas do NestJS (Schedule, Pipes, etc)
5. **Clean Controllers** - Lógica de transformação em Pipes/Interceptors
6. **Type Safety** - Symbols ao invés de strings para injection tokens

---

## 🔄 Principais Mudanças

### 1. **DatabaseModule** - Configuração Assíncrona

**Antes:**
```typescript
// app.module.ts
MongooseModule.forRoot(String(process.env.MONGO_URI))
```

**Depois:**
```typescript
// infrastructure/database/database.module.ts
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): MongooseModuleOptions => ({
        uri: configService.get<string>('database.uri') as string,
      }),
    }),
  ],
})
export class DatabaseModule {}

// app.module.ts
@Module({
  imports: [DatabaseModule, ...],
})
```

**Benefícios:**
- ✅ Encapsulamento da configuração do banco
- ✅ Testável e mockável
- ✅ Usa ConfigService ao invés de process.env direto
- ✅ Type-safe

---

### 2. **SourcesModule** - Dependency Injection de Sources

**Antes:**
```typescript
// sources.config.ts (função manual)
export function registerSources(
  ingestionService: IIngestionService,
  configService: ConfigService,
) {
  ingestionService.registerSource({
    name: 'source1',
    url: getRequiredEnv('SOURCE1_URL', configService),
    mapper: new Source1Mapper(), // ❌ Instanciação manual
  });
}

// app.module.ts
export class AppModule implements OnModuleInit {
  onModuleInit() {
    registerSources(this.ingestionService, this.configService); // ❌
  }
}
```

**Depois:**
```typescript
// infrastructure/sources/sources.module.ts
@Module({
  imports: [ConfigModule],
  providers: [
    Source1Mapper, // ✅ Injectable
    Source2Mapper, // ✅ Injectable
    {
      provide: INGESTION_SOURCES_TOKEN,
      useFactory: (
        source1Mapper: Source1Mapper,
        source2Mapper: Source2Mapper,
        configService: ConfigService,
      ): IngestionSource[] => {
        return [
          {
            name: 'source1',
            url: configService.get<string>('sources.source1.url'),
            mapper: source1Mapper, // ✅ Injetado
          },
          {
            name: 'source2',
            url: configService.get<string>('sources.source2.url'),
            mapper: source2Mapper, // ✅ Injetado
          },
        ];
      },
      inject: [Source1Mapper, Source2Mapper, ConfigService],
    },
  ],
  exports: [INGESTION_SOURCES_TOKEN],
})
export class SourcesModule {}

// Mappers agora são @Injectable()
@Injectable()
export class Source1Mapper implements SourceMapper { ... }
```

**Benefícios:**
- ✅ Mappers testáveis isoladamente
- ✅ Sources injetadas via DI
- ✅ Sem lógica no AppModule
- ✅ Facilita adicionar novos sources
- ✅ Token exportável e reutilizável

---

### 3. **IngestionScheduler** - @Cron Decorator

**Antes:**
```typescript
import { CronJob } from 'cron'; // ❌ Biblioteca externa

@Injectable()
export class IngestionScheduler implements OnModuleInit {
  onModuleInit() {
    const cronExpression = this.configService.get('INGESTION_CRON') || '0 * * * *';
    
    const job = new CronJob(cronExpression, async () => { // ❌ Manual
      await this.ingestionService.ingestAll();
    });
    
    job.start(); // ❌ Manual
  }
}
```

**Depois:**
```typescript
import { Cron } from '@nestjs/schedule'; // ✅ Native NestJS

@Injectable()
export class IngestionScheduler {
  constructor(private readonly ingestionUseCase: IngestionUseCase) {}

  @Cron('0 * * * *') // ✅ Decorator nativo
  async handleScheduledIngestion() {
    this.logger.log('Starting scheduled ingestion...');
    await this.ingestionUseCase.execute();
  }
}

// No módulo
@Module({
  imports: [ScheduleModule.forRoot()], // ✅ Habilita scheduling
  providers: [IngestionScheduler],
})
```

**Benefícios:**
- ✅ Usa feature nativa do NestJS
- ✅ Código mais declarativo
- ✅ Testável (decorator pode ser ignorado em testes)
- ✅ Menos dependências externas

---

### 4. **QueryDataTransformPipe** - Controllers Limpos

**Antes:**
```typescript
@Controller('data')
export class DataController {
  @Get()
  async find(@Query() query: QueryDataDto, @Query() rawQuery: any) { // ❌
    const adapted = this.adaptQuery(query, rawQuery); // ❌ Lógica no controller
    return this.queryDataUseCase.execute(adapted);
  }

  private adaptQuery(query: QueryDataDto, rawQuery: any): QueryDataDto {
    // ... lógica complexa de transformação
  }
}
```

**Depois:**
```typescript
// interfaces/rest/pipes/query-data-transform.pipe.ts
@Injectable()
export class QueryDataTransformPipe implements PipeTransform {
  transform(value: any): QueryDataDto {
    const adapted: QueryDataDto = { ...value };
    
    if (value?.pageSize && !value?.page) {
      adapted.limit = Number(value.pageSize);
    }
    
    if (value?.page) {
      const page = Number(value.page) || 0;
      const pageSize = Number(value.pageSize) || adapted.limit || 100;
      adapted.limit = pageSize;
      adapted.skip = Math.max(0, page * pageSize);
    }
    
    return adapted;
  }
}

// Controller (limpo!)
@Controller('data')
export class DataController {
  @Get()
  async find(@Query(QueryDataTransformPipe) query: QueryDataDto) { // ✅ Pipe faz transformação
    return this.queryDataUseCase.execute(query);
  }
}
```

**Benefícios:**
- ✅ Controller com single responsibility
- ✅ Pipe reutilizável
- ✅ Testável isoladamente
- ✅ Segue padrão NestJS

---

### 5. **AppModule Minimalista**

**Antes:**
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(String(process.env.MONGO_URI)), // ❌
    PersistenceModule,
    IngestionModule,
    InterfacesModule,
  ],
  providers: [
    ConfigService,
    IngestionUseCase, // ❌ Use cases no AppModule
    QueryDataUseCase,
    GetDataByIdUseCase,
  ],
})
export class AppModule implements OnModuleInit { // ❌ Lógica de negócio
  onModuleInit() {
    registerSources(this.ingestionService, this.configService);
  }
}
```

**Depois:**
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, sourcesConfig, ingestionConfig], // ✅ Config files
    }),
    DatabaseModule, // ✅ Módulo dedicado
    IngestionModule,
    InterfacesModule,
  ],
})
export class AppModule {} // ✅ Sem lógica, apenas composição
```

**Benefícios:**
- ✅ AppModule como orquestrador
- ✅ Sem lógica de negócio
- ✅ Configurações centralizadas
- ✅ Mais fácil de entender

---

### 6. **Configuration Files Pattern**

**Antes:**
```typescript
process.env.MONGO_URI // ❌ Direto no código
process.env.SOURCE1_URL
```

**Depois:**
```typescript
// config/database.config.ts
export default registerAs('database', () => ({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/buenro',
}));

// config/sources.config.ts
export default registerAs('sources', () => ({
  source1: {
    name: 'source1',
    url: process.env.SOURCE1_URL,
  },
  source2: {
    name: 'source2',
    url: process.env.SOURCE2_URL,
  },
}));

// config/ingestion.config.ts
export default registerAs('ingestion', () => ({
  batchSize: parseInt(process.env.BATCH_SIZE || '5000', 10),
  cronExpression: process.env.INGESTION_CRON || '0 * * * *',
}));

// Uso
configService.get<string>('database.uri')
configService.get<number>('ingestion.batchSize')
```

**Benefícios:**
- ✅ Configurações tipadas e centralizadas
- ✅ Fácil de testar
- ✅ Namespace prevent collisions
- ✅ Default values em um só lugar

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Instanciação Manual** | `new Source1Mapper()` | `@Injectable()` + DI |
| **Source Registration** | `AppModule.onModuleInit()` | `SourcesModule` factory |
| **Scheduler** | `cron` library manual | `@Cron` decorator |
| **Controller Logic** | Método privado | `Pipe` dedicado |
| **Config** | `process.env` direto | `ConfigModule.registerAs()` |
| **AppModule** | 40 linhas + lógica | 15 linhas, apenas imports |
| **Database Config** | Inline no AppModule | `DatabaseModule` dedicado |
| **Tokens** | Strings | Symbols |

---

## ✅ Checklist de Convenções NestJS

- [x] Dependency Injection completo (sem `new`)
- [x] Modules com single responsibility
- [x] ConfigModule com `registerAs` pattern
- [x] Dynamic modules com `forRoot/forRootAsync`
- [x] Decorators nativos (`@Cron`, `@Injectable`)
- [x] Pipes para transformação
- [x] AppModule minimalista
- [x] Feature modules exportando tokens
- [x] Symbols ao invés de strings
- [x] ScheduleModule do NestJS

---

## 🧪 Impacto nos Testes

**Testes Atualizados:**
- `ingestion.service.spec.ts` - Agora injeta sources via `INGESTION_SOURCES_TOKEN`

**Todos os testes continuam passando** ✅

---

## 📚 Referências

1. [NestJS Modules](https://docs.nestjs.com/modules)
2. [NestJS Dependency Injection](https://docs.nestjs.com/fundamentals/custom-providers)
3. [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
4. [NestJS Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)
5. [NestJS Pipes](https://docs.nestjs.com/pipes)

---

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Rodar testes
npm test

# Rodar em dev
npm run start:dev
```

---

## 🎯 Conclusão

Esta refatoração transforma o projeto de uma implementação tecnicamente correta de **Clean Architecture** para uma implementação que **combina Clean Architecture com as convenções idiomáticas do NestJS**.

**Principais aprendizados:**
1. NestJS é opinionated - tem uma forma específica de fazer as coisas
2. Use features nativas quando disponíveis
3. DI é central - tudo deve ser injetável
4. Modules devem ter responsabilidades claras
5. AppModule é apenas orquestrador

**Resultado:** Código mais NestJS-idiomático, maintainable e alinhado com expectativas de empresas que usam o framework.

---

**Autor:** Rafael Silva Menezes  
**GitHub:** [@rafaelsmenezes](https://github.com/rafaelsmenezes)
