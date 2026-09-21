export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect x="6" y="5" width="24" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 5v26" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-ice" />
      <path
        d="M18 13.5c2.2-1.8 5.6-.4 5.6 2.2 0 1.6-1.1 2.5-2.6 3.3L18 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-gold"
      />
      <circle cx="18" cy="23.4" r="1.5" fill="currentColor" className="text-gold" />
    </svg>
  );
}
