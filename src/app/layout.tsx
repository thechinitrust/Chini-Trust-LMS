import type { Metadata } from "next";

import "@/app/globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "NeuroBridge AI | The Chini Trust",
    template: "%s | NeuroBridge AI",
  },
  description:
    "An accessibility-first platform for neurodiversity awareness, structured learning, resources, and AI-guided support from The Chini Trust.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
