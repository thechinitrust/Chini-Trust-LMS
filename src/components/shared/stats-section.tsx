import { Users, Library, Route, Accessibility } from "lucide-react";

import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

const STATS = [
  { icon: Users, value: "1 in 7", label: "people are neurodivergent" },
  { icon: Library, value: "100+", label: "resources available" },
  { icon: Route, value: "Personalized", label: "learning pathways" },
  { icon: Accessibility, value: "Accessible", label: "by design, not retrofit" },
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
              <p className="text-sm text-muted-foreground">{label}</p>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
