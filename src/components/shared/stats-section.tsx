import { Users, Library, Route, Sparkles } from "lucide-react";

const STATS = [
  { icon: Users, value: "1 in 7", label: "people are neurodivergent" },
  { icon: Library, value: "100+", label: "resources available" },
  { icon: Route, value: "Personalized", label: "learning pathways" },
  { icon: Sparkles, value: "AI-powered", label: "guidance, anytime" },
];

export function StatsSection() {
  return (
    <section className="border-y border-border bg-muted/30 py-14">
      <div className="container-page grid grid-cols-2 gap-6 lg:grid-cols-4">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
