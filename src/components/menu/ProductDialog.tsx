"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, type MouseEvent } from "react";

import { PillLink } from "@/components/ui/PillLink";
import { trapTabKey } from "@/components/ui/trapTabKey";
import { formatPrice, formatPriceSpoken } from "@/lib/format";
import type { MenuItem } from "@/lib/menu-types";

import styles from "./ProductDialog.module.css";

interface ProductDialogProps {
  item: MenuItem | null;
  orderingUrl: string | null;
  /** Called after the dialog closed (Escape, close button or backdrop). Restore focus there. */
  onClose: () => void;
}

/**
 * Native modal <dialog>: the browser traps focus inside, makes the page inert and closes on
 * Escape. Only published data is shown; unknown fields (allergens, availability…) stay absent.
 */
export function ProductDialog({ item, orderingUrl, onClose }: ProductDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);

  const closeFromBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  return (
    // Clicks on the backdrop close the dialog; the keyboard equivalent is the native Escape key.
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={closeFromBackdrop}
      onKeyDown={trapTabKey}
    >
      {item ? (
        <div className={styles.panel}>
          <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()}>
            <X size={24} strokeWidth={2.25} aria-hidden="true" />
            <span className="sr-only">Fermer</span>
          </button>

          <div className={styles.media}>
            <Image
              src={item.image.src}
              width={item.image.width}
              height={item.image.height}
              alt={`Photo : ${item.name}`}
              sizes="(min-width: 768px) 420px, 80vw"
              className={styles.image}
            />
          </div>

          <div className={styles.content}>
            <p className={styles.category}>{item.categoryLabel}</p>
            <h2 id={titleId} className={styles.title}>
              {item.name}
            </h2>
            {item.description ? <p className={styles.description}>{item.description}</p> : null}

            <dl className={styles.prices}>
              <div className={styles.priceRow}>
                <dt className="sr-only">Prix</dt>
                <dd className={styles.price}>
                  <span aria-hidden="true">{formatPrice(item.price)}</span>
                  <span className="sr-only">{formatPriceSpoken(item.price)}</span>
                </dd>
              </div>
              {item.menuUpgradePrice !== null ? (
                <div className={styles.upgrade}>
                  <dt>Supplément menu</dt>
                  <dd>
                    <span aria-hidden="true">+{formatPrice(item.menuUpgradePrice)}</span>
                    <span className="sr-only">plus {formatPriceSpoken(item.menuUpgradePrice)}</span>
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className={styles.actions}>
              {orderingUrl ? (
                <PillLink href={orderingUrl} external>
                  Commander
                </PillLink>
              ) : (
                <PillLink href="/restaurants">Trouver un restaurant</PillLink>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
