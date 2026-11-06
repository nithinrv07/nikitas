import type { Metadata } from "next";
import { DivisionPage } from "@/components/site/DivisionPage";

export const metadata: Metadata = { title: "Ventures — The Foundry" };

export default function Page() {
  return <DivisionPage division="foundry" entriesLabel="Ventures" showVideos={false} />;
}
