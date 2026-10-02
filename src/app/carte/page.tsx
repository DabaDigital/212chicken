import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { FindRestaurant } from "@/components/restaurants/FindRestaurant";
import { getMenu } from "@/lib/menu";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

import styles from "./page.module.css";

const menu = getMenu();

export const metadata = pageMetadata({
  title: "La carte",
  description: `La carte 212 Chicken : ${menu.totalProducts} produits et leurs prix en dirhams — ${menu.groups
    .map((group) => group.label.toLowerCase())
    .join(", ")}.`,
  path: "/carte",
});

export default function CartePage() {
  return (
    <>
      <section className={styles.intro} aria-labelledby="carte-title">
        <div className={`container ${styles.introInner}`}>
          <h1 id="carte-title" className={styles.title}>
            La <span className="accent">carte.</span>
          </h1>
          <p className={styles.lead}>
            {menu.totalProducts} produits, {menu.groups.length} catégories. Filtrez, cherchez, choisissez votre crunch.
            <span className={styles.note}>Prix en dirhams marocains (DH).</span>
          </p>
        </div>
      </section>

      <div className={`container ${styles.menu}`}>
        <MenuExplorer groups={menu.groups} totalProducts={menu.totalProducts} orderingUrl={site.orderingUrl} />
      </div>

      <FindRestaurant />
    </>
  );
}
