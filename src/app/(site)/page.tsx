import Link from "next/link";
import { chapters, floorById, floors, profile } from "@/content/site";
import { AtriumHero } from "@/components/site/AtriumHero";
import { Reveal } from "@/components/site/Reveal";

export default function HomePage() {
  const upper = [...floors].filter((f) => f.id !== "atrium").reverse();
  return (
    <>
      <AtriumHero />

      {/* Positioning */}
      <section className="blueprint border-b border-line">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-24 md:grid-cols-[280px_1fr] md:px-10 md:py-36">
          <p className="label text-concrete">The premise</p>
          <div>
            <Reveal>
              <p className="display text-4xl leading-[1.08] md:text-7xl">
                Not a universe. <span className="text-concrete">A building</span> — one floor for every chapter of a career across{" "}
                <em className="text-crimson">sports, gaming and technology.</em>
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-10 max-w-2xl text-lg leading-relaxed text-platinum/70">{profile.intro}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Building directory as an architectural section drawing */}
      <section id="directory" className="scroll-mt-16 border-b border-line">
        <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label text-concrete">Building directory</p>
              <h2 className="display mt-4 text-6xl md:text-8xl">Seven floors</h2>
            </div>
            <p className="label max-w-xs text-concrete">Each floor is a page. Each page is a floor. Choose either way in.</p>
          </div>
          <ol className="mt-14 border-t border-line">
            {upper.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.04}>
                <li className="border-b border-line">
                  <Link
                    href={f.route}
                    className="group grid grid-cols-[56px_1fr_auto] items-center gap-4 py-6 md:grid-cols-[96px_1.2fr_1fr_auto] md:gap-8 md:py-8"
                  >
                    <span className="display text-4xl text-concrete transition-colors group-hover:text-crimson md:text-6xl">{f.level}</span>
                    <span>
                      <span className="display block text-4xl transition-transform duration-700 ease-arch group-hover:translate-x-3 md:text-6xl">
                        {f.name}
                      </span>
                      <span className="label mt-2 block text-concrete md:hidden">{f.division}</span>
                    </span>
                    <span className="hidden text-sm leading-relaxed text-platinum/60 md:block">
                      <span className="label mb-2 block text-platinum/80">{f.division}</span>
                      {f.description}
                    </span>
                    <span className="label text-concrete transition-colors group-hover:text-platinum">→</span>
                  </Link>
                </li>
              </Reveal>
            ))}
            <li className="grid grid-cols-[56px_1fr] items-center gap-4 py-6 md:grid-cols-[96px_1fr] md:gap-8">
              <span className="display text-4xl text-crimson md:text-6xl">G</span>
              <span className="label text-concrete">You are here — {floorById("atrium").name}</span>
            </li>
          </ol>
        </div>
      </section>

      {/* Story strip */}
      <section className="border-b border-line bg-graphite/40">
        <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10">
          <p className="label text-concrete">Every chapter builds the next</p>
          <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {chapters.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.05} className="bg-midnight">
                <Link href={floorById(c.division).route} className="group block h-full p-6">
                  <p className="display text-5xl text-platinum/25 transition-colors group-hover:text-crimson">{c.index}</p>
                  <p className="display mt-10 text-3xl">{c.title}</p>
                  <p className="label mt-3 text-concrete">{floorById(c.division).name}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <Link href="/about" className="label mt-10 inline-block border border-platinum/30 px-5 py-3 hover:border-crimson">
            Walk the full timeline →
          </Link>
        </div>
      </section>

      {/* Two ways in */}
      <section className="grid md:grid-cols-2">
        <Link href="/experience" className="group relative overflow-hidden border-b border-line p-10 md:border-r md:p-16">
          <p className="label text-crimson">01 — Playable</p>
          <p className="display mt-6 text-6xl md:text-7xl">Enter the building</p>
          <p className="mt-4 max-w-md text-platinum/70">
            Walk the floors in 3D. Keyboard, mouse or touch. Every exhibit opens; every elevator works.
          </p>
          <span className="label mt-10 inline-block bg-crimson px-5 py-3">Enter experience →</span>
        </Link>
        <Link href="/archive" className="group relative overflow-hidden border-b border-line p-10 md:p-16">
          <p className="label text-concrete">02 — Conventional</p>
          <p className="display mt-6 text-6xl md:text-7xl">Search the archive</p>
          <p className="mt-4 max-w-md text-platinum/70">Every venture, project and chapter on one searchable index.</p>
          <span className="label mt-10 inline-block border border-platinum/30 px-5 py-3 group-hover:border-crimson">Open archive →</span>
        </Link>
      </section>
    </>
  );
}
