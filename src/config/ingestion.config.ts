import { registerAs } from '@nestjs/config';

export default registerAs('ingestion', () => ({
  batchSize: parseInt(process.env.BATCH_SIZE || '5000', 10),
  concurrency: parseInt(process.env.INGEST_CONCURRENCY || '1', 10),
  cronExpression: process.env.INGESTION_CRON || '0 * * * *',
}));
