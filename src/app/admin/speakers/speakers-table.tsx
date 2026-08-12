"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, User } from "lucide-react";

import type { Speaker } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { createSpeaker, deleteSpeaker, updateSpeaker, type SpeakerInput } from "@/lib/data/speakers";
import { notify } from "@/lib/toast";
import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";
import { SpeakerPhotoUpload } from "@/components/admin/speaker-photo-upload";

function emptyDraft(): SpeakerInput {
  return { name: "", role: "", organization: "", bio: "", photoUrl: "" };
}

export function SpeakersTable({ speakers }: { speakers: Speaker[] }) {
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirm();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<SpeakerInput | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setDialogOpen(true);
  };

  const openEdit = (speaker: Speaker) => {
    setEditingId(speaker.id);
    setDraft({
      name: speaker.name,
      role: speaker.role,
      organization: speaker.organization,
      bio: speaker.bio,
      photoUrl: speaker.photoUrl,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      notify.error("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      const supabase = createClient();
      if (editingId) {
        await updateSpeaker(supabase, editingId, draft);
      } else {
        await createSpeaker(supabase, draft);
      }
      notify.success("Speaker saved");
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save speaker", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: "Delete speaker?",
      description: `Delete "${name}"? This removes them from every course they're linked to. This can't be undone.`,
    });
    if (!ok) return;
    try {
      const supabase = createClient();
      await deleteSpeaker(supabase, id);
      notify.success("Speaker deleted");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't delete ${name}`, error instanceof Error ? error.message : undefined);
    }
  };

  const columns: AdminTableColumn<Speaker>[] = [
    {
      header: "Photo",
      cell: (s) => (
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted">
          {s.photoUrl ? (
            <Image src={s.photoUrl} alt="" fill className="object-cover" sizes="40px" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <User className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </div>
          )}
        </div>
      ),
    },
    { header: "Name", cell: (s) => <span className="font-medium text-foreground">{s.name}</span> },
    { header: "Role", cell: (s) => s.role || "—" },
    { header: "Organization", cell: (s) => s.organization || "—" },
    {
      header: "Actions",
      cell: (s) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id, s.name)} aria-label={`Delete ${s.name}`}>
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
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Speakers</h1>
          <p className="mt-2 text-muted-foreground">
            Manage the panelist/presenter roster shown on the About page and linked to courses.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New speaker
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable
          columns={columns}
          rows={speakers}
          getRowId={(s) => s.id}
          emptyTitle="No speakers yet"
          emptyDescription="Add your first speaker to feature them on the About page."
        />
      </div>

      {draft && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editingId ? "Edit speaker" : "New speaker"}
          onSubmit={handleSave}
          submitLabel={isSaving ? "Saving…" : "Save speaker"}
        >
          <SpeakerPhotoUpload value={draft.photoUrl} onChange={(url) => setDraft({ ...draft, photoUrl: url })} />
          <FormField label="Name" htmlFor="speaker-name">
            <Input
              id="speaker-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role / designation" htmlFor="speaker-role">
              <Input
                id="speaker-role"
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                placeholder="e.g. Assistant Professor"
              />
            </FormField>
            <FormField label="Organization" htmlFor="speaker-organization">
              <Input
                id="speaker-organization"
                value={draft.organization}
                onChange={(e) => setDraft({ ...draft, organization: e.target.value })}
                placeholder="e.g. NIMHANS, Bangalore"
              />
            </FormField>
          </div>
          <FormField label="Short bio" htmlFor="speaker-bio">
            <Textarea
              id="speaker-bio"
              value={draft.bio}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              rows={2}
              placeholder="1-2 sentences shown on the speaker card"
            />
          </FormField>
        </AdminForm>
      )}

      {ConfirmDialog}
    </div>
  );
}
