import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { PillLink } from "@/components/ui/PillLink";
import { brandImages } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Nos restaurants",
  description:
    "Trouvez un restaurant 212 Chicken grâce à la recherche Google Maps, puis découvrez la carte et ses prix en dirhams.",
  path: "/restaurants",
});

/**
 * No verified restaurant records exist yet (data/website.json → restaurants: []), so this page
 * never lists addresses, hours or "open now" states. It offers the brand's general map search.
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
              Pour trouver un 212 Chicken, ouvrez la recherche « 212 Chicken » sur Google Maps&nbsp;: vous y verrez les
              établissements référencés et pourrez préparer votre itinéraire.
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
              alt=""
              sizes="(min-width: 64rem) 560px, (min-width: 48rem) 45vw, 70vw"
              quality={65}
              className={styles.burger}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

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
          {site.instagram ? (
            <div className={styles.column} data-reveal>
              <h2 className={styles.columnTitle}>Sur Instagram</h2>
              <p>Suivez l’actualité de la marque sur son compte officiel.</p>
              <a href={site.instagram.url} className={styles.social} target="_blank" rel="noopener noreferrer">
                <InstagramIcon size={22} />
                <span>{site.instagram.handle}</span>
                <ArrowUpRight size={18} strokeWidth={2.25} aria-hidden="true" />
                <span className="sr-only"> sur Instagram (nouvel onglet)</span>
              </a>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
