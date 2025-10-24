# RFC-003: NestJS Conventions Refactoring

**Date:** October 24, 2025  
**Author:** Rafael Silva Menezes  
**Status:** Implemented  
**Branch:** `refactor/nestjs-conventions`

---

## 📋 Context

During the project evolution, we identified opportunities to improve adherence to **NestJS conventions and idiomatic patterns**.

This RFC documents the complete refactoring of the project to align with framework best practices.

---

## 🎯 Refactoring Objectives

1. **100% Dependency Injection via NestJS** - Eliminate manual instantiations
2. **Module Organization** - Minimalist AppModule, logic in feature modules
3. **Configuration Management** - ConfigModule with registerAs pattern
4. **Native Features** - Use native NestJS solutions (Schedule, Pipes, etc)
5. **Clean Controllers** - Transformation logic in Pipes/Interceptors
6. **Type Safety** - Symbols instead of strings for injection tokens

---

## 🔄 Main Changes

### 1. **DatabaseModule** - Async Configuration

**Before:**
```typescript
// app.module.ts
MongooseModule.forRoot(String(process.env.MONGO_URI))
```

**After:**
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

**Benefits:**
- ✅ Database configuration encapsulation
- ✅ Testable and mockable
- ✅ Uses ConfigService instead of direct process.env
- ✅ Type-safe

---

### 2. **SourcesModule** - Dependency Injection of Sources

**Before:**
```typescript
// sources.config.ts (manual function)
export function registerSources(
  ingestionService: IIngestionService,
  configService: ConfigService,
) {
  ingestionService.registerSource({
    name: 'source1',
    url: getRequiredEnv('SOURCE1_URL', configService),
    mapper: new Source1Mapper(), // ❌ Manual instantiation
  });
}

// app.module.ts
export class AppModule implements OnModuleInit {
  onModuleInit() {
    registerSources(this.ingestionService, this.configService); // ❌
  }
}
```

**After:**
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
            mapper: source1Mapper, // ✅ Injected
          },
          {
            name: 'source2',
            url: configService.get<string>('sources.source2.url'),
            mapper: source2Mapper, // ✅ Injected
          },
        ];
      },
      inject: [Source1Mapper, Source2Mapper, ConfigService],
    },
  ],
  exports: [INGESTION_SOURCES_TOKEN],
})
export class SourcesModule {}

// Mappers are now @Injectable()
@Injectable()
export class Source1Mapper implements SourceMapper { ... }
```

**Benefits:**
- ✅ Mappers testable in isolation
- ✅ Sources injected via DI
- ✅ No logic in AppModule
- ✅ Easy to add new sources
- ✅ Token exportable and reusable

---

### 3. **IngestionScheduler** - @Cron Decorator

**Before:**
```typescript
import { CronJob } from 'cron'; // ❌ External library

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

**After:**
```typescript
import { Cron } from '@nestjs/schedule'; // ✅ Native NestJS

@Injectable()
export class IngestionScheduler {
  constructor(private readonly ingestionUseCase: IngestionUseCase) {}

  @Cron('0 * * * *') // ✅ Native decorator
  async handleScheduledIngestion() {
    this.logger.log('Starting scheduled ingestion...');
    await this.ingestionUseCase.execute();
  }
}

// In module
@Module({
  imports: [ScheduleModule.forRoot()], // ✅ Enable scheduling
  providers: [IngestionScheduler],
})
```

**Benefits:**
- ✅ Uses native NestJS feature
- ✅ More declarative code
- ✅ Testable (decorator can be ignored in tests)
- ✅ Fewer external dependencies

---

### 4. **QueryDataTransformPipe** - Clean Controllers

**Before:**
```typescript
@Controller('data')
export class DataController {
  @Get()
  async find(@Query() query: QueryDataDto, @Query() rawQuery: any) { // ❌
    const adapted = this.adaptQuery(query, rawQuery); // ❌ Logic in controller
    return this.queryDataUseCase.execute(adapted);
  }

  private adaptQuery(query: QueryDataDto, rawQuery: any): QueryDataDto {
    // ... complex transformation logic
  }
}
```

