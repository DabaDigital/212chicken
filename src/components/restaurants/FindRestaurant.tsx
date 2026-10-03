import { Crown, MapPin } from "lucide-react";
import Image from "next/image";

import { PillLink } from "@/components/ui/PillLink";
import { brandImages, campaignImages } from "@/lib/assets";
import { restaurants } from "@/lib/restaurants";
import { site } from "@/lib/site";

import styles from "./FindRestaurant.module.css";
import { RestaurantCards } from "./RestaurantCards";

function PinMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 32" focusable="false">
      <path d="M12 0C5.37 0 0 5.2 0 11.6 0 20.3 12 32 12 32s12-11.7 12-20.4C24 5.2 18.63 0 12 0Z" fill="currentColor" />
      <circle className={styles.pinHole} cx="12" cy="11.6" r="4.4" />
    </svg>
  );
}

/**
 * Restaurant finder callout linking to the full directory and the brand's Google Maps search.
 * The owner's campaign illustration is decorative.
 */
export function FindRestaurant() {
  const { boxExplosion } = campaignImages;
  const featured = restaurants.filter((restaurant) => restaurant.featured).slice(0, 4);

  return (
    <section className={styles.band} aria-labelledby="find-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.head} data-reveal>
          <p className={styles.eyebrow}>Nos restaurants</p>
          <h2 id="find-title" className={styles.title}>
            <span className={styles.line}>Envie de croquer</span>{" "}
            <span className={`${styles.line} ${styles.lineCream}`}>près de chez vous&nbsp;?</span>
          </h2>
        </div>

        <div className={styles.body} data-reveal>
          <p className={styles.lead}>
            Retrouvez 212 Chicken dans plusieurs villes et venez profiter de nos recettes croustillantes
            sur place, à emporter ou en livraison.
          </p>
          <div className={styles.actions}>
            <PillLink href="/restaurants" block="mobile">
              Voir nos adresses
            </PillLink>
            {site.restaurantSearchUrl ? (
              <a href={site.restaurantSearchUrl} className={styles.maps} target="_blank" rel="noopener noreferrer">
                <MapPin size={20} strokeWidth={2.25} aria-hidden="true" />
                <span>Ouvrir dans Google Maps</span>
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className={styles.art} aria-hidden="true">
          <div data-parallax="10">
            <Image
              src={boxExplosion.src}
              width={boxExplosion.width}
              height={boxExplosion.height}
              alt="Box 212 Chicken garnie de poulet croustillant, de frites et de burgers"
              sizes="(min-width: 64rem) 900px, (min-width: 48rem) 55vw, 92vw"
              className={styles.feast}
            />
          </div>
          <div className={`${styles.piece} ${styles.pinA}`} data-parallax="-30">
            <PinMark className={styles.pin} />
          </div>
          <div className={`${styles.piece} ${styles.pinB}`} data-parallax="-18">
            <PinMark className={styles.pin} />
          </div>
          <p className={styles.note}>
            <Crown size={30} strokeWidth={2} />
            <span>
              Du goût.
              <br />
              Partout
              <br />
              avec vous.
            </span>
            <svg className={styles.noteArrow} viewBox="0 0 90 64" focusable="false">
              <path d="M86 6C60 4 28 14 14 52" />
              <path d="M25 44 14 53 9 40" />
            </svg>
          </p>
        </div>
        {featured.length ? <RestaurantCards restaurants={featured} logo={brandImages.logo} className={styles.cards} /> : null}
      </div>
    </section>
  );
}
