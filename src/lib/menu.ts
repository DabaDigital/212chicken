import "server-only";

import { assetUrl, productImageScaleFor } from "./assets";
import { normalizeSearchText } from "./format";
import type { HomeSelection, MenuGroup, MenuItem, SearchableMenuItem } from "./menu-types";
import { sourceMenu, type SourceProduct } from "./source-data";

/**
 * Presentation labels for display categories. Source category ids and labels stay untouched in the
 * data; these labels only exist for the redesigned navigation (see docs/content-and-data.md).
 * `wraps` is the proposed display category for Royal 212 Wistor (source category: burger).
 */
const DISPLAY_CATEGORY_LABELS: Record<string, string> = {
  "box-family": "Box à partager",
  "star-box": "Star Box",
  "star-box-combo": "Combos",
  burger: "Burgers",
  wraps: "Wraps",
  salade: "Salades",
  texmex: "Tex-mex",
  "milk-shake": "Milkshakes",
  dessert: "Desserts",
};

/** Curated home "selection" (not a best-seller claim). Unknown ids are skipped. */
const HOME_SELECTION_IDS = [
  "royal-crunch-double",
  "long-212-pepper",
  "royal-212-wistor",
  "212-skin-tenders",
  "box-n1",
  "wings-bbq-miel",
];

/** Display categories offered as shortcuts in the home selection, in this order. */
const HOME_FILTER_IDS = ["burger", "box-family", "wraps", "star-box"];
const HOME_ITEMS_PER_FILTER = 6;

const sourceCategoryLabels = new Map(sourceMenu.categories.map((category) => [category.id, category.label]));

function displayLabel(displayCategoryId: string): string {
  return DISPLAY_CATEGORY_LABELS[displayCategoryId] ?? sourceCategoryLabels.get(displayCategoryId) ?? displayCategoryId;
}

function toMenuItem(product: SourceProduct): SearchableMenuItem {
  const categoryLabel = displayLabel(product.display_category_id);
  const description = product.description_fr?.trim() || null;
  return {
    id: product.id,
    name: product.name,
    description,
    price: product.price,
    menuUpgradePrice: product.menu_upgrade_price,
    categoryId: product.display_category_id,
    categoryLabel,
    image: {
      src: assetUrl(product.image),
      width: product.image_size.width,
      height: product.image_size.height,
      scale: productImageScaleFor(product.id),
    },
    searchText: normalizeSearchText([product.name, description ?? "", categoryLabel].join(" ")),
  };
}

const items: SearchableMenuItem[] = sourceMenu.products.map(toMenuItem);

/**
 * Display categories are generated from the adapted products, so no product can disappear:
 * source categories keep their source order; a new display category (e.g. `wraps`) is inserted
 * right after the source category of its first product.
 */
function buildGroups(): MenuGroup[] {
  const order: string[] = [];
  for (const category of sourceMenu.categories) {
    for (const product of sourceMenu.products) {
      if (product.category_id === category.id && !order.includes(product.display_category_id)) {
        order.push(product.display_category_id);
      }
    }
  }
  return order.map((id) => {
    const groupItems = items.filter((item) => item.categoryId === id);
    return { id, label: displayLabel(id), count: groupItems.length, items: groupItems };
  });
}

const groups = buildGroups();

if (groups.reduce((sum, group) => sum + group.count, 0) !== items.length) {
  throw new Error("[212 data] Every product must belong to exactly one display category.");
}

export function getMenu() {
  return {
    groups,
    totalProducts: items.length,
    retrievedOn: sourceMenu.retrieved_on,
  };
}

function withoutSearchText(item: SearchableMenuItem): MenuItem {
  const { id, name, description, price, menuUpgradePrice, categoryId, categoryLabel, image } = item;
  return { id, name, description, price, menuUpgradePrice, categoryId, categoryLabel, image };
}

export function getHomeSelection(): HomeSelection {
  const byId = new Map(items.map((item) => [item.id, item]));
  const curated = HOME_SELECTION_IDS.filter((id) => byId.has(id));
  const filters = [
    { id: "all", label: "Tout", count: items.length, itemIds: curated },
    ...HOME_FILTER_IDS.flatMap((id) => {
      const group = groups.find((candidate) => candidate.id === id);
      if (!group) return [];
      return [
        {
          id,
          label: group.label,
          count: group.count,
          itemIds: group.items.slice(0, HOME_ITEMS_PER_FILTER).map((item) => item.id),
        },
      ];
    }),
  ];
  const usedIds = new Set(filters.flatMap((filter) => filter.itemIds));
  const selectionItems: Record<string, MenuItem> = {};
  for (const id of usedIds) {
    const item = byId.get(id);
    if (item) selectionItems[id] = withoutSearchText(item);
  }
  return { filters, items: selectionItems, totalProducts: items.length };
}

/**
 * Product photos for decorative compositions (restaurant band collage, social tiles), resolved
 * through menu.json so the paths stay single-sourced. Unknown ids are skipped.
 */
export function getProductPhotos(ids: readonly string[]): MenuItem["image"][] {
  return ids.flatMap((id) => {
    const item = items.find((candidate) => candidate.id === id);
    return item ? [item.image] : [];
  });
}
