"use client";

import * as React from "react";
import { Pencil, Plus, Trash2, Youtube } from "lucide-react";

import { mockLessons, mockModules, getModuleById, getCourseById } from "@/lib/mock-data";
import { extractYouTubeId, formatDuration } from "@/lib/youtube";
import type { Lesson } from "@/lib/types";
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

function emptyLesson(moduleId: string): Lesson {
  const parentModule = getModuleById(moduleId);
  return {
    id: `lesson-${Date.now()}`,
    moduleId,
    courseId: parentModule?.courseId ?? "",
    title: "",
    description: "",
    order: 1,
    published: false,
    resourceIds: [],
    video: { youtubeVideoId: "", thumbnailUrl: "", durationSeconds: 0 },
  };
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = React.useState<Lesson[]>(mockLessons);
  const [editing, setEditing] = React.useState<Lesson | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openCreate = () => {
    setEditing(emptyLesson(mockModules[0]?.id ?? ""));
    setDialogOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditing({ ...lesson });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.video.youtubeVideoId.trim()) {
      notify.error("Title and YouTube video ID are required");
      return;
    }
    const parentModule = getModuleById(editing.moduleId);
    const finalLesson: Lesson = {
      ...editing,
      courseId: parentModule?.courseId ?? editing.courseId,
      video: {
        ...editing.video,
        youtubeVideoId: extractYouTubeId(editing.video.youtubeVideoId),
        thumbnailUrl: `https://img.youtube.com/vi/${extractYouTubeId(editing.video.youtubeVideoId)}/hqdefault.jpg`,
      },
    };
    setLessons((prev) => {
      const exists = prev.some((l) => l.id === finalLesson.id);
      return exists ? prev.map((l) => (l.id === finalLesson.id ? finalLesson : l)) : [...prev, finalLesson];
    });
    notify.success("Lesson saved");
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    notify.success("Lesson deleted");
  };

  const togglePublished = (id: string) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, published: !l.published } : l)));
  };

  const columns: AdminTableColumn<Lesson>[] = [
    { header: "Title", cell: (l) => <span className="font-medium text-foreground">{l.title}</span> },
    { header: "Module", cell: (l) => getModuleById(l.moduleId)?.title ?? "—" },
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
        <button onClick={() => togglePublished(l.id)}>
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
          <Button size="icon" variant="ghost" onClick={() => handleDelete(l.id)} aria-label={`Delete ${l.title}`}>
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

      {editing && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={lessons.some((l) => l.id === editing.id) ? "Edit lesson" : "New lesson"}
          onSubmit={handleSave}
          submitLabel="Save lesson"
        >
          <FormField label="Module" htmlFor="lesson-module">
            <Select
              value={editing.moduleId}
              onValueChange={(v) => setEditing({ ...editing, moduleId: v, courseId: getModuleById(v)?.courseId ?? "" })}
            >
              <SelectTrigger id="lesson-module">
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
          <FormField label="Title" htmlFor="lesson-title">
            <Input
              id="lesson-title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Description" htmlFor="lesson-description">
            <Textarea
              id="lesson-description"
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={3}
            />
          </FormField>
          <FormField label="YouTube video ID or URL" htmlFor="lesson-youtube">
            <Input
              id="lesson-youtube"
              value={editing.video.youtubeVideoId}
              onChange={(e) =>
                setEditing({ ...editing, video: { ...editing.video, youtubeVideoId: e.target.value } })
              }
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
                value={editing.video.durationSeconds}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    video: { ...editing.video, durationSeconds: Number(e.target.value) },
                  })
                }
              />
            </FormField>
            <FormField label="Order" htmlFor="lesson-order">
              <Input
                id="lesson-order"
                type="number"
                min={1}
                value={editing.order}
                onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
              />
            </FormField>
          </div>
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
