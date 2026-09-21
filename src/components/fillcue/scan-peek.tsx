import { useState, type MouseEvent } from "react";
import { formatScanSize } from "@/lib/fillcue/scan";
import { cn } from "@/lib/utils";

export function ScanPeek({
  src,
  alt,
  className,
  size = "tile",
}: {
  src: string;
  alt: string;
  className?: string;
  size?: "tile" | "thumb";
}) {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  const kb = formatScanSize(src);

  function openScan(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openScan}
        className={cn(
          "overflow-hidden border border-line bg-paper text-left",
          size === "thumb" ? "size-12 shrink-0 rounded-sm" : "h-28 w-full rounded-md",
          className,
        )}
        aria-label={`Open ${alt} scan`}
      >
        <img src={src} alt={alt} className="size-full object-cover" />
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/80 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <figure
            className="max-h-[90dvh] w-full max-w-lg overflow-hidden rounded-lg bg-paper shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={src} alt={alt} className="max-h-[75dvh] w-full object-contain bg-cream" />
            <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm text-muted-ink">
                {alt}
                {kb ? ` · ${kb} B&W scan` : " · B&W scan"}
              </span>
              <button
                type="button"
                className="h-11 rounded-md px-3 text-sm font-medium text-navy"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}

export function ScanTile({ src, caption }: { src: string; caption: string }) {
  const kb = src ? formatScanSize(src) : "";
  return (
    <figure className="min-w-0">
      {src ? (
        <ScanPeek src={src} alt={caption} size="tile" />
      ) : (
        <div className="flex h-28 items-center justify-center overflow-hidden rounded-md bg-line/50 text-xs text-muted-ink">
          {caption}
        </div>
      )}
      <figcaption className="mt-1 truncate text-xs text-muted-ink">
        {src ? (kb ? `Saved · ${kb}` : "Saved scan") : caption}
      </figcaption>
    </figure>
  );
}
