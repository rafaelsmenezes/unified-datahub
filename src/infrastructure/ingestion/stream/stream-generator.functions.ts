import * as StreamArray from 'stream-json/streamers/StreamArray';
import { Readable } from 'stream';
import { IHttpClientService } from '../../../domain/http/http-client.interface';
import { Logger } from '@nestjs/common';

export async function* fetchHttpStream(
  url: string,
  httpClient: IHttpClientService,
  logger: Logger,
): AsyncGenerator<unknown> {
  const responseStream: Readable = await httpClient.getStream(url);
  const jsonStream = StreamArray.withParser();
  responseStream.pipe(jsonStream);

  try {
    for await (const { value } of jsonStream) {
      yield value;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`HTTP/Stream error for ${url}: ${msg}`);
    throw err;
  }
}

export async function* mapStream<T>(
  input: AsyncIterable<unknown>,
  mapper: { map(record: unknown): T },
  logger: Logger,
): AsyncGenerator<T> {
  for await (const record of input) {
    try {
      const mapped = mapper.map(record);
      if (mapped) yield mapped;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Mapping failed for record: ${msg}`);
    }
  }
}

export async function* batchStream<T>(
  input: AsyncIterable<T>,
  batchSize: number,
): AsyncGenerator<T[]> {
  const batch: T[] = [];
  for await (const item of input) {
    batch.push(item);
    if (batch.length >= batchSize) {
      yield batch.splice(0, batchSize);
    }
  }
  if (batch.length > 0) yield batch.splice(0, batch.length);
}
