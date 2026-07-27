import Link from "next/link";
import { Brain } from "lucide-react";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/learn", label: "Learn" },
      { href: "/resources", label: "Resources" },
      { href: "/ai-neuroguide", label: "AI NeuroGuide" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Our mission" },
      { href: "/dashboard", label: "Your dashboard" },
      { href: "/register", label: "Create an account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="size-4" aria-hidden="true" />
            </span>
            <span className="tracking-tight">
              NeuroBridge <span className="text-primary">AI</span>
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            An accessibility-first platform from The Chini Trust for neurodiversity awareness,
            structured learning, and AI-guided support.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} The Chini Trust. All rights reserved.</p>
          <p>NeuroBridge AI is an independent platform of The Chini Trust.</p>
        </div>
      </div>
    </footer>
  );
}
