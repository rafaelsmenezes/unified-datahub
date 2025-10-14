@Injectable()
export class IngestionService {
  private readonly sources: IngestionSource[] = [];
  private readonly BATCH_SIZE = 5000;
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly httpClient: HttpClientService,
    private readonly ingestDataUseCase: IngestDataUseCase,
  ) {}

  registerSource(source: IngestionSource) {
    this.sources.push(source);
  }

  async ingestAll() {
    for (const source of this.sources) {
      await this.ingestSource(source);
    }
  }

  private async ingestSource({ name, url, mapper }: IngestionSource) {
    this.logger.log(`Starting ingestion for ${name}`);
    const stream = await this.httpClient.getStream(url);
    const jsonStream = StreamArray.withParser();
    const batch: UnifiedData[] = [];

    await new Promise<void>((resolve, reject) => {
      pipeline(stream, jsonStream, (err) => (err ? reject(err) : resolve()));

      jsonStream.on('data', ({ value }) => {
        batch.push(mapper.map(value));
        if (batch.length >= this.BATCH_SIZE) {
          this.ingestDataUseCase.execute(batch);
          batch.length = 0;
        }
      });

      jsonStream.on('end', async () => {
        if (batch.length > 0) await this.ingestDataUseCase.execute(batch);
        this.logger.log(`Finished ingestion for ${name}`);
        resolve();
      });

      jsonStream.on('error', (err) => reject(err));
    });
  }
}
