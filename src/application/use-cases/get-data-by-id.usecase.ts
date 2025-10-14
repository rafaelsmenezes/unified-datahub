import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { UnifiedData } from '../../domain/entities/unified-data.entity';
import {
  IUnifiedDataRepositoryInterface,
  IUnifiedDataRepositoryInterfaceToken,
} from '../../domain/repositories/unified-data.repository.interface';

@Injectable()
export class GetDataByIdUseCase {
  constructor(
    @Inject(IUnifiedDataRepositoryInterfaceToken)
    private readonly repository: IUnifiedDataRepositoryInterface,
  ) {}

  async execute(id: string): Promise<UnifiedData> {
    const item = await this.repository.findOne({ externalId: id });
    if (!item) {
      throw new NotFoundException(`Data not found: ${id}`);
    }
    return item;
  }
}
