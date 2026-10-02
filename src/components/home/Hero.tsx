import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { PillLink } from "@/components/ui/PillLink";
import { brandImages, heroBounds, heroLayers } from "@/lib/assets";
import { site } from "@/lib/site";

import styles from "./Hero.module.css";

/**
 * Server-rendered exploded artwork: one intact image for first paint, phones, reduced motion and no-JS.
 *
 * Desktop motion (PageMotion) swaps in three layers split from that same image along its own
 * transparent gaps — bottom bun, upper stack (top bun → chicken, inseparable in the supplied art) and
 * garnish (sauce drop + crumbs). They recompose the image pixel for pixel (verified at build time in
 * scripts/derive-assets.mjs) and stay unloaded (display: none + lazy) until enhancement starts.
 */
export function Hero() {
  const [firstLine, secondLine] = site.copy.hero_lines;
  // Phones: the canvas bleeds past the gutters (its edges are transparent); 90vw keeps ≥ 1.7x density.
  const artSizes = "(min-width: 1536px) 820px, (min-width: 768px) 56vw, 90vw";
  const boundsStyle = {
    "--art-x0": heroBounds.x0,
    "--art-x1": heroBounds.x1,
    "--art-y0": heroBounds.y0,
    "--art-y1": heroBounds.y1,
  } as CSSProperties;

  return (
    <section className={styles.hero} aria-labelledby="hero-title" data-hero>
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.line}>
              <span className={styles.lineInner} data-hero-line>
                {firstLine}
              </span>
            </span>{" "}
            <span className={`${styles.line} ${styles.lineAccent}`}>
              <span className={styles.lineInner} data-hero-line>
                {secondLine}
              </span>
            </span>
          </h1>
          <p className={styles.lead}>{site.copy.hero_description}</p>
          <div className={styles.actions}>
            <PillLink href="/carte" size="lg" block="mobile">
              {site.copy.primary_cta}
            </PillLink>
            <Link href="/restaurants" className={styles.secondary}>
              <MapPin className={styles.pin} size={22} strokeWidth={2.25} aria-hidden="true" />
              <span className={styles.secondaryLabel}>{site.copy.secondary_cta}</span>
              <ArrowRight className={styles.secondaryArrow} size={18} strokeWidth={2.25} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className={styles.art} style={boundsStyle} data-hero-art>
          {/* Layers: CSS centring → GSAP drift → clip + entrance → text (transforms never collide). */}
          <span className={styles.number} aria-hidden="true">
            <span className={styles.numberDrift} data-hero-number>
              <span className={styles.numberClip}>
                <span className={styles.numberText}>212</span>
              </span>
            </span>
          </span>

          <div className={styles.burger} data-hero-burger>
            <div className={styles.burgerIntro} data-hero-intro>
              <div className={styles.shadowWrap} aria-hidden="true">
                <div className={styles.shadow} data-hero-shadow />
              </div>
              <div className={styles.frame}>
                <Image
                  src={brandImages.burgerExploded.src}
                  width={brandImages.burgerExploded.width}
                  height={brandImages.burgerExploded.height}
                  alt="Burger au poulet croustillant en suspension : pain au sésame, salade, tomate, cheddar et poulet pané."
                  sizes={artSizes}
                  quality={65}
                  loading="eager"
                  fetchPriority="high"
                  className={`${styles.layer} ${styles.photo}`}
                  data-hero-photo
                />
                <div className={styles.layers} aria-hidden="true" data-hero-layers>
                  {heroLayers.map((layer) => (
                    <Image
                      key={layer.id}
                      src={layer.src}
                      width={layer.width}
                      height={layer.height}
                      alt=""
                      sizes={artSizes}
                      quality={65}
                      loading="lazy"
                      className={styles.layer}
                      data-hero-layer={layer.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
