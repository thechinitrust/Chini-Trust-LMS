"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { AdminSidebar, AdminMobileNav } from "@/components/layout/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth adminOnly>
      <div className="flex">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <div className="container-page py-8 lg:py-10">
            <AdminMobileNav />
            {children}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
