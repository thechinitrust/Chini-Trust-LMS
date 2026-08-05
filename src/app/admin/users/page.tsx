import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { listProfiles } from "@/lib/data/users";
import { UsersTable } from "./users-table";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;
  if (!userId) redirect("/login");

  const users = await listProfiles(supabase);
  return <UsersTable users={users} currentUserId={userId} />;
}
