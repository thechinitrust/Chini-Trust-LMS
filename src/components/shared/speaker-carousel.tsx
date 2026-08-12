"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

import type { Speaker } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HIGHLIGHT_MS = 2600;

function SpeakerCard({ speaker, isAccent, isHighlighted }: { speaker: Speaker; isAccent: boolean; isHighlighted: boolean }) {
  return (
    <Card
      tone={isAccent ? "accent" : "brand"}
      interactive
      className={cn(
        "flex h-full flex-col overflow-hidden text-center",
        isHighlighted && "ring-2 ring-primary ring-offset-4 ring-offset-background"
      )}
      data-speaker-id={speaker.id}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {speaker.photoUrl ? (
          <Image
            src={speaker.photoUrl}
            alt={speaker.name}
            fill
            draggable={false}
            className="object-cover transition-transform duration-700 ease-out hover:scale-105"
            sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 85vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <User className="size-10" strokeWidth={1} aria-hidden="true" />
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-lg text-foreground">{speaker.name}</h3>
        {speaker.role && (
          <p className="mt-1 text-xs font-medium tracking-wide text-primary-text uppercase">{speaker.role}</p>
        )}
        {speaker.organization && <p className="mt-0.5 text-xs text-muted-foreground">{speaker.organization}</p>}
        {speaker.bio && (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{speaker.bio}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function SpeakerCarousel({ speakers }: { speakers: Speaker[] }) {
  const searchParams = useSearchParams();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", containScroll: "trimSnaps" },
    [WheelGesturesPlugin({ forceWheelAxis: "x" })]
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);
  const sectionRef = React.useRef<HTMLDivElement>(null);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  React.useEffect(() => {
    const targetId = searchParams.get("speaker");
    if (!targetId || !emblaApi) return;
    const index = speakers.findIndex((s) => s.id === targetId);
    if (index === -1) return;

    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    emblaApi.scrollTo(index);
    setHighlightedId(targetId);
    const timeout = setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
    return () => clearTimeout(timeout);
  }, [searchParams, emblaApi, speakers]);

  if (speakers.length === 0) return null;

  return (
    <div id="speakers" ref={sectionRef} className="group/carousel relative scroll-mt-28">
      <div className="overflow-hidden px-1 py-1" ref={emblaRef}>
        <div className="flex gap-6">
          {speakers.map((speaker, i) => (
            <div
              key={speaker.id}
              className="min-w-0 shrink-0 grow-0 basis-[85%] animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 ease-out sm:basis-[45%] lg:basis-[30%] xl:basis-[23%]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <SpeakerCard speaker={speaker} isAccent={i % 2 === 1} isHighlighted={highlightedId === speaker.id} />
            </div>
          ))}
        </div>
      </div>

      {canScrollPrev && (
        <Button
          size="icon"
          variant="outline"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous speaker"
          className="absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-background opacity-0 shadow-soft-lg transition-opacity duration-300 group-hover/carousel:opacity-100 sm:flex"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
      )}
      {canScrollNext && (
        <Button
          size="icon"
          variant="outline"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next speaker"
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 rounded-full bg-background opacity-0 shadow-soft-lg transition-opacity duration-300 group-hover/carousel:opacity-100 sm:flex"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      )}

      <div className="mt-5 flex justify-center gap-2 sm:hidden">
        <Button size="icon" variant="outline" onClick={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev} aria-label="Previous speaker">
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <Button size="icon" variant="outline" onClick={() => emblaApi?.scrollNext()} disabled={!canScrollNext} aria-label="Next speaker">
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
