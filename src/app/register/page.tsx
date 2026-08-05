"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { notify } from "@/lib/toast";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const { user, register, isLoading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = React.useState<string | null>(null);
  // See /login for why this guard exists -- prevents the effect below from
  // replaying handleSubmit's own redirect a second time once `user` state
  // catches up.
  const hasRedirectedRef = React.useRef(false);

  // Same reasoning as /login: an already-authenticated visitor shouldn't see
  // the signup form. Middleware covers this server-side too.
  React.useEffect(() => {
    if (hasRedirectedRef.current || isLoading || !user) return;
    hasRedirectedRef.current = true;
    router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  }, [isLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { profile, needsEmailConfirmation } = await register(fullName, email, password);
      if (needsEmailConfirmation) {
        setConfirmationSentTo(email);
        return;
      }
      notify.success("Account created", `Welcome to NeuroBridge, ${profile?.fullName ?? "there"}.`);
      hasRedirectedRef.current = true;
      router.replace(profile?.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (error) {
      notify.error("Couldn't create account", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoading && user) {
    return null;
  }

  if (confirmationSentTo) {
    return (
      <AuthCard
        title="Check your inbox"
        description="Confirm your email to finish creating your account."
        footer={
          <>
            Already confirmed?{" "}
            <Link href="/login" className="font-semibold text-primary-text hover:underline">
              Log in
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <p className="text-sm text-foreground">
            We sent a confirmation link to <strong>{confirmationSentTo}</strong>. Click it to
            activate your account, then log in.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      description="Join NeuroBridge to track progress and earn certificates."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary-text hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jamie Rivera"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Create account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to receive a confirmation email to verify your address.
        </p>
      </form>
    </AuthCard>
  );
}
