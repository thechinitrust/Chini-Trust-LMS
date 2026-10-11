import { createClient } from "@/lib/supabase/server";
import { listCourses } from "@/lib/data/courses";
import { getModuleCountsByCourse } from "@/lib/data/modules";
import { getLessonCountsByCourse } from "@/lib/data/lessons";
import { getEnrollmentsForUser } from "@/lib/data/enrollments";
import { getCourseCompletionPercentagesForUser } from "@/lib/data/progress";
import { LearnClient, type LearnCourseSummary } from "./learn-client";

export default async function LearnPage() {
  const supabase = await createClient();

  const [courses, { data: userData }, moduleCounts, lessonCounts] = await Promise.all([
    listCourses(supabase),
    supabase.auth.getUser(),
    getModuleCountsByCourse(supabase).catch((): Record<string, number> => ({})),
    getLessonCountsByCourse(supabase, true).catch((): Record<string, number> => ({})),
  ]);

  const userId = userData?.user?.id;
  const published = courses.filter((c) => c.published);

  let progressByCourse: Record<string, number> = {};
  if (userId) {
    const userEnrollments = await getEnrollmentsForUser(supabase, userId).catch(() => []);
    const enrolledCourseIds = userEnrollments.map((e) => e.courseId);
    if (enrolledCourseIds.length > 0) {
      progressByCourse = await getCourseCompletionPercentagesForUser(
        supabase,
        userId,
        enrolledCourseIds
      ).catch(() => ({}));
    }
  }

  const summaries: LearnCourseSummary[] = published.map((course) => ({
    course,
    progress: userId && course.id in progressByCourse ? progressByCourse[course.id] : undefined,
    moduleCount: moduleCounts[course.id] ?? 0,
    lessonCount: lessonCounts[course.id] ?? 0,
  }));

  return <LearnClient courses={summaries} />;
}

