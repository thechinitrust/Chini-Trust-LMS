"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import type { AudienceTag, Course, Resource, ResourceType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { createResource, deleteResource, updateResource, type ResourceInput } from "@/lib/data/resources";
import { notify } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

const TYPES: ResourceType[] = ["pdf", "slides", "worksheet", "guide", "link"];
const TYPE_LABEL: Record<ResourceType, string> = {
  pdf: "PDF",
  slides: "Slides",
  worksheet: "Worksheet",
  guide: "Guide",
  link: "Link",
};
const AUDIENCES: AudienceTag[] = ["parents", "teachers", "students", "employers", "neurodivergent-individuals"];

function emptyDraft(): ResourceInput {
  return { title: "", summary: "", type: "guide", category: "teachers", fileUrl: "", featured: false };
}

export function ResourcesTable({ resources, courses }: { resources: Resource[]; courses: Course[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ResourceInput | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const courseTitle = (courseId?: string) => courses.find((c) => c.id === courseId)?.title ?? "—";

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setDialogOpen(true);
  };

  const openEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setDraft({
      title: resource.title,
      summary: resource.summary,
      type: resource.type,
      category: resource.category,
      fileUrl: resource.fileUrl,
      courseId: resource.courseId,
      moduleId: resource.moduleId,
      lessonId: resource.lessonId,
      featured: resource.featured ?? false,
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
        await updateResource(supabase, editingId, draft);
      } else {
        await createResource(supabase, draft);
      }
      notify.success("Resource saved");
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't save resource", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    try {
      const supabase = createClient();
      await deleteResource(supabase, id);
      notify.success("Resource deleted");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't delete ${title}`, error instanceof Error ? error.message : undefined);
    }
  };

  const columns: AdminTableColumn<Resource>[] = [
    { header: "Title", cell: (r) => <span className="font-medium text-foreground">{r.title}</span> },
    { header: "Type", cell: (r) => <Badge variant="outline" className="uppercase">{r.type}</Badge> },
    { header: "Category", cell: (r) => <span className="capitalize">{r.category.replace("-", " ")}</span> },
    { header: "Course", cell: (r) => courseTitle(r.courseId) },
    {
      header: "Actions",
      cell: (r) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(r)} aria-label={`Edit ${r.title}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id, r.title)} aria-label={`Delete ${r.title}`}>
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
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Resources</h1>
          <p className="mt-2 text-muted-foreground">Manage downloadable guides and toolkits.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New resource
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={resources} getRowId={(r) => r.id} emptyTitle="No resources yet" />
      </div>

      {draft && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={editingId ? "Edit resource" : "New resource"}
          onSubmit={handleSave}
          submitLabel={isSaving ? "Saving…" : "Save resource"}
        >
          <FormField label="Title" htmlFor="resource-title">
            <Input
              id="resource-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Summary" htmlFor="resource-summary">
            <Textarea
              id="resource-summary"
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              rows={2}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" htmlFor="resource-type">
              <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as ResourceType })}>
                <SelectTrigger id="resource-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Audience" htmlFor="resource-category">
              <Select
                value={draft.category}
                onValueChange={(v) => setDraft({ ...draft, category: v as AudienceTag })}
              >
                <SelectTrigger id="resource-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => (
                    <SelectItem key={a} value={a} className="capitalize">
                      {a.replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="Related course (optional)" htmlFor="resource-course">
            <Select
              value={draft.courseId ?? "none"}
              onValueChange={(v) => setDraft({ ...draft, courseId: v === "none" ? undefined : v })}
            >
              <SelectTrigger id="resource-course">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="File URL" htmlFor="resource-file">
            <Input
              id="resource-file"
              value={draft.fileUrl}
              onChange={(e) => setDraft({ ...draft, fileUrl: e.target.value })}
              placeholder="/resources/example.pdf"
            />
          </FormField>
        </AdminForm>
      )}
    </div>
  );
}
