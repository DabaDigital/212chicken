import Image from "next/image";
import type { CSSProperties } from "react";

import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { PillLink } from "@/components/ui/PillLink";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import type { StaticImage } from "@/lib/assets";
import { socialLinks, type SocialLink } from "@/lib/site";

import styles from "./SocialBand.module.css";

interface Tile extends StaticImage {
  href?: string;
  /** "cover" bleeds art to the tile edges (cropped by the tile); "contain" keeps cut-outs whole. */
  fit: "contain" | "cover";
  /** object-position of cover art (keeps the subject in frame when the tile crops it). */
  position?: string;
  /** Inner margin of contained art, in % of the tile width. */
  pad?: number;
  /** Optical scale for product photos with wide transparent padding (from menu.ts). */
  scale?: number;
  scene?: "burger" | "feast" | "tenders" | "neon" | "cup";
}

/** Owner-supplied video covers and direct links, in display order. */
const TILES: Record<SocialLink["id"], Tile[]> = {
  instagram: [
    { src: "/social/instagram-1.webp", width: 720, height: 1280, fit: "cover", href: "https://www.instagram.com/p/DXzcBVsC-H4/" },
    { src: "/social/instagram-2.webp", width: 720, height: 1280, fit: "cover", href: "https://www.instagram.com/p/Dd1POipNHLk/" },
    { src: "/social/instagram-3.webp", width: 720, height: 1280, fit: "cover", href: "https://www.instagram.com/p/DcaxMD4tdF3/" },
  ],
  tiktok: [
    { src: "/social/tiktok-1.webp", width: 360, height: 640, fit: "cover", href: "https://www.tiktok.com/@212_chicken_maroc/video/7659363372692933909" },
    { src: "/social/tiktok-2.webp", width: 360, height: 640, fit: "cover", href: "https://www.tiktok.com/@212_chicken_maroc/video/7663510588957723925" },
    { src: "/social/tiktok-3.webp", width: 360, height: 640, fit: "cover", href: "https://www.tiktok.com/@212_chicken_maroc/video/7602612931741830421" },
  ],
};

const DESCRIPTIONS: Record<SocialLink["id"], string> = {
  instagram: "Photos et actus, sur le compte officiel.",
  tiktok: "Coulisses, sketchs et gourmandise, en vidéo.",
};

/** One card per official account configured in website.json (Instagram, TikTok). */
export function SocialBand() {
  if (!socialLinks.length) return null;
  const tileCount = socialLinks.length === 1 ? 4 : 3;

  return (
    <section className={styles.band} aria-labelledby="social-title" data-count={socialLinks.length}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.intro} data-reveal>
            <p className={styles.eyebrow}>Nos réseaux sociaux</p>
            <h2 id="social-title" className={styles.title}>
              Suivez le <span className="accent">crunch.</span>
            </h2>
            <p className={styles.lead}>
              L’actualité de la marque et toute la communauté 212&nbsp;Chicken, sur{" "}
              {socialLinks.map((social) => social.label).join(" et ")}.
            </p>
          </div>
          <div className={styles.callout} aria-hidden="true">
            <svg className={styles.sparks} viewBox="0 0 40 40" focusable="false">
              <path d="M4 27 15 23M9 9l9 8M24 3l1 10" />
            </svg>
            <p className={styles.calloutText}>
              Rejoignez
              <br />
              la communauté
              <br />
              212 Chicken&nbsp;!
            </p>
            <svg className={styles.arrow} viewBox="0 0 140 110" focusable="false">
              <path d="M130 10C98 14 54 34 30 94" />
              <path d="M14 78 29 97l18-15" />
            </svg>
          </div>
        </div>

        <ul role="list" className={styles.cards}>
          {socialLinks.map((social) => (
            <li key={social.id} className={styles.card} data-reveal>
              <div className={styles.cardBody}>
                <div className={styles.info}>
                  <span className={`${styles.mark} ${styles[social.id]}`} aria-hidden="true">
                    {social.id === "instagram" ? <InstagramIcon size={28} /> : <TikTokIcon size={26} brand />}
                  </span>
                  <h3 className={styles.handle}>
                    <span className="sr-only">{social.label} : </span>
                    {social.handle}
                  </h3>
                  <p className={styles.text}>{DESCRIPTIONS[social.id]}</p>
                  <PillLink href={social.url} external variant="outline" className={styles.button}>
                    Voir {social.label}
                  </PillLink>
                </div>
                <div className={styles.tiles} data-network={social.id}>
                  {TILES[social.id].slice(0, tileCount).map((tile, index) => (
                    <a
                      key={tile.src}
                      className={styles.tile}
                      href={tile.href ?? social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={tile.href ? `Voir la vidéo ${index + 1} sur ${social.label} (nouvel onglet)` : `Voir les vidéos de ${social.handle} sur ${social.label} (nouvel onglet)`}
                      data-scene={tile.scene}
                      style={{ "--tile-scale": tile.scale ?? 1, "--tile-pad": `${tile.pad ?? 8}%` } as CSSProperties}
                    >
                      <Image
                        src={tile.src}
                        width={tile.width}
                        height={tile.height}
                        alt=""
                        sizes="(min-width: 64rem) 200px, (min-width: 40rem) 25vw, 30vw"
                        className={tile.fit === "cover" ? `${styles.tileImage} ${styles.tileCover}` : styles.tileImage}
                        style={tile.position ? { objectPosition: tile.position } : undefined}
                      />
                      <span className={styles.play} aria-hidden="true">
                        <svg viewBox="0 0 24 24" focusable="false">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
