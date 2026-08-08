import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCourseById } from "@/lib/data/courses";
import { getModulesForCourse } from "@/lib/data/modules";
import { getLessonsForModule } from "@/lib/data/lessons";
import { CourseBuilder, type ModuleWithLessons } from "./course-builder";

export default async function AdminCourseBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const course = await getCourseById(supabase, courseId);
  if (!course) notFound();

  const modules = await getModulesForCourse(supabase, courseId);
  const modulesWithLessons: ModuleWithLessons[] = await Promise.all(
    modules.map(async (module) => ({
      ...module,
      lessons: await getLessonsForModule(supabase, module.id),
    }))
  );

  return <CourseBuilder course={course} initialModules={modulesWithLessons} />;
}
