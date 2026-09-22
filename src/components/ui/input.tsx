import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const picker = type === "date" || type === "time";
    const field = (
      <input
        type={type}
        className={cn(
          "h-11 w-full min-w-0 max-w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink shadow-none transition-[border-color,box-shadow] duration-[var(--motion-quick)] placeholder:text-muted-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice/70 disabled:cursor-not-allowed disabled:opacity-50",
          picker ? "block overflow-hidden appearance-none" : "flex",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
    if (!picker) return field;
    return <span className="block min-w-0 max-w-full overflow-hidden">{field}</span>;
  },
);
Input.displayName = "Input";

export { Input };