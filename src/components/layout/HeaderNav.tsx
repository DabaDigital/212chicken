"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PillLink } from "@/components/ui/PillLink";
import type { SocialLink } from "@/lib/site";

import { MobileMenu, type NavItem } from "./MobileMenu";
import styles from "./SiteHeader.module.css";

const NAV_ITEMS: NavItem[] = [
  { href: "/carte", label: "La carte" },
  { href: "/restaurants", label: "Nos restaurants" },
];

interface HeaderNavProps {
  orderingUrl: string | null;
  socials: SocialLink[];
  logo: { src: string; width: number; height: number };
}

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({ orderingUrl, socials, logo }: HeaderNavProps) {
  const pathname = usePathname() ?? "/";

  // "Commander" only exists with a verified ordering destination. Without it the header points to
  // the next useful step of the journey instead of pretending ordering works.
  const cta = orderingUrl
    ? { href: orderingUrl, label: "Commander", short: "Commander", external: true }
    : pathname === "/carte"
      ? { href: "/restaurants", label: "Trouver un restaurant", short: "Restaurants", external: false }
      : { href: "/carte", label: "Voir la carte", short: "La carte", external: false };

  return (
    <>
      <nav aria-label="Navigation principale" className={styles.nav}>
        <ul role="list" className={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={styles.navLink}
                aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.actions}>
        <PillLink href={cta.href} shortLabel={cta.short} external={cta.external} className={styles.cta}>
          {cta.label}
        </PillLink>
        <MobileMenu items={NAV_ITEMS} pathname={pathname} socials={socials} logo={logo} />
      </div>
    </>
  );
}
