import type { Metadata } from "next";
import { DivisionPage } from "@/components/site/DivisionPage";

export const metadata: Metadata = { title: "Sports — The Arena" };

export default function Page() {
  return <DivisionPage division="arena" entriesLabel="Sport" />;
}
