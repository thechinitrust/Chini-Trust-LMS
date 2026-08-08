/**
 * Course category is free text (admins can type any category), but the
 * four topics CHINI Learn launched with get friendly display labels even
 * though they're stored lowercase. Anything else displays as typed.
 */
export const CATEGORY_SUGGESTIONS = ["Autism", "ADHD", "Dyslexia", "Workplace Inclusion"];

const CATEGORY_LABEL: Record<string, string> = {
  autism: "Autism",
  adhd: "ADHD",
  dyslexia: "Dyslexia",
  workplace: "Workplace Inclusion",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? category;
}
