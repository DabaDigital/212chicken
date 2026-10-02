import { ArrowUpRight } from "lucide-react";

import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { site } from "@/lib/site";

import styles from "./InstagramBand.module.css";

/** Restrained social link. No embeds or fake posts: reels/reviews stay empty until real content exists. */
export function InstagramBand() {
  if (!site.instagram) return null;
  return (
    <section className={styles.band} aria-labelledby="instagram-title">
      <div className={`container ${styles.inner}`} data-reveal>
        <div>
          <h2 id="instagram-title" className={styles.title}>
            Suivez le <span className="accent">crunch.</span>
          </h2>
          <p className={styles.text}>Retrouvez 212 Chicken sur Instagram.</p>
        </div>
        <a href={site.instagram.url} className={styles.link} target="_blank" rel="noopener noreferrer">
          <InstagramIcon size={26} />
          <span className={styles.handle}>{site.instagram.handle}</span>
          <ArrowUpRight size={20} strokeWidth={2.25} aria-hidden="true" />
          <span className="sr-only"> sur Instagram (nouvel onglet)</span>
        </a>
      </div>
    </section>
  );
}
