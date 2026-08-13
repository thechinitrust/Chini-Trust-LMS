import Image from "next/image";

import type { CertificateTextTone } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface CertificateArtworkProps {
  learnerName: string;
  courseTitle: string;
  /** ISO timestamp. */
  issuedAt: string;
  certificateId: string;
  /** Course artwork used as the backdrop. Unset renders the built-in design. */
  templateUrl?: string;
  textTone?: CertificateTextTone;
  /** Vertical nudge in percent (-25..25) for lining text up with the artwork. */
  textOffset?: number;
  className?: string;
}

/**
 * The certificate itself -- rendered identically on the learner's certificate
 * page and in the admin template preview, so the two can never drift.
 *
 * Sizing is entirely container-relative (`cqw` units against the `@container`
 * root), so the same markup is faithful at full page width and at thumbnail
 * size in the admin panel. The box is locked to A4 landscape, matching both
 * the print stylesheet and the artwork admins are asked to export.
 *
 * Two modes:
 *   - no `templateUrl`: the built-in "ink" placeholder -- the deep umber
 *     surface the design system reserves for premium contrast moments, with
 *     the Chini Trust crest. Flips to paper-white when printed (see the
 *     `@media print` block in globals.css, which keys off `data-has-template`).
 *   - with `templateUrl`: the uploaded artwork as backdrop, with the same
 *     personalised text drawn on top. The uploaded file is always a blank
 *     form; names and dates are never baked into it.
 */
export function CertificateArtwork({
  learnerName,
  courseTitle,
  issuedAt,
  certificateId,
  templateUrl,
  textTone = "light",
  textOffset = 0,
  className,
}: CertificateArtworkProps) {
  const hasTemplate = Boolean(templateUrl);
  const issuedDate = new Date(issuedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // On the built-in design the ink tokens already guarantee contrast. On
  // uploaded artwork the admin picks the tone, since we can't know whether
  // their background is pale or dark.
  const tone = hasTemplate
    ? textTone === "dark"
      ? { body: "text-[#26251b]", muted: "text-[#26251b]/70", rule: "bg-[#26251b]/30", accent: "text-[#4f4d21]" }
      : { body: "text-white", muted: "text-white/75", rule: "bg-white/40", accent: "text-white" }
    : {
        body: "text-ink-foreground",
        muted: "text-ink-muted-foreground",
        rule: "bg-ink-border",
        accent: "text-ink-glow-accent",
      };

  return (
    <div
      id="certificate-print-area"
      data-has-template={hasTemplate}
      className={cn(
        "@container relative aspect-[1.414/1] w-full overflow-hidden rounded-3xl shadow-soft-lg",
        hasTemplate ? "bg-muted" : "bg-ink",
        className
      )}
    >
      {hasTemplate ? (
        <Image
          src={templateUrl!}
          alt=""
          fill
          className="certificate-template-image object-cover"
          sizes="(min-width: 1024px) 900px, 100vw"
          priority
        />
      ) : (
        <>
          {/* Faint guilloche ruling -- the security-paper texture that keeps
              the placeholder from reading as a plain dark card. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(90deg,var(--color-ink-glow-primary)_0,var(--color-ink-glow-primary)_1px,transparent_1px,transparent_10px)] opacity-[0.06]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--color-ink-glow-primary)_16%,transparent),transparent_60%)]"
          />
        </>
      )}

      {/* Inset rule frame, drawn on both modes so uploaded artwork still sits
          in a certificate-shaped border. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-[2.5cqw] rounded-[1.5cqw] border-[0.15cqw]",
          hasTemplate ? "border-transparent" : "border-ink-border"
        )}
      />

      <div
        className={cn(
          "relative flex h-full flex-col items-center justify-center px-[8cqw] text-center",
          tone.body
        )}
        style={textOffset ? { transform: `translateY(${textOffset}%)` } : undefined}
      >
        {!hasTemplate && (
          <span className="relative mb-[2.5cqw] block size-[8cqw] overflow-hidden rounded-[1.6cqw] shadow-soft">
            {/* Two variants: the dark-surface logo on screen, the light-surface
                one when the certificate prints on white paper. A single asset
                would be invisible in one of the two contexts. */}
            <Image
              src="/logo-dark.png"
              alt="The Chini Trust"
              fill
              className="certificate-logo-screen object-cover"
              sizes="120px"
            />
            <Image
              src="/logo.png"
              alt=""
              fill
              aria-hidden="true"
              className="certificate-logo-print hidden object-cover"
              sizes="120px"
            />
          </span>
        )}

        <p className={cn("text-[1.5cqw] font-medium tracking-[0.25em] uppercase", tone.muted)}>
          Certificate of Completion
        </p>
        <div aria-hidden="true" className={cn("mt-[1.5cqw] h-[0.12cqw] w-[8cqw]", tone.rule)} />

        <p className={cn("mt-[3cqw] text-[1.6cqw]", tone.muted)}>This is to certify that</p>
        <h1 className="mt-[1cqw] font-serif text-[5cqw] leading-tight tracking-tight">{learnerName}</h1>

        <p className={cn("mt-[2cqw] text-[1.6cqw]", tone.muted)}>has successfully completed</p>
        <p className={cn("mt-[0.8cqw] font-serif text-[3cqw] leading-tight", tone.accent)}>{courseTitle}</p>

        <p className={cn("mt-[3cqw] text-[1.5cqw]", tone.muted)}>Issued on {issuedDate}</p>
        <div aria-hidden="true" className={cn("mt-[2.5cqw] h-[0.1cqw] w-[12cqw]", tone.rule)} />
        <p className={cn("mt-[2cqw] text-[1.3cqw] tracking-[0.2em] uppercase", tone.muted)}>
          CHINI Learn &middot; The Chini Trust
        </p>
        <p className={cn("mt-[0.6cqw] font-mono text-[1.05cqw]", tone.muted)}>
          Certificate ID: {certificateId.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
