import type { Metadata } from "next";
import { chapters, entries, floors, profile } from "@/content/site";
import { PrintButton } from "@/components/site/PrintButton";

export const metadata: Metadata = { title: "Professional profile" };

export default function ProfilePage() {
  const confirmed = entries.filter((e) => !e.awaitingRecord);
  return (
    <section className="pt-28 pb-24 print:pt-0">
      <div className="no-print mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-between gap-4 px-5">
        <p className="label text-concrete">Printable profile — save as PDF from the print dialog</p>
        <div className="flex gap-3">
          {profile.profilePdf && (
            <a href={profile.profilePdf} download className="label border border-platinum/30 px-4 py-2 hover:border-crimson">
              Download PDF
            </a>
          )}
          <PrintButton />
        </div>
      </div>

      <article className="mx-auto max-w-3xl bg-platinum px-8 py-12 text-midnight shadow-2xl md:px-14 print:max-w-none print:shadow-none">
        <header className="border-b border-midnight/20 pb-8">
          <p className="label text-[#D7263D]">The Living Archive — Professional profile</p>
          <h1 className="display mt-4 text-7xl">{profile.name}</h1>
          <p className="display mt-2 text-2xl italic">{profile.tagline}</p>
          <p className="mt-4 text-sm">{profile.roles.join(" · ")}</p>
          {(profile.email || profile.location) && (
            <p className="mt-2 font-mono text-xs">{[profile.email, profile.location].filter(Boolean).join(" — ")}</p>
          )}
        </header>
        <section className="mt-8">
          <h2 className="label mb-3">Summary</h2>
          <p className="leading-relaxed">{profile.positioning} {profile.intro}</p>
        </section>
        <section className="mt-8">
          <h2 className="label mb-3">Career chapters</h2>
          <ol className="space-y-3">
            {chapters.map((c) => (
              <li key={c.id} className="grid grid-cols-[48px_1fr] gap-3 text-sm">
                <span className="display text-xl">{c.index}</span>
                <span>
                  <strong>{c.title}</strong>
                  {c.period && <span className="font-mono text-xs"> — {c.period}</span>}
                  <br />
                  {c.body}
                </span>
              </li>
            ))}
          </ol>
        </section>
        <section className="mt-8">
          <h2 className="label mb-3">Divisions</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {floors.filter((f) => f.id !== "atrium" && f.id !== "exchange").map((f) => (
              <li key={f.id}>
                <strong>{f.division}</strong> — {f.description}
              </li>
            ))}
          </ul>
        </section>
        {confirmed.length > 0 && (
          <section className="mt-8">
            <h2 className="label mb-3">Selected work</h2>
            <ul className="space-y-2 text-sm">
              {confirmed.map((e) => (
                <li key={e.id}>
                  <strong>{e.title}</strong> {e.role && `— ${e.role}`} {e.period && `(${e.period})`}: {e.summary}
                </li>
              ))}
            </ul>
          </section>
        )}
        {profile.socials.some((s) => s.url) && (
          <section className="mt-8">
            <h2 className="label mb-3">Links</h2>
            <ul className="font-mono text-xs">
              {profile.socials.filter((s) => s.url).map((s) => (
                <li key={s.url}>{s.label}: {s.url}</li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </section>
  );
}
