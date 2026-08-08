"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";

import type { Course } from "@/lib/types";
import { categoryLabel } from "@/lib/categories";
import { createClient } from "@/lib/supabase/client";
import { createCourse, deleteCourse, setCoursePublished, type CourseInput } from "@/lib/data/courses";
import { notify } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";
import { CategoryInput } from "@/components/admin/category-input";
import { CourseThumbnailUpload } from "@/components/admin/course-thumbnail-upload";
import { EmptyState } from "@/components/shared/empty-state";

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function emptyDraft(): CourseInput {
  return {
    slug: "",
    title: "",
    summary: "",
    description: "",
    category: "",
    audience: ["teachers"],
    thumbnailUrl: "",
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
  const [draft, setDraft] = React.useState<CourseInput | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const openCreate = () => {
    setDraft(emptyDraft());
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      notify.error("Title is required");
      return;
    }
    if (!draft.category.trim()) {
      notify.error("Category is required");
      return;
    }
    if (!draft.thumbnailUrl) {
      notify.error("Upload a course banner image before saving");
      return;
    }
    setIsSaving(true);
    try {
      const supabase = createClient();
      const input: CourseInput = { ...draft, slug: draft.slug || slugify(draft.title) };
      const created = await createCourse(supabase, input);
      notify.success("Course created — add modules and lessons below");
      setDialogOpen(false);
      router.push(`/admin/courses/${created.id}`);
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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Courses</h1>
          <p className="mt-2 text-muted-foreground">
            Create a course, then open it to manage its modules and lessons in one place.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New course
        </Button>
      </div>

      <div className="mt-6">
        {courses.length === 0 ? (
          <EmptyState title="No courses yet" description="Create your first course to get started." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col overflow-hidden">
                <div className="relative aspect-[16/9] w-full bg-muted">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageOff className="size-7" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <Badge variant="brand" className="bg-background/90 backdrop-blur">
                      {categoryLabel(course.category)}
                    </Badge>
                  </div>
                  <button
                    onClick={() => togglePublished(course)}
                    className="absolute right-3 top-3"
                    aria-label="Toggle published status"
                  >
                    <Badge
                      variant={course.published ? "success" : "outline"}
                      className="bg-background/90 backdrop-blur"
                    >
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                  </button>
                </div>

                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="text-lg font-semibold leading-snug text-foreground hover:text-primary-text"
                    >
                      {course.title}
                    </Link>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{course.summary}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="capitalize">{course.level}</span>
                    <span>&middot;</span>
                    <span>
                      {moduleCounts[course.id] ?? 0} {moduleCounts[course.id] === 1 ? "module" : "modules"}
                    </span>
                    <span>&middot;</span>
                    <span>{course.estimatedMinutes} min</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/courses/${course.id}`}>
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(course.id, course.title)}
                      aria-label={`Delete ${course.title}`}
                    >
                      <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {draft && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="New course"
          description="Add the core details, then manage modules and lessons on the course's own page."
          onSubmit={handleSave}
          submitLabel={isSaving ? "Saving…" : "Save course"}
        >
          <CourseThumbnailUpload
            value={draft.thumbnailUrl}
            onChange={(url) => setDraft({ ...draft, thumbnailUrl: url })}
            required
          />
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
              <CategoryInput
                id="course-category"
                value={draft.category}
                onChange={(v) => setDraft({ ...draft, category: v })}
              />
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
