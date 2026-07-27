"use client";

import { useParams, notFound } from "next/navigation";
import { Award, Download, Printer, Share2 } from "lucide-react";

import { notify } from "@/lib/toast";
import { mockCertificates } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

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
    <div className="container-page py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
        <div
          id="certificate-print-area"
          className="relative w-full rounded-2xl border-4 border-primary/20 bg-card p-10 text-center shadow-sm sm:p-14"
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Award className="size-8" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Certificate of Completion
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {certificate.learnerName}
          </h1>
          <p className="mt-4 text-muted-foreground">has successfully completed</p>
          <p className="mt-2 text-xl font-semibold text-primary">{certificate.courseTitle}</p>
          <p className="mt-6 text-sm text-muted-foreground">Issued on {issuedDate}</p>
          <p className="mt-8 text-xs text-muted-foreground">NeuroBridge AI &middot; The Chini Trust</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 print:hidden">
          <Button onClick={() => window.print()}>
            <Download className="size-4" aria-hidden="true" />
            Download / Print
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            Print
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="size-4" aria-hidden="true" />
            Share link
          </Button>
        </div>
      </div>
    </div>
  );
}
