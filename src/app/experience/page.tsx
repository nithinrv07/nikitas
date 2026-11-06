import type { Metadata } from "next";
import { ExperienceLoader } from "./ExperienceLoader";

export const metadata: Metadata = {
  title: "Enter the building",
  description: "Explore Nikita S.'s career as an interactive 3D building.",
};

export default function ExperiencePage() {
  return <ExperienceLoader />;
}
