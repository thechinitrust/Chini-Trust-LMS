import { createClient } from "@/lib/supabase/server";
import { listCourses } from "@/lib/data/courses";
import { getModulesForCourse } from "@/lib/data/modules";
import { getLessonsForModule } from "@/lib/data/lessons";
import { LessonsTable } from "./lessons-table";

export default async function AdminLessonsPage() {
  const supabase = await createClient();
  const courses = await listCourses(supabase);
  const modulesByCourse = await Promise.all(courses.map((c) => getModulesForCourse(supabase, c.id)));
  const modules = modulesByCourse.flat();
  const lessonsByModule = await Promise.all(modules.map((m) => getLessonsForModule(supabase, m.id)));
  const lessons = lessonsByModule.flat();

  return <LessonsTable lessons={lessons} modules={modules} courses={courses} />;
}
