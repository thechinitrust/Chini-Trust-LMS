import { Suspense } from "react";
import { Target, Eye, HeartHandshake, Rocket } from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { listSpeakers } from "@/lib/data/speakers";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";
import { SplitReveal } from "@/components/motion/split-reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { SpeakerCarousel } from "@/components/shared/speaker-carousel";

const PILLARS = [
  {
    icon: Target,
    title: "Our mission",
    body: "To make evidence-based understanding of neurodiversity, and the practical support that follows from it, freely accessible to anyone who needs it — starting with the teachers, parents, students, and employers who shape neurodivergent people's everyday environments.",
  },
  {
    icon: Eye,
    title: "Our vision",
    body: "A world where neurodivergent traits are understood rather than pathologized, and where classrooms, workplaces, and homes are designed with that variation in mind from the start — not retrofitted as an afterthought.",
  },
  {
    icon: HeartHandshake,
    title: "Why neurodiversity awareness matters",
    body: "An estimated 1 in 7 people are neurodivergent. Small, well-informed adjustments — how instructions are given, how spaces are lit, how routines are structured — routinely make the difference between someone struggling and someone thriving. Awareness is the first, most necessary step.",
  },
  {
    icon: Rocket,
    title: "Where we're headed",
    body: "CHINI Learn launches with structured courses for teachers, alongside a growing resource library and guided support. Over time we plan to expand into more audiences, deeper personalization, and a wider course catalogue shaped directly by community need.",
  },
];

const SECTIONS = [
  {
    title: "Who this platform helps",
    body: "While teachers are our primary audience at launch, CHINI Learn is built to scale to caregivers, parents, students, mental health professionals, therapists, employers, and anyone who wants to understand neurodiversity and inclusion more deeply.",
  },
  {
    title: "How it supports learning and inclusion",
    body: "Structured, self-paced courses break long-form expert knowledge into manageable modules and lessons. Downloadable resources turn that knowledge into ready-to-use tools, forming one accessible learning journey.",
  },
  {
    title: "Long-term direction",
    body: "We're building CHINI Learn to grow with the community it serves — more courses, more resource types, deeper accessibility tooling, and closer guidance, all grounded in the same evidence-based, inclusion-first approach we started with.",
  },
];

export default async function AboutPage() {
  const supabase = await createClient();
  const speakers = await listSpeakers(supabase);

  return (
    <div className="container-page px-6 py-20 lg:px-12" data-focus-content="true">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium tracking-widest text-primary-text uppercase">About us</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          <SplitReveal text="About CHINI Learn" />
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          CHINI Learn is an independent platform from The Chini Trust, built to make neurodiversity
          education, resources, and support accessible to everyone who needs them.
        </p>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
        {PILLARS.map((pillar, i) => {
          const isAccent = i % 2 === 1;
          return (
            <TiltCard key={pillar.title}>
              <Card tone={isAccent ? "accent" : "brand"} interactive className="group flex h-full flex-row overflow-hidden">
                <div
                  className={cn(
                    "flex w-24 shrink-0 flex-col items-center justify-center bg-gradient-to-br text-primary-foreground transition-all duration-500 group-hover:brightness-110",
                    isAccent ? "from-accent to-ink" : "from-primary to-ink"
                  )}
                >
                  <span className="drop-shadow-sm transition-transform duration-500 group-hover:scale-110">
                    <pillar.icon className="size-14" strokeWidth={1} aria-hidden="true" />
                  </span>
                </div>
                <CardContent className="flex flex-1 flex-col p-6 sm:p-7">
                  <h2 className="font-serif text-xl text-foreground">{pillar.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
                </CardContent>
              </Card>
            </TiltCard>
          );
        })}
      </div>

      {/* ---- Speakers ---- */}
      {speakers.length > 0 && (
        <section className="mt-24">
          <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-center duration-700 ease-out">
            <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Our speakers</p>
            <h2 className="mt-4 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              Voices behind the courses
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The educators, clinicians, and researchers who present CHINI Learn&apos;s courses and panels.
            </p>
          </div>

          <div className="mt-12">
            <Suspense fallback={null}>
              <SpeakerCarousel speakers={speakers} />
            </Suspense>
          </div>
        </section>
      )}

      <div className="mx-auto mt-24 max-w-3xl space-y-12">
        {SECTIONS.map((section) => (
          <Reveal key={section.title} variant="scale">
            <h2 className="font-serif text-2xl text-foreground">{section.title}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
