import type { SupabaseClient } from "@supabase/supabase-js";

export interface SiteSettings {
  heroImageUrl: string;
  heroImageAlt: string;
}

export const DEFAULT_HERO_IMAGE_URL = "/images/home-hero.jpg";
export const DEFAULT_HERO_IMAGE_ALT =
  "Colorful illustration of diverse human profiles representing neurodiversity";

export async function getSiteSettings(supabase: SupabaseClient): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["hero_image_url", "hero_image_alt"]);

    if (error || !data || data.length === 0) {
      return {
        heroImageUrl: DEFAULT_HERO_IMAGE_URL,
        heroImageAlt: DEFAULT_HERO_IMAGE_ALT,
      };
    }

    const map = new Map(data.map((row: { key: string; value: string }) => [row.key, row.value]));

    return {
      heroImageUrl: map.get("hero_image_url") || DEFAULT_HERO_IMAGE_URL,
      heroImageAlt: map.get("hero_image_alt") || DEFAULT_HERO_IMAGE_ALT,
    };
  } catch {
    return {
      heroImageUrl: DEFAULT_HERO_IMAGE_URL,
      heroImageAlt: DEFAULT_HERO_IMAGE_ALT,
    };
  }
}

export async function updateSiteSettings(
  client: SupabaseClient,
  settings: Partial<SiteSettings>
): Promise<void> {
  const rows: { key: string; value: string; updated_at?: string }[] = [];

  if (settings.heroImageUrl !== undefined) {
    rows.push({
      key: "hero_image_url",
      value: settings.heroImageUrl,
      updated_at: new Date().toISOString(),
    });
  }
  if (settings.heroImageAlt !== undefined) {
    rows.push({
      key: "hero_image_alt",
      value: settings.heroImageAlt,
      updated_at: new Date().toISOString(),
    });
  }

  if (rows.length === 0) return;

  const { error } = await client.from("site_settings").upsert(rows);
  if (error) throw error;
}
