"use client";

import { useTheme } from "next-themes";
import { Moon, Type, Focus, Volume2, TextCursorInput } from "lucide-react";

import { useAccessibility, type TextScale } from "@/context/accessibility-context";
import { notify } from "@/lib/toast";
import { AccessibilityControl } from "@/components/accessibility/accessibility-control";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TEXT_SCALE_OPTIONS: { value: TextScale; label: string }[] = [
  { value: "default", label: "A" },
  { value: "lg", label: "A+" },
  { value: "xl", label: "A++" },
];

export default function AccessibilityPage() {
  const { theme, setTheme } = useTheme();
  const { dyslexiaFont, setDyslexiaFont, textScale, setTextScale, focusMode, setFocusMode, readAloud, setReadAloud } =
    useAccessibility();

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Accessibility</h1>
        <p className="mt-3 text-muted-foreground">
          NeuroBridge AI is built accessibility-first. These tools adjust the whole platform to fit
          how you read, focus, and process information best — and your preferences are remembered.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        <AccessibilityControl
          icon={Moon}
          title="Dark mode"
          description="Reduce glare and eye strain with a low-light color theme."
          control={
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
          }
        />

        <AccessibilityControl
          icon={Type}
          title="Dyslexia-friendly font"
          description="Switch body text to a font with wider letter spacing, shown to help some dyslexic readers."
          control={
            <Switch checked={dyslexiaFont} onCheckedChange={setDyslexiaFont} aria-label="Toggle dyslexia-friendly font" />
          }
        />

        <AccessibilityControl
          icon={TextCursorInput}
          title="Text size"
          description="Increase the base text size across the whole platform."
          control={
            <div className="flex gap-1 rounded-lg border border-border p-1">
              {TEXT_SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTextScale(opt.value)}
                  aria-pressed={textScale === opt.value}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                    textScale === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          }
        />

        <AccessibilityControl
          icon={Focus}
          title="Focus mode"
          description="Dim secondary navigation and chrome so you can concentrate on the main content."
          control={<Switch checked={focusMode} onCheckedChange={setFocusMode} aria-label="Toggle focus mode" />}
        />

        <AccessibilityControl
          icon={Volume2}
          title="Read aloud"
          description="Enable a read-aloud control on lesson and article pages (uses your browser's built-in speech)."
          control={
            <Switch
              checked={readAloud}
              onCheckedChange={(checked) => {
                setReadAloud(checked);
                notify.info(checked ? "Read aloud enabled" : "Read aloud disabled");
              }}
              aria-label="Toggle read aloud"
            />
          }
        />
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <Card>
          <CardContent className="p-6" data-focus-dim="true">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live preview</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">This is a preview heading</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This paragraph updates as you change the settings above, so you can see exactly how the
              rest of the platform will look before you commit to a setting.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mx-auto mt-14 max-w-2xl space-y-3 text-center">
        <h2 className="text-xl font-semibold text-foreground">Why these tools matter</h2>
        <p className="text-sm text-muted-foreground">
          Neurodivergent learners process text, light, and sound differently — and so does everyone
          else, to varying degrees. Rather than a single &ldquo;one size fits all&rdquo; design, NeuroBridge AI
          lets you shape the interface around what actually works for you.
        </p>
        <Button variant="outline" asChild>
          <a href="/about">Learn about our approach</a>
        </Button>
      </div>
    </div>
  );
}
