import { createClient } from "@/lib/supabase/server";
import { listCourses } from "@/lib/data/courses";
import { getModulesForCourse } from "@/lib/data/modules";
import { getLessonsForCourse } from "@/lib/data/lessons";
import { getCourseCompletionPercent } from "@/lib/data/progress";
import { LearnClient, type LearnCourseSummary } from "./learn-client";

export default async function LearnPage() {
  const supabase = await createClient();

  const [courses, {
    data: { user },
  }] = await Promise.all([listCourses(supabase), supabase.auth.getUser()]);
  const published = courses.filter((c) => c.published);

  const summaries: LearnCourseSummary[] = await Promise.all(
    published.map(async (course) => {
      const [modules, lessons, progress] = await Promise.all([
        getModulesForCourse(supabase, course.id),
        getLessonsForCourse(supabase, course.id),
        user ? getCourseCompletionPercent(supabase, user.id, course.id) : Promise.resolve(undefined),
      ]);
      return { course, progress, moduleCount: modules.length, lessonCount: lessons.length };
    })
  );

  return <LearnClient courses={summaries} />;
}
