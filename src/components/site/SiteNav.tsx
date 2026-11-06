"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { floors, profile } from "@/content/site";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`no-print fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? "bg-midnight/90 backdrop-blur-md border-b border-line" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label={`${profile.name} — home`}>
          <span className="grid h-8 w-8 place-items-center border border-platinum/40 font-mono text-[10px] tracking-widest">
            {profile.monogram}
          </span>
          <span className="label hidden text-platinum/80 sm:inline">The Living Archive</span>
        </Link>

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {floors.map((f) => {
              const active = f.route === "/" ? pathname === "/" : pathname.startsWith(f.route);
              return (
                <li key={f.id}>
                  <Link
                    href={f.route}
                    className={`label relative px-3 py-2 transition-colors ${
                      active ? "text-platinum" : "text-concrete hover:text-platinum"
                    }`}
                  >
                    {f.navLabel}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-3 -bottom-0.5 h-px bg-crimson"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/archive"
            className="label hidden px-3 py-2 text-concrete hover:text-platinum md:inline"
          >
            Search
          </Link>
          <Link
            href="/experience"
            className="label hidden border border-platinum/30 px-4 py-2 text-platinum transition-colors hover:border-crimson hover:bg-crimson sm:inline"
          >
            Enter 3D
          </Link>
          <button
            type="button"
            className="label border border-platinum/30 px-3 py-2 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Floors"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Floors"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-line xl:hidden"
          >
            <ul className="mx-auto max-w-[1600px] px-5 py-4 md:px-10">
              {[...floors].reverse().map((f) => (
                <li key={f.id} className="border-b border-line last:border-0">
                  <Link href={f.route} className="flex items-baseline gap-4 py-3">
                    <span className="label w-8 text-crimson">{f.level}</span>
                    <span className="display text-3xl">{f.navLabel}</span>
                    <span className="label ml-auto hidden text-concrete sm:inline">{f.name}</span>
                  </Link>
                </li>
              ))}
              <li className="flex gap-3 pt-4">
                <Link href="/archive" className="label flex-1 border border-line px-4 py-3 text-center">
                  Search archive
                </Link>
                <Link href="/experience" className="label flex-1 bg-crimson px-4 py-3 text-center">
                  Enter 3D
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
