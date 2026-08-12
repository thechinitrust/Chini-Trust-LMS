import { Accessibility, Clock, Wrench, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

const STATS = [
  { icon: Accessibility, value: "Accessible", label: "Designed with different learning and access needs in mind." },
  { icon: Clock, value: "Self-paced", label: "Learn at a pace that works for you." },
  { icon: Wrench, value: "Practical", label: "Useful information, tools and strategies you can apply." },
  { icon: Users, value: "Inclusive", label: "Supporting different ways of thinking, learning and communicating." },
];

export function StatsSection() {
  return (
    <section className="border-y border-primary/10 bg-card-subtle py-20">
      <RevealGroup className="container-page grid grid-cols-2 gap-10 px-6 lg:grid-cols-4 lg:px-12">
        {STATS.map(({ icon: Icon, value, label }, i) => {
          const isAccent = i % 2 === 1;
          return (
            <RevealItem key={label} className="flex flex-col items-center gap-3 text-center">
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-primary-foreground shadow-soft transition-transform duration-500 hover:scale-105",
                  isAccent ? "from-accent to-ink" : "from-primary to-ink"
                )}
              >
                <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="font-serif text-2xl text-foreground sm:text-3xl">{value}</p>
              <p className="max-w-[20rem] text-sm leading-relaxed text-balance text-muted-foreground">{label}</p>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
