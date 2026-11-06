import type { Metadata } from "next";
import Link from "next/link";
import { chapters, floorById, floors, profile } from "@/content/site";
import { ChapterList, FloorHeader, NextFloor, Section } from "@/components/site/blocks";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = { title: "About — Memory Archive" };

export default function AboutPage() {
  const floor = floorById("memory");
  return (
    <>
      <FloorHeader floor={floor} />
      <Section label="Profile" title={profile.name}>
        <Reveal>
          <p className="display max-w-4xl text-3xl leading-[1.15] md:text-5xl">{profile.positioning}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-platinum/75">{profile.intro}</p>
        </Reveal>
        <ul className="mt-10 flex flex-wrap gap-2">
          {profile.roles.map((r) => (
            <li key={r} className="label border border-line px-3 py-2 text-platinum/80">
              {r}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/profile" className="label bg-crimson px-5 py-3 hover:bg-crimson/80">
            Download professional profile
          </Link>
          <Link href="/contact" className="label border border-platinum/30 px-5 py-3 hover:border-crimson">
            Get in touch
          </Link>
        </div>
      </Section>
      <Section label="The physical timeline" title="Seven chapters">
        <ChapterList chapters={chapters} />
      </Section>
      <NextFloor floor={floors[2]} />
    </>
  );
}
