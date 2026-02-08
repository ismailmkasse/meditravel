import type { Country } from '@/data/countries';

export type PriceKind = 'EXACT' | 'ESTIMATED';
export type PriceConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type PriceSource = 'PROVIDER' | 'API' | 'HISTORICAL' | 'ESTIMATE';

export type PriceResult = {
  kind: PriceKind;
  min: number;
  max: number;
  currencyCode: string; // We keep USD for demo; UI can show local currency separately.
  confidence: PriceConfidence;
  sources: PriceSource[];
  lastUpdatedISO: string;
  note: string;
};

export type PricingContext = {
  nowISO?: string;
  // Optional: featured country avg signals (your internal dataset)
  featuredAvgByCountryName?: Record<string, number | undefined>;
};

/**
 * This service is intentionally:
 * - Offline, deterministic, and legal
 * - No scraping
 * - Uses platform data (providers/prices) + simple estimation fallbacks
 */
export function getProcedureBaseUSD(procedure: string): number {
  const key = procedure.toLowerCase();
  if (key.includes('hair')) return 2000;
  if (key.includes('rhino')) return 3200;
  if (key.includes('dental')) return 1200;
  if (key.includes('ivf')) return 5200;
  if (key.includes('gastric') || key.includes('bari')) return 4500;
  return 2500;
}

export function getHotelBaseNightUSD(stars: number): number {
  if (stars >= 5) return 180;
  if (stars === 4) return 120;
  return 80;
}

function isoNow(ctx?: PricingContext) {
  return ctx?.nowISO ?? new Date().toISOString();
}

/**
 * Returns an EXACT result if we have platform/provider data for that country.
 * Otherwise returns an ESTIMATED range + LOW confidence.
 */
export function procedurePriceForCountry(params: {
  procedure: string;
  country: Country;
  providerPricesUSD?: number[]; // e.g., extracted from clinics in that country
  ctx?: PricingContext;
}): PriceResult {
  const { procedure, country, providerPricesUSD, ctx } = params;

  if (providerPricesUSD && providerPricesUSD.length > 0) {
    const sorted = [...providerPricesUSD].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[Math.max(0, Math.floor(sorted.length * 0.8))];
    return {
      kind: 'EXACT',
      min,
      max: Math.max(min, max),
      currencyCode: 'USD',
      confidence: 'HIGH',
      sources: ['PROVIDER'],
      lastUpdatedISO: isoNow(ctx),
      note: 'Exact price range based on verified provider listings on the platform.',
    };
  }

  // Estimation: base by procedure + a lightweight multiplier signal (featuredAvg if provided)
  const base = getProcedureBaseUSD(procedure);

  // If the platform has a featured average signal for that country, use it as a weak calibration
  const featuredAvg = ctx?.featuredAvgByCountryName?.[country.name];
  const center = featuredAvg && featuredAvg > 0 ? featuredAvg : base;

  // Range width depends on procedure complexity
  const spread = Math.max(250, Math.round(center * 0.18));
  return {
    kind: 'ESTIMATED',
    min: Math.max(200, center - spread),
    max: center + spread,
    currencyCode: 'USD',
    confidence: featuredAvg ? 'MEDIUM' : 'LOW',
    sources: featuredAvg ? ['HISTORICAL', 'ESTIMATE'] : ['ESTIMATE'],
    lastUpdatedISO: isoNow(ctx),
    note: featuredAvg
      ? 'Estimated range based on platform averages for this destination. Final price requires clinic quotation.'
      : 'Estimated range based on general market baselines. Final price requires clinic quotation.',
  };
}

/**
 * Hotel nightly price for a country: exact if provider listings provided, else estimate.
 */
export function hotelNightPriceForCountry(params: {
  stars: number;
  country: Country;
  providerNightPricesUSD?: number[];
  ctx?: PricingContext;
}): PriceResult {
  const { stars, providerNightPricesUSD, ctx } = params;

  if (providerNightPricesUSD && providerNightPricesUSD.length > 0) {
    const sorted = [...providerNightPricesUSD].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[Math.max(0, Math.floor(sorted.length * 0.8))];
    return {
      kind: 'EXACT',
      min,
      max: Math.max(min, max),
      currencyCode: 'USD',
      confidence: 'HIGH',
      sources: ['PROVIDER'],
      lastUpdatedISO: isoNow(ctx),
      note: 'Exact nightly range based on verified hotel listings on the platform.',
    };
  }

  const base = getHotelBaseNightUSD(stars);
  const spread = Math.max(15, Math.round(base * 0.25));
  return {
    kind: 'ESTIMATED',
    min: Math.max(25, base - spread),
    max: base + spread,
    currencyCode: 'USD',
    confidence: 'LOW',
    sources: ['ESTIMATE'],
    lastUpdatedISO: isoNow(ctx),
    note: 'Estimated nightly range based on typical market pricing. Availability & final price depend on dates and taxes.',
  };
}

export function formatPriceRangeUSD(res: PriceResult) {
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
  if (Math.round(res.min) === Math.round(res.max)) return fmt(res.min);
  return `${fmt(res.min)} – ${fmt(res.max)}`;
}
