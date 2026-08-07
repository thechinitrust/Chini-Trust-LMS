import { AdminSidebar, AdminMobileNav } from "@/components/layout/admin-sidebar";

/**
 * Admin shell. Access is enforced server-side by middleware.ts, which
 * redirects unauthenticated users and non-admins away from /admin/* before
 * any of this renders, and by RLS on every query the pages below make.
 *
 * This layout deliberately does no async work of its own: it renders on the
 * server as part of the initial payload, so the sidebar paints immediately
 * and each route's own loading.tsx skeleton covers the content area while
 * that route's data resolves. Gating it behind a client-side auth check
 * instead would blank the whole shell -- skeletons included -- until a
 * post-hydration session lookup finished, which is exactly the delay and
 * layout-mismatched placeholder this replaced.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <div className="px-6 py-10 lg:px-12 lg:py-14">
          <AdminMobileNav />
          {children}
        </div>
      </div>
    </div>
  );
}
