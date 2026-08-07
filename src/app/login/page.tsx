"use client";

import * as React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { notify } from "@/lib/toast";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthRedirecting } from "@/components/auth/auth-redirecting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Only allow redirecting to a same-site path -- an absolute/protocol-relative
 *  `redirectTo` query value would be an open-redirect vector. */
function safeRedirectTarget(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // Sign-in already redirects immediately with the profile it just fetched
  // (see handleSubmit) -- without this guard, the effect below would fire a
  // *second* time once the auth-context `user` state catches up a moment
  // later, replaying the redirect and triggering a second, wasted page
  // fetch on top of the first.
  const hasRedirectedRef = React.useRef(false);

  // The login page is only for signed-out visitors. If someone is already
  // authenticated (e.g. they hit back, or opened /login in a tab where
  // they're already signed in elsewhere), send them straight to their
  // dashboard instead of showing the form. Middleware does the same check
  // server-side before this ever renders; this covers the client-side
  // session already in memory.
  React.useEffect(() => {
    if (hasRedirectedRef.current || isLoading || !user) return;
    hasRedirectedRef.current = true;
    const redirectTo = safeRedirectTarget(searchParams.get("redirectTo"));
    router.replace(redirectTo || (user.role === "admin" ? "/admin" : "/dashboard"));
    router.refresh();
  }, [isLoading, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const profile = await login(email, password);
      notify.success(`Welcome back, ${profile.fullName.split(" ")[0]}`);
      hasRedirectedRef.current = true;
      const redirectTo = safeRedirectTarget(searchParams.get("redirectTo"));
      router.replace(redirectTo || (profile.role === "admin" ? "/admin" : "/dashboard"));
      router.refresh();
    } catch (error) {
      notify.error("Couldn't log in", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoading && user) {
    return <AuthRedirecting />;
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to continue your learning journey."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary-text hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary-text hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Log in
        </Button>
      </form>
    </AuthCard>
  );
}
