import { ArrowRight, Expand, MapPin, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { PillLink } from "@/components/ui/PillLink";
import { brandImages, heroBounds, heroLayers } from "@/lib/assets";
import { site } from "@/lib/site";

import styles from "./Hero.module.css";

/** The intact photo remains the first-paint, reduced-motion and failed-enhancement fallback. */
export function Hero() {
  const [firstLine, secondLine] = site.copy.hero_lines;
  // Phones: the canvas bleeds past the gutters (its edges are transparent); 90vw keeps ≥ 1.7x density.
  const artSizes = "(min-width: 1536px) 820px, (min-width: 768px) 56vw, 90vw";
  const garnish = heroLayers.find((layer) => layer.id === "garnish")!;
  const boundsStyle = {
    "--art-x0": heroBounds.x0,
    "--art-x1": heroBounds.x1,
    "--art-y0": heroBounds.y0,
    "--art-y1": heroBounds.y1,
  } as CSSProperties;

  // Source order is the phone order (headline → burger → burger controls → actions); from 768px the
  // burger moves beside the copy and the controls drop below the actions.
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

          <span className={styles.crunchWord} data-crunch-word aria-hidden="true">CRUNCH!</span>

          <div id="burger-scene" className={styles.burger} data-hero-burger>
            <div className={styles.burgerIntro} data-hero-intro>
              <div className={styles.shadowWrap} aria-hidden="true">
                <div className={styles.shadow} data-hero-shadow />
              </div>
              <div className={styles.frame} data-burger-camera>
                <Image
                  src={brandImages.burgerExploded.src}
                  width={brandImages.burgerExploded.width}
                  height={brandImages.burgerExploded.height}
                  alt="Burger au poulet croustillant en suspension : pain au sésame, salade, tomate, cheddar et poulet pané."
                  sizes={artSizes}
                  quality={65}
                  // LCP image: React hoists a fetchpriority=high preload into <head> (`preload` would not).
                  loading="eager"
                  fetchPriority="high"
                  className={`${styles.layer} ${styles.photo}`}
                  data-hero-photo
                />
                <div className={styles.layers} aria-hidden="true" data-hero-layers>
                  <div className={styles.float} data-burger-float>
                    <div className={styles.assembled} data-burger-assembled>
                      <Image
                        {...brandImages.burgerAssembled}
                        alt="Burger 212 Chicken au poulet croustillant, salade et cheddar"
                        sizes={artSizes}
                        quality={65}
                        loading="lazy"
                        className={styles.assembledPhoto}
                        data-burger-image
                      />
                    </div>
                    <div className={styles.exploded} data-burger-exploded>
                      {heroLayers.filter((layer) => layer.id !== "garnish").map((layer) => (
                        <div key={layer.id} className={styles.ingredient} data-hero-layer={layer.id}>
                          <Image
                            src={layer.src}
                            width={layer.width}
                            height={layer.height}
                            alt={layer.id === "bun" ? "Pain au sésame du burger 212 Chicken" : "Poulet pané, cheddar, tomate et salade du burger 212 Chicken"}
                            sizes={artSizes}
                            quality={65}
                            loading="lazy"
                            className={styles.layer}
                            data-burger-image
                          />
                        </div>
                      ))}
                      <div className={styles.garnish} data-hero-layer="garnish">
                        {Array.from({ length: 4 }, (_, index) => (
                          <div key={index} className={`${styles.crumbGroup} ${styles[`crumbGroup${index}`]}`} data-burger-crumbs>
                            <Image
                              src={garnish.src} width={garnish.width} height={garnish.height}
                              alt="Éclats de panure autour du burger au poulet" sizes={artSizes} quality={65} loading="lazy"
                              className={styles.layer} data-burger-image
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button type="button" className={styles.burgerHit} data-burger-hit aria-label="Animer le burger" aria-controls="burger-scene" title="Cliquez pour faire claquer le burger" />
        </div>

        <div className={styles.cta}>
          <div className={styles.motionControls} data-burger-controls>
            <button type="button" className={styles.crunchButton} data-burger-toggle aria-controls="burger-scene" aria-pressed="true">
              <span className={styles.crunchIcon}><Expand size={18} aria-hidden="true" /></span>
              <span data-burger-label>Assembler le burger</span>
            </button>
            <span className={styles.controlDivider} aria-hidden="true" />
            <button type="button" className={styles.pauseButton} data-burger-pause aria-label="Mettre l’animation en pause" aria-pressed="false">
              <Pause size={15} data-pause-icon aria-hidden="true" />
              <Play size={15} data-play-icon aria-hidden="true" />
            </button>
          </div>
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
      </div>
    </section>
  );
}
