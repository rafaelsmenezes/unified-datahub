import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { IHttpClientService } from 'src/domain/http/http-client.interface';
import { Readable } from 'stream';

@Injectable()
export class HttpClientService implements IHttpClientService {
  async getStream(url: string, config?: AxiosRequestConfig): Promise<Readable> {
    const response = await axios.get<Readable>(url, {
      ...config,
      responseType: 'stream',
    });
    return response.data as unknown as Readable;
  }

  async get<T>(url: string): Promise<T> {
    const response = await axios.get<T>(url);
    return response.data;
  }
}
