"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListChecks, Pencil, Plus, Trash2 } from "lucide-react";

import type { Course, Module, Quiz } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { createQuiz, deleteQuiz, updateQuiz, type QuizInput } from "@/lib/data/quizzes";
import { notify } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

function emptyDraft(moduleId: string, courseId: string): QuizInput {
  return { moduleId, courseId, title: "", description: "", passThreshold: 70 };
}

export function QuizzesTable({
  quizzes,
  modules,
  courses,
  questionCounts,
}: {
  quizzes: Quiz[];
  modules: Module[];
  courses: Course[];
  questionCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<QuizInput | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const courseTitle = (courseId: string) => courses.find((c) => c.id === courseId)?.title ?? "—";

  const openCreate = () => {
    const firstModule = modules[0];
    setEditingId(null);
    setDraft(emptyDraft(firstModule?.id ?? "", firstModule?.courseId ?? ""));
    setDialogOpen(true);
  };

  const openEdit = (quiz: Quiz) => {
    setEditingId(quiz.id);
    setDraft({
      moduleId: quiz.moduleId,
      courseId: quiz.courseId,
      title: quiz.title,
      description: quiz.description,
      passThreshold: quiz.passThreshold,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      notify.error("Title is required");
      return;
    }
    setIsSaving(true);
    try {
      const supabase = createClient();
      if (editingId) {
        await updateQuiz(supabase, editingId, draft);
      } else {
        await createQuiz(supabase, draft);
      }
      notify.success("Quiz saved");
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save quiz", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This also removes its questions and options. This can't be undone.`)) return;
    try {
      const supabase = createClient();
      await deleteQuiz(supabase, id);
      notify.success("Quiz deleted");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't delete ${title}`, error instanceof Error ? error.message : undefined);
    }
  };

  const columns: AdminTableColumn<Quiz>[] = [
    { header: "Title", cell: (q) => <span className="font-medium text-foreground">{q.title}</span> },
    { header: "Course", cell: (q) => courseTitle(q.courseId) },
    {
      header: "Questions",
      cell: (q) => (
        <Link href={`/admin/quizzes/${q.id}`}>
          <Badge variant="outline" className="gap-1.5 hover:bg-muted">
            <ListChecks className="size-3.5" aria-hidden="true" />
            {questionCounts[q.id] ?? 0}
          </Badge>
        </Link>
      ),
    },
    { header: "Pass threshold", cell: (q) => `${q.passThreshold}%` },
    {
      header: "Actions",
      cell: (q) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(q)} aria-label={`Edit ${q.title}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(q.id, q.title)} aria-label={`Delete ${q.title}`}>
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
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Quizzes</h1>
          <p className="mt-2 text-muted-foreground">
            Manage assessments attached to each module. Click the question count to edit questions and answers.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New quiz
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={quizzes} getRowId={(q) => q.id} emptyTitle="No quizzes yet" />
      </div>

      {draft && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editingId ? "Edit quiz" : "New quiz"}
          description="Manage questions and answer options from the quiz's own page after saving."
          onSubmit={handleSave}
          submitLabel={isSaving ? "Saving…" : "Save quiz"}
        >
          <FormField label="Module" htmlFor="quiz-module">
            <Select
              value={draft.moduleId}
              onValueChange={(v) =>
                setDraft({ ...draft, moduleId: v, courseId: modules.find((m) => m.id === v)?.courseId ?? "" })
              }
            >
              <SelectTrigger id="quiz-module">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modules.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {courseTitle(m.courseId)} — {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Title" htmlFor="quiz-title">
            <Input
              id="quiz-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Description" htmlFor="quiz-description">
            <Textarea
              id="quiz-description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
            />
          </FormField>
          <FormField label="Pass threshold (%)" htmlFor="quiz-threshold">
            <Input
              id="quiz-threshold"
              type="number"
              min={0}
              max={100}
              value={draft.passThreshold}
              onChange={(e) => setDraft({ ...draft, passThreshold: Number(e.target.value) })}
            />
          </FormField>
        </AdminForm>
      )}
    </div>
  );
}
