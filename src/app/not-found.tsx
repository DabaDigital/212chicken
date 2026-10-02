import type { Metadata } from "next";
import Link from "next/link";

import { PillLink } from "@/components/ui/PillLink";

import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className={styles.section} aria-labelledby="not-found-title">
      <div className={`container ${styles.inner}`}>
        <p className={styles.code} aria-hidden="true">
          404
        </p>
        <h1 id="not-found-title" className={styles.title}>
          Cette page s’est fait <span className="accent">croquer.</span>
        </h1>
        <p className={styles.text}>Elle n’existe pas ou plus. Reprenez par la carte ou par l’accueil.</p>
        <div className={styles.actions}>
          <PillLink href="/carte">Voir la carte</PillLink>
          <Link href="/" className={styles.link}>
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
