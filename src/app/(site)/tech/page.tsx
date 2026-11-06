import type { Metadata } from "next";
import { DivisionPage } from "@/components/site/DivisionPage";

export const metadata: Metadata = { title: "Tech & Game Dev — The Sandbox" };

export default function Page() {
  return <DivisionPage division="sandbox" entriesLabel="Prototypes" />;
}
