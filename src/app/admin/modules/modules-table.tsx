"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import type { Course, Module } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { createModule, deleteModule, updateModule, type ModuleInput } from "@/lib/data/modules";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

function emptyDraft(courseId: string): ModuleInput {
  return { courseId, title: "", description: "", order: 1 };
}

export function ModulesTable({
  modules,
  courses,
  lessonCounts,
}: {
  modules: Module[];
  courses: Course[];
  lessonCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ModuleInput | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const courseTitle = (courseId: string) => courses.find((c) => c.id === courseId)?.title ?? "—";

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft(courses[0]?.id ?? ""));
    setDialogOpen(true);
  };

  const openEdit = (courseModule: Module) => {
    setEditingId(courseModule.id);
    setDraft({ ...courseModule });
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
        await updateModule(supabase, editingId, draft);
      } else {
        await createModule(supabase, draft);
      }
      notify.success("Module saved");
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save module", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This also removes its lessons. This can't be undone.`)) return;
    try {
      const supabase = createClient();
      await deleteModule(supabase, id);
      notify.success("Module deleted");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't delete ${title}`, error instanceof Error ? error.message : undefined);
    }
  };

  const columns: AdminTableColumn<Module>[] = [
    { header: "Title", cell: (m) => <span className="font-medium text-foreground">{m.title}</span> },
    { header: "Course", cell: (m) => courseTitle(m.courseId) },
    { header: "Order", cell: (m) => m.order },
    { header: "Lessons", cell: (m) => lessonCounts[m.id] ?? 0 },
    {
      header: "Actions",
      cell: (m) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(m)} aria-label={`Edit ${m.title}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(m.id, m.title)} aria-label={`Delete ${m.title}`}>
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
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Modules</h1>
          <p className="mt-2 text-muted-foreground">Group lessons into modules within each course.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New module
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={modules} getRowId={(m) => m.id} emptyTitle="No modules yet" />
      </div>

      {draft && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editingId ? "Edit module" : "New module"}
          onSubmit={handleSave}
          submitLabel={isSaving ? "Saving…" : "Save module"}
        >
          <FormField label="Course" htmlFor="module-course">
            <Select value={draft.courseId} onValueChange={(v) => setDraft({ ...draft, courseId: v })}>
              <SelectTrigger id="module-course">
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
          <FormField label="Title" htmlFor="module-title">
            <Input
              id="module-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Description" htmlFor="module-description">
            <Textarea
              id="module-description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={3}
            />
          </FormField>
          <FormField label="Order" htmlFor="module-order">
            <Input
              id="module-order"
              type="number"
              min={1}
              value={draft.order}
              onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
            />
          </FormField>
        </AdminForm>
      )}
    </div>
  );
}
