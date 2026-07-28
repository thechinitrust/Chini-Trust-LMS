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

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="container-page relative grid gap-16 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-12 lg:py-32"
      >
        <div>
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-widest text-primary-text uppercase"
          >
            <Brain className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            The Chini Trust
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-7 font-serif text-5xl leading-[1.05] tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl"
          >
            Empowering neurodiverse minds through{" "}
            <span className="text-primary italic">learning</span> and{" "}
            <span className="text-accent-text italic">inclusion</span>
          </motion.h1>

          <motion.p variants={item} className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A centralized platform for education, support, and accessible resources — tailored
            to every learning journey, built with neurodivergent people at the center.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton>
              <Button size="lg" asChild>
                <Link href="/learn">
                  Start learning
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

        <motion.div variants={item} className="relative mx-auto w-full max-w-md">
          {/* Scroll parallax lives on this inner wrapper only, so it never
              fights the outer motion.div's mount-in animation above. */}
          <motion.div style={{ y: imageY }} className="relative group">
            {/* Hero image with brand-tinted overlay + floating stat cards */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] border border-primary/15 shadow-soft-lg">
              <Image
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=900&q=80"
                alt="A teacher working one-to-one with a student at a table"
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 1024px) 28rem, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/45 via-primary/5 to-transparent transition-opacity duration-700 group-hover:opacity-80" />
            </div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-4 w-52 rounded-2xl border border-primary/15 bg-card/95 p-4 shadow-soft-lg backdrop-blur-xl sm:-left-8 transition-transform duration-500 group-hover:-translate-x-2"
            >
              <p className="font-serif text-2xl text-primary-text">1 in 7</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">people are neurodivergent</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-5 -right-3 w-44 rounded-2xl border border-accent/20 bg-card/95 p-4 shadow-soft-lg backdrop-blur-xl sm:-right-6 transition-transform duration-500 group-hover:translate-x-2"
            >
              <p className="font-serif text-2xl text-accent-text">100+</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">free resources</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
