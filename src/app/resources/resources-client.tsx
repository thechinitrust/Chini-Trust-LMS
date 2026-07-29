"use client";

import * as React from "react";

import type { AudienceTag, Resource } from "@/lib/types";
import { ResourceCard } from "@/components/shared/resource-card";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

const CATEGORY_OPTIONS: { value: AudienceTag | "all"; label: string }[] = [
  { value: "all", label: "All resources" },
  { value: "parents", label: "Parents" },
  { value: "teachers", label: "Teachers" },
  { value: "students", label: "Students" },
  { value: "employers", label: "Employers" },
];

export function ResourcesClient({ resources }: { resources: Resource[] }) {
  const [category, setCategory] = React.useState<AudienceTag | "all">("all");
  const [query, setQuery] = React.useState("");

  const filtered = resources.filter((resource) => {
    const matchesCategory = category === "all" || resource.category === category;
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
        <FilterTabs options={CATEGORY_OPTIONS} value={category} onChange={setCategory} className="justify-center" />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No resources found" description="Try a different category or search term." />
        </div>
      ) : (
        <RevealGroup key={category} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
