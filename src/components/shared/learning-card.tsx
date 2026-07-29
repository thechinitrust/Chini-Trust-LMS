"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Layers, Signal } from "lucide-react";
import { motion } from "framer-motion";

import type { Course } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";

const CATEGORY_LABEL: Record<Course["category"], string> = {
  autism: "Autism",
  adhd: "ADHD",
  dyslexia: "Dyslexia",
  workplace: "Workplace Inclusion",
};

const AUDIENCE_LABEL: Record<string, string> = {
  students: "Students",
  parents: "Parents",
  teachers: "Teachers",
  employers: "Employers",
  "neurodivergent-individuals": "Neurodivergent individuals",
};

interface LearningCardProps {
  course: Course;
  progress?: number;
  lessonCount?: number;
  moduleCount?: number;
}

export function LearningCard({ course, progress, lessonCount, moduleCount }: LearningCardProps) {
  const started = typeof progress === "number" && progress > 0;

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="h-full">
      <Link href={`/courses/${course.slug}`} className="group block h-full">
        <Card interactive className="flex h-full flex-col overflow-hidden">
          {/* Thumbnail */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <Image
              src={course.thumbnailUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
            <Badge className="absolute top-3 left-3 border-none bg-primary text-primary-foreground shadow-soft">
              {CATEGORY_LABEL[course.category]}
            </Badge>
            {started && (
              <span className="absolute right-3 bottom-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-primary-text shadow-soft dark:bg-black/80">
                {progress}% complete
              </span>
            )}
          </div>

          <CardContent className="flex flex-1 flex-col gap-3.5 p-6">
            <h3 className="font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-primary-text">
              {course.title}
            </h3>
            <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{course.summary}</p>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-primary-text" strokeWidth={1.5} aria-hidden="true" />
                {course.estimatedMinutes} min
              </span>
              {typeof moduleCount === "number" && (
                <span className="flex items-center gap-1.5">
                  <Layers className="size-4 text-primary-text" strokeWidth={1.5} aria-hidden="true" />
                  {moduleCount} modules
                </span>
              )}
              {typeof lessonCount === "number" && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="size-4 text-primary-text" strokeWidth={1.5} aria-hidden="true" />
                  {lessonCount} lessons
                </span>
              )}
              <span className="flex items-center gap-1.5 capitalize">
                <Signal className="size-4 text-primary-text" strokeWidth={1.5} aria-hidden="true" />
                {course.level}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {course.audience.slice(0, 2).map((a) => (
                <Badge key={a} variant="secondary" className="text-[11px]">
                  {AUDIENCE_LABEL[a] ?? a}
                </Badge>
              ))}
            </div>

            {started && <ProgressBar value={progress} showPercent={false} />}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
