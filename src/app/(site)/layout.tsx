import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="label sr-only z-[60] bg-crimson px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
        Skip to content
      </a>
      <SiteNav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
