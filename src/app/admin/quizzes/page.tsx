"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { mockQuizzes, mockModules, getCourseById, getModuleById, getQuestionsForQuiz } from "@/lib/mock-data";
import type { Quiz } from "@/lib/types";
import { notify } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

function emptyQuiz(moduleId: string): Quiz {
  const parentModule = getModuleById(moduleId);
  return {
    id: `quiz-${Date.now()}`,
    moduleId,
    courseId: parentModule?.courseId ?? "",
    title: "",
    description: "",
    passThreshold: 70,
    questionIds: [],
  };
}

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = React.useState<Quiz[]>(mockQuizzes);
  const [editing, setEditing] = React.useState<Quiz | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openCreate = () => {
    setEditing(emptyQuiz(mockModules[0]?.id ?? ""));
    setDialogOpen(true);
  };

  const openEdit = (quiz: Quiz) => {
    setEditing({ ...quiz });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      notify.error("Title is required");
      return;
    }
    const parentModule = getModuleById(editing.moduleId);
    const finalQuiz = { ...editing, courseId: parentModule?.courseId ?? editing.courseId };
    setQuizzes((prev) => {
      const exists = prev.some((q) => q.id === finalQuiz.id);
      return exists ? prev.map((q) => (q.id === finalQuiz.id ? finalQuiz : q)) : [...prev, finalQuiz];
    });
    notify.success("Quiz saved");
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    notify.success("Quiz deleted");
  };

  const columns: AdminTableColumn<Quiz>[] = [
    { header: "Title", cell: (q) => <span className="font-medium text-foreground">{q.title}</span> },
    { header: "Course", cell: (q) => getCourseById(q.courseId)?.title ?? "—" },
    { header: "Questions", cell: (q) => <Badge variant="outline">{getQuestionsForQuiz(q.id).length}</Badge> },
    { header: "Pass threshold", cell: (q) => `${q.passThreshold}%` },
    {
      header: "Actions",
      cell: (q) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(q)} aria-label={`Edit ${q.title}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(q.id)} aria-label={`Delete ${q.title}`}>
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
          <p className="mt-2 text-muted-foreground">Manage assessments attached to each module.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New quiz
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={quizzes} getRowId={(q) => q.id} emptyTitle="No quizzes yet" />
      </div>

      {editing && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={quizzes.some((q) => q.id === editing.id) ? "Edit quiz" : "New quiz"}
          description="Question authoring happens in a dedicated question editor (coming with the Supabase-backed admin)."
          onSubmit={handleSave}
          submitLabel="Save quiz"
        >
          <FormField label="Module" htmlFor="quiz-module">
            <Select
              value={editing.moduleId}
              onValueChange={(v) => setEditing({ ...editing, moduleId: v, courseId: getModuleById(v)?.courseId ?? "" })}
            >
              <SelectTrigger id="quiz-module">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockModules.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {getCourseById(m.courseId)?.title} — {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Title" htmlFor="quiz-title">
            <Input
              id="quiz-title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Description" htmlFor="quiz-description">
            <Textarea
              id="quiz-description"
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={2}
            />
          </FormField>
          <FormField label="Pass threshold (%)" htmlFor="quiz-threshold">
            <Input
              id="quiz-threshold"
              type="number"
              min={0}
              max={100}
              value={editing.passThreshold}
              onChange={(e) => setEditing({ ...editing, passThreshold: Number(e.target.value) })}
            />
          </FormField>
        </AdminForm>
      )}
    </div>
  );
}
