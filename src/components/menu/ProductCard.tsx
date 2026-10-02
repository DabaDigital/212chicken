import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { formatPrice, formatPriceSpoken } from "@/lib/format";
import type { MenuItem } from "@/lib/menu-types";

import styles from "./ProductCard.module.css";

interface ProductCardProps {
  item: MenuItem;
  sizes: string;
  onOpen: (id: string, trigger: HTMLButtonElement) => void;
  showCategory?: boolean;
  /** First cards of an above-the-fold grid: eager, and "high" for the likely LCP image. */
  priority?: "high" | "eager";
}

/**
 * One tab stop per product: the name is a real <button> whose ::after stretches over the card.
 * The photo is decorative here (alt="") because the product name is announced right next to it.
 */
export function ProductCard({ item, sizes, onOpen, showCategory = false, priority }: ProductCardProps) {
  return (
    <article className={styles.card} style={{ "--image-scale": item.image.scale } as CSSProperties}>
      <div className={styles.media}>
        <Image
          src={item.image.src}
          width={item.image.width}
          height={item.image.height}
          alt=""
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority === "high" ? "high" : "auto"}
          className={styles.image}
        />
      </div>
      {showCategory ? <p className={styles.category}>{item.categoryLabel}</p> : null}
      <div className={styles.body}>
        <h3 className={styles.name}>
          <button
            type="button"
            className={styles.trigger}
            aria-haspopup="dialog"
            onClick={(event) => onOpen(item.id, event.currentTarget)}
          >
            {item.name}
            <span className="sr-only"> — voir le détail</span>
          </button>
        </h3>
        <p className={styles.price}>
          <span aria-hidden="true">{formatPrice(item.price)}</span>
          <span className="sr-only">{formatPriceSpoken(item.price)}</span>
        </p>
        <span className={styles.arrow} aria-hidden="true">
          <ArrowRight size={20} strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}
