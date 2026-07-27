import Link from "next/link";
import { BookOpen, Library, Sparkles, Accessibility, ArrowRight } from "lucide-react";

import { HeroSection } from "@/components/shared/hero-section";
import { StatsSection } from "@/components/shared/stats-section";
import { FeatureCard } from "@/components/shared/feature-card";
import { CourseCard } from "@/components/shared/course-card";
import { ResourceCard } from "@/components/shared/resource-card";
import { Button } from "@/components/ui/button";
import { mockCourses, mockResources } from "@/lib/mock-data";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Learning Hub",
    description: "Structured, self-paced courses on autism, ADHD, dyslexia, and workplace inclusion.",
    href: "/learn",
  },
  {
    icon: Library,
    title: "Resource Library",
    description: "Downloadable guides and toolkits for parents, teachers, students, and employers.",
    href: "/resources",
  },
  {
    icon: Sparkles,
    title: "AI NeuroGuide",
    description: "A supportive AI assistant for quick, practical guidance whenever you need it.",
    href: "/ai-neuroguide",
  },
  {
    icon: Accessibility,
    title: "Accessibility Center",
    description: "Dark mode, dyslexia-friendly fonts, text sizing, and focus tools built in.",
    href: "/accessibility",
  },
];

const AUDIENCES = [
  { title: "Students", description: "Learn about your own strengths and how to advocate for what you need." },
  { title: "Parents", description: "Practical guidance and toolkits for supporting your child at home." },
  { title: "Teachers", description: "Classroom-ready strategies grounded in current research." },
  { title: "Employers", description: "Build a genuinely inclusive workplace, one practical step at a time." },
];

export default function HomePage() {
  const featuredCourses = mockCourses.slice(0, 3);
  const featuredResources = mockResources.filter((r) => r.featured).slice(0, 3);

  return (
    <>
      <HeroSection />
      <StatsSection />

      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">One platform, four ways to grow</h2>
          <p className="mt-3 text-muted-foreground">
            NeuroBridge AI brings structured learning, curated resources, AI-guided support, and
            accessibility tools together in one accessible, evidence-based platform.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 py-16">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured courses</h2>
              <p className="mt-1 text-muted-foreground">Start with our most popular learning paths.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/learn">
                View all courses
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured resources</h2>
            <p className="mt-1 text-muted-foreground">Free, downloadable guides you can use today.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/resources">
              Browse resources
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 py-16">
        <div className="container-page">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">Who NeuroBridge AI is for</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-2xl border border-border bg-gradient-to-b from-primary/5 to-transparent p-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Ready to get started?</h2>
          <p className="text-muted-foreground">
            Create a free account to track your progress, or explore the platform first — no sign-up required.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">Sign up free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/learn">Explore courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
