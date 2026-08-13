"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { AUDIENCE_SUGGESTIONS, audienceLabel, toAudienceSlug } from "@/lib/audiences";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AudienceSelectProps {
  /** Id for the "add audience" input — the checkbox group is labelled by the group label. */
  id: string;
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  /** Audiences already used elsewhere, listed as options alongside the suggestions. */
  knownAudiences?: string[];
}

/**
 * Multi-select audience picker. The launch audiences plus anything already in
 * use are checkboxes, and admins can type an audience of their own to add it
 * on the spot — it's slugified so "Job coaches" and "job coaches" stay one tag.
 */
export function AudienceSelect({
  id,
  label = "Audience",
  value,
  onChange,
  knownAudiences = [],
}: AudienceSelectProps) {
  const [custom, setCustom] = React.useState("");

  const options = React.useMemo(
    () => Array.from(new Set([...AUDIENCE_SUGGESTIONS, ...knownAudiences, ...value])),
    [knownAudiences, value]
  );

  const toggle = (audience: string) => {
    onChange(value.includes(audience) ? value.filter((a) => a !== audience) : [...value, audience]);
  };

  const addCustom = () => {
    const slug = toAudienceSlug(custom);
    if (!slug) return;
    if (!value.includes(slug)) onChange([...value, slug]);
    setCustom("");
  };

  return (
    <div className="space-y-1.5">
      <Label id={`${id}-label`}>{label}</Label>
      <div role="group" aria-labelledby={`${id}-label`} className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
        {options.map((audience) => (
          <label key={audience} className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox checked={value.includes(audience)} onCheckedChange={() => toggle(audience)} />
            {audienceLabel(audience)}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Input
          id={id}
          value={custom}
          aria-label="Add a custom audience"
          placeholder="Add another audience, e.g. Carers"
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            // Enter would otherwise submit the surrounding admin form.
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <Button type="button" size="sm" variant="outline" onClick={addCustom} disabled={!custom.trim()}>
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>
    </div>
  );
}
