"use client";

import { useParams, notFound } from "next/navigation";
import { Award, Download, Printer, Share2 } from "lucide-react";
import { motion } from "framer-motion";

import { notify } from "@/lib/toast";
import { mockCertificates } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/components/motion/reveal";

export default function CertificatePage() {
  const params = useParams<{ certificateId: string }>();
  const certificate = mockCertificates.find((c) => c.id === params.certificateId);

  if (!certificate) notFound();

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      notify.success("Link copied", "Certificate link copied to your clipboard.");
    } catch {
      notify.info("Copy this link", url);
    }
  };

  return (
    <div className="container-page px-6 py-20 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          id="certificate-print-area"
          className="relative w-full overflow-hidden rounded-3xl border border-primary/20 bg-card p-10 text-center shadow-soft-lg sm:p-16"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl [background:repeating-linear-gradient(90deg,var(--color-primary)_0,var(--color-primary)_1px,transparent_1px,transparent_10px)] opacity-[0.03]"
          />
          <div aria-hidden="true" className="absolute inset-3 rounded-2xl border border-primary/15 sm:inset-4" />

          <div className="relative">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
              <Award className="size-8" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="mt-7 text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase">
              Certificate of Completion
            </p>
            <div className="mx-auto mt-3 h-px w-16 bg-primary/40" />
            <h1 className="mt-6 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
              {certificate.learnerName}
            </h1>
            <p className="mt-5 text-muted-foreground">has successfully completed</p>
            <p className="mt-2 font-serif text-2xl text-primary">{certificate.courseTitle}</p>
            <p className="mt-7 text-sm text-muted-foreground">Issued on {issuedDate}</p>
            <div className="mx-auto mt-8 h-px w-24 bg-border" />
            <p className="mt-6 text-xs tracking-widest text-muted-foreground uppercase">
              NeuroBridge &middot; The Chini Trust
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">
              Certificate ID: {certificate.id.toUpperCase()}
            </p>
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 print:hidden">
          <Button onClick={() => window.print()}>
            <Download className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Download / Print
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Print
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Share link
          </Button>
        </div>
      </div>
    </div>
  );
}
