import type { Metadata } from "next";
import { DivisionPage } from "@/components/site/DivisionPage";

export const metadata: Metadata = { title: "Esports & Creator — Control Room" };

export default function Page() {
  return <DivisionPage division="control" entriesLabel="Competition & creation" />;
}
