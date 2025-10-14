export class UnifiedData {
  constructor(
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
  ) {}
}
