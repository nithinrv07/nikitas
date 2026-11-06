"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { profile } from "@/content/site";

const AtriumScene = dynamic(() => import("@/experience/AtriumScene"), { ssr: false });

export function AtriumHero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hero-char", { yPercent: 110 });
      gsap
        .timeline({ delay: 0.3 })
        .to(".hero-veil", { opacity: 0, duration: 2.2, ease: "power2.inOut" })
        .to(".hero-char", { yPercent: 0, duration: 1.2, stagger: 0.045, ease: "power4.out" }, "-=1.6")
        .from(".hero-fade", { opacity: 0, y: 18, duration: 1, stagger: 0.12, ease: "power3.out" }, "-=0.7");
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <div className="absolute inset-0">
        <AtriumScene />
      </div>
      <div className="hero-veil pointer-events-none absolute inset-0 bg-midnight" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-midnight/40" />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-12 md:px-10 md:pb-16">
        <p className="hero-fade label flex items-center gap-3 text-platinum/80">
          <span className="text-crimson">G</span>
          <span className="h-px w-10 bg-concrete/60" />
          The Grand Atrium — The Living Archive
        </p>
        <h1 className="display mt-4 text-[22vw] leading-[0.82] md:text-[15vw]" aria-label={profile.name}>
          {profile.name.split("").map((c, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom" aria-hidden>
              <span className="hero-char inline-block">{c === " " ? " " : c}</span>
            </span>
          ))}
        </h1>
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="hero-fade display text-3xl italic md:text-5xl">{profile.tagline}</p>
            <p className="hero-fade mt-5 max-w-3xl text-sm leading-relaxed text-platinum/75 md:text-base">
              {profile.roles.join(". ")}.
            </p>
          </div>
          <div className="hero-fade pointer-events-auto flex flex-col gap-3 sm:flex-row">
            <Link
              href="/experience"
              className="label group flex items-center justify-between gap-6 bg-crimson px-6 py-4 transition-colors hover:bg-[#b81f33]"
            >
              <span>
                <span className="block text-[10px] text-platinum/70">01</span>
                Enter experience
              </span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="#directory"
              className="label group flex items-center justify-between gap-6 border border-platinum/30 bg-midnight/40 px-6 py-4 backdrop-blur transition-colors hover:border-platinum"
            >
              <span>
                <span className="block text-[10px] text-platinum/60">02</span>
                Explore portfolio
              </span>
              <span className="transition-transform group-hover:translate-y-1">↓</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
