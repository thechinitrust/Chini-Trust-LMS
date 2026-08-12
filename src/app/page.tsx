import Link from "next/link";
import { BookOpen, Library, Accessibility, ArrowRight, Brain } from "lucide-react";

import { cn } from "@/lib/utils";
import { HeroSection } from "@/components/shared/hero-section";
import { StatsSection } from "@/components/shared/stats-section";
import { FeatureCard } from "@/components/shared/feature-card";
import { CourseCard } from "@/components/shared/course-card";
import { ResourceCard } from "@/components/shared/resource-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { SplitReveal } from "@/components/motion/split-reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { createClient } from "@/lib/supabase/server";
import { listCourses } from "@/lib/data/courses";
import { listResources } from "@/lib/data/resources";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Learning Hub",
    description: "Self-paced courses and learning materials covering neurodiversity, inclusion and related topics.",
    href: "/learn",
  },
  {
    icon: Library,
    title: "Resource Library",
    description: "Downloadable guides and toolkits for parents, teachers, students, and employers.",
    href: "/resources",
  },
  {
    icon: Accessibility,
    title: "Accessibility Center",
    description: "Dark mode, dyslexia-friendly fonts, text sizing, and focus tools built in.",
    href: "/accessibility",
  },
];

const AUDIENCES = [
  {
    title: "Students & Learners",
    description: "Learn about neurodiversity, develop skills and find resources that support your learning.",
  },
  {
    title: "Parents & Families",
    description:
      "Find practical information and resources to better understand and support neurodivergent people.",
  },
  {
    title: "Teachers & Educators",
    description: "Explore practical strategies for creating more inclusive learning environments.",
  },
  {
    title: "Employers & Organisations",
    description:
      "Learn how to create more inclusive workplaces and support different ways of thinking and working.",
  },
  {
    title: "Anyone Interested in Neurodiversity",
    description:
      "CHINI Learn is for anyone who wants to understand neurodiversity and help create a more inclusive world.",
  },
];

import { MagneticButton } from "@/components/motion/magnetic-button";

export default async function HomePage() {
  const supabase = await createClient();
  const [courses, resources] = await Promise.all([listCourses(supabase), listResources(supabase)]);
  const featuredCourses = courses.filter((c) => c.published).slice(0, 3);
  const featuredResources = resources.filter((r) => r.featured).slice(0, 3);

  return (
    <>
      <HeroSection />
      <StatsSection />

      <section className="container-page px-6 py-24 lg:px-12 lg:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-widest text-primary-text uppercase">What&apos;s inside</p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
            <SplitReveal text="Explore CHINI Learn" />
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Explore courses, resources and practical tools to learn about
            neurodiversity and support inclusion.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <TiltCard key={f.title}>
              <FeatureCard
                icon={<f.icon className="size-14" strokeWidth={1} aria-hidden="true" />}
                title={f.title}
                description={f.description}
                href={f.href}
                tone={i % 2 === 0 ? "primary" : "accent"}
              />
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="border-y border-black/5 bg-muted/40 py-24 dark:border-white/10">
        <div className="container-page px-6 lg:px-12">
          <Reveal className="flex flex-wrap items-end justify-between gap-4" variant="blur">
            <div>
              <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Learning paths</p>
              <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
                <SplitReveal text="Featured courses" />
              </h2>
              <p className="mt-2 text-muted-foreground">Start with our most popular learning paths.</p>
            </div>
            <MagneticButton>
              <Button variant="outline" asChild>
                <Link href="/learn">
                  View all courses
                  <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </Button>
            </MagneticButton>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <TiltCard key={course.id}>
                <CourseCard course={course} />
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page px-6 py-24 lg:px-12">
        <Reveal className="flex flex-wrap items-end justify-between gap-4" variant="scale">
          <div>
            <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Resources</p>
            <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
              <SplitReveal text="Featured resources" />
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Practical guides, tools and resources to help you learn and put ideas into practice.
            </p>
          </div>
          <MagneticButton>
            <Button variant="outline" asChild>
              <Link href="/resources">
                Browse resources
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </Button>
          </MagneticButton>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredResources.map((resource) => (
            <TiltCard key={resource.id}>
              <ResourceCard resource={resource} />
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="border-y border-primary/10 bg-card-subtle py-24">
        <div className="container-page px-6 lg:px-12">
          <Reveal className="mx-auto max-w-2xl text-center" variant="blur">
            <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Built for everyone</p>
            <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
              <SplitReveal text="Who CHINI Learn is for" />
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a, i) => {
              const isAccent = i % 2 === 1;
              // The final "anyone" card is a catch-all, so it spans the full row
              // rather than leaving three empty columns beside it.
              const isLast = i === AUDIENCES.length - 1;
              return (
                <TiltCard key={a.title} className={cn(isLast && "sm:col-span-2 lg:col-span-4")}>
                  <Card tone={isAccent ? "accent" : "brand"} interactive className="h-full">
                    <CardContent className="p-6">
                      <span
                        className={cn(
                          "mb-4 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground text-sm font-semibold shadow-soft",
                          isAccent ? "from-accent to-ink" : "from-primary to-ink"
                        )}
                      >
                        {i + 1}
                      </span>
                      <h3 className="font-semibold text-foreground">{a.title}</h3>
                      <p
                        className={cn(
                          "mt-2 text-sm leading-relaxed text-muted-foreground",
                          isLast && "max-w-2xl"
                        )}
                      >
                        {a.description}
                      </p>
                    </CardContent>
                  </Card>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page px-6 py-28 lg:px-12">
        <Reveal
          variant="scale"
          className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-[30px] border border-primary/20 bg-brand-mesh bg-card-brand p-12 text-center shadow-soft-lg sm:p-16"
        >
          <span className="relative flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Brain className="size-7" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h2 className="relative font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            <SplitReveal text="Ready to get started?" />
          </h2>
          <p className="relative text-lg leading-relaxed text-muted-foreground">
            Create a free account to track your progress, or explore the platform first — no sign-up required.
          </p>
          <div className="relative flex flex-wrap justify-center gap-4 mt-4">
            <MagneticButton>
              <Button size="lg" asChild>
                <Link href="/register">Sign up free</Link>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button size="lg" variant="accent" asChild>
                <Link href="/learn">Explore courses</Link>
              </Button>
            </MagneticButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}

