import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/data/site-settings";
import { HeroImageSettingsCard } from "@/components/admin/hero-image-settings-card";
import { Reveal } from "@/components/motion/reveal";

export const metadata = {
  title: "Site Settings | Admin | CHINI Learn",
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const siteSettings = await getSiteSettings(supabase);

  return (
    <div className="space-y-8 max-w-5xl">
      <Reveal>
        <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Configuration</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-foreground">Site Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage site-wide visual assets, landing page artwork, and global configurations.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <HeroImageSettingsCard initialSettings={siteSettings} />
      </Reveal>
    </div>
  );
}
