import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/learn", label: "Learn" },
      { href: "/resources", label: "Resources" },
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
    <footer className="relative overflow-hidden bg-ink-mesh text-ink-foreground" data-focus-hide="true">
      <div className="container-page relative grid gap-12 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">
        <div className="sm:col-span-2">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-soft transition-transform duration-500 group-hover:scale-105">
              <Image src="/logo-dark.png" alt="" fill className="object-cover" sizes="36px" />
            </span>
            <span className="font-serif text-lg tracking-tight text-ink-foreground">CHINI Learn</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted-foreground">
            An accessibility-first platform from The Chini Trust for neurodiversity awareness,
            structured learning, and practical inclusive support.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-medium tracking-widest text-ink-muted-foreground uppercase">{col.title}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-foreground/80 transition-colors duration-300 hover:text-ink-glow-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-ink-border py-6">
        <div className="container-page flex flex-col items-center justify-between gap-2 px-6 text-xs text-ink-muted-foreground sm:flex-row lg:px-12">
          <p>&copy; {new Date().getFullYear()} The Chini Trust. All rights reserved.</p>
          <p>CHINI Learn is an independent platform of The Chini Trust.</p>
        </div>
      </div>
    </footer>
  );
}
