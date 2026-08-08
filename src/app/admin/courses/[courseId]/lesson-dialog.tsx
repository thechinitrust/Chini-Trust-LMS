"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

export interface LessonDraft {
  title: string;
  description: string;
  notes: string;
  youtubeVideoId: string;
  durationSeconds: number;
  published: boolean;
  objectives: string[];
}

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues: LessonDraft;
  onSubmit: (values: LessonDraft) => Promise<void>;
  submitLabel: string;
}

export function LessonDialog({ open, onOpenChange, title, initialValues, onSubmit, submitLabel }: LessonDialogProps) {
  const [draft, setDraft] = React.useState<LessonDraft>(initialValues);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) setDraft(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSubmit(draft);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminForm
      trigger={<span />}
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Videos live on YouTube — paste a video ID or URL below."
      onSubmit={handleSubmit}
      submitLabel={isSaving ? "Saving…" : submitLabel}
    >
      <FormField label="Title" htmlFor="lesson-title">
        <Input
          id="lesson-title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
          autoFocus
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
      <FormField label="Duration (seconds)" htmlFor="lesson-duration">
        <Input
          id="lesson-duration"
          type="number"
          min={0}
          value={draft.durationSeconds}
          onChange={(e) => setDraft({ ...draft, durationSeconds: Number(e.target.value) })}
        />
      </FormField>
      <FormField label="Lesson objectives" htmlFor="lesson-objectives">
        <Textarea
          id="lesson-objectives"
          value={draft.objectives.join("\n")}
          onChange={(e) => setDraft({ ...draft, objectives: e.target.value.split("\n") })}
          onBlur={(e) =>
            setDraft((prev) => ({
              ...prev,
              objectives: e.target.value.split("\n").map((o) => o.trim()).filter(Boolean),
            }))
          }
          rows={2}
          placeholder="One per line, optional"
        />
      </FormField>
      <FormField label="Notes" htmlFor="lesson-notes">
        <Textarea
          id="lesson-notes"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          rows={2}
          placeholder="Optional internal notes shown to learners below the video"
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
  );
}
