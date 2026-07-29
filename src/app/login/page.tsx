"use client";

import * as React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Shield, UserRound } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { notify } from "@/lib/toast";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const QUICK_LOGIN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_QUICK_LOGIN === "true";
const QUICK_LOGIN_PASSWORD = "NeuroBridge@2026";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [quickLoginRole, setQuickLoginRole] = React.useState<"admin" | "learner" | null>(null);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    try {
      const profile = await login(loginEmail, loginPassword);
      notify.success(`Welcome back, ${profile.fullName.split(" ")[0]}`);
      const redirectTo = searchParams.get("redirectTo");
      router.push(redirectTo || (profile.role === "admin" ? "/admin" : "/dashboard"));
    } catch (error) {
      notify.error("Couldn't log in", error instanceof Error ? error.message : undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await doLogin(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: "admin" | "learner") => {
    setQuickLoginRole(role);
    try {
      await doLogin(role === "admin" ? "admin@neurobridge.com" : "user@neurobridge.com", QUICK_LOGIN_PASSWORD);
    } finally {
      setQuickLoginRole(null);
    }
  };

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

      {QUICK_LOGIN_ENABLED && (
        <div className="mt-6 rounded-xl border border-dashed border-warning/40 bg-warning/5 p-4">
          <p className="text-xs font-semibold tracking-wide text-warning-text uppercase">Dev only — quick login</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Set NEXT_PUBLIC_ENABLE_QUICK_LOGIN=false (or remove this block) before shipping to production.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={quickLoginRole !== null}
              onClick={() => handleQuickLogin("admin")}
            >
              {quickLoginRole === "admin" ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
              Login as Admin
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={quickLoginRole !== null}
              onClick={() => handleQuickLogin("learner")}
            >
              {quickLoginRole === "learner" ? <Loader2 className="size-4 animate-spin" /> : <UserRound className="size-4" />}
              Login as User
            </Button>
          </div>
        </div>
      )}
    </AuthCard>
  );
}
