import Link from "next/link";
import Image from "next/image";
import type {
  Achievement,
  Chapter,
  Entry,
  FloorDef,
  MediaImage,
  MediaVideo,
} from "@/content/site";
import { floorById } from "@/content/site";
import { Reveal } from "./Reveal";

export function FloorHeader({ floor }: { floor: FloorDef }) {
  return (
    <section className="blueprint grain relative overflow-hidden border-b border-line pt-32 pb-16 md:pt-44 md:pb-24">
      <div
        aria-hidden
        className="display pointer-events-none absolute -right-6 -bottom-10 select-none text-[38vw] leading-none text-platinum/[0.035] md:text-[26vw]"
      >
        {floor.level}
      </div>
      <div className="relative mx-auto max-w-[1600px] px-5 md:px-10">
        <Reveal>
          <p className="label flex items-center gap-3 text-concrete">
            <span className="text-crimson">Floor {floor.level}</span>
            <span className="h-px w-10 bg-concrete/50" />
            {floor.division}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="display mt-6 text-[17vw] md:text-[10vw]">{floor.name}</h1>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-2xl text-lg leading-relaxed text-platinum/80 md:text-xl">
              <span className="display italic text-2xl text-platinum md:text-3xl">{floor.statement}</span>{" "}
              {floor.description}
            </p>
            <Link
              href={`/experience?floor=${floor.id}`}
              className="label inline-flex items-center gap-3 self-start border border-platinum/30 px-5 py-3 hover:border-crimson hover:bg-crimson md:self-end"
            >
              Visit this floor in 3D →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Section({
  label,
  title,
  children,
  id,
}: {
  label: string;
  title?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="border-b border-line">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-16 md:grid-cols-[280px_1fr] md:px-10 md:py-24">
        <div>
          <p className="label text-concrete">{label}</p>
          {title && <h2 className="display mt-4 text-5xl md:text-6xl">{title}</h2>}
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

/** Shown wherever a real record has not been supplied yet. Never invents data. */
export function AwaitingPlate({ what }: { what: string }) {
  return (
    <div className="flex items-center gap-4 border border-dashed border-concrete/40 px-5 py-6">
      <span className="h-2 w-2 shrink-0 bg-concrete/60" />
      <p className="text-sm text-concrete">
        <span className="label mr-2 text-platinum/70">Awaiting record</span>
        {what} will be displayed here once added to <code className="font-mono text-xs">src/content/site.ts</code>.
      </p>
    </div>
  );
}

export function EntryCard({ entry, index }: { entry: Entry; index?: number }) {
  const floor = floorById(entry.division);
  const body = (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden border border-line bg-graphite/60 p-6 transition-colors duration-500 hover:border-platinum/40">
      <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-crimson transition-transform duration-700 ease-arch group-hover:scale-x-100" />
      <div>
        <div className="label flex justify-between text-concrete">
          <span>{entry.kind}</span>
          <span>
            {floor.level}
            {index !== undefined ? ` · ${String(index + 1).padStart(2, "0")}` : ""}
          </span>
        </div>
        <h3 className="display mt-8 text-4xl">{entry.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-platinum/70">{entry.summary}</p>
        {(entry.role || entry.period) && (
          <p className="label mt-4 text-platinum/80">
            {[entry.role, entry.period].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {entry.tags.map((t) => (
          <span key={t} className="label border border-line px-2 py-1 text-concrete">
            {t}
          </span>
        ))}
        {entry.awaitingRecord && (
          <span className="label ml-auto text-concrete/70" title="Details to be added in site.ts">
            ◌ details pending
          </span>
        )}
        {entry.link && <span className="label ml-auto text-crimson">Open ↗</span>}
      </div>
    </article>
  );
  return entry.link ? (
    <a href={entry.link} target="_blank" rel="noreferrer" className="block h-full">
      {body}
    </a>
  ) : (
    body
  );
}

export function EntryGrid({ entries }: { entries: Entry[] }) {
  if (!entries.length) return <AwaitingPlate what="Projects" />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((e, i) => (
        <Reveal key={e.id} delay={i * 0.05}>
          <EntryCard entry={e} index={i} />
        </Reveal>
      ))}
    </div>
  );
}

export function ChapterList({ chapters }: { chapters: Chapter[] }) {
  return (
    <ol className="relative border-l border-line">
      {chapters.map((c, i) => (
        <Reveal key={c.id} delay={i * 0.04}>
          <li className="relative grid gap-3 pb-12 pl-8 md:grid-cols-[120px_1fr] md:gap-8 md:pl-12">
            <span className="absolute top-2 -left-[5px] h-[9px] w-[9px] bg-crimson" />
            <div>
              <p className="display text-5xl text-platinum/30">{c.index}</p>
              <p className="label mt-2 text-concrete">{c.period || "Date — to add"}</p>
            </div>
            <div>
              <h3 className="display text-4xl md:text-5xl">{c.title}</h3>
              <p className="mt-3 max-w-2xl leading-relaxed text-platinum/75">{c.body}</p>
              <Link
                href={floorById(c.division).route}
                className="label mt-4 inline-block text-concrete hover:text-crimson"
              >
                → {floorById(c.division).name}
              </Link>
            </div>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

export function Achievements({ items }: { items: Achievement[] }) {
  if (!items.length) return <AwaitingPlate what="Verified achievements" />;
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((a) => (
        <li key={a.title} className="grid gap-2 py-6 md:grid-cols-[1fr_2fr_auto] md:items-baseline">
          <h3 className="display text-3xl">{a.title}</h3>
          <p className="text-platinum/70">{a.detail}</p>
          <p className="label text-concrete">{a.period}</p>
        </li>
      ))}
    </ul>
  );
}

export function Gallery({ images }: { images?: MediaImage[] }) {
  if (!images?.length) return <AwaitingPlate what="Photographs" />;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {images.map((img, i) => (
        <figure
          key={img.src}
          className={`group relative overflow-hidden bg-graphite ${i % 5 === 0 ? "col-span-2 row-span-2" : ""}`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            width={1200}
            height={900}
            sizes="(min-width: 768px) 33vw, 50vw"
            className="h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0"
          />
          {img.caption && (
            <figcaption className="label absolute inset-x-0 bottom-0 bg-midnight/80 p-3 text-platinum/80">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function embedUrl(v: MediaVideo) {
  if (v.youtubeId) return `https://www.youtube-nocookie.com/embed/${v.youtubeId}`;
  return v.url ?? "";
}

export function Videos({ videos }: { videos?: MediaVideo[] }) {
  if (!videos?.length) return <AwaitingPlate what="Videos" />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {videos.map((v) => (
        <figure key={v.title} className="border border-line bg-graphite">
          <div className="aspect-video">
            <iframe
              src={embedUrl(v)}
              title={v.title}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <figcaption className="label p-4 text-platinum/80">{v.title}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function NextFloor({ floor }: { floor: FloorDef }) {
  return (
    <Link href={floor.route} className="group block border-b border-line">
      <div className="mx-auto flex max-w-[1600px] items-end justify-between gap-6 px-5 py-16 md:px-10 md:py-24">
        <div>
          <p className="label text-concrete">Take the elevator — Floor {floor.level}</p>
          <p className="display mt-4 text-6xl transition-colors group-hover:text-crimson md:text-8xl">
            {floor.name}
          </p>
        </div>
        <span className="display text-6xl text-concrete transition-transform duration-700 ease-arch group-hover:-translate-y-3 md:text-8xl">
          ↑
        </span>
      </div>
    </Link>
  );
}
