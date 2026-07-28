"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, Award, ListChecks, History, Library } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useLocalProgress } from "@/hooks/use-local-progress";
import {
  mockQuizzes,
  getCourseById,
  getEnrollmentsForUser,
  getCertificatesForUser,
  getLessonById,
  getModuleById,
  getProgressForUser,
} from "@/lib/mock-data";
import { RequireAuth } from "@/components/auth/require-auth";
import { DashboardStatCard } from "@/components/shared/dashboard-stat-card";
import { CourseCard } from "@/components/shared/course-card";
import { CertificateCard } from "@/components/shared/certificate-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function DashboardContent() {
  const { user } = useAuth();
  const progress = useLocalProgress(user!.id);

  const enrollments = getEnrollmentsForUser(user!.id);
  const inProgress = enrollments.filter((e) => e.status !== "completed");
  const completed = enrollments.filter((e) => e.status === "completed");
  const certificates = getCertificatesForUser(user!.id);

  const recentLessons = [...getProgressForUser(user!.id)]
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
    .slice(0, 4);

  const avgProgress =
    enrollments.length === 0
      ? 0
      : Math.round(
          enrollments.reduce((sum, e) => sum + progress.courseProgressPercent(e.courseId), 0) / enrollments.length
        );

  return (
    <div className="container-page px-6 py-16 lg:px-12">
      <Reveal className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Your dashboard</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            Welcome back, {user!.fullName.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted-foreground">Here&apos;s where your learning journey stands.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/resources">
            <Library className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Resources
          </Link>
        </Button>
      </Reveal>

      <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RevealItem>
          <DashboardStatCard icon={BookOpen} label="Courses in progress" value={inProgress.length} tone="primary" />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={CheckCircle2} label="Courses completed" value={completed.length} tone="accent" />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={ListChecks} label="Average progress" value={`${avgProgress}%`} />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={Award} label="Certificates earned" value={certificates.length} tone="accent" />
        </RevealItem>
      </RevealGroup>

      <section className="mt-14">
        <h2 className="font-serif text-xl text-foreground">Continue learning</h2>
        {inProgress.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={BookOpen}
              title="No courses in progress"
              description="Browse the catalogue to start your first course."
              action={
                <Button asChild>
                  <Link href="/learn">Browse courses</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((enrollment) => {
              const course = getCourseById(enrollment.courseId);
              if (!course) return null;
              return <CourseCard key={course.id} course={course} progress={progress.courseProgressPercent(course.id)} />;
            })}
          </div>
        )}
      </section>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-xl text-foreground">Quiz status</h2>
          <div className="mt-5 space-y-3">
            {mockQuizzes
              .filter((quiz) => enrollments.some((e) => e.courseId === quiz.courseId))
              .map((quiz) => {
                const attempt = progress.getLatestAttempt(quiz.id);
                return (
                  <Card key={quiz.id}>
                    <CardContent className="flex items-center justify-between gap-3 p-5">
                      <div>
                        <p className="text-sm font-medium text-foreground">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {attempt ? `Last score: ${attempt.score}%` : "Not attempted yet"}
                        </p>
                      </div>
                      {attempt ? (
                        <Badge variant={attempt.passed ? "success" : "destructive"}>
                          {attempt.passed ? "Passed" : "Not passed"}
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/quizzes/${quiz.id}`}>Take quiz</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-xl text-foreground">Recently viewed lessons</h2>
          <div className="mt-5 space-y-3">
            {recentLessons.length === 0 && (
              <EmptyState icon={History} title="Nothing viewed yet" description="Lessons you watch will show up here." />
            )}
            {recentLessons.map((p) => {
              const lesson = getLessonById(p.lessonId);
              const lessonModule = lesson ? getModuleById(lesson.moduleId) : undefined;
              if (!lesson) return null;
              return (
                <Link key={p.id} href={`/lessons/${lesson.id}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lessonModule?.title}</p>
                      </div>
                      {p.completed && <CheckCircle2 className="size-4 shrink-0 text-success" strokeWidth={1.5} aria-hidden="true" />}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-xl text-foreground">Certificates</h2>
        {certificates.length === 0 ? (
          <div className="mt-5">
            <EmptyState icon={Award} title="No certificates yet" description="Complete a course to earn your first certificate." />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
