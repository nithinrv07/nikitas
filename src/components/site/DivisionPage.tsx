import {
  achievements,
  chaptersFor,
  entriesFor,
  floorById,
  floors,
  galleries,
  videos,
  type Division,
} from "@/content/site";
import {
  Achievements,
  ChapterList,
  EntryGrid,
  FloorHeader,
  Gallery,
  NextFloor,
  Section,
  Videos,
} from "./blocks";

export function DivisionPage({
  division,
  entriesLabel = "Projects",
  showVideos = true,
  children,
}: {
  division: Division;
  entriesLabel?: string;
  showVideos?: boolean;
  children?: React.ReactNode;
}) {
  const floor = floorById(division);
  const idx = floors.findIndex((f) => f.id === division);
  const next = floors[(idx + 1) % floors.length];
  const chapters = chaptersFor(division);

  return (
    <>
      <FloorHeader floor={floor} />
      {chapters.length > 0 && (
        <Section label="In the story" title="Chapters">
          <ChapterList chapters={chapters} />
        </Section>
      )}
      {children}
      <Section label="Exhibits" title={entriesLabel}>
        <EntryGrid entries={entriesFor(division)} />
      </Section>
      <Section label="Records" title="Achievements">
        <Achievements items={achievements.filter((a) => a.division === division)} />
      </Section>
      <Section label="Image archive" title="Gallery">
        <Gallery images={galleries[division]} />
      </Section>
      {showVideos && (
        <Section label="Screening room" title="Video">
          <Videos videos={videos[division]} />
        </Section>
      )}
      <NextFloor floor={next} />
    </>
  );
}
