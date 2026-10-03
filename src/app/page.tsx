import { Hero } from "@/components/home/Hero";
import { BrandQuestions } from "@/components/home/BrandQuestions";
import { Ribbon } from "@/components/home/Ribbon";
import { SocialBand } from "@/components/home/SocialBand";
import { FeaturedMenu } from "@/components/menu/FeaturedMenu";
import { MotionGate } from "@/components/motion/MotionGate";
import { FindRestaurant } from "@/components/restaurants/FindRestaurant";
import { getHomeSelection } from "@/lib/menu";
import { pageMetadata, SITE_DESCRIPTION } from "@/lib/metadata";
import { site } from "@/lib/site";

import styles from "./page.module.css";

export const metadata = pageMetadata({ description: SITE_DESCRIPTION, path: "/" });

function splitAccent(heading: string): [string, string] {
  const index = heading.lastIndexOf(" ");
  return index > 0 ? [heading.slice(0, index), heading.slice(index + 1)] : ["", heading];
}

export default function HomePage() {
  const selection = getHomeSelection();
  const [headingStart, headingAccent] = splitAccent(site.copy.menu_heading);

  return (
    <MotionGate>
      <Hero />
      <Ribbon />

      <section id="selection" className={styles.selection} aria-labelledby="selection-title">
        <div className="container">
          <div className={styles.head} data-reveal>
            <h2 id="selection-title" className={styles.title}>
              {headingStart} <span className="accent">{headingAccent}</span>
            </h2>
            <p className={styles.intro}>
              Des recettes généreuses, du poulet croustillant et des saveurs uniques. Il y en a pour toutes les envies.
            </p>
          </div>
          <FeaturedMenu selection={selection} orderingUrl={site.orderingUrl} />
        </div>
      </section>

      <FindRestaurant />
      <SocialBand />
      <BrandQuestions />
    </MotionGate>
  );
}
