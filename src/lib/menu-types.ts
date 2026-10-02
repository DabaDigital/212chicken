/** Serializable product shape passed to client components (only the fields the UI needs). */
export interface MenuItem {
  id: string;
  name: string;
  /** null when the source publishes no description — never invented. */
  description: string | null;
  /** Price in MAD. */
  price: number;
  /** Published "menu" supplement in MAD (contents unknown), or null. */
  menuUpgradePrice: number | null;
  /** Display category id (e.g. `wraps` for Royal 212 Wistor). */
  categoryId: string;
  categoryLabel: string;
  /** `scale` evens out photos with large transparent padding (see scripts/derive-assets.mjs). */
  image: { src: string; width: number; height: number; scale: number };
}

export interface SearchableMenuItem extends MenuItem {
  /** Accent-insensitive name + description + category label, precomputed on the server. */
  searchText: string;
}

export interface MenuCategory {
  id: string;
  label: string;
  count: number;
}

export interface MenuGroup extends MenuCategory {
  items: SearchableMenuItem[];
}

export interface HomeFilter extends MenuCategory {
  itemIds: string[];
}

export interface HomeSelection {
  /** `all` holds the curated mixed selection; other ids are display categories. */
  filters: HomeFilter[];
  items: Record<string, MenuItem>;
  totalProducts: number;
}
