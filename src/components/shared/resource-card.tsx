"use client";

import { Download, FileText, Presentation, ClipboardList, Link as LinkIcon, BookMarked } from "lucide-react";
import { motion } from "framer-motion";

import type { Resource } from "@/lib/types";
import { audienceLabel } from "@/lib/audiences";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Each resource type gets its own icon + colourway so a grid of resources
 * reads as visually varied rather than a wall of identical cards.
 */
const TYPE_VISUAL: Record<
  Resource["type"],
  { icon: typeof FileText; label: string; className: string; pattern: string }
> = {
  pdf: {
    icon: FileText,
    label: "PDF",
    className: "bg-primary/12 text-primary-text ring-primary/20",
    pattern: "from-primary/12 to-primary/0",
  },
  slides: {
    icon: Presentation,
    label: "Slides",
    className: "bg-accent/12 text-accent-text ring-accent/20",
    pattern: "from-accent/12 to-accent/0",
  },
  worksheet: {
    icon: ClipboardList,
    label: "Worksheet",
    className: "bg-success/12 text-success-text ring-success/20",
    pattern: "from-success/12 to-success/0",
  },
  guide: {
    icon: BookMarked,
    label: "Guide",
    className: "bg-primary/12 text-primary-text ring-primary/20",
    pattern: "from-primary/14 to-primary/0",
  },
  link: {
    icon: LinkIcon,
    label: "Link",
    className: "bg-warning/12 text-warning-text ring-warning/20",
    pattern: "from-warning/12 to-warning/0",
  },
};

/** Cards stay one line of badges — the rest of the audiences roll up into "+N". */
const VISIBLE_AUDIENCES = 2;

export function ResourceCard({ resource }: { resource: Resource }) {
  const visual = TYPE_VISUAL[resource.type];
  const Icon = visual.icon;
  const shownAudiences = resource.audiences.slice(0, VISIBLE_AUDIENCES);
  const hiddenAudiences = resource.audiences.slice(VISIBLE_AUDIENCES);

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="h-full">
      <Card interactive className="flex h-full flex-col overflow-hidden">
        {/* Illustrated header band — gives each resource type its own look */}
        <div
          className={cn(
            "relative flex h-28 items-center justify-center bg-gradient-to-br",
            visual.pattern
          )}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 11px)",
            }}
          />
          <span
            className={cn(
              "relative flex size-14 items-center justify-center rounded-2xl ring-1 backdrop-blur-sm",
              visual.className
            )}
          >
            <Icon className="size-6" strokeWidth={1.5} />
          </span>
          <Badge variant="outline" className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm">
            {visual.label}
          </Badge>
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="font-semibold leading-snug text-foreground">{resource.title}</h3>
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{resource.summary}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {shownAudiences.map((audience) => (
                <Badge key={audience} variant="secondary">
                  {audienceLabel(audience)}
                </Badge>
              ))}
              {hiddenAudiences.length > 0 && (
                <Badge variant="outline" title={hiddenAudiences.map(audienceLabel).join(", ")}>
                  +{hiddenAudiences.length}
                </Badge>
              )}
            </div>
            <Button size="sm" variant="outline" asChild>
              <a href={resource.fileUrl} download>
                <Download className="size-4" strokeWidth={1.5} aria-hidden="true" />
                Download
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
