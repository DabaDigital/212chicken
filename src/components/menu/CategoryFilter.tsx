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
}

/** Toggle buttons that wrap onto as many rows as needed: every option stays visible, no sideways scrolling. */
export function CategoryFilter({ label, options, value, onChange, showCounts = false }: CategoryFilterProps) {
  return (
    <div role="group" aria-label={label} className={styles.group}>
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
