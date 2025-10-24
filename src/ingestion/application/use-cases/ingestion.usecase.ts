import { Inject, Injectable } from '@nestjs/common';
import {
  IIngestionService,
  IIngestionServiceToken,
} from 'src/ingestion/domain/interfaces/ingestion.service.interface';

@Injectable()
export class IngestionUseCase {
  constructor(
    @Inject(IIngestionServiceToken)
    private readonly ingestionService: IIngestionService,
  ) {}

  async execute(): Promise<void> {
    await this.ingestionService.ingestAll();
  }
}
