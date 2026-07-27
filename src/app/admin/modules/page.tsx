"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { mockModules, mockCourses, getLessonsForModule } from "@/lib/mock-data";
import type { Module } from "@/lib/types";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

function emptyModule(courseId: string): Module {
  return {
    id: `mod-${Date.now()}`,
    courseId,
    title: "",
    description: "",
    order: 1,
    lessonIds: [],
  };
}

export default function AdminModulesPage() {
  const [modules, setModules] = React.useState<Module[]>(mockModules);
  const [editing, setEditing] = React.useState<Module | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const courseTitle = (courseId: string) => mockCourses.find((c) => c.id === courseId)?.title ?? "—";

  const openCreate = () => {
    setEditing(emptyModule(mockCourses[0]?.id ?? ""));
    setDialogOpen(true);
  };

  const openEdit = (module: Module) => {
    setEditing({ ...module });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      notify.error("Title is required");
      return;
    }
    setModules((prev) => {
      const exists = prev.some((m) => m.id === editing.id);
      return exists ? prev.map((m) => (m.id === editing.id ? editing : m)) : [...prev, editing];
    });
    notify.success("Module saved");
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    notify.success("Module deleted");
  };

  const columns: AdminTableColumn<Module>[] = [
    { header: "Title", cell: (m) => <span className="font-medium text-foreground">{m.title}</span> },
    { header: "Course", cell: (m) => courseTitle(m.courseId) },
    { header: "Order", cell: (m) => m.order },
    { header: "Lessons", cell: (m) => getLessonsForModule(m.id).length },
    {
      header: "Actions",
      cell: (m) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(m)} aria-label={`Edit ${m.title}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(m.id)} aria-label={`Delete ${m.title}`}>
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Modules</h1>
          <p className="mt-1 text-muted-foreground">Group lessons into modules within each course.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New module
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={modules} getRowId={(m) => m.id} emptyTitle="No modules yet" />
      </div>

      {editing && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={modules.some((m) => m.id === editing.id) ? "Edit module" : "New module"}
          onSubmit={handleSave}
          submitLabel="Save module"
        >
          <FormField label="Course" htmlFor="module-course">
            <Select value={editing.courseId} onValueChange={(v) => setEditing({ ...editing, courseId: v })}>
              <SelectTrigger id="module-course">
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
          <FormField label="Title" htmlFor="module-title">
            <Input
              id="module-title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Description" htmlFor="module-description">
            <Textarea
              id="module-description"
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={3}
            />
          </FormField>
          <FormField label="Order" htmlFor="module-order">
            <Input
              id="module-order"
              type="number"
              min={1}
              value={editing.order}
              onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
            />
          </FormField>
        </AdminForm>
      )}
    </div>
  );
}
