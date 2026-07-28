"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client-side gate for pages that need a signed-in user (and optionally an
 * admin role). This is a UX convenience only, not a security boundary —
 * TODO(supabase): once Supabase Auth is wired in, re-check the session in
 * middleware/server components so protected data is never fetched for an
 * unauthenticated request in the first place.
 */
export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (adminOnly && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, user, adminOnly, router]);

  if (isLoading || !user || (adminOnly && user.role !== "admin")) {
    return (
      <div className="container-page space-y-4 px-6 py-16 lg:px-12">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
