"use client";

import { useState } from "react";

import { PillLink } from "@/components/ui/PillLink";
import type { HomeSelection, MenuItem } from "@/lib/menu-types";

import { CategoryFilter } from "./CategoryFilter";
import styles from "./FeaturedMenu.module.css";
import { ProductCard } from "./ProductCard";
import { ProductDialog } from "./ProductDialog";
import { useProductDialog } from "./useProductDialog";

const CARD_SIZES = "(min-width: 1536px) 460px, (min-width: 768px) 31vw, (min-width: 360px) 46vw, 90vw";

interface FeaturedMenuProps {
  selection: HomeSelection;
  orderingUrl: string | null;
}

/** Home "À chacun son crunch." selection: a few products per filter plus a route to the full menu. */
export function FeaturedMenu({ selection, orderingUrl }: FeaturedMenuProps) {
  const [activeId, setActiveId] = useState(selection.filters[0]?.id ?? "all");
  const { openId, open, close } = useProductDialog();

  const active = selection.filters.find((filter) => filter.id === activeId) ?? selection.filters[0];
  const visible = (active?.itemIds ?? [])
    .map((id) => selection.items[id])
    .filter((item): item is MenuItem => Boolean(item));
  const openItem = openId ? (selection.items[openId] ?? null) : null;

  const isAll = !active || active.id === "all";
  const moreHref = isAll ? "/carte" : `/carte?categorie=${encodeURIComponent(active.id)}`;
  const moreLabel = isAll ? "Voir toute la carte" : `Voir la catégorie ${active.label}`;

  return (
    <div className={styles.featured}>
      <CategoryFilter label="Filtrer la sélection" options={selection.filters} value={activeId} onChange={setActiveId} />

      <p className="sr-only" role="status">
        {`${visible.length} produit${visible.length > 1 ? "s" : ""} affiché${visible.length > 1 ? "s" : ""}${
          isAll ? "" : ` : ${active.label}`
        }`}
      </p>

      <ul role="list" className={styles.grid}>
        {visible.map((item) => (
          <li key={item.id} data-reveal-item>
            <ProductCard item={item} sizes={CARD_SIZES} onOpen={open} />
          </li>
        ))}
      </ul>

      <div className={styles.more}>
        <PillLink href={moreHref}>{moreLabel}</PillLink>
        <p className={styles.total}>{selection.totalProducts} produits sur la carte complète</p>
      </div>

      <ProductDialog item={openItem} orderingUrl={orderingUrl} onClose={close} />
    </div>
  );
}
