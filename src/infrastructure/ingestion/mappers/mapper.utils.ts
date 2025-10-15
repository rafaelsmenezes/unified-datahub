export function extractExternalId(
  rec: Record<string, unknown>,
  source: string,
): string {
  if (typeof rec.id === 'string' || typeof rec.id === 'number')
    return String(rec.id);

  return `missing-${source}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function asString(
  rec: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = rec[key];
  return typeof v === 'string' ? v : undefined;
}

export function asNumber(
  rec: Record<string, unknown>,
  key: string,
): number | undefined {
  const v = rec[key];
  if (v == null) return undefined;
  const num = Number(v as any);
  return Number.isFinite(num) ? num : undefined;
}

export function asBoolean(
  rec: Record<string, unknown>,
  key: string,
): boolean | undefined {
  const v = rec[key];
  return typeof v === 'boolean' ? v : undefined;
}

export function fromAddress(rec: Record<string, unknown>) {
  const addr =
    rec.address && typeof rec.address === 'object'
      ? (rec.address as Record<string, unknown>)
      : undefined;
  return {
    city: addr ? asString(addr, 'city') : undefined,
    country: addr ? asString(addr, 'country') : undefined,
  };
}
