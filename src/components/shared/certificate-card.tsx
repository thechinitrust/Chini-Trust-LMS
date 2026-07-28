import { Award, Download } from "lucide-react";

import type { Certificate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <Card className="overflow-hidden transition-shadow duration-500 hover:shadow-soft-lg">
      <CardContent className="flex items-center gap-4 p-6">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Award className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground">{certificate.courseTitle}</h3>
          <p className="text-xs text-muted-foreground">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <a href={`/certificates/${certificate.id}`}>
            <Download className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            View
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
