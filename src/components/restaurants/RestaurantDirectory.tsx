"use client";

import { useState } from "react";

import { CategoryFilter } from "@/components/menu/CategoryFilter";
import type { StaticImage } from "@/lib/assets";
import type { Restaurant } from "@/lib/restaurants";

import { RestaurantCards } from "./RestaurantCards";
import styles from "./RestaurantDirectory.module.css";

export function RestaurantDirectory({ restaurants, logo }: { restaurants: Restaurant[]; logo: StaticImage }) {
  const [city, setCity] = useState("all");
  const cities = [...new Set(restaurants.map((restaurant) => restaurant.city))];
  const visible = city === "all" ? restaurants : restaurants.filter((restaurant) => restaurant.city === city);

  return (
    <div className={styles.directory}>
      <CategoryFilter
        label="Filtrer les restaurants par ville"
        options={[{ id: "all", label: "Tous" }, ...cities.map((name) => ({ id: name, label: name }))]}
        value={city}
        onChange={setCity}
      />
      <p className={styles.count} role="status">
        {visible.length} restaurant{visible.length === 1 ? "" : "s"}{city === "all" ? " au Maroc" : ` à ${city}`}
      </p>
      <RestaurantCards restaurants={visible} logo={logo} />
      <p className={styles.hint}>Consultez Google Maps pour les horaires à jour et préparer votre itinéraire.</p>
    </div>
  );
}
