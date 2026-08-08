import Link from "next/link";
import { BookOpen, Users, CheckCircle2, ListChecks, ArrowRight, Award, GraduationCap, Clock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  getAudienceDistribution,
  getCompletionRatesByCategory,
  getEnrollmentsOverTime,
  getMostEnrolledCourses,
  getOverviewStats,
  getQuizPassFailDistribution,
  getRegistrationsOverTime,
} from "@/lib/data/admin-stats";
import { DashboardStatCard } from "@/components/shared/dashboard-stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import {
  RegistrationsLineChart,
  EnrollmentsAreaChart,
  CourseEnrollmentsBarChart,
  CompletionRatesBarChart,
  AudienceDistributionPieChart,
} from "@/components/admin/charts/admin-charts";
import { Button } from "@/components/ui/button";

const QUICK_LINKS = [
  { href: "/admin/courses", label: "Manage courses" },
  { href: "/admin/resources", label: "Manage resources" },
  { href: "/admin/quizzes", label: "Manage quizzes" },
  { href: "/admin/events", label: "Manage events" },
  { href: "/admin/users", label: "Manage users" },
  { href: "/admin/certificates", label: "Manage certificates" },
];

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [stats, registrations, enrollmentsOverTime, mostEnrolled, audience, completionRates, quizPassFail] =
    await Promise.all([
      getOverviewStats(supabase),
      getRegistrationsOverTime(supabase),
      getEnrollmentsOverTime(supabase),
      getMostEnrolledCourses(supabase),
      getAudienceDistribution(supabase),
      getCompletionRatesByCategory(supabase),
      getQuizPassFailDistribution(supabase),
    ]);

  return (
    <div className="space-y-8">
      <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Analytics</p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">A snapshot of CHINI Learn performance, content, and learners.</p>
        </div>
        <div className="flex gap-2">
          {QUICK_LINKS.slice(0, 2).map((link) => (
            <Button key={link.href} variant="outline" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
          <Button asChild>
            <Link href="/admin/users">View All Users</Link>
          </Button>
        </div>
      </Reveal>

      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RevealItem>
          <DashboardStatCard icon={Users} label="Total learners" value={stats.totalLearners} tone="primary" />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={Clock} label="Active Users (30d)" value={stats.activeUsers30d} />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={BookOpen} label="Total courses" value={stats.totalCourses} />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={GraduationCap} label="Total Enrollments" value={stats.totalEnrollments} tone="accent" />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={CheckCircle2} label="Completion rate" value={`${stats.completionRate}%`} tone="primary" />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={ListChecks} label="Quiz Attempts" value={stats.totalQuizAttempts} />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={Award} label="Certificates Issued" value={stats.certificatesIssued} tone="accent" />
        </RevealItem>
        <RevealItem>
          <DashboardStatCard icon={BookOpen} label="Draft Courses" value={stats.draftCourses} />
        </RevealItem>
      </RevealGroup>

      <div className="space-y-6 mt-6">
        <RevealGroup className="grid gap-6 lg:grid-cols-2">
          <RevealItem>
            <RegistrationsLineChart title="New User Registrations" data={registrations} />
          </RevealItem>
          <RevealItem>
            <EnrollmentsAreaChart title="Course Enrollments Over Time" data={enrollmentsOverTime} />
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="grid gap-6 lg:grid-cols-3">
          <RevealItem className="lg:col-span-2">
            <CourseEnrollmentsBarChart title="Most Enrolled Courses" data={mostEnrolled} />
          </RevealItem>
          <RevealItem>
            <AudienceDistributionPieChart title="Audience Distribution" data={audience} />
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="grid gap-6 lg:grid-cols-2">
          <RevealItem>
            <CompletionRatesBarChart title="Course Completion Rates (%)" data={completionRates} />
          </RevealItem>
          <RevealItem>
            <AudienceDistributionPieChart title="Quiz Pass/Fail Distribution" data={quizPassFail} />
          </RevealItem>
        </RevealGroup>
      </div>

      <div className="pt-8 border-t border-border mt-8">
        <h2 className="font-semibold text-foreground">All Quick Links</h2>
        <RevealGroup className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <RevealItem key={link.href}>
              <Link href={link.href}>
                <Card className="transition-shadow duration-500 hover:shadow-soft-lg border-border">
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
