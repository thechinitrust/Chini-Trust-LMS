"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  PlayCircle,
  FileText,
  ListChecks,
  Users,
  Award,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/modules", label: "Modules", icon: Layers },
  { href: "/admin/lessons", label: "Lessons & Videos", icon: PlayCircle },
  { href: "/admin/resources", label: "Resources", icon: FileText },
  { href: "/admin/quizzes", label: "Quizzes", icon: ListChecks },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-muted/30 lg:block">
      <nav className="sticky top-16 flex flex-col gap-1 p-4" aria-label="Admin navigation">
        {ADMIN_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-primary/10 text-primary"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden"
      aria-label="Admin navigation"
    >
      {ADMIN_LINKS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground",
              active && "border-primary bg-primary/10 text-primary"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
