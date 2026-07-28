"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SplitRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  /** Stagger delay (seconds) before this element's own reveal starts. */
  delay?: number;
  /** ScrollTrigger start position — when the element is considered "entered". */
  start?: string;
}

/**
 * Word-by-word masked reveal, driven by GSAP + ScrollTrigger rather than
 * Framer Motion — each word slides up out of a clipped mask. Re-plays in
 * both scroll directions via `toggleActions: "play reverse play reverse"`.
 * Renders plain text on the server; splitting/animation only happens after
 * mount, so there's no hydration mismatch and no-JS visitors still get the
 * full sentence.
 */
const WORD_SEPARATOR = String.fromCharCode(32);

export function SplitReveal({ text, className, wordClassName, delay = 0, start = "top 85%" }: SplitRevealProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const words = React.useMemo(() => text.split(WORD_SEPARATOR), [text]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wordEls = el.querySelectorAll<HTMLElement>("[data-split-word]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.set(wordEls, { yPercent: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordEls,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          delay,
          stagger: 0.045,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: "play reverse play reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, start, words]);

  return (
    <span ref={containerRef} className={className}>
      {words.map((word, i) => (
        // The separator is a plain sibling text node, not part of the
        // inline-block mask below — a trailing space *inside* an
        // inline-block gets silently collapsed away by the browser, which
        // is what caused words to run together with no gap.
        <React.Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.15em] -mb-[0.15em] align-top">
            <span data-split-word className={cn("inline-block will-change-transform", wordClassName)}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? WORD_SEPARATOR : null}
        </React.Fragment>
      ))}
    </span>
  );
}
