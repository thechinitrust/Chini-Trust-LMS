"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, RotateCcw, Check, Sparkles, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/toast";
import {
  DEFAULT_HERO_IMAGE_URL,
  DEFAULT_HERO_IMAGE_ALT,
  updateSiteSettings,
  type SiteSettings,
} from "@/lib/data/site-settings";
import { HeroImageCropperModal } from "@/components/admin/hero-image-cropper-modal";
import { revalidateLandingPage } from "@/app/admin/settings/actions";

const MAX_RAW_FILE_SIZE = 12 * 1024 * 1024; // 12MB raw limit before cropping
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function HeroImageSettingsCard({ initialSettings }: { initialSettings: SiteSettings }) {
  const [currentUrl, setCurrentUrl] = React.useState(initialSettings.heroImageUrl);
  const [currentAlt, setCurrentAlt] = React.useState(initialSettings.heroImageAlt);
  const [previewUrl, setPreviewUrl] = React.useState(initialSettings.heroImageUrl);
  const [pendingBlob, setPendingBlob] = React.useState<Blob | null>(null);

  const [rawImageSrc, setRawImageSrc] = React.useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = React.useState(false);

  const [isSaving, setIsSaving] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasUnsavedChanges =
    previewUrl !== currentUrl || currentAlt !== initialSettings.heroImageAlt || pendingBlob !== null;

  const isDefaultArtwork =
    previewUrl === DEFAULT_HERO_IMAGE_URL && !pendingBlob;

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      notify.error("Please upload a JPG, PNG, or WEBP photo.");
      return;
    }

    if (file.size > MAX_RAW_FILE_SIZE) {
      notify.error("Please select an image under 12MB.");
      return;
    }

    if (rawImageSrc) {
      URL.revokeObjectURL(rawImageSrc);
    }

    const objectUrl = URL.createObjectURL(file);
    setRawImageSrc(objectUrl);
    setCropperOpen(true);
    e.target.value = "";
  };

  const handleCloseCropper = () => {
    if (rawImageSrc) {
      URL.revokeObjectURL(rawImageSrc);
      setRawImageSrc(null);
    }
    setCropperOpen(false);
  };

  const handleCropComplete = (croppedBlob: Blob, newPreviewUrl: string) => {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPendingBlob(croppedBlob);
    setPreviewUrl(newPreviewUrl);
    notify.success("Crop applied! Click 'Save Changes' to publish to the landing page.");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      let finalUrl = previewUrl;

      // If user cropped a new photo, upload the compressed WebP blob to Supabase Storage
      if (pendingBlob) {
        const fileName = `hero-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(fileName, pendingBlob, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: publicData } = supabase.storage
          .from("site-assets")
          .getPublicUrl(fileName);

        finalUrl = publicData.publicUrl;
      }

      // Persist in site_settings table
      await updateSiteSettings(supabase, {
        heroImageUrl: finalUrl,
        heroImageAlt: currentAlt.trim() || DEFAULT_HERO_IMAGE_ALT,
      });

      // Invalidate cache
      await revalidateLandingPage();

      setCurrentUrl(finalUrl);
      setPreviewUrl(finalUrl);
      setPendingBlob(null);

      notify.success("Landing page hero updated successfully!");
    } catch (err) {
      console.error(err);
      notify.error(
        "Could not save hero settings",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    setIsResetting(true);
    try {
      const supabase = createClient();
      await updateSiteSettings(supabase, {
        heroImageUrl: DEFAULT_HERO_IMAGE_URL,
        heroImageAlt: DEFAULT_HERO_IMAGE_ALT,
      });

      await revalidateLandingPage();

      setCurrentUrl(DEFAULT_HERO_IMAGE_URL);
      setPreviewUrl(DEFAULT_HERO_IMAGE_URL);
      setCurrentAlt(DEFAULT_HERO_IMAGE_ALT);
      setPendingBlob(null);

      notify.success("Restored original hero artwork!");
    } catch (err) {
      console.error(err);
      notify.error(
        "Could not reset hero image",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-2xl">Landing Page Hero Banner</CardTitle>
              <CardDescription className="mt-1">
                Manage the main artwork shown on the home page. Photos are automatically cropped to
                16:9 and compressed into ultra-fast WebP format.
              </CardDescription>
            </div>
            {!isDefaultArtwork && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetToDefault}
                disabled={isResetting || isSaving}
                className="self-start sm:self-auto text-xs"
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                {isResetting ? "Resetting..." : "Restore Default Artwork"}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Live Mockup Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                Live Blend Preview
              </Label>
              {pendingBlob && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <AlertCircle className="size-3.5" />
                  Unsaved changes (Preview only)
                </span>
              )}
            </div>

            {/* Visual simulation of the actual hero section */}
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-background shadow-soft">
              {/* Image positioned on right with exact mask */}
              <div className="absolute inset-y-0 right-0 w-[65%] pointer-events-none">
                <div
                  className="relative w-full h-full"
                  style={{
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 25%)",
                    maskImage: "linear-gradient(to right, transparent, black 25%)",
                  }}
                >
                  <Image
                    src={previewUrl}
                    alt={currentAlt}
                    fill
                    className="object-cover object-right opacity-85 dark:opacity-75"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    unoptimized={previewUrl.startsWith("blob:")}
                  />
                </div>
              </div>

              {/* Ambient Glow */}
              <div className="pointer-events-none absolute top-[-6rem] left-1/4 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl z-0" />

              {/* Text simulation mockup on left */}
              <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10 max-w-md">
                <span className="inline-block w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium tracking-widest text-primary-text uppercase">
                  The Chini Trust
                </span>
                <p className="mt-2 font-serif text-lg sm:text-2xl font-normal leading-tight text-foreground">
                  Your guide to <span className="text-primary italic">neurodiversity</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  Explore courses, practical resources, and accessibility tools...
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Above preview shows how the photo blends into the text with CSS gradient masking.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={handleSelectFile}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
            >
              <Upload className="size-4 mr-2" />
              Upload & Crop New Photo
            </Button>

            {hasUnsavedChanges && (
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                <Check className="size-4 mr-1.5" />
                {isSaving ? "Publishing..." : "Save Changes"}
              </Button>
            )}
          </div>

          {/* Accessibility Alt Text Field */}
          <div className="space-y-1.5 max-w-xl pt-2">
            <Label htmlFor="hero-alt">Image Description / Alt Text</Label>
            <Input
              id="hero-alt"
              value={currentAlt}
              onChange={(e) => setCurrentAlt(e.target.value)}
              placeholder="e.g., Diverse students collaborating in an inclusive classroom"
            />
            <p className="text-xs text-muted-foreground">
              Used by screen readers and search engines for accessibility and SEO.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Cropper Modal */}
      <HeroImageCropperModal
        open={cropperOpen}
        imageSrc={rawImageSrc}
        onClose={handleCloseCropper}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
