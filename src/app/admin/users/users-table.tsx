"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

import type { Profile, UserRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { updateProfileRole } from "@/lib/data/users";
import { notify } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminTable, type AdminTableColumn } from "@/components/admin/admin-table";
import { AdminForm } from "@/components/admin/admin-form";
import { FormField } from "@/components/admin/form-field";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function UsersTable({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("learner");
  const [isSaving, setIsSaving] = React.useState(false);

  const openInvite = () => {
    setFullName("");
    setEmail("");
    setRole("learner");
    setDialogOpen(true);
  };

  const handleInvite = async () => {
    if (!fullName.trim() || !email.trim()) {
      notify.error("Name and email are required");
      return;
    }
    setIsSaving(true);
    try {
      const resp = await fetch("/api/admin/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, role }),
      });
      const body = await resp.json();
      if (!resp.ok) throw new Error(body.error ?? "Invite failed");
      notify.success("Invite sent", `${email} will receive an email to set their password.`);
      setDialogOpen(false);
      router.refresh();
    } catch (error) {
      notify.error("Couldn't invite user", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const supabase = createClient();
      await updateProfileRole(supabase, userId, newRole);
      notify.success("Role updated");
      router.refresh();
    } catch (error) {
      notify.error("Couldn't update role", error instanceof Error ? error.message : undefined);
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!window.confirm(`Permanently delete ${name}'s account and all their data? This can't be undone.`)) return;
    try {
      const resp = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });
      const body = await resp.json();
      if (!resp.ok) throw new Error(body.error ?? "Delete failed");
      notify.success("User removed");
      router.refresh();
    } catch (error) {
      notify.error(`Couldn't remove ${name}`, error instanceof Error ? error.message : undefined);
    }
  };

  const columns: AdminTableColumn<Profile>[] = [
    {
      header: "Name",
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials(u.fullName)}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{u.fullName}</span>
        </div>
      ),
    },
    { header: "Email", cell: (u) => <span className="text-muted-foreground">{u.email}</span> },
    {
      header: "Role",
      cell: (u) =>
        u.id === currentUserId ? (
          <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
            {u.role}
          </Badge>
        ) : (
          <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v as UserRole)}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="learner">Learner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        ),
    },
    { header: "Joined", cell: (u) => new Date(u.createdAt).toLocaleDateString() },
    {
      header: "Actions",
      cell: (u) =>
        u.id === currentUserId ? null : (
          <Button size="icon" variant="ghost" onClick={() => handleRemove(u.id, u.fullName)} aria-label={`Remove ${u.fullName}`}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-foreground">Users</h1>
          <p className="mt-2 text-muted-foreground">Manage learner and admin accounts.</p>
        </div>
        <Button onClick={openInvite}>
          <Plus className="size-4" aria-hidden="true" />
          Invite user
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={users} getRowId={(u) => u.id} emptyTitle="No users yet" />
      </div>

      <AdminForm
        trigger={<span />}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Invite user"
        description="They'll receive an email with a link to set their password."
        onSubmit={handleInvite}
        submitLabel={isSaving ? "Sending…" : "Send invite"}
      >
        <FormField label="Full name" htmlFor="user-name">
          <Input id="user-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </FormField>
        <FormField label="Email" htmlFor="user-email">
          <Input
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Role" htmlFor="user-role">
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger id="user-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="learner">Learner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        {isSaving && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Sending invite…
          </p>
        )}
      </AdminForm>
    </div>
  );
}
