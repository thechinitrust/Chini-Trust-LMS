"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Brain } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/components/motion/reveal";

import { MagneticButton } from "@/components/motion/magnetic-button";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } },
};

export function HeroSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  // Gentle parallax drift as the hero scrolls out of view — the kind of
  // slow, buttery motion that reads as "premium" rather than gimmicky.
  // Kept on its own nested element (not the entrance-animated motion.div)
  // so the scroll-linked transform never fights the mount `variants`.
  const imageY = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, 90]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
      {/* Two-tone brand glow — olive + indigo, the signature duotone mesh */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[-12rem] left-1/2 h-[36rem] w-[36rem] -translate-x-[65%] rounded-full bg-primary/12 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="pointer-events-none absolute top-[-6rem] right-0 h-[32rem] w-[32rem] translate-x-1/3 rounded-full bg-accent/14 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="pointer-events-none absolute bottom-[-10rem] left-[10%] h-[24rem] w-[24rem] rounded-full bg-accent/8 blur-3xl"
      />

      {/* Asymmetric vertical padding: the hero sits directly under the navbar, so
          a full py-24/32 above it reads as dead space rather than breathing room.
          The bottom keeps its full value to separate the hero from the section
          below. */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="container-page relative grid gap-14 px-6 pt-10 pb-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:px-12 lg:pt-14 lg:pb-32"
      >
        <div>
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-widest text-primary-text uppercase"
          >
            <Brain className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            The Chini Trust
          </motion.span>

          {/* `text-balance` is deliberately absent: at display sizes it evens the
              line lengths out into short ragged lines, leaving a visible gap down
              the right of the column. Letting the lines fill naturally keeps the
              headline reading as one solid block. */}
          <motion.h1
            variants={item}
            className="mt-7 font-serif text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Your guide to <span className="text-primary italic">neurodiversity</span> and{" "}
            <span className="text-accent-text italic">inclusion</span>
          </motion.h1>

          {/* The three promises are a strapline, not a paragraph -- set as a real
              list, one step above the body copy in weight. Stacked rather than
              run inline with separators: at these widths an inline row wraps
              mid-list and strands a separator at the end of a line. One promise
              per row also lets each be scanned in a single eye movement. */}
          <motion.ul
            variants={item}
            className="mt-8 space-y-2.5 text-lg leading-snug font-medium text-foreground/90 sm:text-xl"
          >
            {["Learn at your own pace", "Discover practical tools", "Create more inclusive spaces"].map(
              (promise) => (
                <li key={promise} className="flex items-center gap-3.5">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-primary/50 ring-4 ring-primary/10"
                  />
                  {promise}
                </li>
              )
            )}
          </motion.ul>

          <motion.p
            variants={item}
            className="mt-5 max-w-lg border-l-2 border-primary/20 pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Explore courses, practical resources, and accessibility tools designed for anyone
            who wants to learn more and help everyone feel understood.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <MagneticButton>
              <Button size="lg" asChild>
                <Link href="/learn">
                  Explore courses
                  <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button size="lg" variant="accent" asChild>
                <Link href="/resources">Browse resources</Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div variants={item} className="relative mx-auto w-full max-w-xl">
          {/* Scroll parallax lives on this inner wrapper only, so it never
              fights the outer motion.div's mount-in animation above. */}
          <motion.div style={{ y: imageY }} className="relative group">
            {/* Hero illustration — the source art is 3:2, so the frame matches
                it exactly and object-contain guarantees nothing is cropped. */}
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[24px] border border-primary/15 bg-card shadow-soft-lg">
              <Image
                src="/images/home-hero.png"
                alt="An illustration of a student studying at a desk beneath an umbrella representing the neurodiversity spectrum"
                fill
                priority
                className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 36rem, 100vw"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
