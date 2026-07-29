import { createClient } from "@/lib/supabase/server";
import { listResources } from "@/lib/data/resources";
import { ResourcesClient } from "./resources-client";

export default async function ResourcesPage() {
  const supabase = await createClient();
  const resources = await listResources(supabase);
  return <ResourcesClient resources={resources} />;
}
