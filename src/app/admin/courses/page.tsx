"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { mockCourses } from "@/lib/mock-data";
import type { Course, LearningCategory } from "@/lib/types";
import { notify } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

const CATEGORIES: LearningCategory[] = ["autism", "adhd", "dyslexia", "workplace"];

const CATEGORY_LABEL: Record<LearningCategory, string> = {
  autism: "Autism",
  adhd: "ADHD",
  dyslexia: "Dyslexia",
  workplace: "Workplace Inclusion",
};

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function emptyCourse(): Course {
  return {
    id: `course-${Date.now()}`,
    slug: "",
    title: "",
    summary: "",
    description: "",
    category: "autism",
    audience: ["teachers"],
    thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    estimatedMinutes: 60,
    level: "beginner",
    objectives: [],
    requiresCertificate: true,
    published: false,
    moduleIds: [],
    createdAt: new Date().toISOString(),
  };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>(mockCourses);
  const [editing, setEditing] = React.useState<Course | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openCreate = () => {
    setEditing(emptyCourse());
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing({ ...course });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      notify.error("Title is required");
      return;
    }
    const withSlug = { ...editing, slug: editing.slug || slugify(editing.title) };
    setCourses((prev) => {
      const exists = prev.some((c) => c.id === withSlug.id);
      return exists ? prev.map((c) => (c.id === withSlug.id ? withSlug : c)) : [withSlug, ...prev];
    });
    notify.success("Course saved");
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    notify.success("Course deleted");
  };

  const togglePublished = (id: string) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, published: !c.published } : c)));
  };

  const columns: AdminTableColumn<Course>[] = [
    { header: "Title", cell: (c) => <span className="font-medium text-foreground">{c.title}</span> },
    { header: "Category", cell: (c) => <span>{CATEGORY_LABEL[c.category]}</span> },
    { header: "Level", cell: (c) => <span className="capitalize">{c.level}</span> },
    { header: "Modules", cell: (c) => c.moduleIds.length },
    {
      header: "Status",
      cell: (c) => (
        <button onClick={() => togglePublished(c.id)}>
          <Badge variant={c.published ? "success" : "outline"}>{c.published ? "Published" : "Draft"}</Badge>
        </button>
      ),
    },
    {
      header: "Actions",
      cell: (c) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(c)} aria-label={`Edit ${c.title}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} aria-label={`Delete ${c.title}`}>
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
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Courses</h1>
          <p className="mt-2 text-muted-foreground">Create and manage the course catalogue.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New course
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable
          columns={columns}
          rows={courses}
          getRowId={(c) => c.id}
          emptyTitle="No courses yet"
          emptyDescription="Create your first course to get started."
        />
      </div>

      {editing && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={courses.some((c) => c.id === editing.id) ? "Edit course" : "New course"}
          description="Core details shown across the catalogue and course page."
          onSubmit={handleSave}
          submitLabel="Save course"
        >
          <FormField label="Title" htmlFor="course-title">
            <Input
              id="course-title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Summary" htmlFor="course-summary">
            <Textarea
              id="course-summary"
              value={editing.summary}
              onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
              rows={2}
            />
          </FormField>
          <FormField label="Description" htmlFor="course-description">
            <Textarea
              id="course-description"
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={4}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" htmlFor="course-category">
              <Select
                value={editing.category}
                onValueChange={(v) => setEditing({ ...editing, category: v as LearningCategory })}
              >
                <SelectTrigger id="course-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABEL[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Level" htmlFor="course-level">
              <Select
                value={editing.level}
                onValueChange={(v) => setEditing({ ...editing, level: v as Course["level"] })}
              >
                <SelectTrigger id="course-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="Estimated minutes" htmlFor="course-minutes">
            <Input
              id="course-minutes"
              type="number"
              min={0}
              value={editing.estimatedMinutes}
              onChange={(e) => setEditing({ ...editing, estimatedMinutes: Number(e.target.value) })}
            />
          </FormField>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm font-medium text-foreground">Published</span>
            <Switch
              checked={editing.published}
              onCheckedChange={(checked) => setEditing({ ...editing, published: checked })}
            />
          </div>
        </AdminForm>
      )}
    </div>
  );
}
