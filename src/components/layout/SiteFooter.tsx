import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SocialIcon } from "@/components/ui/SocialIcon";
import { brandImages } from "@/lib/assets";
import { site, socialLinks } from "@/lib/site";

import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const { logo } = brandImages;
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink}>
            <Image src={logo.src} width={logo.width} height={logo.height} alt="212 Chicken — accueil" sizes="40px" className={styles.logo} />
          </Link>
          <p className={styles.tagline}>{site.copy.hero_description}</p>
        </div>

        <nav aria-label="Liens du pied de page">
          <ul role="list" className={styles.links}>
            <li>
              <Link href="/carte" className={styles.link}>
                La carte
              </Link>
            </li>
            <li>
              <Link href="/restaurants" className={styles.link}>
                Nos restaurants
              </Link>
            </li>
            {socialLinks.map((social) => (
              <li key={social.id}>
                <a href={social.url} className={styles.link} target="_blank" rel="noopener noreferrer">
                  <SocialIcon id={social.id} size={18} />
                  {social.label}
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={`container ${styles.legal}`}>
        <p>© {year} 212 Chicken</p>
        <p>Prix affichés en dirhams marocains (DH).</p>
      </div>
    </footer>
  );
}
