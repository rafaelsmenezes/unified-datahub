import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnifiedData, UnifiedDataSchema } from './unified-data.schema';
import { StorageService } from './storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UnifiedData.name, schema: UnifiedDataSchema },
    ]),
  ],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
