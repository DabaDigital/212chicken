import "server-only";

/**
 * Raw, untouched records from the asset pack (ASSET_ROOT = 212-chicken-assets/212-chicken-assets).
 * The pack is the single source of truth: never copy or edit these files by hand.
 * Everything below is validated once at build time so a changed dataset fails loudly.
 */
import assetManifestJson from "@pack/data/asset-manifest.json";
import menuJson from "@pack/data/menu.json";
import websiteJson from "@pack/data/website.json";

export interface SourceCategory {
  id: string;
  label: string;
  source_url: string;
}

export interface SourceProduct {
  id: string;
  name: string;
  category_id: string;
  display_category_id: string;
  description_fr: string | null;
  price: number;
  currency: string;
  menu_upgrade_price: number | null;
  menu_upgrade_contents: string | null;
  image: string;
  image_alt_fr: string;
  image_size: { width: number; height: number };
  availability: unknown;
  allergens: unknown;
  calories: unknown;
  needs_review: string[];
}

export interface SourceMenu {
  currency: string;
  retrieved_on: string;
  status: string;
  categories: SourceCategory[];
  products: SourceProduct[];
}

export interface SourceWebsite {
  brand: { name: string; website: string; logo: string; instagram: string; locale: string; currency: string };
  proposed_copy: {
    hero_lines: string[];
    hero_description: string;
    primary_cta: string;
    secondary_cta: string;
    order_cta: string;
    menu_heading: string;
  };
  links: {
    menu: string;
    restaurant_search: string | null;
    ordering: string | null;
    phone: string | null;
    email: string | null;
  };
  restaurants: unknown[];
  reviews: unknown[];
  reels: unknown[];
  opening_hours: unknown;
}

export interface SourceAsset {
  path: string;
  width?: number;
  height?: number;
  alpha?: boolean;
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`[212 data] ${message}`);
}

const isString = (value: unknown): value is string => typeof value === "string" && value.length > 0;
const isNullableString = (value: unknown): value is string | null => value === null || typeof value === "string";
const isPrice = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

function validateMenu(raw: unknown): SourceMenu {
  const menu = raw as SourceMenu;
  invariant(menu && Array.isArray(menu.categories) && Array.isArray(menu.products), "menu.json must list categories and products");
  invariant(menu.currency === "MAD", `Unexpected menu currency ${String(menu.currency)}`);

  const categoryIds = new Set<string>();
  for (const category of menu.categories) {
    invariant(isString(category.id) && isString(category.label), "Every category needs an id and a label");
    invariant(!categoryIds.has(category.id), `Duplicate category id ${category.id}`);
    categoryIds.add(category.id);
  }

  const productIds = new Set<string>();
  for (const product of menu.products) {
    const where = `product ${String(product.id)}`;
    invariant(isString(product.id) && isString(product.name), `${where}: id and name are required`);
    invariant(!productIds.has(product.id), `Duplicate product id ${product.id}`);
    productIds.add(product.id);
    invariant(categoryIds.has(product.category_id), `${where}: unknown category_id ${product.category_id}`);
    invariant(isString(product.display_category_id), `${where}: display_category_id is required`);
    invariant(isNullableString(product.description_fr), `${where}: description_fr must be a string or null`);
    invariant(isPrice(product.price), `${where}: price must be a number`);
    invariant(product.currency === "MAD", `${where}: unexpected currency ${product.currency}`);
    invariant(product.menu_upgrade_price === null || isPrice(product.menu_upgrade_price), `${where}: invalid menu_upgrade_price`);
    invariant(isString(product.image) && product.image.startsWith("images/"), `${where}: invalid image path`);
    invariant(
      product.image_size && product.image_size.width > 0 && product.image_size.height > 0,
      `${where}: image_size is required`,
    );
  }
  return menu;
}

function validateWebsite(raw: unknown): SourceWebsite {
  const website = raw as SourceWebsite;
  invariant(website && website.brand && isString(website.brand.name), "website.json: brand.name is required");
  invariant(website.proposed_copy && Array.isArray(website.proposed_copy.hero_lines), "website.json: proposed_copy is required");
  invariant(website.links && typeof website.links === "object", "website.json: links are required");
  return website;
}

export const sourceMenu: SourceMenu = validateMenu(menuJson);
export const sourceWebsite: SourceWebsite = validateWebsite(websiteJson);
export const sourceAssets: SourceAsset[] = assetManifestJson as SourceAsset[];
