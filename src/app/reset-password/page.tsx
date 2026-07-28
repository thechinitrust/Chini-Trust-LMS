"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/toast";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Landing page for the link sent by supabase.auth.resetPasswordForEmail().
 * Supabase exchanges the recovery token in the URL for a session
 * automatically (via onAuthStateChange's PASSWORD_RECOVERY event); this page
 * just needs to wait for that, then call updateUser with the new password.
 */
export default function ResetPasswordPage() {
  const supabase = React.useMemo(() => createClient(), []);
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [isReady, setIsReady] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsReady(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);
    if (error) {
      notify.error("Couldn't reset password", error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a new password for your account."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-primary-text hover:underline">
            Back to log in
          </Link>
        </>
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <p className="text-sm text-foreground">Password updated. Redirecting to log in…</p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={!isReady}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !isReady}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Update password
          </Button>
          {!isReady && (
            <p className="text-center text-xs text-muted-foreground">
              Open this page from the reset link in your email.
            </p>
          )}
        </form>
      )}
    </AuthCard>
  );
}
