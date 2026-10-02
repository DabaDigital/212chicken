import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PillLink } from "@/components/ui/PillLink";
import { brandImages } from "@/lib/assets";
import { site } from "@/lib/site";

import styles from "./FindRestaurant.module.css";

/**
 * Compact restaurant-finding band. No restaurant cards are rendered: the dataset has no verified
 * addresses, so the honest destination is the brand's general Google Maps search.
 */
export function FindRestaurant() {
  const { fries } = brandImages;
  return (
    <section className={styles.band} aria-labelledby="find-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.text} data-reveal>
          <p className={styles.eyebrow}>Nos restaurants</p>
          <h2 id="find-title" className={styles.title}>
            Envie de<br />croquer&nbsp;?
          </h2>
          <p className={styles.lead}>
            Lancez la recherche « 212 Chicken » sur Google Maps pour voir les restaurants référencés et préparer votre
            itinéraire.
          </p>
          <div className={styles.actions}>
            {site.restaurantSearchUrl ? (
              <PillLink href={site.restaurantSearchUrl} external>
                Rechercher sur Google Maps
              </PillLink>
            ) : null}
            <Link href="/restaurants" className={styles.link}>
              <span>Nos restaurants</span>
              <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.decor} aria-hidden="true">
          <div data-fries>
            <Image
              src={fries.src}
              width={fries.width}
              height={fries.height}
              alt=""
              sizes="(min-width: 64rem) 380px, 300px"
              className={styles.fries}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
