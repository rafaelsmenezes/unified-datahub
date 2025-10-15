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
    const maxAttempts = 3;
    const baseDelay = 20;
    let lastErr: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await axios.get<T>(url);
        return response.data;
      } catch (err: unknown) {
        lastErr = err;
        if (attempt >= maxAttempts) throw lastErr;
        const delay = baseDelay * 2 ** (attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  }
}
