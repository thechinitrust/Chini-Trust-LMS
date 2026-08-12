"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import type { EventCategory, LmsEvent } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { createEvent, deleteEvent, updateEvent, type EventInput } from "@/lib/data/events";
import { notify } from "@/lib/toast";
import { useConfirm } from "@/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

const CATEGORIES: EventCategory[] = ["webinar", "deadline", "live-qa", "announcement"];
const CATEGORY_LABEL: Record<EventCategory, string> = {
  webinar: "Webinar",
  deadline: "Deadline",
  "live-qa": "Live Q&A",
  announcement: "Announcement",
};

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyDraft(): EventInput {
  return { title: "", description: "", startsAt: new Date().toISOString(), category: "announcement", published: false };
}

export function EventsTable({ events }: { events: LmsEvent[] }) {
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirm();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<EventInput | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setDialogOpen(true);
  };

  const openEdit = (event: LmsEvent) => {
    setEditingId(event.id);
    setDraft({
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      location: event.location,
      linkUrl: event.linkUrl,
      category: event.category,
      published: event.published,
    });
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
        await updateEvent(supabase, editingId, draft);
      } else {
        await createEvent(supabase, draft);
      }
      notify.success("Event saved");
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save event", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: "Delete event?",
      description: `Delete "${title}"? This can't be undone.`,
    });
    if (!ok) return;
    try {
      const supabase = createClient();
      await deleteEvent(supabase, id);
      notify.success("Event deleted");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't delete ${title}`, error instanceof Error ? error.message : undefined);
    }
  };

  const columns: AdminTableColumn<LmsEvent>[] = [
    { header: "Title", cell: (e) => <span className="font-medium text-foreground">{e.title}</span> },
    { header: "Category", cell: (e) => <Badge variant="outline">{CATEGORY_LABEL[e.category]}</Badge> },
    { header: "Starts", cell: (e) => new Date(e.startsAt).toLocaleString() },
    {
      header: "Status",
      cell: (e) => <Badge variant={e.published ? "success" : "outline"}>{e.published ? "Published" : "Draft"}</Badge>,
    },
    {
      header: "Actions",
      cell: (e) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(e)} aria-label={`Edit ${e.title}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(e.id, e.title)} aria-label={`Delete ${e.title}`}>
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
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Events</h1>
          <p className="mt-2 text-muted-foreground">Webinars, deadlines, and announcements shown on learner dashboards.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New event
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={events} getRowId={(e) => e.id} emptyTitle="No events yet" />
      </div>

      {draft && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editingId ? "Edit event" : "New event"}
          onSubmit={handleSave}
          submitLabel={isSaving ? "Saving…" : "Save event"}
        >
          <FormField label="Title" htmlFor="event-title">
            <Input
              id="event-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Description" htmlFor="event-description">
            <Textarea
              id="event-description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" htmlFor="event-category">
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as EventCategory })}>
                <SelectTrigger id="event-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Starts" htmlFor="event-starts">
              <Input
                id="event-starts"
                type="datetime-local"
                value={toLocalInputValue(draft.startsAt)}
                onChange={(e) => setDraft({ ...draft, startsAt: new Date(e.target.value).toISOString() })}
              />
            </FormField>
          </div>
          <FormField label="Location (optional)" htmlFor="event-location">
            <Input
              id="event-location"
              value={draft.location ?? ""}
              onChange={(e) => setDraft({ ...draft, location: e.target.value || undefined })}
            />
          </FormField>
          <FormField label="Link (optional)" htmlFor="event-link">
            <Input
              id="event-link"
              value={draft.linkUrl ?? ""}
              onChange={(e) => setDraft({ ...draft, linkUrl: e.target.value || undefined })}
              placeholder="https://..."
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

      {ConfirmDialog}
    </div>
  );
}
