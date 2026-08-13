"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import type { CertificateTextTone } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CertificateArtwork } from "@/components/shared/certificate-artwork";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Stand-in learner used by the preview so the admin can see where the real name lands. */
const SAMPLE_LEARNER = "Priya Sharma";
const SAMPLE_ID = "8f2a1c40-0000-0000-0000-000000000000";

export interface CertificateTemplateValue {
  templateUrl?: string;
  textTone: CertificateTextTone;
  textOffset: number;
}

/**
 * Uploads a course's certificate artwork and positions the text drawn on top
 * of it. The artwork is a *blank form* -- the learner name, course title,
 * issue date and certificate id are always rendered by the app, so the same
 * file serves every learner.
 *
 * The live preview is the real <CertificateArtwork>, not a mock-up, so what
 * the admin lines up here is exactly what the learner gets.
 */
export function CertificateTemplateUpload({
  value,
  onChange,
  courseTitle,
  disabled,
}: {
  value: CertificateTemplateValue;
  onChange: (value: CertificateTemplateValue) => void;
  courseTitle: string;
  disabled?: boolean;
}) {
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      notify.error("Use a JPG, PNG, or WEBP image");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      notify.error("Template must be under 2MB");
      return;
    }
    setIsUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("certificate-templates").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("certificate-templates").getPublicUrl(path);
      onChange({ ...value, templateUrl: data.publicUrl });
    } catch (error) {
      notify.error("Couldn't upload template", error instanceof Error ? error.message : undefined);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Label>Certificate template</Label>
      <p className="mt-1 text-xs text-muted-foreground">
        Optional. Upload A4 landscape artwork with the middle left blank — the learner&apos;s name,
        the course title and the issue date are added automatically. Leave empty to use the
        built-in CHINI Learn design.
      </p>

      <div className="mt-3 space-y-3">
        <div className="relative">
          <CertificateArtwork
            learnerName={SAMPLE_LEARNER}
            courseTitle={courseTitle || "Course title"}
            issuedAt={new Date().toISOString()}
            certificateId={SAMPLE_ID}
            templateUrl={value.templateUrl}
            textTone={value.textTone}
            textOffset={value.textOffset}
            className="rounded-xl"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70">
              <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            Preview — sample name and today&apos;s date
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading || disabled}
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            {value.templateUrl ? "Replace template" : "Upload template"}
          </Button>
          {value.templateUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading || disabled}
              onClick={() => onChange({ ...value, templateUrl: undefined })}
            >
              <X className="size-4" aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>

        {/* Only meaningful over uploaded artwork -- the built-in design manages
            its own contrast and alignment. */}
        {value.templateUrl && (
          <div className="grid gap-4 rounded-lg border border-border p-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="cert-text-tone" className="text-xs">
                Text colour
              </Label>
              <div id="cert-text-tone" className="mt-1.5 flex gap-2">
                {(["light", "dark"] as const).map((tone) => (
                  <Button
                    key={tone}
                    type="button"
                    size="sm"
                    variant={value.textTone === tone ? "default" : "outline"}
                    disabled={disabled}
                    onClick={() => onChange({ ...value, textTone: tone })}
                    className="flex-1 capitalize"
                  >
                    {tone}
                  </Button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Pick whichever reads against your artwork.
              </p>
            </div>

            <div>
              <Label htmlFor="cert-text-offset" className="text-xs">
                Vertical position
                <span className="ml-1 font-normal text-muted-foreground">
                  ({value.textOffset > 0 ? `+${value.textOffset}` : value.textOffset}%)
                </span>
              </Label>
              <input
                id="cert-text-offset"
                type="range"
                min={-25}
                max={25}
                step={1}
                value={value.textOffset}
                disabled={disabled}
                onChange={(e) => onChange({ ...value, textOffset: Number(e.target.value) })}
                className={cn(
                  "mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted",
                  "[accent-color:var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Slide until the name sits in your artwork&apos;s blank area.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
