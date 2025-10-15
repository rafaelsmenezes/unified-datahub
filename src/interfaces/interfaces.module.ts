import { Module } from '@nestjs/common';
import { ApiController } from './rest/api.controller';
import { AdminController } from './rest/admin.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [ApiController, AdminController],
})
export class InterfacesModule {}
