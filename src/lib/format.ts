const numberFormat = new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 2 });

/** Visual price label, e.g. `39 DH` (non-breaking space keeps the unit with the number). */
export function formatPrice(amount: number): string {
  return `${numberFormat.format(amount)} DH`;
}

/** Spoken equivalent for assistive technology, e.g. `39 dirhams`. */
export function formatPriceSpoken(amount: number): string {
  return `${numberFormat.format(amount)} dirham${amount > 1 ? "s" : ""}`;
}

/** Accent- and punctuation-insensitive text used by the menu search. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** True when every query token is found in the product's normalised text (or its compact form). */
export function matchesSearch(haystack: string, query: string): boolean {
  const tokens = normalizeSearchText(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;
  const compact = haystack.replace(/ /g, "");
  return tokens.every((token) => haystack.includes(token) || compact.includes(token));
}