**After:**
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

// Controller (clean!)
@Controller('data')
export class DataController {
  @Get()
  async find(@Query(QueryDataTransformPipe) query: QueryDataDto) { // ✅ Pipe does transformation
    return this.queryDataUseCase.execute(query);
  }
}
```

**Benefits:**
- ✅ Controller with single responsibility
- ✅ Reusable pipe
- ✅ Testable in isolation
- ✅ Follows NestJS pattern

---

### 5. **Minimalist AppModule**

**Before:**
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
    IngestionUseCase, // ❌ Use cases in AppModule
    QueryDataUseCase,
    GetDataByIdUseCase,
  ],
})
export class AppModule implements OnModuleInit { // ❌ Business logic
  onModuleInit() {
    registerSources(this.ingestionService, this.configService);
  }
}
```

**After:**
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, sourcesConfig, ingestionConfig], // ✅ Config files
    }),
    DatabaseModule, // ✅ Dedicated module
    IngestionModule,
    InterfacesModule,
  ],
})
export class AppModule {} // ✅ No logic, just composition
```

**Benefits:**
- ✅ AppModule as orchestrator
- ✅ No business logic
- ✅ Centralized configurations
- ✅ Easier to understand

---

### 6. **Configuration Files Pattern**

**Before:**
```typescript
process.env.MONGO_URI // ❌ Direct in code
process.env.SOURCE1_URL
```

**After:**
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

// Usage
configService.get<string>('database.uri')
configService.get<number>('ingestion.batchSize')
```

**Benefits:**
- ✅ Typed and centralized configurations
- ✅ Easy to test
- ✅ Namespace prevents collisions
- ✅ Default values in one place

---

## 📊 Comparison: Before vs After

| Aspect | Before | After |
|---------|-------|--------|
| **Manual Instantiation** | `new Source1Mapper()` | `@Injectable()` + DI |
| **Source Registration** | `AppModule.onModuleInit()` | `SourcesModule` factory |
| **Scheduler** | `cron` library manual | `@Cron` decorator |
| **Controller Logic** | Private method | Dedicated `Pipe` |
| **Config** | Direct `process.env` | `ConfigModule.registerAs()` |
| **AppModule** | 40 lines + logic | 15 lines, imports only |
| **Database Config** | Inline in AppModule | Dedicated `DatabaseModule` |
| **Tokens** | Strings | Symbols |

---

## ✅ NestJS Conventions Checklist

- [x] Complete Dependency Injection (no `new`)
- [x] Modules with single responsibility
- [x] ConfigModule with `registerAs` pattern
- [x] Dynamic modules with `forRoot/forRootAsync`
- [x] Native decorators (`@Cron`, `@Injectable`)
- [x] Pipes for transformation
- [x] Minimalist AppModule
- [x] Feature modules exporting tokens
- [x] Symbols instead of strings
- [x] NestJS ScheduleModule

---

## 🧪 Impact on Tests

**Updated Tests:**
- `ingestion.service.spec.ts` - Now injects sources via `INGESTION_SOURCES_TOKEN`

**All tests continue passing** ✅

---

## 📚 References

1. [NestJS Modules](https://docs.nestjs.com/modules)
2. [NestJS Dependency Injection](https://docs.nestjs.com/fundamentals/custom-providers)
3. [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
4. [NestJS Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)
5. [NestJS Pipes](https://docs.nestjs.com/pipes)

---

## 🚀 How to Run

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run in dev
npm run start:dev
```

---

## 🎯 Conclusion

This refactoring transforms the project from a technically correct implementation of **Clean Architecture** to an implementation that **combines Clean Architecture with NestJS idiomatic conventions**.

**Key learnings:**
1. NestJS is opinionated - has a specific way of doing things
2. Use native features when available
3. DI is central - everything should be injectable
4. Modules should have clear responsibilities
5. AppModule is just an orchestrator

**Result:** More NestJS-idiomatic, maintainable code aligned with expectations of companies using the framework.

---

**Author:** Rafael Silva Menezes  
**GitHub:** [@rafaelsmenezes](https://github.com/rafaelsmenezes)
