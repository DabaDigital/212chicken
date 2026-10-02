import Image from "next/image";
import Link from "next/link";

import { brandImages } from "@/lib/assets";
import { site } from "@/lib/site";

import { HeaderNav } from "./HeaderNav";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const { logo } = brandImages;
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src={logo.src}
            width={logo.width}
            height={logo.height}
            alt="212 Chicken — accueil"
            className={styles.logo}
            sizes="(min-width: 1024px) 52px, 42px"
            loading="eager"
          />
        </Link>
        <HeaderNav orderingUrl={site.orderingUrl} instagram={site.instagram} logo={logo} />
      </div>
    </header>
  );
}
