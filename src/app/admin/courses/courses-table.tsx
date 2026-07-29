"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import type { Course, LearningCategory } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { createCourse, deleteCourse, setCoursePublished, updateCourse, type CourseInput } from "@/lib/data/courses";
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

function emptyDraft(): CourseInput {
  return {
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
  };
}

export function CoursesTable({
  courses,
  moduleCounts,
}: {
  courses: Course[];
  moduleCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<CourseInput | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingId(course.id);
    setDraft({ ...course });
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
      const input: CourseInput = { ...draft, slug: draft.slug || slugify(draft.title) };
      if (editingId) {
        await updateCourse(supabase, editingId, input);
      } else {
        await createCourse(supabase, input);
      }
      notify.success("Course saved");
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save course", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This also removes its modules, lessons, and quizzes. This can't be undone.`)) return;
    try {
      const supabase = createClient();
      await deleteCourse(supabase, id);
      notify.success("Course deleted");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't delete ${title}`, error instanceof Error ? error.message : undefined);
    }
  };

  const togglePublished = async (course: Course) => {
    try {
      const supabase = createClient();
      await setCoursePublished(supabase, course.id, !course.published);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't update status", error instanceof Error ? error.message : undefined);
    }
  };

  const columns: AdminTableColumn<Course>[] = [
    { header: "Title", cell: (c) => <span className="font-medium text-foreground">{c.title}</span> },
    { header: "Category", cell: (c) => <span>{CATEGORY_LABEL[c.category]}</span> },
    { header: "Level", cell: (c) => <span className="capitalize">{c.level}</span> },
    { header: "Modules", cell: (c) => moduleCounts[c.id] ?? 0 },
    {
      header: "Status",
      cell: (c) => (
        <button onClick={() => togglePublished(c)}>
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
          <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id, c.title)} aria-label={`Delete ${c.title}`}>
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

      {draft && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editingId ? "Edit course" : "New course"}
          description="Core details shown across the catalogue and course page."
          onSubmit={handleSave}
          submitLabel={isSaving ? "Saving…" : "Save course"}
        >
          <FormField label="Title" htmlFor="course-title">
            <Input
              id="course-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Summary" htmlFor="course-summary">
            <Textarea
              id="course-summary"
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              rows={2}
            />
          </FormField>
          <FormField label="Description" htmlFor="course-description">
            <Textarea
              id="course-description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={4}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" htmlFor="course-category">
              <Select
                value={draft.category}
                onValueChange={(v) => setDraft({ ...draft, category: v as LearningCategory })}
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
                value={draft.level}
                onValueChange={(v) => setDraft({ ...draft, level: v as Course["level"] })}
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
              value={draft.estimatedMinutes}
              onChange={(e) => setDraft({ ...draft, estimatedMinutes: Number(e.target.value) })}
            />
          </FormField>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm font-medium text-foreground">Published</span>
            <Switch
              checked={draft.published}
              onCheckedChange={(checked) => setDraft({ ...draft, published: checked })}
            />
          </div>
        </AdminForm>
      )}
    </div>
  );
}
