"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ObjectivesEditorProps {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

/** Bullet-list editor: Enter adds the next bullet, Backspace on an empty one removes it — mirrors the bulleted list learners see on the page. */
export function ObjectivesEditor({ label, value, onChange, placeholder }: ObjectivesEditorProps) {
  const items = value.length > 0 ? value : [""];
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const setItem = (index: number, text: string) => {
    const next = [...items];
    next[index] = text;
    onChange(next);
  };

  const addItem = (afterIndex: number) => {
    const next = [...items];
    next.splice(afterIndex + 1, 0, "");
    onChange(next);
    requestAnimationFrame(() => inputRefs.current[afterIndex + 1]?.focus());
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      onChange([""]);
      return;
    }
    onChange(items.filter((_, i) => i !== index));
    requestAnimationFrame(() => inputRefs.current[Math.max(0, index - 1)]?.focus());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(index);
    } else if (e.key === "Backspace" && items[index] === "" && items.length > 1) {
      e.preventDefault();
      removeItem(index);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
            <Input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={item}
              placeholder={placeholder}
              aria-label={`${label} ${index + 1}`}
              onChange={(e) => setItem(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => removeItem(index)}
              aria-label="Remove objective"
            >
              <X className="size-4 text-muted-foreground" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" size="sm" variant="outline" onClick={() => addItem(items.length - 1)}>
        <Plus className="size-4" aria-hidden="true" />
        Add objective
      </Button>
    </div>
  );
}
