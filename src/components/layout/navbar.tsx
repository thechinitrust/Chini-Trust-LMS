"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun, LayoutDashboard, ShieldCheck, LogOut, Brain } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/resources", label: "Resources" },
  { href: "/ai-neuroguide", label: "NeuroGuide" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/about", label: "About" },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    setMobileOpen(false);
    // Await signOut so the Supabase cookies are actually cleared before we
    // navigate -- pushing immediately (fire-and-forget) risked landing on
    // /login while the old session cookie was still readable by middleware,
    // which is its own source of "logged out but not really" flakiness.
    await logout();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header
      className="sticky top-0 z-40 glass"
      data-focus-hide="true"
    >
      <div className="container-page flex h-20 items-center justify-between gap-4 px-6 lg:px-12">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-ink text-primary-foreground shadow-soft transition-transform duration-500 group-hover:scale-105">
            <Brain className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="font-serif text-xl tracking-tight text-foreground">NeuroBridge</span>
        </Link>

        <nav className="relative hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary-text",
                  active && "text-primary-text"
                )}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 rounded-full bg-primary/12 ring-1 ring-primary/20"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
          {user && (
            <Link
              href="/dashboard"
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary-text",
                (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) && "text-primary-text"
              )}
            >
              {(pathname === "/dashboard" || pathname.startsWith("/dashboard/")) && (
                <motion.span
                  layoutId="navbar-active-pill"
                  className="absolute inset-0 rounded-full bg-primary/12 ring-1 ring-primary/20"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5"><LayoutDashboard className="size-4" strokeWidth={1.5} /> Dashboard</span>
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary-text",
                (pathname === "/admin" || pathname.startsWith("/admin/")) && "text-primary-text"
              )}
            >
              {(pathname === "/admin" || pathname.startsWith("/admin/")) && (
                <motion.span
                  layoutId="navbar-active-pill"
                  className="absolute inset-0 rounded-full bg-primary/12 ring-1 ring-primary/20"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5"><ShieldCheck className="size-4" strokeWidth={1.5} /> Admin</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mounted && resolvedTheme === "dark" ? "sun" : "moon"}
                initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex"
              >
                {mounted && resolvedTheme === "dark" ? (
                  <Sun className="size-5" strokeWidth={1.5} />
                ) : (
                  <Moon className="size-5" strokeWidth={1.5} />
                )}
              </motion.span>
            </AnimatePresence>
          </Button>

          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pr-2 pl-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">{initials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.fullName.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="flex items-center gap-2 text-destructive focus:text-destructive">
                    <LogOut className="size-4" strokeWidth={1.5} /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" strokeWidth={1.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <SheetHeader>
                <SheetTitle className="font-serif">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile navigation">
                {NAV_LINKS.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                        active ? "bg-primary/12 text-primary-text" : "text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="my-2 h-px bg-border" />
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                        pathname === "/dashboard" || pathname.startsWith("/dashboard/") ? "bg-primary/12 text-primary-text" : "text-foreground"
                      )}
                    >
                      Dashboard
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                          pathname === "/admin" || pathname.startsWith("/admin/") ? "bg-primary/12 text-primary-text" : "text-foreground"
                        )}
                      >
                        Admin panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-muted"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
