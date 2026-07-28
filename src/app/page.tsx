import Link from "next/link";
import { BookOpen, Library, MessagesSquare, Accessibility, ArrowRight, Brain } from "lucide-react";

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
    icon: MessagesSquare,
    title: "NeuroGuide",
    description: "A supportive assistant for quick, practical guidance whenever you need it.",
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

import { MagneticButton } from "@/components/motion/magnetic-button";

export default function HomePage() {
  const featuredCourses = mockCourses.slice(0, 3);
  const featuredResources = mockResources.filter((r) => r.featured).slice(0, 3);

  return (
    <>
      <HeroSection />
      <StatsSection />

      <section className="container-page px-6 py-24 lg:px-12 lg:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium tracking-widest text-primary-text uppercase">What&apos;s inside</p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
            <SplitReveal text="One platform, four ways to grow" />
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            NeuroBridge brings structured learning, curated resources, guided support, and
            accessibility tools together in one accessible, evidence-based platform.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Free downloads</p>
            <h2 className="mt-3 font-serif text-3xl text-foreground sm:text-4xl">
              <SplitReveal text="Featured resources" />
            </h2>
            <p className="mt-2 text-muted-foreground">Free, downloadable guides you can use today.</p>
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
              <SplitReveal text="Who NeuroBridge is for" />
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a, i) => {
              const isAccent = i % 2 === 1;
              return (
                <TiltCard key={a.title}>
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
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
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

