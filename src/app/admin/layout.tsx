"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { AdminSidebar, AdminMobileNav } from "@/components/layout/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth adminOnly>
      <div className="flex">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <div className="px-6 py-10 lg:px-12 lg:py-14">
            <AdminMobileNav />
            {children}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
