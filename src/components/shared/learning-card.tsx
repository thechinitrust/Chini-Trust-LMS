import Link from "next/link";
import { Clock } from "lucide-react";

import type { Course } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";

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
}

export function LearningCard({ course, progress }: LearningCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-snug text-foreground">{course.title}</h3>
          <Badge variant="outline" className="shrink-0 capitalize">
            {course.category}
          </Badge>
        </div>
        <p className="flex-1 text-sm text-muted-foreground">{course.summary}</p>
        <div className="flex flex-wrap gap-1.5">
          {course.audience.slice(0, 2).map((a) => (
            <Badge key={a} variant="secondary" className="text-[11px]">
              {AUDIENCE_LABEL[a] ?? a}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          {course.estimatedMinutes} min estimated
        </div>
        {typeof progress === "number" && progress > 0 && <ProgressBar value={progress} />}
        <Button asChild className="mt-auto w-full">
          <Link href={`/courses/${course.id}`}>Learn More</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
