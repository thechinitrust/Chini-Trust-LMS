import { createClient } from "@/lib/supabase/server";
import { listCourses } from "@/lib/data/courses";
import { getModulesForCourse } from "@/lib/data/modules";
import { getQuestionsForQuiz, listQuizzes } from "@/lib/data/quizzes";
import { QuizzesTable } from "./quizzes-table";

export default async function AdminQuizzesPage() {
  const supabase = await createClient();
  const [quizzes, courses] = await Promise.all([listQuizzes(supabase), listCourses(supabase)]);
  const modulesByCourse = await Promise.all(courses.map((c) => getModulesForCourse(supabase, c.id)));
  const modules = modulesByCourse.flat();

  const questionCounts: Record<string, number> = {};
  await Promise.all(
    quizzes.map(async (q) => {
      questionCounts[q.id] = (await getQuestionsForQuiz(supabase, q.id)).length;
    })
  );

  return <QuizzesTable quizzes={quizzes} modules={modules} courses={courses} questionCounts={questionCounts} />;
}
