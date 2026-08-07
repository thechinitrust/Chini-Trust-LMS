import { Loader2 } from "lucide-react";

/**
 * Bridges the gap on /login and /register between a sign-in succeeding and
 * the redirect actually committing.
 *
 * Those pages hide their form as soon as `user` is set, but the navigation to
 * /dashboard or /admin is still in flight at that point -- and no route-level
 * loading.tsx can cover it, because the router is still on the auth route.
 * Rendering nothing there left the viewport completely blank for the whole
 * round trip, which on a slow connection reads as "the button did nothing".
 */
export function AuthRedirecting({ label = "Signing you in…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin text-primary" strokeWidth={1.5} aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
