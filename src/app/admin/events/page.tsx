import { createClient } from "@/lib/supabase/server";
import { listEvents } from "@/lib/data/events";
import { EventsTable } from "./events-table";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const events = await listEvents(supabase);
  return <EventsTable events={events} />;
}
