import { createClient } from "@/lib/supabase/server";
import { listSpeakers } from "@/lib/data/speakers";
import { SpeakersTable } from "./speakers-table";

export default async function AdminSpeakersPage() {
  const supabase = await createClient();
  const speakers = await listSpeakers(supabase);
  return <SpeakersTable speakers={speakers} />;
}
