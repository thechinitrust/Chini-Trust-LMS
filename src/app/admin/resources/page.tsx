"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { mockResources, mockCourses, getCourseById } from "@/lib/mock-data";
import type { AudienceTag, Resource, ResourceType } from "@/lib/types";
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
const AUDIENCES: AudienceTag[] = ["parents", "teachers", "students", "employers", "neurodivergent-individuals"];

function emptyResource(): Resource {
  return {
    id: `resource-${Date.now()}`,
    title: "",
    summary: "",
    type: "guide",
    category: "teachers",
    fileUrl: "",
    createdAt: new Date().toISOString(),
  };
}

export default function AdminResourcesPage() {
  const [resources, setResources] = React.useState<Resource[]>(mockResources);
  const [editing, setEditing] = React.useState<Resource | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openCreate = () => {
    setEditing(emptyResource());
    setDialogOpen(true);
  };

  const openEdit = (resource: Resource) => {
    setEditing({ ...resource });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      notify.error("Title is required");
      return;
    }
    setResources((prev) => {
      const exists = prev.some((r) => r.id === editing.id);
      return exists ? prev.map((r) => (r.id === editing.id ? editing : r)) : [editing, ...prev];
    });
    notify.success("Resource saved");
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    notify.success("Resource deleted");
  };

  const columns: AdminTableColumn<Resource>[] = [
    { header: "Title", cell: (r) => <span className="font-medium text-foreground">{r.title}</span> },
    { header: "Type", cell: (r) => <Badge variant="outline" className="uppercase">{r.type}</Badge> },
    { header: "Category", cell: (r) => <span className="capitalize">{r.category.replace("-", " ")}</span> },
    { header: "Course", cell: (r) => (r.courseId ? getCourseById(r.courseId)?.title : "—") },
    {
      header: "Actions",
      cell: (r) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(r)} aria-label={`Edit ${r.title}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)} aria-label={`Delete ${r.title}`}>
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Resources</h1>
          <p className="mt-1 text-muted-foreground">Manage downloadable guides and toolkits.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New resource
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={resources} getRowId={(r) => r.id} emptyTitle="No resources yet" />
      </div>

      {editing && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={resources.some((r) => r.id === editing.id) ? "Edit resource" : "New resource"}
          onSubmit={handleSave}
          submitLabel="Save resource"
        >
          <FormField label="Title" htmlFor="resource-title">
            <Input
              id="resource-title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Summary" htmlFor="resource-summary">
            <Textarea
              id="resource-summary"
              value={editing.summary}
              onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
              rows={2}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" htmlFor="resource-type">
              <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as ResourceType })}>
                <SelectTrigger id="resource-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Audience" htmlFor="resource-category">
              <Select
                value={editing.category}
                onValueChange={(v) => setEditing({ ...editing, category: v as AudienceTag })}
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
              value={editing.courseId ?? "none"}
              onValueChange={(v) => setEditing({ ...editing, courseId: v === "none" ? undefined : v })}
            >
              <SelectTrigger id="resource-course">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {mockCourses.map((c) => (
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
              value={editing.fileUrl}
              onChange={(e) => setEditing({ ...editing, fileUrl: e.target.value })}
              placeholder="/resources/example.pdf"
            />
          </FormField>
        </AdminForm>
      )}
    </div>
  );
}
