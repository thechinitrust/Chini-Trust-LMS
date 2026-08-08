"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

export interface ModuleDraft {
  title: string;
  description: string;
}

interface ModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues: ModuleDraft;
  onSubmit: (values: ModuleDraft) => Promise<void>;
  submitLabel: string;
}

export function ModuleDialog({ open, onOpenChange, title, initialValues, onSubmit, submitLabel }: ModuleDialogProps) {
  const [draft, setDraft] = React.useState<ModuleDraft>(initialValues);
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
      onSubmit={handleSubmit}
      submitLabel={isSaving ? "Saving…" : submitLabel}
    >
      <FormField label="Title" htmlFor="module-title">
        <Input
          id="module-title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
          autoFocus
        />
      </FormField>
      <FormField label="Description" htmlFor="module-description">
        <Textarea
          id="module-description"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={3}
        />
      </FormField>
    </AdminForm>
  );
}
