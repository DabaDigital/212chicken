"use client";

import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { matchesSearch } from "@/lib/format";
import type { MenuGroup, SearchableMenuItem } from "@/lib/menu-types";

import { CategoryFilter } from "./CategoryFilter";
import styles from "./MenuExplorer.module.css";
import { ProductCard } from "./ProductCard";
import { ProductDialog } from "./ProductDialog";
import { useProductDialog } from "./useProductDialog";

// The first photo loads eagerly with high priority (the LCP element on phones); the rest stay lazy.
const CARD_SIZES =
  "(min-width: 1536px) 340px, (min-width: 1280px) 23vw, (min-width: 768px) 31vw, (min-width: 360px) 46vw, 90vw";
const ALL = "all";

interface MenuExplorerProps {
  groups: MenuGroup[];
  totalProducts: number;
  orderingUrl: string | null;
}

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`;

/** Reads `?categorie=` after hydration so the page itself stays statically rendered. */
function CategoryParamSync({ onCategory }: { onCategory: (id: string) => void }) {
  const value = useSearchParams().get("categorie");
  useEffect(() => {
    onCategory(value ?? ALL);
  }, [value, onCategory]);
  return null;
}

export function MenuExplorer({ groups, totalProducts, orderingUrl }: MenuExplorerProps) {
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const { openId, open, close } = useProductDialog();

  const categoryIds = useMemo(() => new Set(groups.map((group) => group.id)), [groups]);
  const itemsById = useMemo(
    () => new Map<string, SearchableMenuItem>(groups.flatMap((group) => group.items.map((item) => [item.id, item]))),
    [groups],
  );
  const options = useMemo(
    () => [
      { id: ALL, label: "Tout", count: totalProducts },
      ...groups.map(({ id, label, count }) => ({ id, label, count })),
    ],
    [groups, totalProducts],
  );

  const visibleGroups = useMemo(() => {
    const scoped = category === ALL ? groups : groups.filter((group) => group.id === category);
    return scoped
      .map((group) => ({ ...group, items: group.items.filter((item) => matchesSearch(item.searchText, query)) }))
      .filter((group) => group.items.length > 0);
  }, [groups, category, query]);

  const resultCount = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);
  const visibleItems = visibleGroups.flatMap((group) => group.items);
  const activeLabel = category === ALL ? null : (options.find((option) => option.id === category)?.label ?? null);
  const trimmedQuery = query.trim();

  const status = trimmedQuery
    ? `${plural(resultCount, "résultat")} pour « ${trimmedQuery} »${activeLabel ? ` dans ${activeLabel}` : ""}`
    : `${plural(resultCount, "produit")}${activeLabel ? ` — ${activeLabel}` : ""}`;

  const selectCategory = useCallback(
    (id: string) => {
      const next = categoryIds.has(id) ? id : ALL;
      setCategory(next);
      const url = new URL(window.location.href);
      if (next === ALL) url.searchParams.delete("categorie");
      else url.searchParams.set("categorie", next);
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      // A sticky filter can be used far down the grid. Keep the first new result in view.
      const controls = controlsRef.current;
      if (controls && controls.getBoundingClientRect().top < 0) {
        window.scrollTo({ top: window.scrollY + controls.getBoundingClientRect().top, behavior: "instant" });
      }
    },
    [categoryIds],
  );

  const syncFromUrl = useCallback(
    (id: string) => {
      setCategory(categoryIds.has(id) ? id : ALL);
    },
    [categoryIds],
  );

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const openItem = openId ? (itemsById.get(openId) ?? null) : null;

  return (
    <div className={styles.explorer}>
      <Suspense fallback={null}>
        <CategoryParamSync onCategory={syncFromUrl} />
      </Suspense>

      <div ref={controlsRef} className={styles.controls}>
        <form role="search" className={styles.search} onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="menu-search" className={styles.searchLabel}>
            Rechercher sur la carte
          </label>
          <div className={styles.searchField}>
            <Search className={styles.searchIcon} size={20} strokeWidth={2.25} aria-hidden="true" />
            <input
              ref={inputRef}
              id="menu-search"
              className={styles.input}
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Burger, tenders, tiramisu…"
              autoComplete="off"
              enterKeyHint="search"
              spellCheck={false}
            />
            {query ? (
              <button type="button" className={styles.clear} onClick={clearSearch}>
                <X size={18} strokeWidth={2.25} aria-hidden="true" />
                <span className="sr-only">Effacer la recherche</span>
              </button>
            ) : null}
          </div>
        </form>

      </div>

      <div className={styles.categoryBar}>
        <CategoryFilter label="Catégories" options={options} value={category} onChange={selectCategory} showCounts />
      </div>

      <p className={styles.status} role="status">
        {status}
      </p>

      {visibleItems.length > 0 ? (
        <section aria-label={activeLabel ?? "Tous les produits"}>
          <h2 className="sr-only">{activeLabel ?? "Tous les produits"}</h2>
          <ul role="list" className={styles.grid}>
            {visibleItems.map((item, index) => (
              <li key={item.id}>
                <ProductCard
                  item={item}
                  sizes={CARD_SIZES}
                  onOpen={open}
                  showCategory
                  // The first photo is the page's LCP element on phones; the others stay lazy.
                  priority={index === 0 ? "high" : undefined}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Aucun produit ne correspond à votre recherche.</p>
          <p className={styles.emptyText}>
            Essayez un autre mot{activeLabel ? " ou cherchez dans toute la carte" : ""}.
          </p>
          <div className={styles.emptyActions}>
            <button type="button" className={styles.emptyButton} onClick={() => { selectCategory(ALL); clearSearch(); }}>
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      <ProductDialog item={openItem} orderingUrl={orderingUrl} onClose={close} />
    </div>
  );
}
