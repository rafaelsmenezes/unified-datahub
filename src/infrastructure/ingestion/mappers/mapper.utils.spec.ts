import * as utils from './mapper.utils';

describe('mapper.utils', () => {
  describe('extractExternalId', () => {
    it('returns string id when present', () => {
      const rec: any = { id: 123 };
      expect(utils.extractExternalId(rec, 's')).toBe('123');
      expect(utils.extractExternalId({ id: 'abc' } as any, 's')).toBe('abc');
    });

    it('generates missing id when absent', () => {
      const out = utils.extractExternalId({}, 'mysource');
      expect(out.startsWith('missing-mysource-')).toBe(true);
    });
  });

  describe('asNumber/asBoolean/asString', () => {
    it('parses numbers and returns undefined for invalid', () => {
      const rec: any = { a: '10', b: 'x', c: 5 };
      expect(utils.asNumber(rec, 'a')).toBe(10);
      expect(utils.asNumber(rec, 'b')).toBeUndefined();
      expect(utils.asNumber(rec, 'c')).toBe(5);
    });

    it('parses booleans only when boolean type', () => {
      const rec: any = { t: true, f: 'true' };
      expect(utils.asBoolean(rec, 't')).toBe(true);
      expect(utils.asBoolean(rec, 'f')).toBeUndefined();
    });

    it('parses strings only when string type', () => {
      const rec: any = { s: 'ok', n: 1 };
      expect(utils.asString(rec, 's')).toBe('ok');
      expect(utils.asString(rec, 'n')).toBeUndefined();
    });
  });

  describe('fromAddress', () => {
    it('extracts city and country when present', () => {
      const rec: any = { address: { city: 'C', country: 'X' } };
      const res = utils.fromAddress(rec);
      expect(res.city).toBe('C');
      expect(res.country).toBe('X');
    });

    it('returns undefineds when address missing', () => {
      const res = utils.fromAddress({} as any);
      expect(res.city).toBeUndefined();
      expect(res.country).toBeUndefined();
    });
  });
});
