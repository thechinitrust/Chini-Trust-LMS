"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import type { AudienceTag, Course } from "@/lib/types";
import { extractYouTubeId } from "@/lib/youtube";
import { createClient } from "@/lib/supabase/client";
import { deleteCourse, setCoursePublished, updateCourse, type CourseInput } from "@/lib/data/courses";
import { notify } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/admin/form-field";
import { CategoryInput } from "@/components/admin/category-input";
import { CourseThumbnailUpload } from "@/components/admin/course-thumbnail-upload";

const AUDIENCE_OPTIONS: { value: AudienceTag; label: string }[] = [
  { value: "students", label: "Students" },
  { value: "parents", label: "Parents" },
  { value: "teachers", label: "Teachers" },
  { value: "employers", label: "Employers" },
  { value: "neurodivergent-individuals", label: "Neurodivergent individuals" },
];

function toInput(course: Course): CourseInput {
  return {
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description,
    category: course.category,
    audience: course.audience,
    thumbnailUrl: course.thumbnailUrl,
    estimatedMinutes: course.estimatedMinutes,
    level: course.level,
    objectives: course.objectives,
    requiresCertificate: course.requiresCertificate,
    published: course.published,
    previewVideoId: course.previewVideoId,
  };
}

export function CourseDetailsForm({ course }: { course: Course }) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<CourseInput>(() => toInput(course));
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(toInput(course));

  const toggleAudience = (tag: AudienceTag) => {
    setDraft((prev) => ({
      ...prev,
      audience: prev.audience.includes(tag) ? prev.audience.filter((a) => a !== tag) : [...prev.audience, tag],
    }));
  };

  const handleSave = async () => {
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
      const trimmedPreview = draft.previewVideoId?.trim();
      const input: CourseInput = {
        ...draft,
        previewVideoId: trimmedPreview ? extractYouTubeId(trimmedPreview) : undefined,
      };
      await updateCourse(supabase, course.id, input);
      setDraft(input);
      notify.success("Course details saved");
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save course", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublished = async () => {
    const next = !draft.published;
    setDraft((prev) => ({ ...prev, published: next }));
    try {
      const supabase = createClient();
      await setCoursePublished(supabase, course.id, next);
      notify.success(next ? "Course published" : "Course unpublished");
      router.refresh();
    } catch (error) {
      setDraft((prev) => ({ ...prev, published: !next }));
      notify.error("Couldn't update status", error instanceof Error ? error.message : undefined);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${course.title}"? This also removes its modules, lessons, and quizzes. This can't be undone.`))
      return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await deleteCourse(supabase, course.id);
      notify.success("Course deleted");
      router.push("/admin/courses");
    } catch (error) {
      notify.error("Couldn't delete course", error instanceof Error ? error.message : undefined);
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg">Course details</CardTitle>
        </div>
        <button onClick={togglePublished} aria-label="Toggle published status">
          <Badge variant={draft.published ? "success" : "outline"}>{draft.published ? "Published" : "Draft"}</Badge>
        </button>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
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

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Category" htmlFor="course-category">
            <CategoryInput
              id="course-category"
              value={draft.category}
              onChange={(v) => setDraft({ ...draft, category: v })}
            />
          </FormField>
          <FormField label="Level" htmlFor="course-level">
            <Select value={draft.level} onValueChange={(v) => setDraft({ ...draft, level: v as Course["level"] })}>
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
          <FormField label="Estimated minutes" htmlFor="course-minutes">
            <Input
              id="course-minutes"
              type="number"
              min={0}
              value={draft.estimatedMinutes}
              onChange={(e) => setDraft({ ...draft, estimatedMinutes: Number(e.target.value) })}
            />
          </FormField>
        </div>

        <FormField label="Preview video (YouTube ID or URL)" htmlFor="course-preview-video">
          <Input
            id="course-preview-video"
            value={draft.previewVideoId ?? ""}
            onChange={(e) => setDraft({ ...draft, previewVideoId: e.target.value })}
            placeholder="Optional — falls back to the first lesson's video"
          />
        </FormField>

        <div className="space-y-1.5">
          <Label>Audience</Label>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {AUDIENCE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={draft.audience.includes(option.value)}
                  onCheckedChange={() => toggleAudience(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <FormField label="Learning objectives" htmlFor="course-objectives">
          <Textarea
            id="course-objectives"
            value={draft.objectives.join("\n")}
            onChange={(e) => setDraft({ ...draft, objectives: e.target.value.split("\n") })}
            onBlur={(e) =>
              setDraft((prev) => ({
                ...prev,
                objectives: e.target.value.split("\n").map((o) => o.trim()).filter(Boolean),
              }))
            }
            rows={3}
            placeholder="One objective per line"
          />
        </FormField>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm font-medium text-foreground">Requires certificate</span>
          <Switch
            checked={draft.requiresCertificate}
            onCheckedChange={(checked) => setDraft({ ...draft, requiresCertificate: checked })}
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="size-4 text-destructive" aria-hidden="true" />
            Delete course
          </Button>
          <Button type="button" onClick={handleSave} disabled={!dirty || isSaving}>
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
