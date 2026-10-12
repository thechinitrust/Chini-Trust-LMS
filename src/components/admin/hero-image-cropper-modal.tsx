"use client";

import * as React from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { ZoomIn, ZoomOut, Check, RotateCcw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCroppedImg } from "@/lib/crop-image";
import { notify } from "@/lib/toast";

interface HeroImageCropperModalProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void;
}

export function HeroImageCropperModal({
  open,
  imageSrc,
  onClose,
  onCropComplete,
}: HeroImageCropperModalProps) {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Reset when dialog opens with a new image
  React.useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [open, imageSrc]);

  const handleCropComplete = (
    _croppedArea: Area,
    currentCroppedAreaPixels: Area
  ) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedBlob);
      onCropComplete(croppedBlob, previewUrl);
      onClose();
    } catch (err) {
      console.error("Cropping failed:", err);
      notify.error("Cropping failed. Please try a different image.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Crop & Frame Hero Image</DialogTitle>
          <DialogDescription className="text-sm">
            Position the focal subject towards the center or right. The left ~25% automatically
            blends into the background behind the text.
          </DialogDescription>
        </DialogHeader>

        {/* Cropper Container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
          />

          {/* Left blend visual guide overlay */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1/4 border-r border-dashed border-white/60 bg-black/35 z-10 flex flex-col justify-between p-3"
            aria-hidden="true"
          >
            <span className="inline-block rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium tracking-wider text-white/90 uppercase backdrop-blur-sm">
              Fade Zone
            </span>
            <span className="text-[11px] leading-tight text-white/75">
              Blends into text on landing page
            </span>
          </div>

          {/* Right focal subject guide overlay */}
          <div
            className="pointer-events-none absolute top-3 right-3 rounded bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm z-10"
            aria-hidden="true"
          >
            Focal Area (faces / artwork)
          </div>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
          <div className="flex items-center gap-3 w-full sm:w-72">
            <ZoomOut className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              aria-label="Zoom photo"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
            <ZoomIn className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="text-xs font-mono text-muted-foreground min-w-8">
              {zoom.toFixed(1)}x
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setCrop({ x: 0, y: 0 });
              setZoom(1);
            }}
            className="self-start sm:self-auto text-xs"
          >
            <RotateCcw className="size-3.5 mr-1" />
            Reset position
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isProcessing}>
            <Check className="size-4 mr-1.5" />
            {isProcessing ? "Processing..." : "Apply Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
