import type { Metadata } from "next";
import Link from "next/link";
import { floorById, profile } from "@/content/site";
import { FloorHeader, Section } from "@/components/site/blocks";
import { ContactForm } from "@/components/site/ContactForm";
import { SocialLinks } from "@/components/site/SocialLinks";

export const metadata: Metadata = { title: "Contact — The Exchange" };

export default function ContactPage() {
  return (
    <>
      <FloorHeader floor={floorById("exchange")} />
      <Section label="Enquiries" title="Write to the Exchange">
        <ContactForm />
      </Section>
      <Section label="Direct" title="Other routes">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="label text-concrete">Email</p>
            {profile.email ? (
              <a href={`mailto:${profile.email}`} className="display mt-3 block text-4xl hover:text-crimson">
                {profile.email}
              </a>
            ) : (
              <p className="mt-3 text-concrete">Use the form above — it is the primary route for enquiries.</p>
            )}
            <Link href="/profile" className="label mt-8 inline-block border border-platinum/30 px-5 py-3 hover:border-crimson">
              Download professional profile
            </Link>
          </div>
          <SocialLinks />
        </div>
      </Section>
    </>
  );
}
