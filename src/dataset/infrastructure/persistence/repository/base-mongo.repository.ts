import { Model, FilterQuery, UpdateQuery, ClientSession } from 'mongoose';

export class BaseMongoRepository<T> {
  protected static readonly BULK_CHUNK_SIZE = 1000;

  constructor(protected readonly model: Model<T>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean<T>().exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).lean<T>().exec();
  }

  async findMany(
    filter: FilterQuery<T>,
    options?: { limit?: number; skip?: number; sort?: Record<string, 1 | -1> },
  ): Promise<T[]> {
    const limit = Math.min(options?.limit ?? 100, 1000);
    const skip = options?.skip ?? 0;
    const sort = options?.sort ?? { createdAt: -1 };

    return this.model
      .find(filter)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .lean<T[]>()
      .exec();
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async bulkUpsert(
    docs: Partial<T>[],
    keySelector: (doc: Partial<T>) => FilterQuery<T>,
    session?: ClientSession,
  ): Promise<void> {
    if (!docs.length) return;

    for (let i = 0; i < docs.length; i += BaseMongoRepository.BULK_CHUNK_SIZE) {
      const chunk = docs.slice(i, i + BaseMongoRepository.BULK_CHUNK_SIZE);

      const ops = chunk.map((doc) => ({
        updateOne: {
          filter: keySelector(doc),
          update: { $set: doc as UpdateQuery<T> },
          upsert: true,
        },
      }));

      await this.model.bulkWrite(ops, { ordered: false, session });
    }
  }
}
