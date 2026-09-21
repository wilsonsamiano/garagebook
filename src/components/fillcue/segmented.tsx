import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="grid gap-1 rounded-lg bg-line/60 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "min-h-11 rounded-md px-1 font-medium transition-colors duration-[var(--motion-quick)]",
              options.length > 3 ? "text-xs" : "text-sm",
              active ? "bg-card text-navy shadow-panel" : "text-muted-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
