"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client-side gate for pages that need a signed-in user (and optionally an
 * admin role). The real security boundary is middleware.ts (redirects
 * unauthenticated requests before render) plus RLS (the database rejects
 * unauthorized reads/writes regardless of what the client shows) — this
 * component is a UX layer on top of both, giving an instant loading/redirect
 * state instead of a content flash while the server-side checks resolve.
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
