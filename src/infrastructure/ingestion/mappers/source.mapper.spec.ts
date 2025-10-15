import { UnifiedData } from 'src/domain/entities/unified-data.entity';
import { Source1Mapper } from './source1.mapper';
import { Source2Mapper } from './source2.mapper';

describe('SourceMappers', () => {
  const record1 = {
    id: 1,
    name: 'Hotel A',
    address: { city: 'C', country: 'CT' },
    isAvailable: true,
    priceForNight: 100,
  };

  const record2 = {
    id: '2',
    city: 'City2',
    availability: false,
    pricePerNight: 200,
    priceSegment: 'luxury',
  };

  it('Source1Mapper maps correctly', () => {
    const mapper = new Source1Mapper();
    const result = mapper.map(record1);
    expect(result).toBeInstanceOf(UnifiedData);
    expect(result.city).toBe('C');
    expect(result.country).toBe('CT');
    expect(result.pricePerNight).toBe(100);
  });

  it('Source2Mapper maps correctly', () => {
    const mapper = new Source2Mapper();
    const result = mapper.map(record2);
    expect(result).toBeInstanceOf(UnifiedData);
    expect(result.city).toBe('City2');
    expect(result.availability).toBe(false);
    expect(result.priceSegment).toBe('luxury');
  });
});
