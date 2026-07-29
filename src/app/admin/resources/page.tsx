import { createClient } from "@/lib/supabase/server";
import { listResources } from "@/lib/data/resources";
import { listCourses } from "@/lib/data/courses";
import { ResourcesTable } from "./resources-table";

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const [resources, courses] = await Promise.all([listResources(supabase), listCourses(supabase)]);
  return <ResourcesTable resources={resources} courses={courses} />;
}
