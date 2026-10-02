import "server-only";

import { assetUrl } from "./assets";
import { sourceWebsite } from "./source-data";

/**
 * Restaurant records from data/website.json → restaurants (owner's 2026-10-02 listing snapshot).
 * Only entries supplied with `"verified": true` are published; a published entry
 * with missing or malformed fields fails the build. Format: docs/content-and-launch.md.
 */
export const RESTAURANT_SERVICES = {
  sur_place: "Sur place",
  a_emporter: "À emporter",
  livraison: "Livraison",
} as const;

export type RestaurantService = keyof typeof RESTAURANT_SERVICES;

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  /** https link to this restaurant's own map listing. */
  mapsUrl: string;
  /** Opening hours exactly as confirmed by the owner, or null. */
  hours: string | null;
  services: RestaurantService[];
  /** Public URL of the storefront photo (copied by scripts/sync-assets.mjs), or null. */
  photo: string | null;
  featured: boolean;
  googlePlaceId: string | null;
}

function fail(message: string): never {
  throw new Error(`[212 data] ${message}`);
}

function requiredText(entry: Record<string, unknown>, field: string, where: string): string {
  const value = entry[field];
  if (typeof value !== "string" || !value.trim()) fail(`${where}: "${field}" is required`);
  return value.trim();
}

function optionalText(entry: Record<string, unknown>, field: string, where: string): string | null {
  return entry[field] === undefined || entry[field] === null ? null : requiredText(entry, field, where);
}

function isService(value: unknown): value is RestaurantService {
  return typeof value === "string" && Object.hasOwn(RESTAURANT_SERVICES, value);
}

function parseRestaurant(raw: unknown, index: number): Restaurant | null {
  const where = `website.json restaurants[${index}]`;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) fail(`${where} must be an object`);
  const entry = raw as Record<string, unknown>;
  if (entry.verified !== true) {
    return null;
  }

  const mapsUrl = requiredText(entry, "maps_url", where);
  if (!URL.canParse(mapsUrl) || new URL(mapsUrl).protocol !== "https:") fail(`${where}: "maps_url" must be an https URL`);

  const services = entry.services ?? [];
  if (!Array.isArray(services) || !services.every(isService)) {
    fail(`${where}: "services" may only contain ${Object.keys(RESTAURANT_SERVICES).join(", ")}`);
  }

  const photo = optionalText(entry, "photo", where);
  return {
    id: requiredText(entry, "id", where),
    name: requiredText(entry, "name", where),
    address: requiredText(entry, "address", where),
    city: requiredText(entry, "city", where),
    mapsUrl,
    hours: optionalText(entry, "hours", where),
    services: [...new Set(services)],
    photo: photo ? assetUrl(photo) : null,
    featured: entry.featured === true,
    googlePlaceId: optionalText(entry, "google_place_id", where),
  };
}

export const restaurants: Restaurant[] = sourceWebsite.restaurants
  .map(parseRestaurant)
  .filter((restaurant): restaurant is Restaurant => restaurant !== null);

const ids = new Set(restaurants.map((restaurant) => restaurant.id));
if (ids.size !== restaurants.length) fail("website.json restaurants: every id must be unique");
