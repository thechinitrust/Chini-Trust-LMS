"use client";

import * as React from "react";

import type { Resource } from "@/lib/types";
import { audienceLabel } from "@/lib/audiences";
import { ResourceCard } from "@/components/shared/resource-card";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export function ResourcesClient({ resources }: { resources: Resource[] }) {
  const [audience, setAudience] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  // Audiences are free text now, so the tabs come from what's actually tagged.
  const audienceOptions = React.useMemo(() => {
    const distinct = Array.from(new Set(resources.flatMap((r) => r.audiences))).sort((a, b) =>
      audienceLabel(a).localeCompare(audienceLabel(b))
    );
    return [
      { value: "all", label: "All resources" },
      ...distinct.map((a) => ({ value: a, label: audienceLabel(a) })),
    ];
  }, [resources]);

  const filtered = resources.filter((resource) => {
    const matchesCategory = audience === "all" || resource.audiences.includes(audience);
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q.length === 0 || resource.title.toLowerCase().includes(q) || resource.summary.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="container-page px-6 py-20 lg:px-12">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Resource Library</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Resource Library</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Free, downloadable guides and toolkits for parents, teachers, students, and employers.
        </p>
      </Reveal>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-4">
        <SearchInput
          placeholder="Search resources..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search resources"
        />
        <FilterTabs options={audienceOptions} value={audience} onChange={setAudience} className="justify-center" />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No resources found" description="Try a different category or search term." />
        </div>
      ) : (
        <RevealGroup key={audience} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <RevealItem key={resource.id}>
              <ResourceCard resource={resource} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
