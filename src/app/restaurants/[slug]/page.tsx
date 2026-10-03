import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { PillLink } from "@/components/ui/PillLink";
import { pageMetadata } from "@/lib/metadata";
import { restaurants, RESTAURANT_SERVICES } from "@/lib/restaurants";
import { breadcrumbJsonLd, restaurantJsonLd } from "@/lib/structured-data";
import styles from "./page.module.css";

export const dynamicParams = false;
export function generateStaticParams() {
  return restaurants.map(({ id }) => ({ slug: id }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = restaurants.find(({ id }) => id === slug);
  if (!restaurant) notFound();
  return pageMetadata({
    title: `${restaurant.name} à ${restaurant.city} — Adresse et horaires`,
    description: `212 Chicken ${restaurant.name} à ${restaurant.city} : ${restaurant.address}. Découvrez les horaires disponibles, les services, le menu et l’itinéraire.`,
    path: `/restaurants/${restaurant.id}`,
  });
}

export default async function RestaurantPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = restaurants.find(({ id }) => id === slug);
  if (!restaurant) notFound();
  const structuredData = restaurantJsonLd(restaurant);
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Restaurants", path: "/restaurants" },
    { name: restaurant.name, path: `/restaurants/${restaurant.id}` },
  ]);

  return (
    <section className={`container ${styles.page}`}>
      <nav aria-label="Fil d’Ariane" className={styles.breadcrumbs}>
        <Link href="/">Accueil</Link><span aria-hidden="true">/</span>
        <Link href="/restaurants">Restaurants</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{restaurant.name}</span>
      </nav>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>212 Chicken · {restaurant.city}</p>
          <h1 className={styles.title}>212 Chicken <span className="accent">{restaurant.name}</span></h1>
          <p>Retrouvez votre restaurant 212 Chicken à {restaurant.city}, {restaurant.address}. Découvrez la carte de burgers au poulet croustillant, tenders et box à partager avant votre visite.</p>
          <h2>Adresse et horaires</h2>
          <address>{restaurant.address}<br />{restaurant.city}, Maroc</address>
          <p>{restaurant.hours ? `Horaires indiqués : ${restaurant.hours}.` : "Consultez les horaires sur Google Maps."} Vérifiez les horaires du jour avant de vous déplacer.</p>
          {restaurant.services.length > 0 ? <>
            <h2>Services disponibles</h2>
            <ul>{restaurant.services.map((service) => <li key={service}>{RESTAURANT_SERVICES[service]}</li>)}</ul>
          </> : null}
          <div className={styles.actions}>
            <PillLink href={restaurant.mapsUrl} external>Itinéraire Google Maps</PillLink>
            <PillLink href="/carte" variant="outline">Menu et prix en DH</PillLink>
          </div>
        </div>
        <figure className={styles.figure}>
          <Image src={restaurant.photo ?? "/locations/storefront.webp"} alt={restaurant.photo ? `Restaurant 212 Chicken ${restaurant.name}` : "Illustration d’une devanture 212 Chicken"} width={1440} height={1080} sizes="(min-width: 64rem) 45vw, 92vw" className={styles.photo} />
          {!restaurant.photo ? <figcaption>Visuel d’illustration de l’enseigne 212 Chicken.</figcaption> : null}
        </figure>
      </div>
      {structuredData ? <JsonLd data={structuredData} /> : null}
      {breadcrumbs ? <JsonLd data={breadcrumbs} /> : null}
    </section>
  );
}
