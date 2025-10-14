import { Injectable, NotFoundException } from '@nestjs/common';
import type { UnifiedDataRepositoryInterface } from '../../domain/repositories/unified-data.repository.interface';
import { UnifiedData } from '../../domain/entities/unified-data.entity';

@Injectable()
export class GetDataByIdUseCase {
  constructor(private readonly repository: UnifiedDataRepositoryInterface) {}

  async execute(id: string): Promise<UnifiedData> {
    const item = await this.repository.findOne({ externalId: id });
    if (!item) {
      throw new NotFoundException(`Data not found: ${id}`);
    }
    return item;
  }
}
