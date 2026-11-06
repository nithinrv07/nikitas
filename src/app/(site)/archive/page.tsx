import type { Metadata } from "next";
import { ArchiveSearch } from "@/components/site/ArchiveSearch";

export const metadata: Metadata = { title: "Search the archive" };

export default function ArchivePage() {
  return (
    <section className="blueprint min-h-dvh pt-32 pb-24 md:pt-40">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <p className="label text-crimson">Index</p>
        <h1 className="display mt-4 text-[16vw] md:text-[9vw]">The Archive</h1>
        <p className="mt-4 max-w-xl text-platinum/70">
          Every exhibit and chapter in the building, searchable in one place.
        </p>
        <ArchiveSearch />
      </div>
    </section>
  );
}
