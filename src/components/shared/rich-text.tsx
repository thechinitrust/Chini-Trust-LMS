import { cn } from "@/lib/utils";

const HAS_TAGS = /<[a-z][\s\S]*>/i;

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Content saved before the rich-text editor shipped is plain text — wrap it into paragraphs so line breaks still render. */
function plainTextToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).split("\n").join("<br />")}</p>`)
    .join("");
}

/**
 * Renders admin-authored HTML from the rich-text editor. Safe because the
 * editor's Tiptap schema only ever produces p/h2/h3/strong/em/ul/ol/li tags
 * with inline text-align styles — there's no way to get a script, link, or
 * arbitrary attribute into this content through that editor.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  if (!html) return null;
  const content = HAS_TAGS.test(html) ? html : plainTextToHtml(html);
  return (
    <div
      className={cn(
        "[&_p]:mb-3 [&_p:last-child]:mb-0 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-foreground [&_h2:first-child]:mt-0 [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:text-foreground [&_h3:first-child]:mt-0 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
