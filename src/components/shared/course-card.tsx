import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";

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
    <Card className="group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <Image
          src={course.thumbnailUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, 100vw"
        />
        <Badge className="absolute left-3 top-3" variant="secondary">
          {CATEGORY_LABEL[course.category]}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-semibold leading-snug text-foreground">{course.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{course.summary}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          {course.estimatedMinutes} min &middot; {course.level}
        </div>
        {typeof progress === "number" && <ProgressBar value={progress} />}
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          {typeof progress === "number" && progress > 0 ? "Continue learning" : "Learn more"}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
