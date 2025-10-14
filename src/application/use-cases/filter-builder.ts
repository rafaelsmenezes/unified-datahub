import { QueryDataDto } from '../../interfaces/rest/dto/query-data.dto';

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
    if (query.city) {
      // Escape user input to prevent accidental regex injection / ReDoS
      const escaped = query.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filters.city = { $regex: escaped, $options: 'i' };
    }

    if (query.q) {
      filters.$or = [
        { name: { $regex: query.q, $options: 'i' } },
        { city: { $regex: query.q, $options: 'i' } },
        // Avoid running regex against nested raw object which is unsafe; search specific fields instead
        { raw: { $elemMatch: { $regex: query.q, $options: 'i' } } },
      ];
    }

    return filters;
  }
}
