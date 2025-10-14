import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { Readable } from 'stream';

@Injectable()
export class HttpClientService {
  async getStream(url: string, config?: AxiosRequestConfig): Promise<Readable> {
    const response = await axios.get(url, {
      ...config,
      responseType: 'stream',
    });
    return response.data;
  }
}
