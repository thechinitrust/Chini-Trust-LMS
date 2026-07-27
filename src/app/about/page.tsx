import { Target, Eye, HeartHandshake, Rocket } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

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
    body: "NeuroBridge AI launches with structured courses for teachers, alongside a growing resource library and AI-guided support. Over time we plan to expand into more audiences, deeper personalization, and a wider course catalogue shaped directly by community need.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">About NeuroBridge AI</h1>
        <p className="mt-3 text-muted-foreground">
          NeuroBridge AI is an independent platform from The Chini Trust, built to make neurodiversity
          education, resources, and support accessible to everyone who needs them.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
        {PILLARS.map((pillar) => (
          <Card key={pillar.title}>
            <CardContent className="p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <pillar.icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-semibold text-foreground">{pillar.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-3xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Who this platform helps</h2>
          <p className="mt-2 text-muted-foreground">
            While teachers are our primary audience at launch, NeuroBridge AI is built to scale to
            caregivers, parents, students, mental health professionals, therapists, employers, and
            anyone who wants to understand neurodiversity and inclusion more deeply.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">How it supports learning and inclusion</h2>
          <p className="mt-2 text-muted-foreground">
            Structured, self-paced courses break long-form expert knowledge into manageable modules
            and lessons. Downloadable resources turn that knowledge into ready-to-use tools. The AI
            NeuroGuide assistant offers a supportive, always-available first stop for specific
            questions. Together, they form one accessible learning journey.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Long-term direction</h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;re building NeuroBridge AI to grow with the community it serves — more courses, more
            resource types, deeper accessibility tooling, and closer AI guidance, all grounded in the
            same evidence-based, inclusion-first approach we started with.
          </p>
        </div>
      </div>
    </div>
  );
}
