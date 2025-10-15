import { Module } from '@nestjs/common';
import { HttpClientService } from './http-client.service';
import { IHttpClientServiceToken } from '../../domain/http/http-client.interface';

@Module({
  providers: [
    {
      provide: IHttpClientServiceToken,
      useClass: HttpClientService,
    },
  ],
  exports: [IHttpClientServiceToken],
})
export class HttpModule {}
