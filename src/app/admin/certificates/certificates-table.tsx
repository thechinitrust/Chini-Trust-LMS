"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Eye, PenLine, Plus, RefreshCw, Trash2 } from "lucide-react";

import type { Certificate, Course, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { issueCertificateManually, recheckCertificateEligibility, revokeCertificate } from "@/lib/data/certificates";
import { updateCourseCertificateTemplate } from "@/lib/data/courses";
import { notify } from "@/lib/toast";
import { useConfirm } from "@/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";
import {
  CertificateTemplateUpload,
  type CertificateTemplateValue,
} from "@/components/admin/certificate-template-upload";
import { EmptyState } from "@/components/shared/empty-state";

const RECENT_LIMIT = 8;

function relativeDate(iso: string) {
  const then = new Date(iso).getTime();
  const days = Math.round((then - Date.now()) / 86_400_000);
  const fmt = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(days) < 1) return "today";
  if (Math.abs(days) < 30) return fmt.format(days, "day");
  if (Math.abs(days) < 365) return fmt.format(Math.round(days / 30), "month");
  return fmt.format(Math.round(days / 365), "year");
}

interface CourseGroup {
  courseId: string;
  courseTitle: string;
  /** Absent when the course is no longer readable (title falls back to the certificate snapshot). */
  course?: Course;
  certificates: Certificate[];
  latestIssuedAt?: string;
}

