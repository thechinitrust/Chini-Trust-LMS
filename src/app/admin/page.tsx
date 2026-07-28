import Link from "next/link";
import { BookOpen, Users, CheckCircle2, ListChecks, ArrowRight } from "lucide-react";

import { mockCourses, mockLessons, mockProfiles, mockQuizzes, mockQuizAttempts, mockEnrollments } from "@/lib/mock-data";
import { DashboardStatCard } from "@/components/shared/dashboard-stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export default function AdminOverviewPage() {
  const totalLearners = mockProfiles.filter((p) => p.role === "learner").length;
  const completedEnrollments = mockEnrollments.filter((e) => e.status === "completed").length;
  const completionRate =
    mockEnrollments.length === 0 ? 0 : Math.round((completedEnrollments / mockEnrollments.length) * 100);
  const pendingQuizzes = mockQuizzes.filter((q) => !mockQuizAttempts.some((a) => a.quizId === q.id)).length;

  const publishedCourses = mockCourses.filter((c) => c.published).length;
  const draftCourses = mockCourses.length - publishedCourses;
  const publishedLessons = mockLessons.filter((l) => l.published).length;
  const draftLessons = mockLessons.length - publishedLessons;

  const quickLinks = [
    { href: "/admin/courses", label: "Manage courses" },
    { href: "/admin/modules", label: "Manage modules" },
    { href: "/admin/lessons", label: "Manage lessons & videos" },
    { href: "/admin/resources", label: "Manage resources" },
    { href: "/admin/quizzes", label: "Manage quizzes" },
    { href: "/admin/users", label: "Manage users" },
    { href: "/admin/certificates", label: "Manage certificates" },
  ];

  return (
    <div>
      <Reveal>
        <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Admin</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight text-foreground">Admin overview</h1>
        <p className="mt-2 text-muted-foreground">A snapshot of NeuroBridge content and learners.</p>
      </Reveal>

      <RevealGroup className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RevealItem>
          <DashboardStatCard icon={BookOpen} label="Total courses" value={mockCourses.length} tone="primary" />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={Users} label="Total learners" value={totalLearners} tone="accent" />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={CheckCircle2} label="Completion rate" value={`${completionRate}%`} />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={ListChecks} label="Pending quizzes" value={pendingQuizzes} />
        </RevealItem>
      </RevealGroup>

      <Reveal delay={0.1} className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-7">
            <h2 className="font-semibold text-foreground">Published vs. draft courses</h2>
            <div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Published</span>
                <span>
                  {publishedCourses} / {mockCourses.length}
                </span>
              </div>
              <Progress
                value={(publishedCourses / Math.max(mockCourses.length, 1)) * 100}
                className="mt-2.5"
                aria-label="Published courses"
              />
            </div>
            <p className="text-xs text-muted-foreground">{draftCourses} course(s) still in draft.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-7">
            <h2 className="font-semibold text-foreground">Published vs. draft lessons</h2>
            <div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Published</span>
                <span>
                  {publishedLessons} / {mockLessons.length}
                </span>
              </div>
              <Progress
                value={(publishedLessons / Math.max(mockLessons.length, 1)) * 100}
                className="mt-2.5"
                aria-label="Published lessons"
                tone="accent"
              />
            </div>
            <p className="text-xs text-muted-foreground">{draftLessons} lesson(s) still in draft.</p>
          </CardContent>
        </Card>
      </Reveal>

      <div className="mt-10">
        <h2 className="font-semibold text-foreground">Quick links</h2>
        <RevealGroup className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <RevealItem key={link.href}>
              <Link href={link.href}>
                <Card className="transition-shadow duration-500 hover:shadow-soft-lg">
                  <CardContent className="flex items-center justify-between p-5">
                    <span className="text-sm font-medium text-foreground">{link.label}</span>
                    <ArrowRight className="size-4 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                  </CardContent>
                </Card>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </div>
  );
}
