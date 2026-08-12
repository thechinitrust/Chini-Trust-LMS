"use client";

import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConfirmOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonProps["variant"];
}

/**
 * Themed replacement for `window.confirm` — returns a promise so call sites
 * keep the same `if (!(await confirm(...))) return;` shape.
 */
export function useConfirm() {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback((opts: ConfirmOptions | string) => {
    setOptions(typeof opts === "string" ? { description: opts } : opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const respond = (value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setOptions(null);
  };

  const ConfirmDialog = (
    <Dialog open={options !== null} onOpenChange={(open) => !open && respond(false)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{options?.title ?? "Are you sure?"}</DialogTitle>
          <DialogDescription>{options?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => respond(false)}>
            {options?.cancelLabel ?? "Cancel"}
          </Button>
          <Button type="button" variant={options?.confirmVariant ?? "destructive"} onClick={() => respond(true)}>
            {options?.confirmLabel ?? "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, ConfirmDialog };
}
