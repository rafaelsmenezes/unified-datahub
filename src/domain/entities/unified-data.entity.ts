export class UnifiedData {
  constructor(
    public readonly id: string,
    public readonly source: string,
    public readonly externalId: string,
    public readonly name?: string,
    public readonly city?: string,
    public readonly country?: string,
    public readonly availability?: boolean,
    public readonly pricePerNight?: number,
    public readonly priceSegment?: string,
    public readonly raw?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    if (!source) throw new Error('UnifiedData must have a source');
    if (!externalId) throw new Error('UnifiedData must have an externalId');
  }

  static create(params: {
    source: string;
    externalId: string;
    name?: string;
    city?: string;
    country?: string;
    availability?: boolean;
    pricePerNight?: number;
    priceSegment?: string;
    raw?: Record<string, any>;
  }): UnifiedData {
    return new UnifiedData(
      '', //ID will be set by the repository
      params.source,
      params.externalId,
      params.name,
      params.city,
      params.country,
      params.availability,
      params.pricePerNight,
      params.priceSegment,
      params.raw,
    );
  }

  withId(newId: string): UnifiedData {
    return new UnifiedData(
      newId,
      this.source,
      this.externalId,
      this.name,
      this.city,
      this.country,
      this.availability,
      this.pricePerNight,
      this.priceSegment,
      this.raw,
      this.createdAt,
      this.updatedAt,
    );
  }
}
