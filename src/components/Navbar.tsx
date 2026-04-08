"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

import { useCart } from "@/components/cart/CartProvider";
import BrandMark from "@/components/BrandMark";
import type { LandingDictionary } from "@/lib/i18n";

type NavbarProps = {
  content: LandingDictionary["navbar"];
};

type NavLink = NavbarProps["content"]["links"][number];

export default function Navbar({ content }: NavbarProps) {
  const { itemCount } = useCart();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopOpenMenu, setDesktopOpenMenu] = useState<string | null>(null);
  const [mobileOpenMenu, setMobileOpenMenu] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const navLinks = content.links.filter((link) => link.href !== "/account" && link.href !== "/subscriptions");

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!navContainerRef.current?.contains(event.target as Node)) {
        setDesktopOpenMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopOpenMenu(null);
        setMobileOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setMobileOpenMenu(null);
    setDesktopOpenMenu(null);
  };

  const getMenuId = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

  const renderDesktopLink = (link: NavLink) => {
    if (link.children) {
      const isOpen = desktopOpenMenu === link.name;
      const menuId = getMenuId(link.name);

      return (
        <div key={link.name} className="relative">
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              aria-label={link.name}
              onClick={() => setDesktopOpenMenu((current) => (current === link.name ? null : link.name))}
              className="whitespace-nowrap text-[13px] font-medium tracking-[0.02em] text-[var(--color-dark)] transition-colors hover:text-[var(--color-primary)]"
            >
              {link.name}
            </button>

            <button
              type="button"
              aria-label={`${link.name} menu`}
              aria-expanded={isOpen}
              aria-haspopup="true"
              aria-controls={`desktop-panel-${menuId}`}
              onClick={() => setDesktopOpenMenu((current) => (current === link.name ? null : link.name))}
              className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-medium tracking-[0.02em] transition-colors hover:text-[var(--color-primary)] focus:outline-none focus-visible:text-[var(--color-primary)]"
            >
              <svg
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {isOpen && (
            <div
              id={`desktop-panel-${menuId}`}
              className="absolute left-1/2 top-full mt-4 w-56 -translate-x-1/2 rounded-3xl border border-[var(--color-primary-light)] bg-[var(--color-cream)]/95 p-3 shadow-xl backdrop-blur-md"
            >
              <div className="space-y-1">
                {link.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    onClick={() => setDesktopOpenMenu(null)}
                    className="block rounded-2xl px-4 py-2.5 text-sm text-[var(--color-dark)] transition-colors hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:bg-[var(--color-primary-pale)] focus-visible:text-[var(--color-primary)]"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (!link.href) {
      return null;
    }

    return (
      <Link
        key={link.name}
        href={link.href}
        onClick={() => setDesktopOpenMenu(null)}
        className={link.emphasis
          ? "whitespace-nowrap rounded-full bg-[var(--color-primary)] px-4 py-2 text-[13px] font-medium tracking-[0.02em] text-white transition-all hover:scale-105 hover:brightness-95"
          : "whitespace-nowrap text-[13px] font-medium tracking-[0.02em] transition-colors hover:text-[var(--color-primary)]"
        }
      >
        {link.name}
      </Link>
    );
  };

  const renderMobileLink = (link: NavLink) => {
    if (link.children) {
      const isOpen = mobileOpenMenu === link.name;
      const menuId = getMenuId(link.name);

      return (
        <div key={link.name} className="rounded-2xl border border-[var(--color-primary-light)]/60 bg-white/60 px-2 py-2">
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <button
              type="button"
              aria-label={link.name}
              onClick={() => setMobileOpenMenu((current) => (current === link.name ? null : link.name))}
              className="text-base font-medium text-[var(--color-dark)] transition-colors hover:text-[var(--color-primary)]"
            >
              {link.name}
            </button>

            <button
              type="button"
              aria-label={`${link.name} menu`}
              aria-expanded={isOpen}
              aria-haspopup="true"
              aria-controls={`mobile-panel-${menuId}`}
              onClick={() => setMobileOpenMenu((current) => (current === link.name ? null : link.name))}
              className="rounded-full p-1 text-[var(--color-dark)] transition-colors hover:text-[var(--color-primary)]"
            >
              <svg
                className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {isOpen && (
            <div id={`mobile-panel-${menuId}`} className="mt-2 space-y-1 border-t border-[var(--color-primary-light)]/70 px-2 pt-3">
              {link.children.map((child) => (
                <Link
                  key={child.name}
                  href={child.href}
                  onClick={closeAllMenus}
                  className="block rounded-xl px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (!link.href) {
      return null;
    }

    return (
      <Link
        key={link.name}
        href={link.href}
        onClick={closeAllMenus}
        className={link.emphasis
          ? "block rounded-full bg-[var(--color-primary)] px-5 py-3 text-center text-base font-medium text-white transition-transform hover:scale-[1.02]"
          : "block rounded-xl p-3 text-base font-medium transition-colors hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]"
        }
      >
        {link.name}
      </Link>
    );
  };

  return (
    <header
      className="fixed top-0 w-full z-50 bg-[var(--color-cream)]/95 py-3 shadow-sm backdrop-blur-md transition-all duration-300"
    >
      <div ref={navContainerRef} className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center border-b border-[var(--color-primary-pale)] px-0 py-2 transition-all duration-300">
          <div className="flex flex-col items-start">
            <BrandMark tagline={content.brandTagline} />
          </div>

          <nav aria-label={content.ariaLabel} className="hidden xl:flex items-center gap-3 2xl:gap-4">
            {navLinks.map(renderDesktopLink)}
            <Link
              href="/cart"
              aria-label={content.cartAriaLabel}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-primary-light)] bg-white text-[var(--color-dark)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2m0 0L7 13h10l2-8H5.4M7 13l-1 5h13M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            </Link>
            {session?.user ? (
              <Link
                href="/account"
                aria-label={content.cartLabel}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-primary-light)] bg-white text-[var(--color-dark)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] overflow-hidden"
              >
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
                ) : (
                  <span className="text-xs font-bold text-[var(--color-primary)]">
                    {(session.user.name ?? session.user.email ?? "?")[0].toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label={content.links.find((l) => l.href === "/account")?.name ?? "Mi Cuenta"}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-primary-light)] bg-white text-[var(--color-dark)] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </nav>

          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? content.closeMenuLabel : content.openMenuLabel}
            className="text-[var(--color-dark)] xl:hidden"
            onClick={() => {
              setMobileMenuOpen((current) => !current);
              if (mobileMenuOpen) {
                setMobileOpenMenu(null);
              }
            }}
          >
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full border-t border-[var(--color-primary-pale)] bg-[var(--color-cream)] shadow-lg xl:hidden">
          <div className="flex flex-col space-y-3 px-4 py-4">
            {navLinks.map(renderMobileLink)}
            <Link
              href="/cart"
              onClick={closeAllMenus}
              aria-label={content.cartAriaLabel}
              className="flex items-center justify-between rounded-xl border border-[var(--color-primary-light)] bg-white px-4 py-3 text-base font-medium text-[var(--color-dark)]"
            >
              <span className="inline-flex items-center gap-3">
                <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2m0 0L7 13h10l2-8H5.4M7 13l-1 5h13M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </span>
              <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-[var(--color-primary-pale)] px-2 py-0.5 text-sm font-semibold text-[var(--color-primary)]">
                {itemCount}
              </span>
            </Link>
            {session?.user ? (
              <div className="flex items-center justify-between rounded-xl border border-[var(--color-primary-light)] bg-white px-4 py-3">
                <Link href="/account" onClick={closeAllMenus} className="inline-flex items-center gap-3 text-base font-medium text-[var(--color-dark)]">
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="h-7 w-7 rounded-full object-cover" aria-hidden="true" />
                  ) : (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                      {(session.user.name ?? session.user.email ?? "?")[0].toUpperCase()}
                    </span>
                  )}
                  <span className="truncate max-w-[140px]">{session.user.name ?? session.user.email}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => { signOut({ redirectTo: "/" }); closeAllMenus(); }}
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={closeAllMenus}
                aria-label={content.links.find((l) => l.href === "/account")?.name ?? "Mi Cuenta"}
                className="flex items-center justify-center rounded-xl border border-[var(--color-primary-light)] bg-white p-3 text-[var(--color-dark)] transition-colors hover:bg-[var(--color-primary-pale)] hover:text-[var(--color-primary)]"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
