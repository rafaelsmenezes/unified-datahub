import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoUnifiedDataRepository } from './repository/mongo-unified-data.repository';
import {
  MongoUnifiedData,
  MongoUnifiedDataSchema,
} from './models/mongo-unified-data.schema';
import { IUnifiedDataRepositoryToken } from 'src/domain/repositories/unified-data.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MongoUnifiedData.name, schema: MongoUnifiedDataSchema },
    ]),
  ],
  providers: [
    {
      provide: IUnifiedDataRepositoryToken,
      useClass: MongoUnifiedDataRepository,
    },
  ],
  exports: [IUnifiedDataRepositoryToken],
})
export class PersistenceModule {}
