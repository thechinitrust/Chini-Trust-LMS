"use client";

import { Brain } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { EASE_OUT } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function AuthCard({
  title,
  description,
  children,
  footer,
  sidePanel,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  sidePanel?: React.ReactNode;
}) {
  return (
    <div className="container-page flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        className={cn("w-full", sidePanel ? "max-w-5xl" : "max-w-md")}
      >
        {sidePanel ? (
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">{sidePanel}</div>
            <div className="lg:col-span-7">
              <div className="mb-6 flex flex-col items-center text-center lg:items-start lg:text-left">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
                  <Brain className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h1 className="mt-4 font-serif text-3xl tracking-tight text-foreground">{title}</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              </div>
              <Card className="rounded-3xl border-border/80 shadow-soft">
                <CardContent className="p-7 sm:p-8">{children}</CardContent>
              </Card>
              {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col items-center text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
                <Brain className="size-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h1 className="mt-5 font-serif text-3xl tracking-tight text-foreground">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
            <Card className="rounded-3xl">
              <CardContent className="p-7">{children}</CardContent>
            </Card>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </>
        )}
      </motion.div>
    </div>
  );
}
