import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BookOpen, CheckCircle2, Award, History, Library, Calendar, Zap, ArrowRight, Flame } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { listProfiles } from "@/lib/data/users";
import { listCourses } from "@/lib/data/courses";
import { getEnrollmentsForUser } from "@/lib/data/enrollments";
import { getCertificatesForUser } from "@/lib/data/certificates";
import { getCourseCompletionPercent, getDayStreak, getProgressForUser } from "@/lib/data/progress";
import { getLessonById } from "@/lib/data/lessons";
import { getModuleById } from "@/lib/data/modules";
import { getUpcomingEvents } from "@/lib/data/events";
import { DashboardStatCard } from "@/components/shared/dashboard-stat-card";
import { CourseCard } from "@/components/shared/course-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EVENT_MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const profiles = await listProfiles(supabase);
  const profile = profiles.find((p) => p.id === authUser.id);
  const fullName = profile?.fullName ?? "there";

  const [enrollments, certificates, progressRows, dayStreak, courses, upcomingEvents] = await Promise.all([
    getEnrollmentsForUser(supabase, authUser.id),
    getCertificatesForUser(supabase, authUser.id),
    getProgressForUser(supabase, authUser.id),
    getDayStreak(supabase, authUser.id),
    listCourses(supabase),
    getUpcomingEvents(supabase, 2),
  ]);

  const inProgress = enrollments.filter((e) => e.status !== "completed");
  const completed = enrollments.filter((e) => e.status === "completed");

  const progressPercentByCourse: Record<string, number> = {};
  await Promise.all(
    enrollments.map(async (e) => {
      progressPercentByCourse[e.courseId] = await getCourseCompletionPercent(supabase, authUser.id, e.courseId);
    })
  );
  const avgProgress =
    enrollments.length === 0
      ? 0
      : Math.round(
          enrollments.reduce((sum, e) => sum + (progressPercentByCourse[e.courseId] ?? 0), 0) / enrollments.length
        );

  const recentProgress = [...progressRows]
    .sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())
    .slice(0, 4);
  const recentLessons = await Promise.all(
    recentProgress.map(async (p) => {
      const lesson = await getLessonById(supabase, p.lessonId);
      const lessonModule = lesson ? await getModuleById(supabase, lesson.moduleId) : undefined;
      return lesson ? { progress: p, lesson, moduleTitle: lessonModule?.title } : null;
    })
  );

  const inProgressCourses = await Promise.all(
    inProgress.map(async (e) => ({ enrollment: e, course: courses.find((c) => c.id === e.courseId) }))
  );

  const recommendedCourses = courses
    .filter((c) => c.published && !enrollments.some((e) => e.courseId === c.id))
    .slice(0, 2);

  return (
    <div className="container-page px-6 py-12 lg:px-12 max-w-[1400px]">
      <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-gradient-to-r from-primary/10 to-transparent p-8 rounded-3xl border border-primary/20">
        <div>
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">Your learning dashboard</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
            Welcome back, {fullName.split(" ")[0]}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">You are doing great! Continue your learning journey below.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full bg-background/50 backdrop-blur-md" asChild>
            <Link href="/resources">
              <Library className="size-4 mr-2" strokeWidth={1.5} aria-hidden="true" />
              Resources
            </Link>
          </Button>
          <Button className="rounded-full shadow-lg hover:shadow-xl transition-all" asChild>
            <Link href="/learn">Explore Courses</Link>
          </Button>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <RevealGroup className="grid gap-4 sm:grid-cols-3">
            <RevealItem>
              <DashboardStatCard icon={Flame} label="Day Streak" value={dayStreak} tone="primary" />
            </RevealItem>
            <RevealItem>
              <DashboardStatCard icon={CheckCircle2} label="Courses completed" value={completed.length} tone="accent" />
            </RevealItem>
            <RevealItem>
              <DashboardStatCard icon={Zap} label="Average progress" value={`${avgProgress}%`} />
            </RevealItem>
          </RevealGroup>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-foreground">Continue learning</h2>
              <Link href="/learn" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            {inProgressCourses.length === 0 ? (
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
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {inProgressCourses.map(({ enrollment, course }) =>
                  course ? (
                    <CourseCard key={course.id} course={course} progress={progressPercentByCourse[enrollment.courseId] ?? 0} />
                  ) : null
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground mb-6">Recently viewed lessons</h2>
            <div className="space-y-4">
              {recentLessons.filter(Boolean).length === 0 && (
                <EmptyState icon={History} title="Nothing viewed yet" description="Lessons you watch will show up here." />
              )}
              {recentLessons.map((entry) => {
                if (!entry) return null;
                const { progress: p, lesson, moduleTitle } = entry;
                return (
                  <Link key={p.id} href={`/lessons/${lesson.id}`}>
                    <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                      <CardContent className="flex items-center justify-between gap-4 p-5">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <BookOpen className="size-5" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                              {lesson.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{moduleTitle}</p>
                          </div>
                        </div>
                        {p.completed ? (
                          <CheckCircle2 className="size-5 shrink-0 text-success" strokeWidth={1.5} />
                        ) : (
                          <Badge variant="outline" className="shrink-0 bg-background text-xs">
                            In progress
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <Calendar className="size-5 text-primary" /> Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nothing scheduled right now.</p>
              ) : (
                upcomingEvents.map((event) => {
                  const d = new Date(event.startsAt);
                  return (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-destructive/10 text-destructive font-bold text-lg leading-none shrink-0">
                        <span className="text-xs font-medium uppercase opacity-80">{EVENT_MONTH[d.getMonth()]}</span>
                        {d.getDate().toString().padStart(2, "0")}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-serif">
                  <Award className="size-5 text-accent" /> Certificates
                </CardTitle>
                <Link href="/certificates" className="text-xs font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {certificates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No certificates earned yet.</p>
              ) : (
                <div className="space-y-4">
                  {certificates.slice(0, 2).map((cert) => (
                    <div key={cert.id} className="flex flex-col gap-2 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                      <p className="font-semibold text-sm line-clamp-1">{cert.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {recommendedCourses.length > 0 && (
            <Card className="border-border shadow-sm bg-primary/5 border-primary/10">
              <CardHeader className="pb-3 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-lg font-serif text-primary-text">
                  <Zap className="size-5" /> Recommended for you
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {recommendedCourses.map((course) => (
                  <Link key={course.id} href={`/courses/${course.slug}`} className="group block">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted relative">
                        <Image src={course.thumbnailUrl} alt="" fill sizes="64px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">{course.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          View details <ArrowRight className="size-3" />
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
