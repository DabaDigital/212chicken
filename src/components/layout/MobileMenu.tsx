"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { SocialIcon } from "@/components/ui/SocialIcon";
import { trapTabKey } from "@/components/ui/trapTabKey";
import type { SocialLink } from "@/lib/site";

import styles from "./MobileMenu.module.css";

export interface NavItem {
  href: string;
  label: string;
}

interface MobileMenuProps {
  items: NavItem[];
  pathname: string;
  socials: SocialLink[];
  logo: { src: string; width: number; height: number };
}

/**
 * Compact navigation for < 768px. A native modal <dialog> provides focus containment, an inert
 * page behind it and Escape handling; focus returns to the toggle when it closes.
 */
export function MobileMenu({ items, pathname, socials, logo }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const dialogId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      firstLinkRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Leaving the mobile layout while the menu is open (rotation, resize) closes it.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia("(min-width: 48rem)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open]);

  const handleDialogClose = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus({ preventScroll: true });
  }, []);

  const closeMenu = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <Menu size={30} strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">Ouvrir le menu</span>
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        className={styles.dialog}
        aria-label="Menu"
        onClose={handleDialogClose}
        onKeyDown={trapTabKey}
      >
        <div className={`container ${styles.top}`}>
          <Link href="/" className={styles.logoLink} onClick={closeMenu}>
            <Image src={logo.src} width={logo.width} height={logo.height} alt="212 Chicken — accueil" sizes="40px" className={styles.logo} />
          </Link>
          <button type="button" className={styles.close} onClick={closeMenu}>
            <X size={30} strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">Fermer le menu</span>
          </button>
        </div>

        <nav aria-label="Navigation principale" className={`container ${styles.nav}`}>
          <ul role="list" className={styles.list}>
            {items.map((item, index) => {
              const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={item.href}
                    className={styles.link}
                    aria-current={current ? "page" : undefined}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {socials.length ? (
          <ul role="list" className={`container ${styles.bottom}`}>
            {socials.map((social) => (
              <li key={social.id}>
                <a href={social.url} className={styles.social} target="_blank" rel="noopener noreferrer">
                  <SocialIcon id={social.id} size={22} />
                  <span>{social.label}</span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </dialog>
    </>
  );
}