/**
 * Admin certificates. Certificates are issued automatically by Postgres on
 * course completion, so this screen is a *log* first and a control panel
 * second: what went out recently, grouped by course, with each course's
 * certificate artwork managed in place.
 */
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
  const { confirm, ConfirmDialog } = useConfirm();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [learnerFilter, setLearnerFilter] = React.useState("");

  const sortedProfiles = React.useMemo(
    () => [...profiles].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [profiles]
  );
  const [draft, setDraft] = React.useState({ userId: "", courseId: "" });

  const recent = React.useMemo(
    () =>
      [...certificates]
        .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
        .slice(0, RECENT_LIMIT),
    [certificates]
  );

  /**
   * Every course that either requires a certificate or already has one. The
   * second half matters: turning "requires certificate" off later must not
   * make already-issued certificates disappear from this page.
   */
  const groups = React.useMemo<CourseGroup[]>(() => {
    const byCourse = new Map<string, Certificate[]>();
    for (const cert of certificates) {
      const list = byCourse.get(cert.courseId);
      if (list) list.push(cert);
      else byCourse.set(cert.courseId, [cert]);
    }

    const seen = new Set<string>();
    const result: CourseGroup[] = [];

    for (const course of courses) {
      const issued = byCourse.get(course.id) ?? [];
      if (!course.requiresCertificate && issued.length === 0) continue;
      seen.add(course.id);
      issued.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
      result.push({
        courseId: course.id,
        courseTitle: course.title,
        course,
        certificates: issued,
        latestIssuedAt: issued[0]?.issuedAt,
      });
    }

    // Certificates whose course we can't read — keep them visible rather than
    // silently dropping them, using the title snapshotted on the certificate.
    for (const [courseId, issued] of byCourse) {
      if (seen.has(courseId)) continue;
      issued.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
      result.push({
        courseId,
        courseTitle: issued[0]?.courseTitle ?? "Unknown course",
        certificates: issued,
        latestIssuedAt: issued[0]?.issuedAt,
      });
    }

    // Courses that have issued something float to the top, most recent first;
    // the not-yet-issued ones sit below alphabetically, ready for setup.
    return result.sort((a, b) => {
      if (a.latestIssuedAt && b.latestIssuedAt) {
        return new Date(b.latestIssuedAt).getTime() - new Date(a.latestIssuedAt).getTime();
      }
      if (a.latestIssuedAt) return -1;
      if (b.latestIssuedAt) return 1;
      return a.courseTitle.localeCompare(b.courseTitle);
    });
  }, [certificates, courses]);

  const openIssue = () => {
    setLearnerFilter("");
    setDraft({ userId: sortedProfiles[0]?.id ?? "", courseId: courses[0]?.id ?? "" });
    setDialogOpen(true);
  };

  const handleIssue = async () => {
    const learner = sortedProfiles.find((p) => p.id === draft.userId);
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
    const ok = await confirm({
      title: "Revoke certificate?",
      description: `Revoke ${learnerName}'s certificate? This can't be undone.`,
      confirmLabel: "Revoke",
    });
    if (!ok) return;
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

  /**
   * `learner_name` and `course_title` are snapshots frozen when the
   * certificate was issued, so a renamed learner or a retitled course goes
   * stale with no way to correct it. issueCertificateManually upserts on
   * (user_id, course_id) and doesn't touch issued_at, so re-running it
   * re-copies the current values while keeping the original date and id.
   */
  const handleRefreshDetails = async (cert: Certificate) => {
    const learner = profiles.find((p) => p.id === cert.userId);
    const course = courses.find((c) => c.id === cert.courseId);
    if (!learner && !course) {
      notify.error("Couldn't refresh details", "The learner and course could not be found.");
      return;
    }
    try {
      const supabase = createClient();
      await issueCertificateManually(supabase, {
        userId: cert.userId,
        courseId: cert.courseId,
        learnerName: learner?.fullName ?? cert.learnerName,
        courseTitle: course?.title ?? cert.courseTitle,
      });
      notify.success("Details refreshed", "Name and course title now match the current records.");
      router.refresh();
    } catch (error) {
      notify.error("Couldn't refresh details", error instanceof Error ? error.message : undefined);
    }
  };

  const columns: AdminTableColumn<Certificate>[] = [
    { header: "Learner", cell: (c) => <span className="font-medium text-foreground">{c.learnerName}</span> },
    {
      header: "Issued",
      cell: (c) => (
        <span className="whitespace-nowrap">
          {new Date(c.issuedAt).toLocaleDateString()}
          <span className="ml-2 text-xs text-muted-foreground">{relativeDate(c.issuedAt)}</span>
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (c) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" asChild aria-label={`View certificate for ${c.learnerName}`}>
            <Link href={`/certificates/${c.id}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleRefreshDetails(c)}
            aria-label={`Refresh name and course title for ${c.learnerName}`}
            title="Refresh name and course title"
          >
            <PenLine className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleRecheck(c.userId, c.courseId)}
            aria-label={`Re-check eligibility for ${c.learnerName}`}
            title="Re-check eligibility"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleRevoke(c.id, c.learnerName)}
            aria-label={`Revoke certificate for ${c.learnerName}`}
            title="Revoke"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredProfiles = sortedProfiles.filter((p) =>
    p.fullName.toLowerCase().includes(learnerFilter.trim().toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Certificates</h1>
          <p className="mt-2 text-muted-foreground">
            Issued automatically when a learner finishes every lesson and passes any required
            quizzes. Grouped by course, with each course&apos;s template.
          </p>
        </div>
        <Button onClick={openIssue}>
          <Plus className="size-4" aria-hidden="true" />
          Issue certificate
        </Button>
      </div>

      {recent.length > 0 && (
        <section className="mt-8 rounded-2xl border border-border bg-card-subtle p-5">
          <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
            Recently issued
          </h2>
          <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {recent.map((cert) => (
              <li key={cert.id} className="min-w-0 text-sm">
                <Link
                  href={`/certificates/${cert.id}`}
                  className="flex items-baseline justify-between gap-3 rounded-md py-1 hover:text-primary-text"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium text-foreground">{cert.learnerName}</span>
                    <span className="text-muted-foreground"> · {cert.courseTitle}</span>
                  </span>
                  <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                    {relativeDate(cert.issuedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6">
        {groups.length === 0 ? (
          <EmptyState
            title="No certificate courses yet"
            description="Turn on 'Requires certificate' for a course to manage its template here."
          />
        ) : (
          <Accordion type="multiple" className="rounded-2xl border border-border px-5">
            {groups.map((group) => (
              <AccordionItem key={group.courseId} value={group.courseId}>
                <AccordionTrigger>
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="truncate text-foreground">{group.courseTitle}</span>
                    <Badge variant={group.certificates.length > 0 ? "brand" : "outline"}>
                      {group.certificates.length} issued
                    </Badge>
                    {group.course?.certificateTemplateUrl ? (
                      <Badge variant="accent">Custom template</Badge>
                    ) : (
                      <Badge variant="outline">Default design</Badge>
                    )}
                    {group.latestIssuedAt && (
                      <span className="text-xs font-normal text-muted-foreground">
                        latest {relativeDate(group.latestIssuedAt)}
                      </span>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {group.course ? (
                    <CourseTemplatePanel course={group.course} />
                  ) : (
                    <p className="rounded-lg border border-border p-3 text-sm">
                      This course is no longer available, so its template can&apos;t be edited.
                    </p>
                  )}

                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-medium text-foreground">
                      Issued certificates
                    </h3>
                    <AdminTable
                      columns={columns}
                      rows={group.certificates}
                      getRowId={(c) => c.id}
                      emptyTitle="Nothing issued yet"
                      emptyDescription="Certificates appear here as learners complete the course."
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
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
          <Input
            value={learnerFilter}
            onChange={(e) => setLearnerFilter(e.target.value)}
            placeholder="Filter by name…"
            aria-label="Filter learners"
            className="mb-2"
          />
          <Select value={draft.userId} onValueChange={(v) => setDraft({ ...draft, userId: v })}>
            <SelectTrigger id="cert-user">
              <SelectValue placeholder="Select a learner" />
            </SelectTrigger>
            <SelectContent>
              {filteredProfiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filteredProfiles.length === 0 && (
            <p className="mt-1.5 text-xs text-muted-foreground">No learners match that filter.</p>
          )}
        </FormField>
        <FormField label="Course" htmlFor="cert-course">
          <Select value={draft.courseId} onValueChange={(v) => setDraft({ ...draft, courseId: v })}>
            <SelectTrigger id="cert-course">
              <SelectValue placeholder="Select a course" />
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

      {ConfirmDialog}
    </div>
  );
}

/**
 * A course's certificate artwork, editable without leaving this page. Saves
 * through the narrow updateCourseCertificateTemplate rather than updateCourse,
 * so it can't clobber fields the course editor owns.
 */
function CourseTemplatePanel({ course }: { course: Course }) {
  const router = useRouter();
  const initial = React.useMemo<CertificateTemplateValue>(
    () => ({
      templateUrl: course.certificateTemplateUrl,
      textTone: course.certificateTextTone,
      textOffset: course.certificateTextOffset,
    }),
    [course]
  );
  const [value, setValue] = React.useState(initial);
  const [isSaving, setIsSaving] = React.useState(false);

  // The server component re-renders this panel after router.refresh(); resync
  // so the "unsaved changes" state clears once the save lands.
  React.useEffect(() => setValue(initial), [initial]);

  const dirty = JSON.stringify(value) !== JSON.stringify(initial);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      await updateCourseCertificateTemplate(supabase, course.id, {
        templateUrl: value.templateUrl,
        textTone: value.textTone,
        textOffset: value.textOffset,
      });
      notify.success("Template saved", course.title);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save template", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border p-4">
      <CertificateTemplateUpload
        courseTitle={course.title}
        value={value}
        onChange={setValue}
        disabled={isSaving}
      />
      <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">
        {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
        <Button type="button" size="sm" onClick={handleSave} disabled={!dirty || isSaving}>
          {isSaving ? "Saving…" : "Save template"}
        </Button>
      </div>
    </div>
  );
}
