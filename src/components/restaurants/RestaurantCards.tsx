import { ArrowUpRight, Bike, Clock, MapPin, ShoppingBag, Store } from "lucide-react";
import Image from "next/image";

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

/** Cards for confirmed restaurant entries only. Each card is one link to that restaurant's map listing. */
export function RestaurantCards({ restaurants, logo, className }: { restaurants: Restaurant[]; logo: StaticImage; className?: string }) {
  return (
    <ul role="list" className={[styles.list, className].filter(Boolean).join(" ")}>
      {restaurants.map((restaurant) => (
        <li key={restaurant.id}>
          <article className={styles.card}>
            <div className={restaurant.photo ? styles.media : `${styles.media} ${styles.mediaFallback}`}>
              {restaurant.photo ? (
                <Image
                  src={restaurant.photo}
                  alt=""
                  fill
                  sizes="(min-width: 75rem) 330px, (min-width: 36rem) 46vw, 92vw"
                  className={styles.photo}
                />
              ) : (
                <>
                  <span className={styles.cityArt} aria-hidden="true">{restaurant.city}</span>
                  <Image src={logo.src} width={logo.width} height={logo.height} alt="" sizes="90px" className={styles.logo} />
                </>
              )}
            </div>
            <div className={styles.body}>
              <div className={styles.top}>
                <MapPin className={styles.pin} size={20} strokeWidth={2.25} aria-hidden="true" />
                <div className={styles.heading}>
                  <h3 className={styles.name}>
                    <a href={restaurant.mapsUrl} className={styles.link} target="_blank" rel="noopener noreferrer">
                      {restaurant.name}
                      <span className="sr-only"> — voir sur Google Maps (nouvel onglet)</span>
                    </a>
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
