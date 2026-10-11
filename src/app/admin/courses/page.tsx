import { createClient } from "@/lib/supabase/server";
import { listCourses } from "@/lib/data/courses";
import { getModuleCountsByCourse } from "@/lib/data/modules";
import { CoursesTable } from "./courses-table";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const [courses, moduleCounts] = await Promise.all([
    listCourses(supabase),
    getModuleCountsByCourse(supabase).catch((): Record<string, number> => ({})),
  ]);

  return <CoursesTable courses={courses} moduleCounts={moduleCounts} />;
}

