import Link from "next/link";
import { floors, profile } from "@/content/site";
import { SocialLinks } from "./SocialLinks";
import { Year } from "./Year";

export function Footer() {
  return (
    <footer className="no-print relative border-t border-line bg-midnight">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10">
        <div>
          <p className="display text-6xl md:text-7xl">{profile.name}</p>
          <p className="label mt-4 text-crimson">{profile.tagline}</p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-concrete">{profile.positioning}</p>
        </div>
        <div>
          <p className="label mb-4 text-concrete">Directory</p>
          <ul className="space-y-2">
            {floors.map((f) => (
              <li key={f.id}>
                <Link href={f.route} className="group flex items-baseline gap-3 text-sm">
                  <span className="label w-6 text-concrete group-hover:text-crimson">{f.level}</span>
                  <span className="text-platinum/80 group-hover:text-platinum">{f.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-6">
          <div>
            <p className="label mb-4 text-concrete">Also</p>
            <ul className="space-y-2 text-sm text-platinum/80">
              <li><Link href="/experience" className="hover:text-platinum">Enter the 3D building</Link></li>
              <li><Link href="/archive" className="hover:text-platinum">Search the archive</Link></li>
              <li><Link href="/profile" className="hover:text-platinum">Professional profile (download)</Link></li>
            </ul>
          </div>
          <SocialLinks />
        </div>
      </div>
      <div className="border-t border-line">
        <div className="label mx-auto flex max-w-[1600px] justify-between px-5 py-5 text-concrete md:px-10">
          <span>© <Year /> {profile.name}</span>
          <span>The Living Archive</span>
        </div>
      </div>
    </footer>
  );
}
