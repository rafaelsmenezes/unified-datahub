import { QueryDataDto } from '../../../interfaces/rest/dto/query-data.dto';

export class FilterBuilder {
  static build(query: QueryDataDto) {
    const filters: Record<string, any> = {};

    if (query.source) filters.source = query.source;
    if (typeof query.availability === 'boolean') {
      filters.availability = query.availability;
    }

    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      const range: Record<string, number> = {};
      if (typeof query.priceMin === 'number') {
        range.$gte = query.priceMin;
      }
      if (typeof query.priceMax === 'number') {
        range.$lte = query.priceMax;
      }
      if (Object.keys(range).length > 0) {
        filters.pricePerNight = range;
      }
    }

    if (query.priceSegment) filters.priceSegment = query.priceSegment;

    if (query.city) {
      const escaped = String(query.city).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filters.city = { $regex: escaped, $options: 'i' };
    }

    if (query.q) {
      const q = String(query.q);
      filters.$or = [
        { name: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { 'raw.description': { $regex: q, $options: 'i' } },
        { 'raw.title': { $regex: q, $options: 'i' } },
      ];
    }

    return filters as Record<string, unknown>;
  }
}
