import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCertificateById } from "@/lib/data/certificates";
import { getCourseById } from "@/lib/data/courses";
import { CertificateArtwork } from "@/components/shared/certificate-artwork";
import { CertificateActions } from "./certificate-actions";

export default async function CertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = await params;
  const supabase = await createClient();

  // RLS already restricts this to the owner or an admin -- a non-owner
  // guessing a certificate id gets an empty result here, not an error.
  const certificate = await getCertificateById(supabase, certificateId);
  if (!certificate) notFound();

  // Only for the course's certificate artwork. Learners can only select
  // *published* courses under RLS, so an unpublished (or since-deleted) course
  // resolves to undefined -- in which case we fall back to the built-in
  // design. A certificate must never break because of a course's publish state.
  const course = await getCourseById(supabase, certificate.courseId).catch(() => undefined);

  return (
    <div className="container-page px-6 py-20 lg:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8">
        <CertificateArtwork
          learnerName={certificate.learnerName}
          courseTitle={certificate.courseTitle}
          issuedAt={certificate.issuedAt}
          certificateId={certificate.id}
          templateUrl={course?.certificateTemplateUrl}
          textTone={course?.certificateTextTone}
          textOffset={course?.certificateTextOffset}
        />

        <CertificateActions />
      </div>
    </div>
  );
}
