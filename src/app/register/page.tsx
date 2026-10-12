"use client";

import * as React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  LayoutDashboard,
  Award,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { notify } from "@/lib/toast";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthRedirecting } from "@/components/auth/auth-redirecting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function safeRedirectTarget(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const { user, register, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const guestTarget = safeRedirectTarget(searchParams.get("redirectTo")) ?? "/learn";

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = React.useState<string | null>(null);

  const hasRedirectedRef = React.useRef(false);

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
      notify.success("Account created", `Welcome to CHINI Learn, ${profile?.fullName ?? "there"}.`);
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
    return <AuthRedirecting label="Setting up your account…" />;
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
          <p className="text-xs text-muted-foreground">
            The email is sent via Supabase on our behalf — if you don&apos;t see it shortly,
            check your spam or promotions folder.
          </p>
        </div>
      </AuthCard>
    );
  }

  const sidePanel = (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary-text">
        <Sparkles className="size-3.5 text-primary" strokeWidth={1.5} aria-hidden="true" />
        <span>Account is optional · Open to all</span>
      </div>

      <div>
        <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          Learn freely, with or without an account
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          All courses, video lessons, and downloadable materials on CHINI Learn are free and open to everyone.
          You can explore as a guest anytime with no sign-up required.
        </p>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-sm">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Benefits of creating a free account
        </p>
        <ul className="mt-4 space-y-3.5 text-sm">
          <li className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary-text">
              <LayoutDashboard className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <span className="font-medium text-foreground">Personal Dashboard</span>
              <p className="text-xs text-muted-foreground">Keep all your enrolled courses and progress in one place.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary-text">
              <CheckCircle2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <span className="font-medium text-foreground">Automatic Progress Tracking</span>
              <p className="text-xs text-muted-foreground">Save completed lessons and pick up right where you left off.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary-text">
              <Award className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <span className="font-medium text-foreground">Verified Certificates</span>
              <p className="text-xs text-muted-foreground">Earn completion certificates issued in your name.</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="pt-1">
        <Button variant="outline" asChild className="rounded-full gap-2">
          <Link href={guestTarget}>
            Browse courses as guest
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <AuthCard
      title="Create your account"
      description="Join CHINI Learn to track your progress and earn certificates."
      sidePanel={sidePanel}
      footer={
        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary-text hover:underline">
              Log in
            </Link>
          </div>
          <div>
            <Link
              href={guestTarget}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              Prefer to explore first? Browse as guest &rarr;
            </Link>
          </div>
        </div>
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

        {/* ---- Data privacy notice ---- */}
        <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 text-xs text-muted-foreground">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5" strokeWidth={1.5} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="leading-relaxed">
                We only collect your name and email to save your learning progress and issue certificates.
                Your data is stored securely and never sold or shared.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="mt-1.5 inline-flex items-center gap-1 font-medium text-primary-text hover:underline"
                  >
                    <span>Data privacy note</span>
                    <ArrowRight className="size-3" strokeWidth={1.5} />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-xl">Data Privacy Note</DialogTitle>
                    <DialogDescription className="text-xs">
                      How your information is collected and protected on CHINI Learn
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-2 text-xs leading-relaxed text-muted-foreground">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Information Collected</h4>
                      <p className="mt-1 leading-relaxed">
                        • <strong>Full Name:</strong> Stored to personalize your profile and display on certificates of completion you earn.<br />
                        • <strong>Email Address:</strong> Used for account sign-in, verification, and critical account security notices.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">How It Is Protected &amp; Used</h4>
                      <p className="mt-1 leading-relaxed">
                        Your data is stored securely in encrypted databases protected by Row-Level Security (RLS). We never sell, rent, or share personal information with third parties or advertisers. It is strictly used to save your educational progress.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Create account
        </Button>

        <div className="text-center pt-1">
          <Link
            href={guestTarget}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            Prefer not to sign up? Explore courses as a guest &rarr;
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
