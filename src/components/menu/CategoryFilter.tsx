import { useEffect, useRef } from "react";

import styles from "./CategoryFilter.module.css";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface CategoryFilterProps {
  /** Accessible name of the button group. */
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (id: string) => void;
  showCounts?: boolean;
  scrollable?: boolean;
}

/** Toggle buttons that wrap at home; the full menu uses a compact, keyboard-scrollable strip. */
export function CategoryFilter({ label, options, value, onChange, showCounts = false, scrollable = false }: CategoryFilterProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollable) return;
    const group = groupRef.current;
    const active = group?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!group || !active) return;
    const outer = group.getBoundingClientRect();
    const inner = active.getBoundingClientRect();
    if (inner.left < outer.left || inner.right > outer.right) {
      group.scrollLeft += inner.left - outer.left - (outer.width - inner.width) / 2;
    }
  }, [scrollable, value]);
  return (
    <div ref={groupRef} role="group" aria-label={label} className={`${styles.group} ${scrollable ? styles.scrollable : ""}`}>
      {options.map((option) => {
        const pressed = option.id === value;
        const hasCount = showCounts && typeof option.count === "number";
        return (
          <button
            key={option.id}
            type="button"
            className={styles.pill}
            aria-pressed={pressed}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            {hasCount ? (
              <>
                <span className={styles.count} aria-hidden="true">
                  {option.count}
                </span>
                <span className="sr-only">
                  {` (${option.count} produit${option.count === 1 ? "" : "s"})`}
                </span>
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
