import { notFound } from "next/navigation";
import { Award } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCertificateById } from "@/lib/data/certificates";
import { CertificateActions } from "./certificate-actions";

export default async function CertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  const supabase = await createClient();

  // RLS already restricts this to the owner or an admin -- a non-owner
  // guessing a certificate id gets an empty result here, not an error.
  const certificate = await getCertificateById(supabase, certificateId);
  if (!certificate) notFound();

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container-page px-6 py-20 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        <div
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
              CHINI Learn &middot; The Chini Trust
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground/70">
              Certificate ID: {certificate.id.toUpperCase()}
            </p>
          </div>
        </div>

        <CertificateActions />
      </div>
    </div>
  );
}
