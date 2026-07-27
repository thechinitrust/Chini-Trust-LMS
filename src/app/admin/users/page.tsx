"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { mockProfiles } from "@/lib/mock-data";
import type { Profile, UserRole } from "@/lib/types";
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

function emptyUser(): Profile {
  return {
    id: `profile-${Date.now()}`,
    fullName: "",
    email: "",
    role: "learner",
    createdAt: new Date().toISOString(),
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<Profile[]>(mockProfiles);
  const [editing, setEditing] = React.useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openInvite = () => {
    setEditing(emptyUser());
    setDialogOpen(true);
  };

  const openEdit = (user: Profile) => {
    setEditing({ ...user });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.fullName.trim() || !editing.email.trim()) {
      notify.error("Name and email are required");
      return;
    }
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === editing.id);
      return exists ? prev.map((u) => (u.id === editing.id ? editing : u)) : [editing, ...prev];
    });
    notify.success("User saved");
    setDialogOpen(false);
  };

  const handleRemove = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    notify.success("User removed");
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
    { header: "Role", cell: (u) => <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">{u.role}</Badge> },
    { header: "Joined", cell: (u) => new Date(u.createdAt).toLocaleDateString() },
    {
      header: "Actions",
      cell: (u) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(u)} aria-label={`Edit ${u.fullName}`}>
            <Pencil className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleRemove(u.id)} aria-label={`Remove ${u.fullName}`}>
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="mt-1 text-muted-foreground">Manage learner and admin accounts.</p>
        </div>
        <Button onClick={openInvite}>
          <Plus className="size-4" aria-hidden="true" />
          Invite user
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable columns={columns} rows={users} getRowId={(u) => u.id} emptyTitle="No users yet" />
      </div>

      {editing && (
        <AdminForm
          trigger={<span />}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={users.some((u) => u.id === editing.id) ? "Edit user" : "Invite user"}
          onSubmit={handleSave}
          submitLabel="Save user"
        >
          <FormField label="Full name" htmlFor="user-name">
            <Input
              id="user-name"
              value={editing.fullName}
              onChange={(e) => setEditing({ ...editing, fullName: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Email" htmlFor="user-email">
            <Input
              id="user-email"
              type="email"
              value={editing.email}
              onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Role" htmlFor="user-role">
            <Select value={editing.role} onValueChange={(v) => setEditing({ ...editing, role: v as UserRole })}>
              <SelectTrigger id="user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="learner">Learner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </AdminForm>
      )}
    </div>
  );
}
