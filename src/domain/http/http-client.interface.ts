import { Readable } from 'stream';

export interface IHttpClientService {
  getStream(url: string): Promise<Readable>;
  get<T>(url: string): Promise<T>;
}

export const IHttpClientServiceToken = Symbol('IHttpClientService');
