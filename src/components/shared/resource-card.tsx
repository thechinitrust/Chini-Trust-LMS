import { Download, FileText, Presentation, ClipboardList, Link as LinkIcon } from "lucide-react";

import type { Resource } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TYPE_ICON: Record<Resource["type"], typeof FileText> = {
  pdf: FileText,
  slides: Presentation,
  worksheet: ClipboardList,
  guide: FileText,
  link: LinkIcon,
};

const AUDIENCE_LABEL: Record<Resource["category"], string> = {
  parents: "Parents",
  teachers: "Teachers",
  students: "Students",
  employers: "Employers",
  "neurodivergent-individuals": "Neurodivergent individuals",
};

export function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = TYPE_ICON[resource.type];
  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <Badge variant="outline" className="uppercase">
            {resource.type}
          </Badge>
        </div>
        <h3 className="font-semibold leading-snug text-foreground">{resource.title}</h3>
        <p className="flex-1 text-sm text-muted-foreground">{resource.summary}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary">{AUDIENCE_LABEL[resource.category]}</Badge>
          <Button size="sm" variant="outline" asChild>
            <a href={resource.fileUrl} download>
              <Download className="size-3.5" aria-hidden="true" />
              Download
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
