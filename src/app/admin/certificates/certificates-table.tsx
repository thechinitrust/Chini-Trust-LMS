"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Plus, RefreshCw, Trash2 } from "lucide-react";

import type { Certificate, Course, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { issueCertificateManually, recheckCertificateEligibility, revokeCertificate } from "@/lib/data/certificates";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

export function CertificatesTable({
  certificates,
  profiles,
  courses,
}: {
  certificates: Certificate[];
  profiles: Profile[];
  courses: Course[];
}) {
  const router = useRouter();
  const [draft, setDraft] = React.useState({ userId: profiles[0]?.id ?? "", courseId: courses[0]?.id ?? "" });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const openIssue = () => {
    setDraft({ userId: profiles[0]?.id ?? "", courseId: courses[0]?.id ?? "" });
    setDialogOpen(true);
  };

  const handleIssue = async () => {
    const learner = profiles.find((p) => p.id === draft.userId);
    const course = courses.find((c) => c.id === draft.courseId);
    if (!learner || !course) {
      notify.error("Select a learner and a course");
      return;
    }
    setIsSaving(true);
    try {
      const supabase = createClient();
      await issueCertificateManually(supabase, {
        userId: learner.id,
        courseId: course.id,
        learnerName: learner.fullName,
        courseTitle: course.title,
      });
      notify.success("Certificate issued", `${learner.fullName} — ${course.title}`);
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't issue certificate", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevoke = async (id: string, learnerName: string) => {
    if (!window.confirm(`Revoke ${learnerName}'s certificate? This can't be undone.`)) return;
    try {
      const supabase = createClient();
      await revokeCertificate(supabase, id);
      notify.success("Certificate revoked");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't revoke certificate for ${learnerName}`, error instanceof Error ? error.message : undefined);
    }
  };

  const handleRecheck = async (userId: string, courseId: string) => {
    try {
      const supabase = createClient();
      await recheckCertificateEligibility(supabase, userId, courseId);
      notify.success("Eligibility re-checked");
      router.refresh();
    } catch (error) {
      notify.error("Couldn't re-check eligibility", error instanceof Error ? error.message : undefined);
    }
  };

  const columns: AdminTableColumn<Certificate>[] = [
    { header: "Learner", cell: (c) => <span className="font-medium text-foreground">{c.learnerName}</span> },
    { header: "Course", cell: (c) => c.courseTitle },
    { header: "Issued", cell: (c) => new Date(c.issuedAt).toLocaleDateString() },
    {
      header: "Actions",
      cell: (c) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" asChild aria-label={`View certificate for ${c.learnerName}`}>
            <Link href={`/certificates/${c.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleRecheck(c.userId, c.courseId)}
            aria-label={`Re-check eligibility for ${c.learnerName}`}
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleRevoke(c.id, c.learnerName)} aria-label={`Revoke certificate for ${c.learnerName}`}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Certificates</h1>
          <p className="mt-2 text-muted-foreground">Certificates issued automatically on course completion.</p>
        </div>
        <Button onClick={openIssue}>
          <Plus className="size-4" aria-hidden="true" />
          Issue certificate
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={certificates} getRowId={(c) => c.id} emptyTitle="No certificates issued yet" />
      </div>

      <AdminForm
        trigger={<span />}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Issue certificate"
        description="Manually issue a certificate outside the automatic completion flow."
        onSubmit={handleIssue}
        submitLabel={isSaving ? "Issuing…" : "Issue certificate"}
      >
        <FormField label="Learner" htmlFor="cert-user">
          <Select value={draft.userId} onValueChange={(v) => setDraft({ ...draft, userId: v })}>
            <SelectTrigger id="cert-user">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Course" htmlFor="cert-course">
          <Select value={draft.courseId} onValueChange={(v) => setDraft({ ...draft, courseId: v })}>
            <SelectTrigger id="cert-course">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </AdminForm>
    </div>
  );
}
