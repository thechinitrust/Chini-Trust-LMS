"use client";

import * as React from "react";

import { useAuth } from "@/context/auth-context";
import { mockCourses, getCourseCompletionPercent } from "@/lib/mock-data";
import type { LearningCategory } from "@/lib/types";
import { LearningCard } from "@/components/shared/learning-card";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";

const CATEGORY_OPTIONS: { value: LearningCategory | "all"; label: string }[] = [
  { value: "all", label: "All topics" },
  { value: "autism", label: "Autism" },
  { value: "adhd", label: "ADHD" },
  { value: "dyslexia", label: "Dyslexia" },
  { value: "workplace", label: "Workplace Inclusion" },
];

export default function LearnPage() {
  const { user } = useAuth();
  const [category, setCategory] = React.useState<LearningCategory | "all">("all");
  const [query, setQuery] = React.useState("");

  const courses = mockCourses.filter((course) => {
    const matchesCategory = category === "all" || course.category === category;
    const matchesQuery =
      query.trim().length === 0 || course.title.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery && course.published;
  });

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Learn</h1>
        <p className="mt-3 text-muted-foreground">
          Structured, self-paced courses built around the topics that matter most: autism, ADHD,
          dyslexia, and workplace inclusion.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
        <SearchInput
          placeholder="Search courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          containerClassName="w-full sm:w-64"
          aria-label="Search courses"
        />
      </div>

      {courses.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No courses found" description="Try a different topic or search term." />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <LearningCard
              key={course.id}
              course={course}
              progress={user ? getCourseCompletionPercent(user.id, course.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
