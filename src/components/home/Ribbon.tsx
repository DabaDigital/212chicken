import styles from "./Ribbon.module.css";

const WORDS = ["Crispy", "Juicy", "212 Chicken"];
const REPEAT = 5;

/**
 * Decorative slanted band linking the hero and the menu. Real text, hidden from assistive tech
 * (it repeats brand words and carries no information). It is static by default; on larger screens
 * PageMotion drifts it with the scroll position only, so no autoplaying motion needs a pause control.
 */
export function Ribbon() {
  return (
    <div className={styles.ribbon} aria-hidden="true" data-ribbon>
      <div className={styles.track} data-ribbon-track>
        {Array.from({ length: REPEAT }, (_, round) =>
          WORDS.map((word) => (
            <span key={`${round}-${word}`} className={styles.item}>
              {word}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
