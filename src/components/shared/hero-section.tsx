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

interface HeroSectionProps {
  imageUrl?: string;
  imageAlt?: string;
}

export function HeroSection({
  imageUrl = "/images/home-hero.jpg",
  imageAlt = "Colorful illustration of diverse human profiles representing neurodiversity",
}: HeroSectionProps = {}) {
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
      {/* Background full-width artwork with parallax scroll */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        
        {/* Restrict the image wrapper to the right side of the screen on desktop to push the brain right and scale it down */}
        <motion.div style={{ y: imageY }} className="absolute inset-y-0 right-0 w-full lg:w-[65%]">
          {/* Smooth fade on the left edge using CSS mask */}
          <div className="absolute inset-0 w-full h-full" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 25%)', maskImage: 'linear-gradient(to right, transparent, black 25%)' }}>
            {/* Smooth fade on the top and bottom edges using CSS mask */}
            <div className="absolute inset-0 w-full h-full" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                priority
                className="object-cover object-right opacity-85 dark:opacity-75"
                sizes="100vw"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Horizontal gradient overlay protecting left text column readability (covers full width for mobile) */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 via-40% to-transparent lg:hidden" />
      </div>

      {/* Ambient duotone brand glow */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.64, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-[-12rem] left-1/4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl z-0"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="container-page relative z-10 grid gap-12 px-6 pt-10 pb-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-12 lg:pt-14 lg:pb-32"
      >
        <div className="max-w-2xl">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-widest text-primary-text uppercase backdrop-blur-md"
          >
            <Brain className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            The Chini Trust
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-7 font-serif text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Your guide to <span className="text-primary italic">neurodiversity</span> and{" "}
            <span className="text-accent-text italic">inclusion</span>
          </motion.h1>

          <motion.ul
            variants={item}
            className="mt-8 space-y-2.5 text-lg leading-snug font-medium text-foreground/90 sm:text-xl"
          >
            {["Learn at your own pace", "Discover practical tools", "Create more inclusive spaces"].map(
              (promise) => (
                <li key={promise} className="flex items-center gap-3.5">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-primary/60 ring-4 ring-primary/15"
                  />
                  {promise}
                </li>
              )
            )}
          </motion.ul>

          <motion.p
            variants={item}
            className="mt-5 max-w-lg border-l-2 border-primary/30 pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
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
      </motion.div>
    </section>
  );
}
