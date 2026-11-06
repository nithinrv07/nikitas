"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { chapters, entries, floorById, floors, type Division } from "@/content/site";
import { EntryCard } from "./blocks";

export function ArchiveSearch() {
  const [q, setQ] = useState("");
  const [division, setDivision] = useState<Division | "all">("all");

  const norm = q.trim().toLowerCase();
  const match = (text: string) => !norm || text.toLowerCase().includes(norm);

  const results = useMemo(
    () =>
      entries.filter(
        (e) =>
          (division === "all" || e.division === division) &&
          match([e.title, e.kind, e.summary, e.role, e.period, ...e.tags].join(" ")),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [norm, division],
  );
  const chapterResults = chapters.filter(
    (c) => (division === "all" || c.division === division) && match(`${c.title} ${c.body} ${c.period}`),
  );

  const filters = floors.filter((f) => f.id !== "atrium" && f.id !== "exchange");

  return (
    <div className="mt-12">
      <label className="block">
        <span className="sr-only">Search the archive</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search — freestyle, esports, ventures…"
          className="display w-full border-b border-platinum/30 bg-transparent pb-4 text-4xl outline-none placeholder:text-concrete/60 focus:border-crimson md:text-6xl"
        />
      </label>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by floor">
        <button
          type="button"
          onClick={() => setDivision("all")}
          aria-pressed={division === "all"}
          className={`label border px-3 py-2 ${division === "all" ? "border-crimson bg-crimson" : "border-line text-concrete hover:text-platinum"}`}
        >
          All floors
        </button>
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setDivision(f.id)}
            aria-pressed={division === f.id}
            className={`label border px-3 py-2 ${division === f.id ? "border-crimson bg-crimson" : "border-line text-concrete hover:text-platinum"}`}
          >
            {f.level} {f.name}
          </button>
        ))}
      </div>

      <p className="label mt-10 text-concrete" aria-live="polite">
        {results.length + chapterResults.length} result{results.length + chapterResults.length === 1 ? "" : "s"}
      </p>

      {chapterResults.length > 0 && (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {chapterResults.map((c) => (
            <li key={c.id}>
              <Link href={floorById(c.division).route} className="group grid grid-cols-[60px_1fr_auto] items-baseline gap-4 py-4">
                <span className="display text-3xl text-concrete">{c.index}</span>
                <span className="display text-3xl group-hover:text-crimson">{c.title}</span>
                <span className="label text-concrete">Chapter · {floorById(c.division).name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((e) => (
          <EntryCard key={e.id} entry={e} />
        ))}
      </div>
      {results.length + chapterResults.length === 0 && (
        <p className="mt-8 text-concrete">Nothing in the archive matches “{q}”.</p>
      )}
    </div>
  );
}
