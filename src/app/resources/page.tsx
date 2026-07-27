"use client";

import * as React from "react";

import { mockResources } from "@/lib/mock-data";
import type { AudienceTag } from "@/lib/types";
import { ResourceCard } from "@/components/shared/resource-card";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";

const CATEGORY_OPTIONS: { value: AudienceTag | "all"; label: string }[] = [
  { value: "all", label: "All resources" },
  { value: "parents", label: "Parents" },
  { value: "teachers", label: "Teachers" },
  { value: "students", label: "Students" },
  { value: "employers", label: "Employers" },
];

export default function ResourcesPage() {
  const [category, setCategory] = React.useState<AudienceTag | "all">("all");
  const [query, setQuery] = React.useState("");

  const resources = mockResources.filter((resource) => {
    const matchesCategory = category === "all" || resource.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q.length === 0 ||
      resource.title.toLowerCase().includes(q) ||
      resource.summary.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Resource Library</h1>
        <p className="mt-3 text-muted-foreground">
          Free, downloadable guides and toolkits for parents, teachers, students, and employers.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <SearchInput
          placeholder="Search resources..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search resources"
        />
        <FilterTabs options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
      </div>

      {resources.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No resources found" description="Try a different category or search term." />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
