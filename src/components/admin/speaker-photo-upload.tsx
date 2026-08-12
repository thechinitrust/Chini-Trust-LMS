"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 500 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function SpeakerPhotoUpload({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}) {
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      notify.error("Use a JPG, PNG, or WEBP image");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      notify.error("Image must be under 500KB");
      return;
    }
    setIsUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("speaker-photos").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("speaker-photos").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (error) {
      notify.error("Couldn't upload photo", error instanceof Error ? error.message : undefined);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Label>
        Photo {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-1.5 flex items-start gap-3">
        <div
          className={cn(
            "relative aspect-square w-24 shrink-0 overflow-hidden rounded-full border bg-muted",
            value ? "border-border" : "border-dashed border-border"
          )}
        >
          {value ? (
            <Image src={value} alt="" fill className="object-cover" sizes="96px" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <ImagePlus className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="space-y-2">
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {value ? "Replace photo" : "Upload photo"}
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                <X className="size-4" aria-hidden="true" />
                Remove
              </Button>
            )}
          </div>
          <p className="max-w-xs text-xs text-muted-foreground">
            Shown on the About page and course pages. JPG, PNG or WEBP, up to 500KB — a square headshot
            works best.
          </p>
        </div>
      </div>
    </div>
  );
}
