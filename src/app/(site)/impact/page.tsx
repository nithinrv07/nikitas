import type { Metadata } from "next";
import { DivisionPage } from "@/components/site/DivisionPage";

export const metadata: Metadata = { title: "Impact — The Assembly" };

export default function Page() {
  return <DivisionPage division="assembly" entriesLabel="Leadership & partnerships" showVideos={false} />;
}
