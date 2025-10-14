import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  imports: [StorageModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
