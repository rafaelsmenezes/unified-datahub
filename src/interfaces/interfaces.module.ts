import { Module } from '@nestjs/common';
import { DataController } from './rest/data.controller';
import { AdminController } from './rest/admin.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [DataController, AdminController],
})
export class InterfacesModule {}
