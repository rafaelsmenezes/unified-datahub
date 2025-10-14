import { Injectable } from '@nestjs/common';
import { IngestionService } from '../../infrastructure/ingestion/ingestion.service';

@Injectable()
export class IngestionUseCase {
  constructor(private readonly ingestionService: IngestionService) {}

  async execute(): Promise<void> {
    await this.ingestionService.ingestAll();
  }
}
