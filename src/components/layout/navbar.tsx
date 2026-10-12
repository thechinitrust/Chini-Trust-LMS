"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun, LayoutDashboard, ShieldCheck, LogOut, Focus } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useAccessibility } from "@/context/accessibility-context";
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
  const { focusMode, setFocusMode } = useAccessibility();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isLearningPage =
    pathname.startsWith("/learn") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/lessons");

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
    <header className="sticky top-0 z-40 glass print:hidden">
      <div className="container-page flex h-20 items-center justify-between gap-4 px-6 lg:px-12">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-soft transition-transform duration-500 group-hover:scale-105">
            <Image src="/logo.png" alt="" fill className="object-cover" sizes="40px" priority />
          </span>
          <span className="font-serif text-xl tracking-tight text-foreground">CHINI Learn</span>
        </Link>

        <nav className="relative hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {mounted && focusMode && isLearningPage ? null : (
            <>
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
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isLearningPage && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={mounted && focusMode ? "Exit focus mode" : "Enter focus mode"}
              title={mounted && focusMode ? "Exit focus mode" : "Focus mode"}
              onClick={() => setFocusMode(!focusMode)}
              className={cn(
                "relative transition-all duration-300",
                mounted && focusMode && "bg-primary/15 text-primary-text ring-1 ring-primary/25 hover:bg-primary/20 hover:text-primary-text"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mounted && focusMode ? "focus-active" : "focus-inactive"}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex"
                >
                  <Focus className="size-5" strokeWidth={1.5} />
                </motion.span>
              </AnimatePresence>
              {mounted && focusMode && (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </Button>
          )}

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
                {mounted && focusMode && isLearningPage ? (
                  <div className="space-y-3 py-2">
                    <div className="rounded-xl border border-primary/20 bg-primary/10 p-3.5 text-center">
                      <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-text">
                        <Focus className="size-4" strokeWidth={2} />
                        Focus Mode Active
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Navigation links are hidden to keep your study session distraction-free.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2 border-primary/30 text-primary-text hover:bg-primary/15"
                      onClick={() => {
                        setFocusMode(false);
                        setMobileOpen(false);
                      }}
                    >
                      Exit Focus Mode
                    </Button>
                  </div>
                ) : (
                  <>
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
                    {isLearningPage && (
                      <>
                        <div className="my-2 h-px bg-border" />
                        <button
                          type="button"
                          onClick={() => {
                            setFocusMode(!focusMode);
                            setMobileOpen(false);
                          }}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                            mounted && focusMode ? "bg-primary/12 text-primary-text" : "text-foreground"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <Focus className="size-4" strokeWidth={1.5} />
                            Focus mode
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {mounted && focusMode ? "Active" : "Off"}
                          </span>
                        </button>
                      </>
                    )}
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
