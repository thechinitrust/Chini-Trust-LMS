/**
 * Audience tags shared by courses and resources.
 *
 * Courses stay limited to the launch five (enforced by the check constraint on
 * courses.audience), while resource audiences are free text — the five below
 * are offered as suggestions and admins can add their own. Custom values are
 * slugified on the way in so "Job coaches" and "job coaches" stay one tag, and
 * anything without a friendly label displays as its de-slugified form.
 */
import type { AudienceTag } from "@/lib/types";

export const AUDIENCE_SUGGESTIONS: AudienceTag[] = [
  "students",
  "parents",
  "teachers",
  "employers",
  "neurodivergent-individuals",
];

const AUDIENCE_LABEL: Record<string, string> = {
  students: "Students",
  parents: "Parents",
  teachers: "Teachers",
  employers: "Employers",
  "neurodivergent-individuals": "Neurodivergent individuals",
};

export function audienceLabel(audience: string): string {
  const known = AUDIENCE_LABEL[audience];
  if (known) return known;
  const words = audience.replace(/-/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Normalises a typed-in audience to storage form: "Job Coaches" -> "job-coaches". */
export function toAudienceSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
