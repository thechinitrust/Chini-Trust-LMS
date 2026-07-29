import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates a real Supabase Auth user and sends them an invite email. Must be
 * a Route Handler, not a Server Action or client call -- creating an
 * auth.users row via the admin API requires the service_role key, which can
 * never reach the browser. Re-verifies the caller is an admin from their
 * own session before touching the service-role client -- never trust a
 * client-supplied "I am an admin" claim.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json();
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const role = body.role === "admin" ? "admin" : "learner";

  if (!fullName || !email) {
    return NextResponse.json({ error: "Full name and email are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });
  if (inviteError || !invited.user) {
    return NextResponse.json({ error: inviteError?.message ?? "Invite failed." }, { status: 400 });
  }

  if (role === "admin") {
    const { error: roleError } = await admin.from("profiles").update({ role: "admin" }).eq("id", invited.user.id);
    if (roleError) {
      return NextResponse.json(
        { error: `Invited, but couldn't set admin role: ${roleError.message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ id: invited.user.id, email: invited.user.email });
}
