import { createClient } from "@/lib/supabase/server";
import { listCourses } from "@/lib/data/courses";
import { getModulesForCourse } from "@/lib/data/modules";
import { getLessonsForModule } from "@/lib/data/lessons";
import { ModulesTable } from "./modules-table";

export default async function AdminModulesPage() {
  const supabase = await createClient();
  const courses = await listCourses(supabase);
  const modulesByCourse = await Promise.all(courses.map((c) => getModulesForCourse(supabase, c.id)));
  const modules = modulesByCourse.flat();

  const lessonCounts: Record<string, number> = {};
  await Promise.all(
    modules.map(async (m) => {
      lessonCounts[m.id] = (await getLessonsForModule(supabase, m.id)).length;
    })
  );

  return <ModulesTable modules={modules} courses={courses} lessonCounts={lessonCounts} />;
}
