"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, Plus, Trash2 } from "lucide-react";

import { mockCertificates, mockProfiles, mockCourses, getCourseById } from "@/lib/mock-data";
import type { Certificate } from "@/lib/types";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

function emptyCertificate(): { userId: string; courseId: string } {
  return { userId: mockProfiles[0]?.id ?? "", courseId: mockCourses[0]?.id ?? "" };
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = React.useState<Certificate[]>(mockCertificates);
  const [draft, setDraft] = React.useState(emptyCertificate());
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openIssue = () => {
    setDraft(emptyCertificate());
    setDialogOpen(true);
  };

  const handleIssue = () => {
    const learner = mockProfiles.find((p) => p.id === draft.userId);
    const course = getCourseById(draft.courseId);
    if (!learner || !course) {
      notify.error("Select a learner and a course");
      return;
    }
    const certificate: Certificate = {
      id: `certificate-${Date.now()}`,
      userId: learner.id,
      courseId: course.id,
      learnerName: learner.fullName,
      courseTitle: course.title,
      issuedAt: new Date().toISOString(),
    };
    setCertificates((prev) => [certificate, ...prev]);
    notify.success("Certificate issued", `${learner.fullName} — ${course.title}`);
    setDialogOpen(false);
  };

  const handleRevoke = (id: string) => {
    setCertificates((prev) => prev.filter((c) => c.id !== id));
    notify.success("Certificate revoked");
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
          <Button size="icon" variant="ghost" onClick={() => handleRevoke(c.id)} aria-label={`Revoke certificate for ${c.learnerName}`}>
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Certificates</h1>
          <p className="mt-1 text-muted-foreground">Certificates issued automatically on course completion.</p>
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
        submitLabel="Issue certificate"
      >
        <FormField label="Learner" htmlFor="cert-user">
          <Select value={draft.userId} onValueChange={(v) => setDraft({ ...draft, userId: v })}>
            <SelectTrigger id="cert-user">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockProfiles.map((p) => (
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
              {mockCourses.map((c) => (
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
