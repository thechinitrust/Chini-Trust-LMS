"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
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

interface CourseCardProps {
  course: Course;
  progress?: number;
}

export function CourseCard({ course, progress }: CourseCardProps) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="h-full">
      <Card className="group flex h-full flex-col overflow-hidden transition-shadow duration-500 hover:shadow-soft-lg">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={course.thumbnailUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <Badge className="absolute top-3 left-3 border-white/20 bg-white/90 text-foreground backdrop-blur-sm dark:bg-black/60">
            {CATEGORY_LABEL[course.category]}
          </Badge>
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-6 sm:p-6">
          <h3 className="font-semibold leading-snug text-foreground">{course.title}</h3>
          <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{course.summary}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-4" strokeWidth={1.5} aria-hidden="true" />
            {course.estimatedMinutes} min &middot; <span className="capitalize">{course.level}</span>
          </div>
          {typeof progress === "number" && <ProgressBar value={progress} />}
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary-text"
          >
            {typeof progress === "number" && progress > 0 ? "Continue learning" : "Learn more"}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
