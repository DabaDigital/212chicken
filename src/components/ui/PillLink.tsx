import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./PillLink.module.css";

interface PillLinkProps {
  href: string;
  children: ReactNode;
  /** Shorter label shown on narrow screens (the full label stays available on wider ones). */
  shortLabel?: string;
  variant?: "dark" | "cream" | "outline";
  size?: "md" | "lg";
  external?: boolean;
  /** Stretch to the full width of the parent (used for the mobile hero CTA). */
  block?: "mobile" | "always";
  className?: string;
}

/** Dark pill with the circular orange arrow from the approved mockups. Navigation only (anchor). */
export function PillLink({
  href,
  children,
  shortLabel,
  variant = "dark",
  size = "md",
  external = false,
  block,
  className,
}: PillLinkProps) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  const classes = [
    styles.pill,
    styles[variant],
    styles[size],
    block === "mobile" && styles.blockMobile,
    block === "always" && styles.blockAlways,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {shortLabel ? (
        <>
          <span className={`${styles.label} ${styles.full}`}>{children}</span>
          <span className={`${styles.label} ${styles.short}`}>{shortLabel}</span>
        </>
      ) : (
        <span className={styles.label}>{children}</span>
      )}
      <span className={styles.icon} aria-hidden="true">
        <Icon size={size === "lg" ? 22 : 18} strokeWidth={2.25} />
      </span>
      {external ? <span className="sr-only"> (nouvel onglet)</span> : null}
    </>
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
