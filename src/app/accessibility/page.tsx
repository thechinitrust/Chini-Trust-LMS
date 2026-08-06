"use client";

import { useTheme } from "next-themes";
import { Moon, Type, Focus, Volume2, TextCursorInput, FileText, TextSelect } from "lucide-react";

import { useAccessibility, type TextScale, type ReadAloudMode } from "@/context/accessibility-context";
import { notify } from "@/lib/toast";
import { AccessibilityControl } from "@/components/accessibility/accessibility-control";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SplitReveal } from "@/components/motion/split-reveal";
import { cn } from "@/lib/utils";

const TEXT_SCALE_OPTIONS: { value: TextScale; label: string }[] = [
  { value: "default", label: "A" },
  { value: "lg", label: "A+" },
  { value: "xl", label: "A++" },
];

const READ_MODE_OPTIONS: { value: ReadAloudMode; label: string; icon: typeof FileText }[] = [
  { value: "page", label: "Entire page", icon: FileText },
  { value: "selection", label: "Selected text", icon: TextSelect },
];

export default function AccessibilityPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const {
    dyslexiaFont,
    setDyslexiaFont,
    textScale,
    setTextScale,
    focusMode,
    setFocusMode,
    readAloud,
    setReadAloud,
    readAloudMode,
    setReadAloudMode,
  } = useAccessibility();

  return (
    <div className="container-page px-6 py-20 lg:px-12">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Accessibility Center</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          <SplitReveal text="Accessibility" />
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          CHINI Learn is built accessibility-first. These tools adjust the whole platform to fit
          how you read, focus, and process information best — and your preferences are remembered.
        </p>
      </Reveal>

      <RevealGroup className="mx-auto mt-14 max-w-2xl space-y-4">
        <RevealItem>
          <AccessibilityControl
            icon={Moon}
            title="Dark mode"
            description="Reduce glare and eye strain with a low-light color theme."
            control={
              <Switch
                checked={resolvedTheme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
            }
          />
        </RevealItem>

        <RevealItem>
          <AccessibilityControl
            icon={Type}
            title="Dyslexia-friendly font"
            description="Switch body text to a font with wider letter spacing, shown to help some dyslexic readers."
            control={
              <Switch checked={dyslexiaFont} onCheckedChange={setDyslexiaFont} aria-label="Toggle dyslexia-friendly font" />
            }
          />
        </RevealItem>

        <RevealItem>
          <AccessibilityControl
            icon={TextCursorInput}
            title="Text size"
            description="Increase the base text size across the whole platform."
            control={
              <div className="flex gap-1 rounded-full border border-border p-1">
                {TEXT_SCALE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTextScale(opt.value)}
                    aria-pressed={textScale === opt.value}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-300",
                      textScale === opt.value ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            }
          />
        </RevealItem>

        <RevealItem>
          <AccessibilityControl
            icon={Focus}
            title="Focus mode"
            description="Hide the navigation, footer and sidebars, and expand the lesson content into a centered, distraction-free reading column."
            control={
              <Switch
                checked={focusMode}
                onCheckedChange={(checked) => {
                  setFocusMode(checked);
                  notify.info(
                    checked ? "Focus mode on" : "Focus mode off",
                    checked ? "Use the Exit button at the top to leave." : undefined
                  );
                }}
                aria-label="Toggle focus mode"
              />
            }
          />
        </RevealItem>

        <RevealItem>
          <AccessibilityControl
            icon={Volume2}
            title="Read aloud"
            description="Show a floating player that reads the page using your browser's built-in speech. Nothing is sent to a server."
            control={
              <Switch
                checked={readAloud}
                onCheckedChange={(checked) => {
                  setReadAloud(checked);
                  notify.info(
                    checked ? "Read aloud enabled" : "Read aloud disabled",
                    checked ? "Use the player on the right edge of the screen." : undefined
                  );
                }}
                aria-label="Toggle read aloud"
              />
            }
          />
        </RevealItem>

        {/* Reading-mode picker — only meaningful once read aloud is on */}
        {readAloud && (
          <RevealItem>
            <Card tone="brand">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Reading mode</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {readAloudMode === "page"
                      ? "The player reads the whole page from top to bottom."
                      : "Highlight any text, then press play to hear just that."}
                  </p>
                </div>
                <div
                  className="flex gap-1 rounded-full border border-primary/25 bg-background/60 p-1"
                  role="group"
                  aria-label="Reading mode"
                >
                  {READ_MODE_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReadAloudMode(value)}
                      aria-pressed={readAloudMode === value}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-300",
                        readAloudMode === value
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </RevealItem>
        )}
      </RevealGroup>

      <Reveal className="mx-auto mt-12 max-w-2xl" variant="scale">
        <Card>
          <CardContent className="p-7" data-focus-dim="true">
            <p className="text-xs font-medium tracking-widest text-primary-text uppercase">Live preview</p>
            <h3 className="mt-3 text-lg font-semibold text-foreground">This is a preview heading</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This paragraph updates as you change the settings above, so you can see exactly how the
              rest of the platform will look before you commit to a setting.
            </p>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal className="mx-auto mt-16 max-w-2xl space-y-4 text-center" variant="blur">
        <h2 className="font-serif text-2xl text-foreground">Why these tools matter</h2>
        <p className="text-muted-foreground">
          Neurodivergent learners process text, light, and sound differently — and so does everyone
          else, to varying degrees. Rather than a single &ldquo;one size fits all&rdquo; design, CHINI Learn
          lets you shape the interface around what actually works for you.
        </p>
        <Button variant="outline" asChild>
          <a href="/about">Learn about our approach</a>
        </Button>
      </Reveal>
    </div>
  );
}
