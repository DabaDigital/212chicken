import { ArrowUpRight, Bike, Clock, MapPin, ShoppingBag, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { StaticImage } from "@/lib/assets";
import type { Restaurant, RestaurantService } from "@/lib/restaurants";

import styles from "./RestaurantCards.module.css";

const SERVICE_ICONS: Record<RestaurantService, typeof Store> = {
  sur_place: Store,
  a_emporter: ShoppingBag,
  livraison: Bike,
};

const SERVICE_LABELS: Record<RestaurantService, string> = {
  sur_place: "Sur place",
  a_emporter: "À emporter",
  livraison: "Livraison",
};

/** Cards link to each confirmed restaurant's address, services and directions. */
export function RestaurantCards({ restaurants, className }: { restaurants: Restaurant[]; logo: StaticImage; className?: string }) {
  return (
    <ul role="list" className={[styles.list, className].filter(Boolean).join(" ")}>
      {restaurants.map((restaurant) => (
        <li key={restaurant.id}>
          <article className={styles.card}>
            <div className={styles.media}>
                <Image
                  src={restaurant.photo ?? "/locations/storefront.webp"}
                  alt={restaurant.photo ? `Devanture du restaurant 212 Chicken ${restaurant.name}` : "Illustration d’une devanture 212 Chicken dans un centre commercial"}
                  fill
                  sizes="(min-width: 75rem) 330px, (min-width: 36rem) 46vw, 92vw"
                  className={styles.photo}
                />
            </div>
            <div className={styles.body}>
              <div className={styles.top}>
                <MapPin className={styles.pin} size={20} strokeWidth={2.25} aria-hidden="true" />
                <div className={styles.heading}>
                  <h3 className={styles.name}>
                    <Link href={`/restaurants/${restaurant.id}`} className={styles.link}>
                      {restaurant.name}
                      <span className="sr-only"> — adresse et horaires à {restaurant.city}</span>
                    </Link>
                  </h3>
                  <address className={styles.address}>
                    {restaurant.address}
                    <br />
                    {restaurant.city}
                  </address>
                </div>
                <span className={styles.arrow} aria-hidden="true">
                  <ArrowUpRight size={18} strokeWidth={2.25} />
                </span>
              </div>
              {restaurant.hours ? (
                <p className={styles.hours}>
                  <Clock size={16} strokeWidth={2.25} aria-hidden="true" />
                  <span className="sr-only">Horaires : </span>
                  {restaurant.hours}
                </p>
              ) : null}
              {restaurant.services.length ? (
                <ul role="list" className={styles.services} aria-label="Services">
                  {restaurant.services.map((service) => {
                    const Icon = SERVICE_ICONS[service];
                    return (
                      <li key={service} className={styles.service}>
                        <Icon size={16} strokeWidth={2.25} aria-hidden="true" />
                        {SERVICE_LABELS[service]}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
