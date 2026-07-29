"use client";

import { Download, Printer, Share2 } from "lucide-react";

import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";

export function CertificateActions() {
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
  );
}
