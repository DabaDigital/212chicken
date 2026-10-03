import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { RestaurantDirectory } from "@/components/restaurants/RestaurantDirectory";
import { PillLink } from "@/components/ui/PillLink";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { brandImages } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";
import { restaurants } from "@/lib/restaurants";
import { site, socialLinks } from "@/lib/site";

import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Restaurants au Maroc — Adresses et horaires",
  description:
    "Trouvez 212 Chicken à Casablanca, Bouskoura, Tanger et Marrakech : adresses, horaires disponibles, services et itinéraires Google Maps.",
  path: "/restaurants",
});

/**
 * Directory from the owner's supplied locations, with city filters and individual Maps destinations.
 */
export default function RestaurantsPage() {
  const { burgerAssembled } = brandImages;
  return (
    <>
      <section className={styles.intro} aria-labelledby="restaurants-title">
        <div className={`container ${styles.introInner}`}>
          <div className={styles.introText}>
            <h1 id="restaurants-title" className={styles.title}>
              Nos <span className="accent">restaurants.</span>
            </h1>
            <p className={styles.lead}>
              Retrouvez votre 212 Chicken à Casablanca, Bouskoura, Tanger ou Marrakech.
              Choisissez votre ville et préparez votre itinéraire.
            </p>
            {site.restaurantSearchUrl ? (
              <div className={styles.actions}>
                <PillLink href={site.restaurantSearchUrl} external size="lg">
                  Rechercher sur Google Maps
                </PillLink>
              </div>
            ) : null}
          </div>
          <div className={styles.art}>
            <Image
              src={burgerAssembled.src}
              width={burgerAssembled.width}
              height={burgerAssembled.height}
              alt="Burger 212 Chicken au poulet croustillant, salade et cheddar"
              sizes="(min-width: 64rem) 560px, (min-width: 48rem) 45vw, 70vw"
              quality={65}
              className={styles.burger}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      {restaurants.length ? (
        <section className={styles.addresses} aria-labelledby="addresses-title">
          <div className="container">
            <h2 id="addresses-title" className={`${styles.columnTitle} ${styles.addressesTitle}`}>
              Nos adresses
            </h2>
            <RestaurantDirectory restaurants={restaurants} logo={brandImages.logo} />
          </div>
        </section>
      ) : null}

      <section className={styles.next} aria-label="Avant de venir">
        <div className={`container ${styles.columns}`}>
          <div className={styles.column} data-reveal>
            <h2 className={styles.columnTitle}>La recherche Google Maps</h2>
            <p>
              Une recherche générale « 212 Chicken », ouverte dans un nouvel onglet. Les informations affichées
              proviennent de Google Maps.
            </p>
          </div>
          <div className={styles.column} data-reveal>
            <h2 className={styles.columnTitle}>La carte avant de venir</h2>
            <p>Burgers, box à partager, wraps, milkshakes et desserts, avec leurs prix en dirhams.</p>
            <PillLink href="/carte" variant="dark">
              Voir la carte
            </PillLink>
          </div>
          {socialLinks.length ? (
            <div className={styles.column} data-reveal>
              <h2 className={styles.columnTitle}>Sur les réseaux</h2>
              <p>
                Suivez l’actualité de la marque sur {socialLinks.length > 1 ? "ses comptes officiels" : "son compte officiel"}.
              </p>
              <ul role="list" className={styles.socials}>
                {socialLinks.map((social) => (
                  <li key={social.id}>
                    <a href={social.url} className={styles.social} target="_blank" rel="noopener noreferrer">
                      <SocialIcon id={social.id} size={22} />
                      <span>{social.label}</span>
                      <ArrowUpRight size={18} strokeWidth={2.25} aria-hidden="true" />
                      <span className="sr-only"> (nouvel onglet)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
