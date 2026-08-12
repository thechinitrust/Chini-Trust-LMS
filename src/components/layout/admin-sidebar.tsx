"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ListChecks,
  Users,
  Award,
  CalendarDays,
  Mic2,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/speakers", label: "Speakers", icon: Mic2 },
  { href: "/admin/resources", label: "Resources", icon: FileText },
  { href: "/admin/quizzes", label: "Quizzes", icon: ListChecks },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-black/5 lg:block dark:border-white/10">
      <nav className="sticky top-20 flex flex-col gap-1 p-6" aria-label="Admin navigation">
        {ADMIN_LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                active && "text-primary-text"
              )}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  layoutId="admin-active-pill"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="relative z-10 size-4" strokeWidth={1.5} aria-hidden="true" />
              <span className="relative z-10">{label}</span>
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
    <nav className="-mx-6 mb-8 flex gap-2 overflow-x-auto px-6 pb-2 lg:hidden" aria-label="Admin navigation">
      {ADMIN_LINKS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "shrink-0 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground",
              active && "border-primary/30 bg-primary/10 text-primary-text"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
