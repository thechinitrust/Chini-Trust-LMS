import { createClient } from "@/lib/supabase/server";
import { listResources } from "@/lib/data/resources";
import { ResourcesClient } from "./resources-client";

export default async function ResourcesPage() {
  const supabase = await createClient();
  const resources = await listResources(supabase).catch(() => []);
  const publishedResources = resources.filter((r) => r.published);
  return <ResourcesClient resources={publishedResources} />;
}
