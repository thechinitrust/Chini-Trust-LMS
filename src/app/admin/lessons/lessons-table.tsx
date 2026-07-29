"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Youtube } from "lucide-react";

import type { Course, Lesson, Module } from "@/lib/types";
import { extractYouTubeId, formatDuration } from "@/lib/youtube";
import { createClient } from "@/lib/supabase/client";
import { createLesson, deleteLesson, updateLesson, type LessonInput } from "@/lib/data/lessons";
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

function emptyDraft(moduleId: string, courseId: string): LessonInput {
  return {
    moduleId,
    courseId,
    title: "",
    description: "",
    order: 1,
    published: false,
    youtubeVideoId: "",
    thumbnailUrl: "",
    durationSeconds: 0,
    objectives: [],
  };
}

export function LessonsTable({
  lessons,
  modules,
  courses,
}: {
  lessons: Lesson[];
  modules: Module[];
  courses: Course[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<LessonInput | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const moduleTitle = (moduleId: string) => modules.find((m) => m.id === moduleId)?.title ?? "—";
  const courseTitle = (courseId: string) => courses.find((c) => c.id === courseId)?.title ?? "—";

  const openCreate = () => {
    const firstModule = modules[0];
    setEditingId(null);
    setDraft(emptyDraft(firstModule?.id ?? "", firstModule?.courseId ?? ""));
    setDialogOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setDraft({
      moduleId: lesson.moduleId,
      courseId: lesson.courseId,
      title: lesson.title,
      description: lesson.description,
      notes: lesson.notes,
      order: lesson.order,
      published: lesson.published,
      youtubeVideoId: lesson.video.youtubeVideoId,
      thumbnailUrl: lesson.video.thumbnailUrl,
      durationSeconds: lesson.video.durationSeconds,
      objectives: lesson.objectives ?? [],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!draft) return;
    const videoId = extractYouTubeId(draft.youtubeVideoId);
    if (!draft.title.trim() || !videoId.trim()) {
      notify.error("Title and YouTube video ID are required");
      return;
    }
    setIsSaving(true);
    try {
      const supabase = createClient();
      const input: LessonInput = {
        ...draft,
        youtubeVideoId: videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
      if (editingId) {
        await updateLesson(supabase, editingId, input);
      } else {
        await createLesson(supabase, input);
      }
      notify.success("Lesson saved");
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save lesson", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    try {
      const supabase = createClient();
      await deleteLesson(supabase, id);
      notify.success("Lesson deleted");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't delete ${title}`, error instanceof Error ? error.message : undefined);
    }
  };

  const togglePublished = async (lesson: Lesson) => {
    try {
      const supabase = createClient();
      await updateLesson(supabase, lesson.id, {
        moduleId: lesson.moduleId,
        courseId: lesson.courseId,
        title: lesson.title,
        description: lesson.description,
        notes: lesson.notes,
        order: lesson.order,
        published: !lesson.published,
        youtubeVideoId: lesson.video.youtubeVideoId,
        thumbnailUrl: lesson.video.thumbnailUrl,
        durationSeconds: lesson.video.durationSeconds,
        objectives: lesson.objectives ?? [],
      });
      router.refresh();
    } catch (error) {
      notify.error("Couldn't update status", error instanceof Error ? error.message : undefined);
    }
  };

  const columns: AdminTableColumn<Lesson>[] = [
    { header: "Title", cell: (l) => <span className="font-medium text-foreground">{l.title}</span> },
    { header: "Module", cell: (l) => moduleTitle(l.moduleId) },
    {
      header: "YouTube ID",
      cell: (l) => (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Youtube className="size-3.5 text-destructive" aria-hidden="true" />
          {l.video.youtubeVideoId || "—"}
        </span>
      ),
    },
    { header: "Duration", cell: (l) => formatDuration(l.video.durationSeconds) },
    {
      header: "Status",
      cell: (l) => (
        <button onClick={() => togglePublished(l)}>
          <Badge variant={l.published ? "success" : "outline"}>{l.published ? "Published" : "Draft"}</Badge>
        </button>
      ),
    },
    {
      header: "Actions",
      cell: (l) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(l)} aria-label={`Edit ${l.title}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(l.id, l.title)} aria-label={`Delete ${l.title}`}>
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
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Lessons &amp; Videos</h1>
          <p className="mt-2 text-muted-foreground">
            Videos live on YouTube — paste a video ID or URL below. No files are uploaded or stored here.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New lesson
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={lessons} getRowId={(l) => l.id} emptyTitle="No lessons yet" />
      </div>

      {draft && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editingId ? "Edit lesson" : "New lesson"}
          onSubmit={handleSave}
          submitLabel={isSaving ? "Saving…" : "Save lesson"}
        >
          <FormField label="Module" htmlFor="lesson-module">
            <Select
              value={draft.moduleId}
              onValueChange={(v) =>
                setDraft({ ...draft, moduleId: v, courseId: modules.find((m) => m.id === v)?.courseId ?? "" })
              }
            >
              <SelectTrigger id="lesson-module">
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
          <FormField label="Title" htmlFor="lesson-title">
            <Input
              id="lesson-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Description" htmlFor="lesson-description">
            <Textarea
              id="lesson-description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={3}
            />
          </FormField>
          <FormField label="YouTube video ID or URL" htmlFor="lesson-youtube">
            <Input
              id="lesson-youtube"
              value={draft.youtubeVideoId}
              onChange={(e) => setDraft({ ...draft, youtubeVideoId: e.target.value })}
              placeholder="e.g. aqz-KE-bpKQ or https://youtu.be/aqz-KE-bpKQ"
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration (seconds)" htmlFor="lesson-duration">
              <Input
                id="lesson-duration"
                type="number"
                min={0}
                value={draft.durationSeconds}
                onChange={(e) => setDraft({ ...draft, durationSeconds: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Order" htmlFor="lesson-order">
              <Input
                id="lesson-order"
                type="number"
                min={1}
                value={draft.order}
                onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
              />
            </FormField>
          </div>
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
