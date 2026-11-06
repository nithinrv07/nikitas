import { profile } from "@/content/site";

export function SocialLinks({ className = "" }: { className?: string }) {
  const socials = profile.socials.filter((s) => s.url);
  if (!socials.length) return null;
  return (
    <div className={className}>
      <p className="label mb-4 text-concrete">Elsewhere</p>
      <ul className="flex flex-wrap gap-2">
        {socials.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="label inline-block border border-line px-3 py-2 text-platinum/80 hover:border-crimson hover:text-platinum"
            >
              {s.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
