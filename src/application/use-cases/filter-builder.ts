import { QueryDataDto } from 'src/modules/api/dto/query-data.dto';

export class FilterBuilder {
  static build(query: QueryDataDto) {
    const filters: any = {};

    if (query.source) filters.source = query.source;
    if (typeof query.availability === 'boolean')
      filters.availability = query.availability;

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      filters.pricePerNight = {};
      if (query.priceMin !== undefined)
        filters.pricePerNight.$gte = query.priceMin;
      if (query.priceMax !== undefined)
        filters.pricePerNight.$lte = query.priceMax;
    }

    if (query.priceSegment) filters.priceSegment = query.priceSegment;
    if (query.city) filters.city = { $regex: query.city, $options: 'i' };

    if (query.q) {
      filters.$or = [
        { name: { $regex: query.q, $options: 'i' } },
        { city: { $regex: query.q, $options: 'i' } },
        { raw: { $regex: query.q, $options: 'i' } },
      ];
    }

    return filters;
  }
}
