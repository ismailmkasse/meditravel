import type { Country } from '@/data/countries';

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function scoreMatch(field: string, q: string) {
  if (!q) return 0;
  if (field === q) return 100;
  if (field.startsWith(q)) return 70;
  const idx = field.indexOf(q);
  if (idx >= 0) return 40 - Math.min(20, idx);
  return 0;
}

/**
 * Strong search across:
 * - country name
 * - ISO alpha-2 code
 * - currency code / name / symbol
 *
 * Deterministic and fully offline.
 */
export function searchCountries(all: Country[], query: string, limit = 60): Country[] {
  const q = norm(query);
  if (!q) return all.slice(0, limit);

  const scored = all
    .map((c) => {
      const fields = [norm(c.name), norm(c.id), norm(c.currencyCode), norm(c.currencyName), norm(c.currencySymbol)];
      let best = 0;
      for (const f of fields) best = Math.max(best, scoreMatch(f, q));

      // Bonus: token match on multi-word names
      const tokens = norm(c.name).split(/\s+/);
      if (tokens.some((t) => t === q)) best = Math.max(best, 80);

      return { c, score: best };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => (b.score - a.score) || a.c.name.localeCompare(b.c.name))
    .slice(0, limit)
    .map((x) => x.c);

  return scored;
}

export function formatCountryCurrency(c: Country) {
  return `${c.currencySymbol} ${c.currencyCode} • ${c.currencyName}`;
}
