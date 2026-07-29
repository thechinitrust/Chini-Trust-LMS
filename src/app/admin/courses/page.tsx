import { createClient } from "@/lib/supabase/server";
import { listCourses } from "@/lib/data/courses";
import { getModulesForCourse } from "@/lib/data/modules";
import { CoursesTable } from "./courses-table";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const courses = await listCourses(supabase);
  const moduleCounts: Record<string, number> = {};
  await Promise.all(
    courses.map(async (c) => {
      moduleCounts[c.id] = (await getModulesForCourse(supabase, c.id)).length;
    })
  );
  return <CoursesTable courses={courses} moduleCounts={moduleCounts} />;
}
