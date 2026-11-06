"use client";

import dynamic from "next/dynamic";

// Three.js is only loaded on this route, and only in the browser.
const Experience = dynamic(() => import("@/experience/Experience"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 grid place-items-center bg-midnight">
      <p className="label animate-pulse text-concrete">Opening the archive…</p>
    </div>
  ),
});

export function ExperienceLoader() {
  return <Experience />;
}
