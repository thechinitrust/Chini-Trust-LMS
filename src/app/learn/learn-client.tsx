"use client";

import * as React from "react";

import type { Course } from "@/lib/types";
import { categoryLabel } from "@/lib/categories";
import { LearningCard } from "@/components/shared/learning-card";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export interface LearnCourseSummary {
  course: Course;
  progress?: number;
  moduleCount: number;
  lessonCount: number;
}

export function LearnClient({ courses }: { courses: LearnCourseSummary[] }) {
  const [category, setCategory] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const categoryOptions = React.useMemo(() => {
    const distinct = Array.from(new Set(courses.map(({ course }) => course.category))).sort((a, b) =>
      categoryLabel(a).localeCompare(categoryLabel(b))
    );
    return [{ value: "all", label: "All topics" }, ...distinct.map((c) => ({ value: c, label: categoryLabel(c) }))];
  }, [courses]);

  const filtered = courses.filter(({ course }) => {
    const matchesCategory = category === "all" || course.category === category;
    const matchesQuery =
      query.trim().length === 0 || course.title.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="container-page px-6 py-20 lg:px-12">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Learning Hub</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Learn</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Structured, self-paced courses built around the topics that matter most: autism, ADHD,
          dyslexia, and workplace inclusion.
        </p>
      </Reveal>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs options={categoryOptions} value={category} onChange={setCategory} />
        <SearchInput
          placeholder="Search courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          containerClassName="w-full sm:w-64"
          aria-label="Search courses"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No courses found" description="Try a different topic or search term." />
        </div>
      ) : (
        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ course, progress, moduleCount, lessonCount }) => (
            <RevealItem key={course.id}>
              <LearningCard course={course} progress={progress} moduleCount={moduleCount} lessonCount={lessonCount} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
